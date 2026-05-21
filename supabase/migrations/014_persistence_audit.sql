-- Audit de persistance Supabase — comble les 4 trous identifiés en
-- session prep launch v1 (mai 2026). Toutes additives.
--
-- Sans cette migration, les données suivantes sont perdues au logout
-- ou à la réinstallation de l'app :
--   1. Test de calibration force (StrengthTestResult)
--   2. Records 1RM par exercice (oneRepMaxByExercise)
--   3. Mémoires du coach IA (préférences, blessures, goals)
--   4. Listes de courses (current + archives)
--   5. Timestamp dernier sync Apple Health
--   6. Timestamp dernière activité (pour la suppression auto à 6 mois)

-- =============================================================
-- 1) STRENGTH TEST (calibration force) — JSONB sur users.
--    Un seul résultat courant par user, donc colonne plutôt que
--    table séparée. Garde la structure JS native côté client.
-- =============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS strength_test JSONB;

COMMENT ON COLUMN public.users.strength_test IS
  'Résultat complet du test de calibration force (StrengthTestResult). Contient level, startingWeights (5 lifts), takenAt, answers. Permet de re-dériver les charges si on tune les ratios.';

-- =============================================================
-- 2) ONE REP MAX par exercice — table séparée (1 ligne par exo).
--    Sépare cette historique vs strength_test : strength_test est
--    une SEED ponctuelle, one_rep_max évolue à chaque PR.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.one_rep_max (
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id  TEXT    NOT NULL,
  value_kg     NUMERIC(6, 1) NOT NULL,
  weight_kg    NUMERIC(6, 1) NOT NULL,
  reps         SMALLINT NOT NULL CHECK (reps > 0 AND reps <= 50),
  achieved_at  TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, exercise_id)
);

ALTER TABLE public.one_rep_max ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own 1RM" ON public.one_rep_max
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write their own 1RM" ON public.one_rep_max
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 1RM" ON public.one_rep_max
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 1RM" ON public.one_rep_max
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.one_rep_max IS
  'Historique des records 1RM (Epley) par exercice et par user. Mis à jour à chaque set qui bat le précédent.';

-- =============================================================
-- 3) COACH MEMORIES — mémoires structurées du coach IA.
--    Lecture à chaque message coach pour personnaliser la réponse.
--    Cap 50 entrées/user — appliqué côté client à l'écriture.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.coach_memories (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  tag         TEXT NOT NULL,
  summary     TEXT NOT NULL,
  weight      SMALLINT NOT NULL DEFAULT 1 CHECK (weight >= 1 AND weight <= 3),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_memories_user_id
  ON public.coach_memories (user_id, date DESC);

ALTER TABLE public.coach_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own memories" ON public.coach_memories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write their own memories" ON public.coach_memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON public.coach_memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON public.coach_memories
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.coach_memories IS
  'Mémoires structurées extraites par le LLM pour personnaliser le coach (préférences, blessures, goals, contraintes). Tag = injury/preference_food/etc.';

-- =============================================================
-- 4) SHOPPING LISTS — listes de courses (current + archivées).
--    Items en JSONB plutôt qu'une table séparée car peu accédés
--    individuellement, toujours en bloc.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id            TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_archived   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  archived_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id_archived
  ON public.shopping_lists (user_id, is_archived, created_at DESC);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own lists" ON public.shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write their own lists" ON public.shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON public.shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON public.shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.shopping_lists IS
  'Listes de courses générées depuis le plan repas. La liste current = is_archived=false (max 1 par user). Les archivées = is_archived=true (max 10, le client purge au-delà).';

-- =============================================================
-- 5) HEALTH SYNC TIMESTAMP — quand l'app a sync Apple Health
--    pour la dernière fois. Permet le delta-sync au prochain
--    foreground (sinon re-import tout l'historique = lent).
-- =============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_health_sync_at TIMESTAMPTZ;

COMMENT ON COLUMN public.users.last_health_sync_at IS
  'Timestamp du dernier import Apple HealthKit. Utilisé pour delta-sync (only pull data after this date au foreground).';

-- =============================================================
-- 6) LAST ACTIVE AT — pour la suppression auto à 6 mois.
--    Bumped à chaque foreground de l'app via userSync.
--    Cleanup géré par pg_cron dans la migration 015.
-- =============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_last_active_at
  ON public.users (last_active_at);

COMMENT ON COLUMN public.users.last_active_at IS
  'Timestamp de la dernière session active (bumped au foreground). Utilisé par le cron de cleanup pour supprimer les comptes inactifs > 180 jours.';
