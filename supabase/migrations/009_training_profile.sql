-- =====================================================
-- 009_training_profile.sql
-- Adds training profile fields used by the v3 program assignment.
-- =====================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS training_level TEXT
    CHECK (training_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  ADD COLUMN IF NOT EXISTS training_frequency INTEGER
    CHECK (training_frequency BETWEEN 3 AND 6),
  ADD COLUMN IF NOT EXISTS equipment_access TEXT
    CHECK (equipment_access IN ('full_gym', 'home_equipped', 'minimal')),
  ADD COLUMN IF NOT EXISTS glute_preference TEXT
    CHECK (glute_preference IN ('glute_focus', 'quad_focus', 'no_glute_focus')),
  ADD COLUMN IF NOT EXISTS current_program_id TEXT,
  ADD COLUMN IF NOT EXISTS program_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cycle_tracking_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_period_date DATE;

CREATE INDEX IF NOT EXISTS idx_users_current_program ON public.users(current_program_id);

-- Track program changes for analytics + level-up suggestions
CREATE TABLE IF NOT EXISTS public.user_program_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  reason_ended TEXT, -- 'completed' | 'plateau' | 'manual_change' | 'level_up' | 'reassigned'
  total_workouts_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_program_history_user ON public.user_program_history(user_id, started_at DESC);

ALTER TABLE public.user_program_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own program history"
  ON public.user_program_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own program history"
  ON public.user_program_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
