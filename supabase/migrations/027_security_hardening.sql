-- =====================================================
-- 027_security_hardening.sql
-- Durcissement sécurité (audit pentest) — ferme :
--  [CRITIQUE] auto-octroi premium via INSERT/DELETE non protégés sur users
--  [ÉLEVÉ]   IDOR sur les RPC trial (expire/extend/get_trial_stats)
--  [ÉLEVÉ]   bucket Storage 'avatars' sans policy (overwrite/lecture cross-user)
--  [MOYEN]   quota premium qui ignore premium_until (refund garde l'illimité)
--
-- Déployable sans rebuild app : `supabase db push`. Compatible avec le
-- client actuel (le trial onboarding is_premium=true/premium_until=+7j
-- reste autorisé ; seules les valeurs abusives sont rejetées).
-- =====================================================

-- =====================================================
-- 1. [CRITIQUE] Policy INSERT users : borner les champs premium/trial/stripe
-- -----------------------------------------------------
-- L'onboarding crée la row public.users côté client AVEC is_premium=true et
-- premium_until=now()+7j (trial auto). On ne peut donc pas interdire
-- is_premium=true à l'INSERT. Mais on BORNE : premium_until ne peut pas
-- dépasser ~8 jours, et stripe_* doit être NULL à la création. Un attaquant
-- ne peut donc plus s'auto-octroyer un premium_until lointain (2099) via
-- DELETE + INSERT. Les abonnements payants longue durée sont écrits
-- uniquement par service_role (verify-session/webhook), qui bypass la RLS.
-- =====================================================
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (
    auth.uid() = id
    -- premium_until borné au trial (marge à 8j) ; pas de premium "à vie"
    AND (premium_until IS NULL OR premium_until <= (now() + INTERVAL '8 days'))
    -- si is_premium=true à la création, il DOIT être borné dans le temps
    AND (is_premium IS NOT TRUE OR (premium_until IS NOT NULL AND premium_until <= (now() + INTERVAL '8 days')))
    -- l'abonnement Stripe ne se crée jamais côté client
    AND stripe_customer_id IS NULL
    AND stripe_subscription_id IS NULL
    -- trial : seulement les états de départ légitimes
    AND (trial_state IS NULL OR trial_state IN ('never_started', 'active'))
  );

-- =====================================================
-- 2. [CRITIQUE] Retirer la policy DELETE table-level sur users
-- -----------------------------------------------------
-- La suppression de compte passe par la RPC delete_my_account() (migration
-- 016, SECURITY DEFINER → bypass RLS). La policy DELETE directe permettait
-- l'étape 1 de l'exploit (supprimer sa row pour la recréer via le chemin
-- INSERT). On la retire : plus aucun DELETE direct possible par le client.
-- =====================================================
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

-- =====================================================
-- 3. [ÉLEVÉ] IDOR : guard auth.uid() sur les RPC trial
-- -----------------------------------------------------
-- Ces fonctions SECURITY DEFINER prenaient p_user_id sans vérifier qu'il
-- correspond à l'appelant → un user authentifié pouvait expirer le trial
-- d'autrui ou lire ses stats. On ajoute un guard : si l'appel vient d'un
-- JWT user (auth.uid() non NULL), p_user_id DOIT être = auth.uid().
-- (service_role / cron : auth.uid() NULL → autorisé, de confiance.)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_trial_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trial_start TIMESTAMPTZ;
  v_messages_used INTEGER;
  v_scans_used INTEGER;
  v_workouts_logged INTEGER;
  v_meals_logged INTEGER;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT trial_started_at INTO v_trial_start
  FROM public.users WHERE id = p_user_id;

  IF v_trial_start IS NULL THEN
    RETURN jsonb_build_object('error', 'no_trial_found');
  END IF;

  SELECT COALESCE(SUM(count), 0) INTO v_messages_used
  FROM public.usage_log
  WHERE user_id = p_user_id AND feature = 'coach_message' AND date >= v_trial_start::DATE;

  SELECT COALESCE(SUM(count), 0) INTO v_scans_used
  FROM public.usage_log
  WHERE user_id = p_user_id AND feature = 'food_scan' AND date >= v_trial_start::DATE;

  SELECT COUNT(*) INTO v_workouts_logged
  FROM public.workouts
  WHERE user_id = p_user_id AND date >= v_trial_start::DATE;

  SELECT COUNT(*) INTO v_meals_logged
  FROM public.daily_meals
  WHERE user_id = p_user_id AND date >= v_trial_start::DATE AND validated_at IS NOT NULL;

  RETURN jsonb_build_object(
    'messages_used', v_messages_used,
    'scans_used', v_scans_used,
    'workouts_logged', v_workouts_logged,
    'meals_logged', v_meals_logged,
    'trial_started_at', v_trial_start
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_trial(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.users
  SET is_premium = FALSE, trial_state = 'expired', premium_until = NULL
  WHERE id = p_user_id
    AND trial_state = 'active'
    AND stripe_subscription_id IS NULL;

  RETURN jsonb_build_object('success', true, 'state', 'expired');
END;
$$;

CREATE OR REPLACE FUNCTION public.extend_trial(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can_extend BOOLEAN;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT (trial_state = 'active' AND trial_source = 'auto_signup') INTO v_can_extend
  FROM public.users WHERE id = p_user_id;

  IF NOT v_can_extend THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_eligible');
  END IF;

  UPDATE public.users
  SET trial_ends_at = NOW() + INTERVAL '7 days',
      trial_state = 'extended',
      trial_source = 'voluntary_extended',
      premium_until = NOW() + INTERVAL '7 days'
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'new_end_date', (NOW() + INTERVAL '7 days'));
END;
$$;

-- =====================================================
-- 4. [MOYEN] check_and_increment_quota : honorer premium_until
-- -----------------------------------------------------
-- Avant : quota "illimité" dès is_premium=TRUE, sans regarder premium_until
-- → un abonné remboursé (is_premium jamais remis à false faute de webhook)
-- gardait l'illimité indéfiniment. Désormais : premium effectif uniquement
-- si premium_until est dans le futur (ou NULL = grandfather conservateur).
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(
  p_user_id UUID,
  p_feature TEXT,
  p_daily_cap INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_premium_until TIMESTAMPTZ;
  v_current_count INTEGER;
  v_bonus_count INTEGER;
BEGIN
  SELECT is_premium, premium_until INTO v_is_premium, v_premium_until
  FROM public.users WHERE id = p_user_id;

  -- PRO actif (premium ET non expiré) : illimité, on log juste
  IF v_is_premium AND (v_premium_until IS NULL OR v_premium_until > now()) THEN
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object('allowed', true, 'reason', 'premium', 'remaining', -1);
  END IF;

  -- Free : check usage
  SELECT COALESCE(count, 0) INTO v_current_count
  FROM public.usage_log
  WHERE user_id = p_user_id AND feature = p_feature AND date = CURRENT_DATE;

  IF v_current_count IS NULL THEN v_current_count := 0; END IF;

  IF p_feature = 'coach_message' THEN
    SELECT COALESCE(coach_messages_bonus, 0) INTO v_bonus_count
    FROM public.user_tokens WHERE user_id = p_user_id;
  ELSIF p_feature = 'food_scan' THEN
    SELECT COALESCE(food_scans_bonus, 0) INTO v_bonus_count
    FROM public.user_tokens WHERE user_id = p_user_id;
  ELSE
    v_bonus_count := 0;
  END IF;

  v_bonus_count := COALESCE(v_bonus_count, 0);

  IF v_current_count < p_daily_cap THEN
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object(
      'allowed', true, 'reason', 'quota_ok',
      'used', v_current_count + 1, 'cap', p_daily_cap, 'bonus', v_bonus_count,
      'remaining', GREATEST(0, p_daily_cap - v_current_count - 1) + v_bonus_count
    );
  ELSIF v_bonus_count > 0 THEN
    IF p_feature = 'coach_message' THEN
      UPDATE public.user_tokens SET coach_messages_bonus = coach_messages_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF p_feature = 'food_scan' THEN
      UPDATE public.user_tokens SET food_scans_bonus = food_scans_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;

    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object(
      'allowed', true, 'reason', 'bonus_consumed',
      'used', v_current_count + 1, 'cap', p_daily_cap, 'bonus', v_bonus_count - 1,
      'remaining', v_bonus_count - 1
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', false, 'reason', 'quota_exceeded',
      'used', v_current_count, 'cap', p_daily_cap, 'bonus', v_bonus_count, 'remaining', 0
    );
  END IF;
END;
$$;

-- =====================================================
-- 5. [ÉLEVÉ] Policies Storage pour le bucket 'avatars'
-- -----------------------------------------------------
-- Le path est {userId}/avatar.ext. Lecture publique OK (avatar), mais
-- écriture/suppression STRICTEMENT limitées au dossier de l'appelant
-- (sinon overwrite/defacement cross-user). Versionné ici (n'était que
-- configuré au dashboard, non auditable).
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Resserrer les limites du bucket (anti-DoS coût stockage)
UPDATE storage.buckets
SET file_size_limit = 2097152, -- 2 MiB
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/heic']
WHERE id = 'avatars';

DROP POLICY IF EXISTS "avatars_read_public" ON storage.objects;
CREATE POLICY "avatars_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
