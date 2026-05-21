-- Extensions du profil user pour les features ajoutées en session de
-- prep launch v1 (mai 2026). Toutes additives, aucune destructive.
--
-- Sans cette migration, les sync* qui essaient d'écrire ces colonnes
-- via syncProfile vont échouer silencieusement (queue retry × 10 puis
-- drop) et l'user perdra ces données au changement de device.

-- 1) Photo de profil custom (avatarUri).
--    Stocke pour l'instant l'URI locale `file:///...` — l'upload vers
--    Supabase Storage viendra en v1.1. Champ TEXT générique pour
--    accommoder une future URL distante sans nouvelle migration.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_uri TEXT;

-- 2) Toggle compteur de pas Apple Health.
--    Opt-in : par défaut désactivé pour ne pas demander la permission
--    HealthKit sans raison. L'user active dans Settings.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS steps_enabled BOOLEAN DEFAULT FALSE;

-- 3) Profil cyclisme commute (5 colonnes).
--    On stocke "à plat" plutôt qu'en JSONB pour pouvoir filtrer / indexer
--    si besoin plus tard (ex : analytics "% d'users vélo").
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cycling_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cycling_home_address TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cycling_destination_address TEXT;

-- Distance one-way en km (NUMERIC pour permettre les décimales 4.8 etc.).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cycling_distance_km NUMERIC(5, 1);

-- Jours par semaine (1-7). CHECK constraint pour éviter les valeurs aberrantes.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS cycling_days_per_week SMALLINT
  DEFAULT 0
  CHECK (cycling_days_per_week >= 0 AND cycling_days_per_week <= 7);

-- Commentaire de documentation pour les futurs devs / l'audit Supabase.
COMMENT ON COLUMN public.users.avatar_uri IS
  'URI ou URL de la photo de profil custom. Locale (file:///) en v1, distante (Supabase Storage) en v1.1.';
COMMENT ON COLUMN public.users.steps_enabled IS
  'Compteur de pas Apple Health affiché sur Home (opt-in iOS uniquement).';
COMMENT ON COLUMN public.users.cycling_enabled IS
  'L''user fait un trajet domicile-travail à vélo régulièrement. Si TRUE, les autres champs cycling_* sont remplis.';
COMMENT ON COLUMN public.users.cycling_distance_km IS
  'Distance one-way du trajet vélo en km, calculée par OSRM cycling profile.';
COMMENT ON COLUMN public.users.cycling_days_per_week IS
  'Nombre de jours par semaine où l''user fait l''aller-retour vélo (1-7).';
