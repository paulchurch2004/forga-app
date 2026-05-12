-- 010_tracking_mode.sql
-- Adds the `tracking_mode` column to users so each profile can scope the
-- FORGA Score to: both pillars (default), nutrition-only (user has their own
-- training program elsewhere), or training-only (user doesn't want to track
-- meals). The scoring engine re-normalises pillar weights based on this.
--
-- Default 'both' preserves existing behaviour for all current users.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tracking_mode TEXT
    NOT NULL
    DEFAULT 'both'
    CHECK (tracking_mode IN ('both', 'nutrition_only', 'training_only'));

COMMENT ON COLUMN users.tracking_mode IS
  'Scope of the FORGA Score: both (default), nutrition_only, training_only';
