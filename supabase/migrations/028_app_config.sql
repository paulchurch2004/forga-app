-- =====================================================
-- 028_app_config.sql
-- Config app pilotée serveur — sert au popup de mise à jour.
--
-- min_version    : en dessous → mise à jour OBLIGATOIRE (popup bloquant)
-- latest_version : entre min et latest → mise à jour SUGGÉRÉE (popup "Plus tard")
-- Tu modifies ces 2 valeurs depuis le SQL Editor quand tu publies une
-- nouvelle version (aucun rebuild nécessaire pour déclencher le popup).
-- =====================================================
CREATE TABLE IF NOT EXISTS public.app_config (
  id             TEXT PRIMARY KEY DEFAULT 'ios',
  min_version    TEXT NOT NULL DEFAULT '1.0.0',
  latest_version TEXT NOT NULL DEFAULT '1.0.0',
  update_url     TEXT NOT NULL DEFAULT 'https://apps.apple.com/app/id6762985427',
  update_message TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_config (id) VALUES ('ios')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Lecture publique (config non sensible). Écriture = service_role uniquement
-- (aucune policy INSERT/UPDATE pour le client → modifiable seulement via le
-- dashboard / SQL Editor).
DROP POLICY IF EXISTS "app_config_read" ON public.app_config;
CREATE POLICY "app_config_read"
  ON public.app_config FOR SELECT
  USING (true);
