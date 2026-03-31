-- FORGA — Stripe Integration Migration
-- Adds Stripe customer/subscription tracking to users

alter table public.users
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- Index for looking up users by Stripe customer ID (for webhooks)
create index if not exists idx_users_stripe_customer
  on public.users(stripe_customer_id)
  where stripe_customer_id is not null;
