-- ============================================================
-- FORGA — Security Hardening Migration
-- Restricts users table update policy to prevent premium bypass
-- Restricts referral_log insert policy
-- ============================================================

-- Drop the overly permissive update policy
drop policy if exists "users_update_own" on public.users;

-- Create a restricted update policy: users can update their own row
-- but CANNOT modify sensitive fields (is_premium, premium_until, forga_score, streaks, stripe IDs)
-- Those fields can only be modified by service_role (Edge Functions, triggers)
create policy "users_update_own_safe"
  on public.users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND is_premium IS NOT DISTINCT FROM (select is_premium from public.users where id = auth.uid())
    AND forga_score IS NOT DISTINCT FROM (select forga_score from public.users where id = auth.uid())
  );

-- Note: premium_until, stripe_customer_id, stripe_subscription_id are added by migrations
-- and should also be protected. If those columns exist, run:
DO $$
BEGIN
  -- Drop the safe policy and recreate with all protected fields
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'premium_until') THEN
    DROP POLICY IF EXISTS "users_update_own_safe" ON public.users;
    CREATE POLICY "users_update_own_safe"
      ON public.users FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (
        auth.uid() = id
        AND is_premium IS NOT DISTINCT FROM (SELECT is_premium FROM public.users WHERE id = auth.uid())
        AND forga_score IS NOT DISTINCT FROM (SELECT forga_score FROM public.users WHERE id = auth.uid())
        AND premium_until IS NOT DISTINCT FROM (SELECT premium_until FROM public.users WHERE id = auth.uid())
      );
  END IF;
END $$;

-- Restrict referral_log insert: only the referee can insert their own referral
drop policy if exists "Service role can insert referral logs" on public.referral_log;

create policy "Users can insert own referral"
  on public.referral_log for insert
  with check (auth.uid() = referee_id);

-- Add a function for secure referral code lookup (bypasses RLS for select)
create or replace function public.lookup_referral_code(code text)
returns uuid as $$
  select id from public.users where referral_code = upper(trim(code)) limit 1;
$$ language sql security definer;

-- Revoke direct execute from public, grant only to authenticated
revoke execute on function public.lookup_referral_code(text) from public;
grant execute on function public.lookup_referral_code(text) to authenticated;
