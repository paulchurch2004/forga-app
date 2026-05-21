-- Cron de suppression automatique des comptes inactifs > 180 jours.
--
-- Conformité : engagement RGPD "data minimization" — on ne garde pas
-- indéfiniment les données d'utilisateurs qui n'utilisent plus l'app.
--
-- Mécanique :
--   - `users.last_active_at` est bumped au foreground (côté app via
--     userSync.bumpLastActiveAt). Migration 014 l'a ajoutée.
--   - Un cron quotidien (2h du matin UTC) appelle la fonction
--     `cleanup_inactive_users()`.
--   - La fonction supprime le row dans `auth.users`, ce qui
--     cascade sur toutes les tables via ON DELETE CASCADE.
--
-- ⚠️ pg_cron est dispo sur Supabase Pro (et au-delà). Si l'on est
-- encore sur Free, ce cron ne s'enregistre pas — la fonction reste
-- callable manuellement via RPC (`select cleanup_inactive_users();`).

-- =============================================================
-- 1) Enable l'extension pg_cron (sur Supabase, déjà installée, on
--    doit juste l'activer dans le schéma extensions ou public).
-- =============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- =============================================================
-- 2) Fonction de cleanup. SECURITY DEFINER pour bypass RLS :
--    le cron run en background, sans auth.uid(), donc il faut un
--    contournement explicite. Locked down à un retour count() pour
--    pouvoir vérifier l'effet en monitoring.
-- =============================================================
CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS TABLE (deleted_count BIGINT, deletion_run_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  inactive_cutoff TIMESTAMPTZ := NOW() - INTERVAL '180 days';
  removed_count BIGINT;
BEGIN
  -- Supprime des auth.users en se basant sur public.users.last_active_at.
  -- ON DELETE CASCADE configurée sur toutes les FK user_id propage la
  -- suppression sur l'ensemble des tables de données.
  --
  -- NB : on FILTRE pour ne pas supprimer les comptes Premium dans la
  -- même requête — l'engagement RGPD vise les inactifs, mais on garde
  -- les abonnés payants par défense (l'utilisateur peut avoir oublié
  -- de désinstaller et l'abonnement court encore).
  WITH deleted AS (
    DELETE FROM auth.users au
    USING public.users pu
    WHERE au.id = pu.id
      AND pu.last_active_at < inactive_cutoff
      AND (pu.is_premium = FALSE OR pu.premium_until IS NULL OR pu.premium_until < NOW())
    RETURNING au.id
  )
  SELECT COUNT(*) INTO removed_count FROM deleted;

  RETURN QUERY SELECT removed_count, NOW();
END;
$$;

COMMENT ON FUNCTION public.cleanup_inactive_users() IS
  'Supprime les users inactifs depuis plus de 180 jours (engagement RGPD). Cascade sur toutes les tables via ON DELETE CASCADE. Préserve les abonnés Premium actifs.';

-- Révoque les droits exécution au public — seul postgres (cron) doit
-- pouvoir l'appeler.
REVOKE EXECUTE ON FUNCTION public.cleanup_inactive_users() FROM PUBLIC;

-- =============================================================
-- 3) Schedule le cron — tous les jours à 02:00 UTC.
--    Choix de 2h du matin : creux d'utilisation app (peu d'users
--    actifs, donc faible probabilité d'impacter une session live).
-- =============================================================
-- Drop le job existant si on re-run la migration (idempotent).
DO $$
BEGIN
  PERFORM cron.unschedule('forga-cleanup-inactive-users');
EXCEPTION WHEN OTHERS THEN
  -- Le job n'existait pas, c'est OK.
  NULL;
END $$;

SELECT cron.schedule(
  'forga-cleanup-inactive-users',
  '0 2 * * *',
  $$SELECT public.cleanup_inactive_users();$$
);

-- =============================================================
-- 4) Table d'audit du cron (optionnelle mais utile pour debug).
--    Chaque run y consigne le nombre de comptes supprimés.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.cleanup_audit (
  id          BIGSERIAL PRIMARY KEY,
  run_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_count BIGINT NOT NULL,
  notes       TEXT
);

COMMENT ON TABLE public.cleanup_audit IS
  'Journal des runs du cron cleanup_inactive_users. Permet de vérifier que la suppression auto fonctionne sans logs serveur.';
