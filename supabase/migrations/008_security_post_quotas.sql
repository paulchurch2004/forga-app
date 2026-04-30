-- =====================================================
-- 008_security_post_quotas.sql
-- Hardens RLS / RPC privileges introduced by migration 007.
-- - Protects trial_* fields from client edits
-- - Protects Stripe identifiers from client edits (only if those columns exist)
-- - Prevents direct client calls to award_video_tokens (must go through SSV)
-- - Restricts check_and_increment_quota to service_role only
-- =====================================================

-- ============= 1. Extend update policy to cover trial + Stripe fields =============
-- Built dynamically to handle databases where some columns may not exist yet.
DO $$
DECLARE
  v_check TEXT := 'auth.uid() = id'
                || ' AND is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM public.users WHERE id = auth.uid())'
                || ' AND forga_score IS NOT DISTINCT FROM (SELECT forga_score FROM public.users WHERE id = auth.uid())';
BEGIN
  -- premium_until (added by 002_referral)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='premium_until') THEN
    v_check := v_check || ' AND premium_until IS NOT DISTINCT FROM (SELECT premium_until FROM public.users WHERE id = auth.uid())';
  END IF;

  -- trial_* (added by 007)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='trial_state') THEN
    v_check := v_check
            || ' AND trial_state IS NOT DISTINCT FROM (SELECT trial_state FROM public.users WHERE id = auth.uid())'
            || ' AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM public.users WHERE id = auth.uid())'
            || ' AND trial_ends_at IS NOT DISTINCT FROM (SELECT trial_ends_at FROM public.users WHERE id = auth.uid())'
            || ' AND trial_source IS NOT DISTINCT FROM (SELECT trial_source FROM public.users WHERE id = auth.uid())';
  END IF;

  -- Stripe IDs (may or may not exist depending on which 003 variant was applied)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='stripe_customer_id') THEN
    v_check := v_check || ' AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.users WHERE id = auth.uid())';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='stripe_subscription_id') THEN
    v_check := v_check || ' AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM public.users WHERE id = auth.uid())';
  END IF;

  -- Recreate the update policy with whatever columns are present
  EXECUTE 'DROP POLICY IF EXISTS "users_update_own_safe" ON public.users';
  EXECUTE format(
    'CREATE POLICY "users_update_own_safe" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (%s)',
    v_check
  );
END $$;

-- ============= 2. Lock down RPC privileges =============
-- award_video_tokens: NO direct client access. Must be called by an edge
-- function that has verified an AdMob Server-Side Verification callback.
REVOKE EXECUTE ON FUNCTION public.award_video_tokens(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.award_video_tokens(UUID, TEXT) TO service_role;

-- check_and_increment_quota: edge functions only (called via service_role from coach-chat / analyze-food).
REVOKE EXECUTE ON FUNCTION public.check_and_increment_quota(UUID, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_quota(UUID, TEXT, INTEGER) TO service_role;

-- expire_trial: user-callable (they can choose to drop their own trial).
-- The function already checks `WHERE id = p_user_id AND trial_state = 'active'`
-- so it's a no-op for any other user.
GRANT EXECUTE ON FUNCTION public.expire_trial(UUID) TO authenticated;

-- extend_trial: user-callable but the function gates with
-- `trial_source = 'auto_signup'`, so the trial can only be extended ONCE.
-- After extension, trial_source becomes 'voluntary_extended' and further
-- calls return { success: false, reason: 'not_eligible' }.
GRANT EXECUTE ON FUNCTION public.extend_trial(UUID) TO authenticated;

-- get_trial_stats stays open to authenticated since it's read-only and scoped.
GRANT EXECUTE ON FUNCTION public.get_trial_stats(UUID) TO authenticated;
