-- Restreint la lecture de partners_offers aux users authentifiés.
--
-- Régression de sécurité : migration 017 a créé la policy
-- "Anyone can read active offers" SANS clause `TO authenticated`.
-- Par défaut, sans `TO`, une policy SELECT s'applique aux rôles
-- PUBLIC, anon ET authenticated → un anon avec l'anon key peut
-- récupérer tous les codes Premium via curl :
--   curl 'https://<ref>.supabase.co/rest/v1/partners_offers?select=*'
--        -H 'apikey: <anon-key>'
--
-- Concrètement : FORGA20, FORGAPRO15, FORGAPRO10, FORGAMP25, FORGAGM
-- (codes réservés Premium) sont exposés à n'importe qui sachant juste
-- l'URL Supabase. Un dev qui inspecte le bundle JS de l'app trouve
-- l'anon key en 30s.
--
-- Fix : recréer la policy avec `TO authenticated` pour exclure anon.
-- Les non-authentifiés ne peuvent plus voir la table du tout. Combiné
-- au filtre côté app (`!isPremium` → hide discount_code), un Free
-- user voit la liste des offres mais pas les codes — comportement
-- préservé. Un anon ne voit rien.

DROP POLICY IF EXISTS "Anyone can read active offers" ON public.partners_offers;

CREATE POLICY "Authenticated can read active offers"
  ON public.partners_offers
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE);
