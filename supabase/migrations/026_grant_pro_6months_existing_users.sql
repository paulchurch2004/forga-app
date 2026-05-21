-- Offre Premium 6 mois aux 18 premiers users (early adopters / friends).
--
-- Contexte : pour le launch, on souhaite passer les comptes existants
-- au moment de cette migration en Premium pendant 6 mois. Ça inclut
-- le test team, les early sign-ups, et nos contacts personnels qui ont
-- testé l'app en pré-prod.
--
-- Comportement :
--   - Toutes les rows existantes dans public.users à l'instant T sont
--     UPDATE avec :
--       is_premium = TRUE
--       premium_until = NOW() + 6 months
--       trial_state = 'converted' (sort du flow trial pour ne pas qu'ils
--                                  reçoivent les notifs "trial expire bientôt")
--       trial_source = 'manual_grant_6mo' (audit trail)
--   - Les futurs sign-ups gardent leur trial 7j normal (cf trigger
--     handle_new_user_setup en migration 007).
--
-- Conservatoire : on n'écrase PAS premium_until s'il est déjà plus
-- éloigné que 6 mois (ex. user qui a déjà acheté un plan annuel).

-- ─────────────────────────────────────────────────────────────────
-- 1) Étendre le check constraint trial_source pour accepter
--    'manual_grant_6mo' (avant : seulement auto_signup, voluntary_extended,
--    paid_conversion → migration 007 ligne 14).
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  c_name TEXT;
BEGIN
  SELECT conname INTO c_name
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%trial_source%';

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_trial_source_check
  CHECK (trial_source IN ('auto_signup', 'voluntary_extended', 'paid_conversion', 'manual_grant_6mo'));

-- ─────────────────────────────────────────────────────────────────
-- 2) Grant le Pro 6 mois à tous les users existants.
-- ─────────────────────────────────────────────────────────────────
UPDATE public.users
SET
  is_premium = TRUE,
  premium_until = GREATEST(
    COALESCE(premium_until, NOW()),
    NOW() + INTERVAL '6 months'
  ),
  trial_state = CASE
    WHEN trial_state IN ('active', 'expired') THEN 'converted'
    ELSE trial_state
  END,
  trial_source = CASE
    WHEN trial_source IS NULL OR trial_source = 'auto_signup' THEN 'manual_grant_6mo'
    ELSE trial_source
  END;

-- ─────────────────────────────────────────────────────────────────
-- 3) Trace dans cleanup_audit pour avoir l'historique de cette grant.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.cleanup_audit (deleted_count, notes)
VALUES (
  0,
  format(
    'manual_grant_6mo on %s users — Pro until %s',
    (SELECT COUNT(*) FROM public.users WHERE is_premium = TRUE),
    (NOW() + INTERVAL '6 months')::DATE
  )
);
