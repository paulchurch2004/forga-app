-- =====================================================
-- 007_quotas_tokens_trial.sql
-- Quotas serveur + tokens FORGA + trial automation
-- =====================================================

-- ============= 1. ENRICHIR public.users =============
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_state TEXT
    CHECK (trial_state IN ('active', 'expired', 'converted', 'extended', 'never_started'))
    DEFAULT 'never_started',
  ADD COLUMN IF NOT EXISTS trial_source TEXT
    CHECK (trial_source IN ('auto_signup', 'voluntary_extended', 'paid_conversion'));

CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON public.users(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_users_trial_state ON public.users(trial_state);

-- ============= 2. TABLE usage_log =============
CREATE TABLE IF NOT EXISTS public.usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('coach_message', 'food_scan', 'rewarded_video')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature, date)
);

CREATE INDEX idx_usage_log_user_date ON public.usage_log(user_id, date);
CREATE INDEX idx_usage_log_feature ON public.usage_log(feature);

ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own usage"
  ON public.usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage"
  ON public.usage_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============= 3. TABLE user_tokens =============
CREATE TABLE IF NOT EXISTS public.user_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_messages_bonus INTEGER NOT NULL DEFAULT 0 CHECK (coach_messages_bonus >= 0),
  food_scans_bonus INTEGER NOT NULL DEFAULT 0 CHECK (food_scans_bonus >= 0),
  total_videos_watched INTEGER NOT NULL DEFAULT 0,
  last_video_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tokens"
  ON public.user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages tokens"
  ON public.user_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- ============= 4. TRIGGER : init tokens + trial pour nouveau user =============
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Init tokens
  INSERT INTO public.user_tokens (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Auto-start 7-day PRO trial
  UPDATE public.users
  SET
    is_premium = TRUE,
    trial_started_at = NOW(),
    trial_ends_at = NOW() + INTERVAL '7 days',
    trial_state = 'active',
    trial_source = 'auto_signup',
    premium_until = NOW() + INTERVAL '7 days'
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- ============= 5. RPC : check_and_increment_quota =============
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(
  p_user_id UUID,
  p_feature TEXT,
  p_daily_cap INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_current_count INTEGER;
  v_bonus_count INTEGER;
BEGIN
  SELECT is_premium INTO v_is_premium
  FROM public.users WHERE id = p_user_id;

  -- PRO : illimité, on log juste
  IF v_is_premium THEN
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object(
      'allowed', true, 'reason', 'premium', 'remaining', -1
    );
  END IF;

  -- Free : check usage
  SELECT COALESCE(count, 0) INTO v_current_count
  FROM public.usage_log
  WHERE user_id = p_user_id AND feature = p_feature AND date = CURRENT_DATE;

  IF v_current_count IS NULL THEN v_current_count := 0; END IF;

  -- Check bonus tokens
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

  -- Decision
  IF v_current_count < p_daily_cap THEN
    -- Quota base disponible
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'quota_ok',
      'used', v_current_count + 1,
      'cap', p_daily_cap,
      'bonus', v_bonus_count,
      'remaining', GREATEST(0, p_daily_cap - v_current_count - 1) + v_bonus_count
    );
  ELSIF v_bonus_count > 0 THEN
    -- Cap atteint mais bonus dispo
    IF p_feature = 'coach_message' THEN
      UPDATE public.user_tokens
      SET coach_messages_bonus = coach_messages_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF p_feature = 'food_scan' THEN
      UPDATE public.user_tokens
      SET food_scans_bonus = food_scans_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;

    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'bonus_consumed',
      'used', v_current_count + 1,
      'cap', p_daily_cap,
      'bonus', v_bonus_count - 1,
      'remaining', v_bonus_count - 1
    );
  ELSE
    -- Refus
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'used', v_current_count,
      'cap', p_daily_cap,
      'bonus', v_bonus_count,
      'remaining', 0
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 6. RPC : award_video_tokens =============
CREATE OR REPLACE FUNCTION public.award_video_tokens(
  p_user_id UUID,
  p_reward_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_videos_today INTEGER;
  v_max_videos_per_day CONSTANT INTEGER := 3;
  v_coach_reward CONSTANT INTEGER := 3;
  v_scan_reward CONSTANT INTEGER := 1;
BEGIN
  SELECT COALESCE(count, 0) INTO v_videos_today
  FROM public.usage_log
  WHERE user_id = p_user_id
    AND feature = 'rewarded_video'
    AND date = CURRENT_DATE;

  IF v_videos_today >= v_max_videos_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'daily_video_limit_reached',
      'limit', v_max_videos_per_day,
      'videos_today', v_videos_today
    );
  END IF;

  IF p_reward_type = 'coach_messages' THEN
    UPDATE public.user_tokens
    SET coach_messages_bonus = coach_messages_bonus + v_coach_reward,
        total_videos_watched = total_videos_watched + 1,
        last_video_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_reward_type = 'food_scan' THEN
    UPDATE public.user_tokens
    SET food_scans_bonus = food_scans_bonus + v_scan_reward,
        total_videos_watched = total_videos_watched + 1,
        last_video_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_reward_type');
  END IF;

  INSERT INTO public.usage_log (user_id, feature, date, count)
  VALUES (p_user_id, 'rewarded_video', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature, date)
  DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'reward_type', p_reward_type,
    'videos_today', v_videos_today + 1,
    'videos_remaining', v_max_videos_per_day - (v_videos_today + 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 7. RPC : get_trial_stats =============
-- Renvoie les stats d'usage pendant le trial (pour le popup J7)
CREATE OR REPLACE FUNCTION public.get_trial_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_trial_start TIMESTAMPTZ;
  v_messages_used INTEGER;
  v_scans_used INTEGER;
  v_workouts_logged INTEGER;
  v_meals_logged INTEGER;
BEGIN
  SELECT trial_started_at INTO v_trial_start
  FROM public.users WHERE id = p_user_id;

  IF v_trial_start IS NULL THEN
    RETURN jsonb_build_object('error', 'no_trial_found');
  END IF;

  SELECT COALESCE(SUM(count), 0) INTO v_messages_used
  FROM public.usage_log
  WHERE user_id = p_user_id
    AND feature = 'coach_message'
    AND date >= v_trial_start::DATE;

  SELECT COALESCE(SUM(count), 0) INTO v_scans_used
  FROM public.usage_log
  WHERE user_id = p_user_id
    AND feature = 'food_scan'
    AND date >= v_trial_start::DATE;

  SELECT COUNT(*) INTO v_workouts_logged
  FROM public.workouts
  WHERE user_id = p_user_id AND date >= v_trial_start::DATE;

  SELECT COUNT(*) INTO v_meals_logged
  FROM public.daily_meals
  WHERE user_id = p_user_id
    AND date >= v_trial_start::DATE
    AND validated_at IS NOT NULL;

  RETURN jsonb_build_object(
    'messages_used', v_messages_used,
    'scans_used', v_scans_used,
    'workouts_logged', v_workouts_logged,
    'meals_logged', v_meals_logged,
    'trial_started_at', v_trial_start
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 8. RPC : expire_trial =============
-- Appelée quand l'user clique "rester en gratuit" ou auto par cron
CREATE OR REPLACE FUNCTION public.expire_trial(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.users
  SET
    is_premium = FALSE,
    trial_state = 'expired',
    premium_until = NULL
  WHERE id = p_user_id
    AND trial_state = 'active'
    AND stripe_subscription_id IS NULL;

  RETURN jsonb_build_object('success', true, 'state', 'expired');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 9. RPC : extend_trial (last chance) =============
-- Appelée quand l'user accepte le "trial 7j de plus" avec CB
CREATE OR REPLACE FUNCTION public.extend_trial(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_can_extend BOOLEAN;
BEGIN
  -- Empêcher les extensions multiples
  SELECT (trial_state = 'active' AND trial_source = 'auto_signup') INTO v_can_extend
  FROM public.users WHERE id = p_user_id;

  IF NOT v_can_extend THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_eligible');
  END IF;

  UPDATE public.users
  SET
    trial_ends_at = NOW() + INTERVAL '7 days',
    trial_state = 'extended',
    trial_source = 'voluntary_extended',
    premium_until = NOW() + INTERVAL '7 days'
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_end_date', (NOW() + INTERVAL '7 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 10. INITIALISER les users existants =============
-- Pour les users déjà créés avant cette migration
INSERT INTO public.user_tokens (user_id)
SELECT id FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_tokens)
ON CONFLICT (user_id) DO NOTHING;
