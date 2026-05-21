-- Statut ménopausique pour les utilisatrices >=40.
--
-- Pourquoi : la péri/ménopause change significativement les besoins
-- physiologiques (TDEE -5 à -10%, protéines majorées, priorité à la
-- force pour combattre sarcopénie + ostéoporose). FORGA s'adapte
-- automatiquement quand ce champ est renseigné.
--
-- Sources scientifiques :
--   - NAMS Position Statement (2022) — densité osseuse + training force
--   - ACSM Guidelines Older Adults — protéines 1.2-2.0 g/kg
--   - ANSES recommandations nutrition femme ménopausée

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS menopause_status TEXT
  CHECK (menopause_status IS NULL OR menopause_status IN ('none', 'peri', 'post'));

COMMENT ON COLUMN public.users.menopause_status IS
  'Statut ménopausique (none, peri, post). NULL = pas demandé ou non applicable (homme, femme <40). Sert à ajuster TDEE, protéines, calcium, programmes.';
