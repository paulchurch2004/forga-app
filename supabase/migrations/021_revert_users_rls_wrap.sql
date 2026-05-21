-- Revert du wrap (SELECT auth.uid()) sur les policies users.
--
-- Pourquoi : la migration 020 wrappait `auth.uid()` en `(SELECT auth.uid())`
-- comme optimisation de perf recommandée par Supabase Advisor. Mais
-- ce pattern crée une **récursion infinie** dans certains contextes
-- (notamment à l'inscription quand l'app fait upsert sur users avec
-- un trigger qui réfère à users).
--
-- L'user a remonté l'erreur :
--   "infinite recursion detected in policy for relation users"
--   au moment du tap "Commencer" en fin d'onboarding.
--
-- Fix : revert aux policies originales `auth.uid() = id` (sans wrap).
-- La perf reste OK pour < 100k users, et on évite le bug bloquant.

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own"
  ON public.users FOR DELETE
  USING (auth.uid() = id);
