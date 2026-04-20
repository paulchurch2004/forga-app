-- Migration 006: Complete data sync (weekly plans, program progress, progress photos, notif settings)

-- ============== WEEKLY MEAL PLANS ==============
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their weekly plans"
  ON public.weekly_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============== PROGRAM PROGRESS (completion tracking) ==============
CREATE TABLE IF NOT EXISTS public.program_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_program_id TEXT,
  start_date DATE,
  planned_days JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their program progress"
  ON public.program_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============== PROGRESS PHOTOS ==============
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  uri TEXT NOT NULL,
  weight NUMERIC,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS progress_photos_user_date_idx ON public.progress_photos(user_id, date DESC);

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their progress photos"
  ON public.progress_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============== NOTIFICATION SETTINGS (add to users table) ==============
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS meal_reminders BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak_alerts BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weekly_checkin_reminder BOOLEAN DEFAULT true;
