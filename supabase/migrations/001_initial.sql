-- ============================================================
-- FORGA — Initial Database Migration
-- Tables: users, daily_meals, weekly_checkins, weight_log,
--         badges, favorites, score_history
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  name          text not null default '',
  sex           text not null check (sex in ('male', 'female')),
  age           integer not null check (age >= 14 and age <= 120),
  height_cm     integer not null check (height_cm >= 100 and height_cm <= 250),
  current_weight numeric(5,1) not null check (current_weight >= 30 and current_weight <= 300),
  target_weight  numeric(5,1) not null check (target_weight >= 30 and target_weight <= 300),
  target_deadline date,
  objective     text not null check (objective in ('bulk', 'cut', 'maintain', 'recomp')),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  budget        text not null default 'both' check (budget in ('eco', 'premium', 'both')),
  restrictions  text[] not null default '{}',

  -- Computed by engine
  tdee             integer not null default 0,
  daily_calories   integer not null default 0,
  daily_protein    integer not null default 0,
  daily_carbs      integer not null default 0,
  daily_fat        integer not null default 0,
  meals_per_day    integer not null default 3 check (meals_per_day >= 2 and meals_per_day <= 6),

  -- Gamification
  current_streak             integer not null default 0,
  best_streak                integer not null default 0,
  streak_freeze_used_this_week boolean not null default false,
  forga_score                integer not null default 0,

  -- Subscription
  is_premium     boolean not null default false,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

-- ─── DAILY_MEALS ────────────────────────────────────────────
create table public.daily_meals (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id) on delete cascade,
  date               date not null,
  slot               text not null check (slot in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'bedtime')),
  meal_id            text not null,
  adjusted_quantities jsonb not null default '{}',
  actual_macros      jsonb not null default '{"calories":0,"protein":0,"carbs":0,"fat":0}',
  validated_at       timestamptz not null default now(),
  created_at         timestamptz not null default now(),

  -- One meal per slot per day per user
  unique (user_id, date, slot)
);

-- ─── WEEKLY_CHECKINS ────────────────────────────────────────
create table public.weekly_checkins (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  week_start          date not null,
  weight              numeric(5,1) not null check (weight >= 30 and weight <= 300),
  energy              integer not null check (energy >= 1 and energy <= 5),
  hunger              integer not null check (hunger >= 1 and hunger <= 5),
  performance         integer not null check (performance >= 1 and performance <= 4),
  sleep               integer not null check (sleep >= 1 and sleep <= 4),
  calorie_adjustment  integer not null default 0,
  adjustment_reason   text not null default '',
  created_at          timestamptz not null default now(),

  -- One check-in per week per user
  unique (user_id, week_start)
);

-- ─── WEIGHT_LOG ─────────────────────────────────────────────
create table public.weight_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  date        date not null,
  weight      numeric(5,1) not null check (weight >= 30 and weight <= 300),
  created_at  timestamptz not null default now(),

  -- One weight entry per day per user
  unique (user_id, date)
);

-- ─── BADGES ─────────────────────────────────────────────────
create table public.badges (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  type         text not null check (type in ('first_meal', 'first_week', 'first_kilo', 'forgeron', 'month_of_forge')),
  unlocked_at  timestamptz not null default now(),
  created_at   timestamptz not null default now(),

  -- Each badge type only once per user
  unique (user_id, type)
);

-- ─── FAVORITES ──────────────────────────────────────────────
create table public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  meal_id     text not null,
  created_at  timestamptz not null default now(),

  -- Each meal favorited only once per user
  unique (user_id, meal_id)
);

-- ─── SCORE_HISTORY ──────────────────────────────────────────
create table public.score_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  date         date not null,
  total        integer not null check (total >= 0 and total <= 100),
  nutrition    integer not null check (nutrition >= 0 and nutrition <= 40),
  consistency  integer not null check (consistency >= 0 and consistency <= 30),
  progression  integer not null check (progression >= 0 and progression <= 20),
  discipline   integer not null check (discipline >= 0 and discipline <= 10),
  created_at   timestamptz not null default now(),

  -- One score entry per day per user
  unique (user_id, date)
);


-- ============================================================
-- INDEXES
-- ============================================================

-- users
create index idx_users_email on public.users(email);

-- daily_meals
create index idx_daily_meals_user_date on public.daily_meals(user_id, date);
create index idx_daily_meals_user_date_slot on public.daily_meals(user_id, date, slot);

-- weekly_checkins
create index idx_weekly_checkins_user_week on public.weekly_checkins(user_id, week_start);

-- weight_log
create index idx_weight_log_user_date on public.weight_log(user_id, date);
create index idx_weight_log_user_date_desc on public.weight_log(user_id, date desc);

-- badges
create index idx_badges_user on public.badges(user_id);

-- favorites
create index idx_favorites_user on public.favorites(user_id);

-- score_history
create index idx_score_history_user_date on public.score_history(user_id, date);
create index idx_score_history_user_date_desc on public.score_history(user_id, date desc);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.daily_meals enable row level security;
alter table public.weekly_checkins enable row level security;
alter table public.weight_log enable row level security;
alter table public.badges enable row level security;
alter table public.favorites enable row level security;
alter table public.score_history enable row level security;

-- ─── USERS policies ────────────────────────────────────────
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_delete_own"
  on public.users for delete
  using (auth.uid() = id);

-- ─── DAILY_MEALS policies ──────────────────────────────────
create policy "daily_meals_select_own"
  on public.daily_meals for select
  using (auth.uid() = user_id);

create policy "daily_meals_insert_own"
  on public.daily_meals for insert
  with check (auth.uid() = user_id);

create policy "daily_meals_update_own"
  on public.daily_meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_meals_delete_own"
  on public.daily_meals for delete
  using (auth.uid() = user_id);

-- ─── WEEKLY_CHECKINS policies ──────────────────────────────
create policy "weekly_checkins_select_own"
  on public.weekly_checkins for select
  using (auth.uid() = user_id);

create policy "weekly_checkins_insert_own"
  on public.weekly_checkins for insert
  with check (auth.uid() = user_id);

create policy "weekly_checkins_update_own"
  on public.weekly_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly_checkins_delete_own"
  on public.weekly_checkins for delete
  using (auth.uid() = user_id);

-- ─── WEIGHT_LOG policies ───────────────────────────────────
create policy "weight_log_select_own"
  on public.weight_log for select
  using (auth.uid() = user_id);

create policy "weight_log_insert_own"
  on public.weight_log for insert
  with check (auth.uid() = user_id);

create policy "weight_log_update_own"
  on public.weight_log for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weight_log_delete_own"
  on public.weight_log for delete
  using (auth.uid() = user_id);

-- ─── BADGES policies ───────────────────────────────────────
create policy "badges_select_own"
  on public.badges for select
  using (auth.uid() = user_id);

create policy "badges_insert_own"
  on public.badges for insert
  with check (auth.uid() = user_id);

-- Badges should not be updated or deleted by the user
-- (only the server/admin can manage them if needed)

-- ─── FAVORITES policies ────────────────────────────────────
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ─── SCORE_HISTORY policies ────────────────────────────────
create policy "score_history_select_own"
  on public.score_history for select
  using (auth.uid() = user_id);

create policy "score_history_insert_own"
  on public.score_history for insert
  with check (auth.uid() = user_id);

create policy "score_history_update_own"
  on public.score_history for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
