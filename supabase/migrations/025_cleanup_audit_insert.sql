-- Persist les runs du cron `cleanup_inactive_users` dans la table
-- `cleanup_audit` (créée en 015 mais jamais remplie).
--
-- Pourquoi : sans cet INSERT, la table reste vide pour toujours →
-- impossible de monitorer si le cron tourne (sauf à check pg_cron qui
-- n'est pas accessible côté app). En cas d'incident RGPD ("vous n'avez
-- pas supprimé mes données après 180j"), on doit pouvoir produire le
-- log d'exécution du cron pour preuve.
--
-- Fix : on re-CREATE la fonction avec un `INSERT INTO cleanup_audit`
-- juste avant le RETURN. La signature ne change pas, donc le cron
-- existant continue à l'appeler sans modification.

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
  WITH deleted AS (
    DELETE FROM auth.users au
    USING public.users pu
    WHERE au.id = pu.id
      AND pu.last_active_at < inactive_cutoff
      AND (pu.is_premium = FALSE OR pu.premium_until IS NULL OR pu.premium_until < NOW())
    RETURNING au.id
  )
  SELECT COUNT(*) INTO removed_count FROM deleted;

  -- Trace l'exécution dans la table d'audit (cf migration 015). Permet
  -- de monitorer le cron sans accès aux logs Postgres.
  INSERT INTO public.cleanup_audit (deleted_count, notes)
  VALUES (removed_count, format('cutoff=%s', inactive_cutoff::DATE));

  RETURN QUERY SELECT removed_count, NOW();
END;
$$;
