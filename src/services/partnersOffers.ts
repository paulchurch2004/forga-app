// FORGA — Service partenaires (offres promo Premium).
//
// Lit la table Supabase `partners_offers` et expose la liste à l'app.
// Le champ `discount_code` est TOUJOURS retourné depuis le serveur
// (RLS = read public sur is_active=true) mais l'UI le cache aux users
// non-premium — c'est intentionnel pour permettre le teaser "tu as
// 6 offres, dont -20% Gymshark... débloque Pro pour voir les codes".

import { supabase, isDemoMode } from './supabase';

export type OfferCategory =
  | 'apparel'
  | 'supplements'
  | 'equipment'
  | 'food'
  | 'other';

export interface PartnerOffer {
  id: string;
  brand: string;
  title: string;
  description: string;
  /** Code réservé Premium. Présent en mémoire mais à NE PAS afficher
   *  si l'user n'est pas premium — c'est à l'UI de gérer le gating. */
  discountCode: string;
  discountPct: number | null;
  category: OfferCategory;
  imageUrl: string | null;
  partnerUrl: string;
  expiresAt: string | null;
  sortOrder: number;
  /** Code accessible à tous (teaser). NULL = aucun code public. */
  publicCode: string | null;
}

/**
 * Charge les offres partenaires actives depuis Supabase.
 * Tri : sort_order ASC puis created_at DESC. Cap à 50 offres pour
 * éviter de charger une liste démesurée si l'admin oublie de
 * désactiver les vieilles offres.
 */
export async function fetchPartnerOffers(): Promise<PartnerOffer[]> {
  if (isDemoMode) return [];

  const { data, error } = await supabase
    .from('partners_offers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    if (__DEV__) console.warn('[partnersOffers] fetch failed:', error?.message);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    brand: row.brand,
    title: row.title,
    description: row.description,
    discountCode: row.discount_code,
    discountPct: row.discount_pct,
    category: (row.category ?? 'other') as OfferCategory,
    imageUrl: row.image_url ?? null,
    partnerUrl: row.partner_url,
    expiresAt: row.expires_at ?? null,
    sortOrder: row.sort_order ?? 100,
    publicCode: row.public_code ?? null,
  }));
}
