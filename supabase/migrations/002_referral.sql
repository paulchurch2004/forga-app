-- ============================================================
-- FORGA — Referral System Migration
-- Adds referral code, referral tracking, and premium gifting
-- ============================================================

-- Add referral columns to users table
alter table public.users
  add column if not exists referral_code text unique,
  add column if not exists referral_count integer not null default 0,
  add column if not exists referred_by text,
  add column if not exists premium_until timestamptz;

-- Generate referral codes for existing users
update public.users
set referral_code = 'FORGA-' || upper(substr(md5(id::text || random()::text), 1, 4))
where referral_code is null;

-- Make referral_code not null after backfill
alter table public.users
  alter column referral_code set not null;

-- Index for fast referral code lookups
create index if not exists idx_users_referral_code on public.users(referral_code);

-- ─── REFERRAL LOG ─────────────────────────────────────────
-- Tracks each referral event for audit and analytics
create table if not exists public.referral_log (
  id          uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referee_id  uuid not null references public.users(id) on delete cascade,
  referral_code text not null,
  reward_type text not null default '1_week_premium',
  reward_applied boolean not null default false,
  created_at  timestamptz not null default now(),
  unique(referee_id) -- each user can only be referred once
);

-- RLS for referral_log
alter table public.referral_log enable row level security;

create policy "Users can read their own referral logs"
  on public.referral_log for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "Service role can insert referral logs"
  on public.referral_log for insert
  with check (true);
