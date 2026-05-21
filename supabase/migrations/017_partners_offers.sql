-- Offres partenaires — feature de rétention Premium.
--
-- Concept : on offre aux abonnés Pro des codes promo des marques
-- partenaires (Gymshark, Nutripure, Fitnessboutique, etc.). Les users
-- Free voient l'offre et ses détails mais PAS le code de réduction —
-- c'est un teaser qui pousse à l'upgrade.
--
-- Pourquoi en table Supabase et pas en JSON statique : on peut activer
-- / désactiver une offre, changer un code, ajouter un nouveau
-- partenaire SANS rebuild de l'app (= sans redownload App Store par
-- les users). Les RLS permettent de tout lire (table publique en read)
-- mais l'app code-side cache le `discount_code` aux non-premium.

CREATE TABLE IF NOT EXISTS public.partners_offers (
  id              TEXT PRIMARY KEY,
  -- Marque (Gymshark, Nutripure, FitnessBoutique, MyProtein…)
  brand           TEXT NOT NULL,
  -- Titre court de l'offre ("-15% sur tout le site")
  title           TEXT NOT NULL,
  -- Description détaillée (visible par tous, free + premium)
  description     TEXT NOT NULL,
  -- Le code réservé Premium. Caché côté app pour les free, mais
  -- présent en DB (RLS reads tout — la séparation se fait UI-side).
  discount_code   TEXT NOT NULL,
  -- Pourcentage de réduction (affiché en badge sur la card)
  discount_pct    SMALLINT CHECK (discount_pct > 0 AND discount_pct <= 90),
  -- Catégorie pour filtrage/groupement ('apparel', 'supplements',
  -- 'equipment', 'food', 'other')
  category        TEXT NOT NULL DEFAULT 'other',
  -- URL du logo/illustration de la marque
  image_url       TEXT,
  -- URL vers le site partenaire (CTA "Profiter de l'offre")
  partner_url     TEXT NOT NULL,
  -- Date d'expiration de l'offre. NULL = pas d'expiration.
  expires_at      TIMESTAMPTZ,
  -- Sort order — les offres avec sort_order plus bas apparaissent en
  -- premier. Permet de mettre en avant les partenariats premium.
  sort_order      INTEGER DEFAULT 100,
  -- Toggle simple pour désactiver une offre sans la supprimer.
  is_active       BOOLEAN DEFAULT TRUE,
  -- Code promo public (visible par tous, même free) — utilisé pour les
  -- "starter codes" donnés à tous pour goûter l'offre. NULL = pas de
  -- code public. Typique : code à -5% pour tous, code à -15% Premium.
  public_code     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index sur les filtres courants pour rester rapide même avec
-- 100+ offres en catalog (cas du long terme).
CREATE INDEX IF NOT EXISTS idx_partners_offers_active_sort
  ON public.partners_offers (is_active, sort_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partners_offers_category
  ON public.partners_offers (category) WHERE is_active = TRUE;

-- RLS : tout user authentifié peut lire les offres actives.
-- WRITE/DELETE/UPDATE réservé au service_role (= back-office Supabase
-- ou Edge Function avec service key). On ne donne PAS d'accès update
-- au client.
ALTER TABLE public.partners_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active offers" ON public.partners_offers
  FOR SELECT
  USING (is_active = TRUE);

COMMENT ON TABLE public.partners_offers IS
  'Offres promo des marques partenaires (Gymshark, Nutripure…). Code Premium masqué côté app pour les free users.';
COMMENT ON COLUMN public.partners_offers.discount_code IS
  'Code réservé Premium. RLS expose ce champ à tous mais l''app le cache côté UI quand isPremium=false.';
COMMENT ON COLUMN public.partners_offers.public_code IS
  'Code accessible à tous les users, même free (teaser à 5%, etc.). NULL si seuls les Premium ont accès.';

-- ─────────────────────────────────────────────────────────────────
-- Seed MVP : 6 offres placeholders. À remplacer par les vrais codes
-- une fois les deals signés. Le code 'CONTACT' indique à l'user que
-- le partenariat arrive bientôt sans bloquer le launch.
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.partners_offers (id, brand, title, description, discount_code, discount_pct, category, image_url, partner_url, sort_order, public_code)
VALUES
  ('gymshark_2026_05',
   'Gymshark',
   '-20% sur toute la collection',
   'Tenues training haut de gamme. Profite de 20% de réduction sur la nouvelle collection Apex et tous les essentiels.',
   'FORGA20',
   20,
   'apparel',
   'https://logos-world.net/wp-content/uploads/2020/12/Gymshark-Logo.png',
   'https://www.gymshark.com',
   10,
   'FORGA5'),
  ('nutripure_2026_05',
   'Nutripure',
   '-15% sur les protéines & créatine',
   'Compléments alimentaires français, fabriqués en France et certifiés purs. Whey isolat, créatine monohydrate, oméga 3.',
   'FORGAPRO15',
   15,
   'supplements',
   'https://nutripure.fr/cdn/shop/files/logo-nutripure-noir.png',
   'https://www.nutripure.fr',
   20,
   NULL),
  ('fitnessboutique_2026_05',
   'FitnessBoutique',
   '-10% sur tout l''équipement',
   'Équipement de musculation et cardio pour la maison. Haltères, barres, racks, banc. Livraison en 48h.',
   'FORGAPRO10',
   10,
   'equipment',
   'https://www.fitnessboutique.com/images/fb-logo.png',
   'https://www.fitnessboutique.com',
   30,
   NULL),
  ('myprotein_2026_05',
   'MyProtein',
   '-25% panier au choix',
   'Le plus large catalogue de compléments sportifs. Whey, créatine, BCAA, vitamines. Promotion sur le panier complet.',
   'FORGAMP25',
   25,
   'supplements',
   'https://logos-world.net/wp-content/uploads/2021/02/Myprotein-Logo.png',
   'https://www.myprotein.fr',
   40,
   NULL),
  ('decathlon_2026_05',
   'Decathlon',
   'Offre spéciale FORGA',
   'Bientôt disponible — un partenariat Decathlon pour la collection Domyos training est en cours de finalisation.',
   'CONTACT',
   NULL,
   'equipment',
   'https://logos-world.net/wp-content/uploads/2020/09/Decathlon-Logo.png',
   'https://www.decathlon.fr',
   50,
   NULL),
  ('garmin_2026_05',
   'Garmin',
   'Réduction sur les montres connectées',
   'Forerunner, Vivoactive, Fenix. Tracking précis HR, sommeil, charge d''entraînement compatible FORGA.',
   'FORGAGM',
   10,
   'equipment',
   'https://logos-world.net/wp-content/uploads/2020/12/Garmin-Logo.png',
   'https://www.garmin.com/fr-FR',
   60,
   NULL)
ON CONFLICT (id) DO NOTHING;
