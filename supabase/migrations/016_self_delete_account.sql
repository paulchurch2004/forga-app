-- Fonction RPC `delete_my_account()` — permet à un user de supprimer
-- son propre compte depuis l'app, sans avoir besoin du service role
-- key (qui ne doit JAMAIS être embarquée côté client).
--
-- Bug avant migration : la suppression côté app faisait des
-- `delete from <table> where user_id = me` sur 7 tables (sur les ~25),
-- puis sign_out. Conséquence :
--   1. Les données de ~18 tables non whitelistées restaient en base
--      (workouts, water_log, measurements, photos, etc.)
--   2. L'entrée dans `auth.users` n'était JAMAIS supprimée → l'user
--      apparaissait toujours dans Supabase Authentication.
--
-- Fix : on supprime UN SEUL ROW dans `auth.users`, et les FK
-- ON DELETE CASCADE configurées sur public.users (puis sur toutes
-- les sous-tables) propagent automatiquement la suppression à
-- l'ensemble des données. Couvre AUSSI les futures tables ajoutées
-- sans qu'on doive maintenir une whitelist côté client.

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  -- Sécurité : auth.uid() est null si la requête n'a pas de JWT
  -- valide (= pas de client authentifié). On refuse explicitement.
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Supprime l'user dans auth.users — l'ON DELETE CASCADE configuré
  -- sur public.users (cf migration 001) propage automatiquement la
  -- suppression vers TOUTES les sous-tables (daily_meals, workouts,
  -- water_log, etc.). Garantit la conformité RGPD "droit à l'effacement".
  DELETE FROM auth.users WHERE id = caller_id;
END;
$$;

COMMENT ON FUNCTION public.delete_my_account() IS
  'Self-service account deletion. Supprime l''user appelant dans auth.users, et cascade automatiquement sur toutes les données via ON DELETE CASCADE. Conformité RGPD (droit à l''effacement).';

-- Restreint l'exécution aux utilisateurs authentifiés uniquement.
-- L'anon role ne doit pas pouvoir l'appeler — sinon n'importe qui
-- pourrait spam des DELETE en boucle (denial-of-service).
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
