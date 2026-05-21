-- Sécurise la table `cleanup_audit` qui logait les runs du cron de
-- suppression auto à 180j (migration 015). Sans RLS, Supabase Advisor
-- flagait CRITICAL car la table est dans le schéma `public` donc
-- exposée par PostgREST → n'importe qui pouvait lire le journal.
--
-- Contenu de la table (audit du cron) : pas sensible en soi (juste des
-- counts de comptes supprimés + timestamps), mais aucune raison qu'un
-- user lambda y accède. Lock down :
--   1. Enable RLS
--   2. Aucune policy SELECT/INSERT/UPDATE/DELETE pour anon/authenticated
--      → personne ne peut y toucher via l'API.
--   3. Le cron utilise service_role qui bypass RLS → continue à écrire
--      sans souci via la fonction `cleanup_inactive_users()`.

ALTER TABLE public.cleanup_audit ENABLE ROW LEVEL SECURITY;

-- Aucune policy ajoutée volontairement = deny par défaut pour
-- authenticated + anon. Seul service_role peut écrire (utilisé par
-- le cron via SECURITY DEFINER).

COMMENT ON TABLE public.cleanup_audit IS
  'Journal des runs du cron cleanup_inactive_users. RLS enabled — accès service_role uniquement.';
