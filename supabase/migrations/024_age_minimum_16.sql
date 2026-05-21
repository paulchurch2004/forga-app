-- Aligne le check constraint age en DB sur le minimum 16 ans imposé
-- par l'app.
--
-- Contexte : la table users a été créée en migration 001 avec
-- `check (age >= 14 and age <= 120)`. L'app valide côté client
-- `age >= 16` (src/utils/validators.ts ligne 13). Le mismatch ouvre :
--   - une porte COPPA (US child privacy < 13) si jamais un user
--     contournait la validation client (ex. via API directe)
--   - un trou RGPD : en France, le consentement à un service en ligne
--     nécessite 15 ans (loi Informatique et Libertés). L'app affiche
--     un service de santé connecté qui demande des photos corporelles
--     et du poids → 16 ans est le minimum prudent.
--
-- Fix : DROP l'ancienne constraint, recréer avec age >= 16.
-- Idempotent : on tente le drop puis on add. Si déjà à 16, no-op.

DO $$
BEGIN
  -- Trouve le nom de la check constraint sur la colonne age
  -- (Postgres lui donne un nom auto comme users_age_check)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND constraint_name = 'users_age_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_age_check;
  END IF;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_age_check CHECK (age >= 16 AND age <= 120);

COMMENT ON CONSTRAINT users_age_check ON public.users IS
  'Age minimum 16 ans — aligné avec validation client (src/utils/validators.ts) et exigences RGPD/CNIL pour service connecté santé.';
