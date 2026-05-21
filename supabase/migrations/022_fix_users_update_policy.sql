-- Fix régression de sécurité introduite par migration 021.
--
-- Contexte : migration 020 a wrappé auth.uid() en (SELECT auth.uid()),
-- ce qui a provoqué "infinite recursion detected in policy for relation
-- users" à la fin de l'onboarding. J'ai revert avec migration 021, mais
-- en re-créant `users_update_own` sans clauses protectrices.
--
-- Problème : `users_update_own_safe` (créée en 008 avec WITH CHECK
-- protégeant is_premium, premium_until, trial_*, stripe_*, forga_score)
-- existe toujours. Les deux policies coexistent comme PERMISSIVE → OR
-- logique → un user authentifié peut bypass via la policy non-protégée
-- et faire UPDATE users SET is_premium = TRUE directement via l'API.
--
-- Fix : drop `users_update_own` (la non-protégée) et garder uniquement
-- `users_update_own_safe`. On re-crée idempotemment cette dernière
-- pour garantir qu'elle contient toutes les protections, peu importe
-- l'ordre d'application des migrations passées.

-- =============================================================
-- 1. Drop la policy non-protégée
-- =============================================================
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- =============================================================
-- 2. Recréer users_update_own_safe avec toutes les protections
--    (logique identique à migration 008, ré-affirmée ici)
-- =============================================================
DO $$
DECLARE
  v_check TEXT := 'auth.uid() = id'
                || ' AND is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM public.users WHERE id = auth.uid())'
                || ' AND forga_score IS NOT DISTINCT FROM (SELECT forga_score FROM public.users WHERE id = auth.uid())';
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='premium_until') THEN
    v_check := v_check || ' AND premium_until IS NOT DISTINCT FROM (SELECT premium_until FROM public.users WHERE id = auth.uid())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='trial_state') THEN
    v_check := v_check
            || ' AND trial_state IS NOT DISTINCT FROM (SELECT trial_state FROM public.users WHERE id = auth.uid())'
            || ' AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM public.users WHERE id = auth.uid())'
            || ' AND trial_ends_at IS NOT DISTINCT FROM (SELECT trial_ends_at FROM public.users WHERE id = auth.uid())'
            || ' AND trial_source IS NOT DISTINCT FROM (SELECT trial_source FROM public.users WHERE id = auth.uid())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='stripe_customer_id') THEN
    v_check := v_check || ' AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.users WHERE id = auth.uid())';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='stripe_subscription_id') THEN
    v_check := v_check || ' AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.users WHERE id = auth.uid())';
  END IF;

  EXECUTE 'DROP POLICY IF EXISTS "users_update_own_safe" ON public.users';
  EXECUTE format(
    'CREATE POLICY "users_update_own_safe" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (%s)',
    v_check
  );
END $$;
