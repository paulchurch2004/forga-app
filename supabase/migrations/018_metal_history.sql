-- Frise gamification "30 derniers jours" — métaux quotidiens.
--
-- Pourquoi cette migration : la frise sur le profil affichait les
-- 30 derniers jours de check-in (plomb → or, l'état de forme de
-- l'user avant chaque séance). Avant : stocké uniquement dans
-- `metalHistoryStore` AsyncStorage → si l'user perdait son local
-- (réinstall, multi-device, etc.), toute sa gamification était à
-- recommencer. Maintenant on persiste en DB pour cross-device et
-- résistance aux résets locaux.

CREATE TABLE IF NOT EXISTS public.metal_history (
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- YYYY-MM-DD local de l'user (timezone côté client). Une seule
  -- entrée par jour par user.
  date     DATE NOT NULL,
  -- 5 niveaux possibles + safe-default 'repos' jamais inséré ici
  -- (les jours sans check-in n'ont juste pas de row).
  metal    TEXT NOT NULL CHECK (metal IN ('plomb', 'bronze', 'fer', 'acier', 'or')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_metal_history_user_date
  ON public.metal_history (user_id, date DESC);

ALTER TABLE public.metal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own metal history" ON public.metal_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can write their own metal history" ON public.metal_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metal history" ON public.metal_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metal history" ON public.metal_history
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.metal_history IS
  'Frise gamification du profil — métal choisi chaque jour avant la séance. Une row par (user_id, date).';
