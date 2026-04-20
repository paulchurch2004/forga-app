-- Migration 005: Additional tables for full data sync
-- Prevents data loss on PWA reinstall

-- ============== WORKOUTS ==============
CREATE TABLE IF NOT EXISTS public.workouts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT,
  exercises JSONB DEFAULT '[]'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON public.workouts(user_id, date DESC);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- ============== WATER LOG ==============
CREATE TABLE IF NOT EXISTS public.water_log (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS water_log_user_date_idx ON public.water_log(user_id, date DESC);

ALTER TABLE public.water_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water log"
  ON public.water_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own water log"
  ON public.water_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water log"
  ON public.water_log FOR DELETE
  USING (auth.uid() = user_id);

-- ============== BODY MEASUREMENTS ==============
CREATE TABLE IF NOT EXISTS public.measurements (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  waist_cm NUMERIC,
  hips_cm NUMERIC,
  chest_cm NUMERIC,
  arms_cm NUMERIC,
  thighs_cm NUMERIC,
  body_fat_percent NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS measurements_user_date_idx ON public.measurements(user_id, date DESC);

ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own measurements"
  ON public.measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements"
  ON public.measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements"
  ON public.measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements"
  ON public.measurements FOR DELETE
  USING (auth.uid() = user_id);

-- ============== MEAL PREFERENCES (likes/dislikes) ==============
CREATE TABLE IF NOT EXISTS public.meal_preferences (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_id TEXT NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, meal_id)
);

ALTER TABLE public.meal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal preferences"
  ON public.meal_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal preferences"
  ON public.meal_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal preferences"
  ON public.meal_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal preferences"
  ON public.meal_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============== USER SETTINGS (tutorial, theme, locale) ==============
-- Add columns to existing users table instead of new table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tutorial_step INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'dark';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS water_daily_target_ml INTEGER DEFAULT 2500;
