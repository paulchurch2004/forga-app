-- Coach IA feedback loop
--
-- Stocke les pouce-haut / pouce-bas que l'user clique sur les réponses
-- du coach. Sert à deux choses :
--   1. Détecter en prod les patterns de réponses qui flop (trop longues,
--      trop génériques, hallucinations, etc.) → on les analyse pour
--      itérer sur le prompt.
--   2. Constituer un dataset de fine-tuning futur (input/output pairs
--      annotés par les users réels).
--
-- Volumétrie attendue : ~5-10% des messages reçoivent un feedback
-- (taux observé sur ChatGPT, Claude, etc.). À 1000 DAU × 5 msg/jour
-- × 7% feedback rate = ~350 lignes/jour. RLS ON, scoped par user_id.

CREATE TABLE IF NOT EXISTS coach_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- L'ID local du message côté app (chatStore). Permet de matcher
  -- le feedback à la transcription complète si on récupère cette
  -- conversation via un autre endpoint (audit / debug).
  message_id      TEXT NOT NULL,

  -- Texte du message coach noté. On stocke directement le contenu
  -- pour pouvoir analyser sans avoir besoin de retracer l'historique.
  -- Tronqué à 2000 chars (les réponses coach font typiquement < 600).
  message_text    TEXT NOT NULL,

  rating          TEXT NOT NULL CHECK (rating IN ('up', 'down')),

  -- Optionnel : commentaire libre de l'user expliquant son vote
  -- (surtout utile sur les downvotes).
  comment         TEXT,

  -- Optionnel : référence vers le message user qui a précédé, utile
  -- pour reconstituer la paire stimulus/réponse en analyse.
  preceding_user_message TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un même message ne peut recevoir qu'un seul feedback par user
-- (UPDATE remplace, INSERT ne dupe pas). Vote up puis down = down final.
CREATE UNIQUE INDEX IF NOT EXISTS coach_feedback_user_message_unique
  ON coach_feedback (user_id, message_id);

-- Index sur created_at pour requêtes d'analyse récentes.
CREATE INDEX IF NOT EXISTS coach_feedback_created_at_idx
  ON coach_feedback (created_at DESC);

-- RLS : un user voit/écrit uniquement ses propres feedbacks.
ALTER TABLE coach_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach_feedback_select_own"
  ON coach_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coach_feedback_insert_own"
  ON coach_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coach_feedback_update_own"
  ON coach_feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coach_feedback_delete_own"
  ON coach_feedback FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE coach_feedback IS
  'Pouce-haut/pouce-bas des users sur les réponses du coach IA. Source d''amélioration prompt + dataset fine-tuning futur.';
