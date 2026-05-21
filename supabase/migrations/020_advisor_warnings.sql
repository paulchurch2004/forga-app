-- Fix complet des 23 warnings remontés par Supabase Advisor.
--
-- IMPORTANT : avant de revoke les EXECUTE, j'ai vérifié quelles
-- fonctions sont appelées DIRECTEMENT par le client app (via
-- `supabase.rpc()`). Pour ces fonctions on garde le GRANT à
-- `authenticated`. Pour les autres (triggers, Edge Functions seules),
-- on revoke pour clean.
--
-- Catégories adressées :
--   1. RLS Initialization Plan (users) → wrap auth.uid()
--   2. Function Search Path Mutable → SET search_path
--   3. Public Can Execute SECURITY DEFINER → REVOKE FROM anon
--   4. Signed-In Can Execute → REVOKE FROM authenticated SI internal
--
-- Non couvert ici (toggle dashboard) :
--   - Leaked Password Protection : Auth > Policies > Password Protection

-- =============================================================
-- 1. RLS Initialization Plan — users.* policies
-- =============================================================
-- Wrap auth.uid() avec (select auth.uid()) → Postgres l'évalue une
-- seule fois par requête au lieu de par row. Gros gain perf.
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING ((SELECT auth.uid()) = id);

-- =============================================================
-- 2. SET search_path sur toutes les fonctions
-- =============================================================
-- Toutes les fonctions doivent figer leur search_path pour éviter
-- les attaques par schema injection. Idempotent : run multiple fois OK.

ALTER FUNCTION public.update_updated_at_column()
  SET search_path = public;

ALTER FUNCTION public.handle_new_user_setup()
  SET search_path = public, auth;

ALTER FUNCTION public.check_and_increment_quota(uuid, text, integer)
  SET search_path = public;

ALTER FUNCTION public.award_video_tokens(uuid, text)
  SET search_path = public;

ALTER FUNCTION public.get_trial_stats(uuid)
  SET search_path = public;

ALTER FUNCTION public.expire_trial(uuid)
  SET search_path = public;

ALTER FUNCTION public.extend_trial(uuid)
  SET search_path = public;

ALTER FUNCTION public.lookup_referral_code(text)
  SET search_path = public;

-- cleanup_inactive_users et delete_my_account ont déjà SET search_path
-- (migrations 015 et 016).

-- =============================================================
-- 3. Lock down SECURITY DEFINER — REVOKE explicite
-- =============================================================

-- ─── Triggers / internes (jamais appelés par le client) ───
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_setup() FROM PUBLIC, anon, authenticated;

-- ─── Quota / tokens : Edge Functions only (service_role) ───
-- Déjà fait en migration 008 mais on re-run pour être sûr (idempotent).
REVOKE ALL ON FUNCTION public.check_and_increment_quota(uuid, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.award_video_tokens(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_quota(uuid, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_video_tokens(uuid, text) TO service_role;

-- ─── Trial management : appelé directement par le client (useTrial hook) ───
-- Ces 3 fonctions DOIVENT rester appelables par les users authentifiés
-- car useTrial.ts les invoque via supabase.rpc(). On les protège
-- contre anon seulement.
REVOKE ALL ON FUNCTION public.expire_trial(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_trial(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.extend_trial(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.extend_trial(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_trial_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trial_stats(uuid) TO authenticated;

-- ─── Référencement : appelé par l'app authentifiée (onboarding) ───
REVOKE ALL ON FUNCTION public.lookup_referral_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_referral_code(text) TO authenticated;

-- ─── Cron-only : pas d'API exposure ───
REVOKE ALL ON FUNCTION public.cleanup_inactive_users() FROM PUBLIC, anon, authenticated;

-- ─── Self-delete : doit rester accessible aux authenticated ───
-- (Bouton "supprimer mon compte" dans Profil > Actions.)
REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger interne — pas exposé à l''API';
COMMENT ON FUNCTION public.handle_new_user_setup() IS 'Trigger auth.users INSERT — pas exposé à l''API';
COMMENT ON FUNCTION public.check_and_increment_quota(uuid, text, integer) IS 'Edge Functions only (service_role)';
COMMENT ON FUNCTION public.award_video_tokens(uuid, text) IS 'AdMob SSV callback only (service_role)';
COMMENT ON FUNCTION public.cleanup_inactive_users() IS 'pg_cron only (service_role)';
