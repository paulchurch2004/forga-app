import { supabase, isDemoMode } from './supabase';

// ─── Système de paliers (V2 — au lieu d'un flat 7j/parrainage) ──
// Chaque parrainage donne 14 jours de Premium (base). Aux paliers
// 3 / 10 / 25, l'user débloque un bonus supplémentaire — effet
// gamification "engrenage" : quand on en a 2, on voit "1 de plus
// = +1 mois", ça incite à pousser. Économiquement très rentable :
// chaque parrainage actif vaut ~30€ de LTV vs ~2-3€ de coût Premium offert.
const BASE_DAYS_PER_REFERRAL = 14;

interface ReferralTier {
  /** Nombre de parrainages requis pour débloquer le bonus. */
  atCount: number;
  /** Jours bonus ajoutés en + du base de 14j pour ce parrainage. */
  bonusDays: number;
  /** Libellé pour l'UI (ex. "+1 mois Pro"). */
  labelKey: 'tier1Month' | 'tier3Months' | 'tier1Year';
}

export const REFERRAL_TIERS: ReferralTier[] = [
  { atCount: 3, bonusDays: 15, labelKey: 'tier1Month' },     // 3 parrains → cumul ≈ 1 mois
  { atCount: 10, bonusDays: 60, labelKey: 'tier3Months' },    // 10 → cumul ≈ 3,5 mois
  { atCount: 25, bonusDays: 180, labelKey: 'tier1Year' },     // 25 → cumul ≈ 20 mois (≈ 1 an+)
];

/** Bonus offert au FILLEUL qui s'inscrit via un lien de parrainage,
 *  EN PLUS du trial automatique de 7j. Total : 37 jours de Pro gratuit.
 *  Incite l'inscription via lien plutôt que direct. */
export const REFEREE_BONUS_DAYS = 30;

/**
 * Calcule le total de jours Premium à ajouter quand l'user passe de
 * `oldCount` parrainages à `newCount`. Inclut :
 *   - Base : 14j × (newCount - oldCount)
 *   - Bonus paliers : pour chaque palier franchi entre old et new.
 */
export function calculateReferralReward(oldCount: number, newCount: number): number {
  if (newCount <= oldCount) return 0;
  const baseDays = BASE_DAYS_PER_REFERRAL * (newCount - oldCount);
  let bonusDays = 0;
  for (const tier of REFERRAL_TIERS) {
    if (tier.atCount > oldCount && tier.atCount <= newCount) {
      bonusDays += tier.bonusDays;
    }
  }
  return baseDays + bonusDays;
}

/** Renvoie le prochain palier non encore atteint, ou null si tous atteints. */
export function getNextTier(currentCount: number): ReferralTier | null {
  return REFERRAL_TIERS.find((t) => t.atCount > currentCount) ?? null;
}

/**
 * Generate a unique referral code (FORGA-XXXX)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for readability
  let code = '';
  const randomBytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 8; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `FORGA-${code}`;
}

/**
 * Validate a referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^FORGA-[A-Z0-9]{4,8}$/i.test(code.trim());
}

/**
 * Look up a referral code to find the referrer
 * Returns the referrer's user ID or null if code doesn't exist
 */
export async function lookupReferralCode(code: string): Promise<string | null> {
  if (isDemoMode) {
    // In demo mode, accept any valid-format code
    return isValidReferralCode(code) ? 'demo-referrer' : null;
  }

  // Use RPC function (security definer) to bypass RLS safely
  const { data } = await supabase
    .rpc('lookup_referral_code', { code: code.trim().toUpperCase() });

  return data ?? null;
}

/**
 * Apply a referral : récompense le parrain avec un nombre de jours Premium
 * calculé via les paliers (base 14j + bonus aux paliers 3/10/25).
 * Called when a new user signs up with a referral code.
 */
export async function applyReferral(
  referrerId: string,
  refereeId: string,
  referralCode: string,
): Promise<boolean> {
  if (isDemoMode) {
    if (__DEV__) console.log('[Referral] Demo mode — referral applied locally');
    return true;
  }

  try {
    // 0. Dédup côté client : vérifie qu'on n'a pas DÉJÀ logué ce
    // referee pour ce parrain (cas où l'user a déjà signup ailleurs
    // avec ce code, ou retry après échec partiel). Sans cette garde,
    // on doublerait la récompense si une retry passe.
    const { data: existing } = await supabase
      .from('referral_log')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referee_id', refereeId)
      .maybeSingle();

    if (existing) {
      if (__DEV__) console.log('[Referral] Already logged — skipping double reward');
      return true;
    }

    // 1. Récupère le count actuel du parrain AVANT d'insérer le log
    // (ordre : read → log → update). Si l'update échoue après le log
    // on rollback le log pour éviter un log orphelin sans récompense.
    const { data: referrer } = await supabase
      .from('users')
      .select('referral_count, premium_until, is_premium')
      .eq('id', referrerId)
      .single();

    if (!referrer) return false;

    const oldCount = referrer.referral_count ?? 0;
    const newCount = oldCount + 1;
    const daysToAdd = calculateReferralReward(oldCount, newCount);

    // 2. Log d'abord (capture l'event même si l'update échoue)
    const { data: logRow, error: logError } = await supabase
      .from('referral_log')
      .insert({
        referrer_id: referrerId,
        referee_id: refereeId,
        referral_code: referralCode,
        reward_type: 'tier_system_v2',
        reward_applied: true,
      })
      .select('id')
      .single();

    if (logError) throw logError;

    // 3. Étend premium_until de daysToAdd
    const now = new Date();
    const currentEnd = referrer.premium_until
      ? new Date(referrer.premium_until)
      : now;
    const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()));
    newEnd.setDate(newEnd.getDate() + daysToAdd);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        referral_count: newCount,
        premium_until: newEnd.toISOString(),
        is_premium: true,
      })
      .eq('id', referrerId);

    if (updateError) {
      // Rollback du log pour éviter une dédup faussée qui bloque les
      // retries. Si le rollback échoue à son tour on log seulement.
      if (logRow?.id) {
        await supabase.from('referral_log').delete().eq('id', logRow.id).catch?.(() => {});
      }
      throw updateError;
    }

    return true;
  } catch (error) {
    if (__DEV__) console.error('[Referral] Error applying referral:', error);
    return false;
  }
}

/**
 * Applique le bonus FILLEUL (+30 jours en plus du trial 7j auto) à
 * l'user qui vient de s'inscrire avec un code de parrainage. À appeler
 * juste après la création du compte si `referredByCode` est présent.
 */
export async function applyRefereeBonus(refereeId: string): Promise<boolean> {
  if (isDemoMode) {
    if (__DEV__) console.log('[Referral] Demo mode — referee bonus applied locally');
    return true;
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('premium_until')
      .eq('id', refereeId)
      .single();

    if (!user) return false;

    const now = new Date();
    const currentEnd = user.premium_until ? new Date(user.premium_until) : now;
    const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()));
    newEnd.setDate(newEnd.getDate() + REFEREE_BONUS_DAYS);

    const { error } = await supabase
      .from('users')
      .update({
        premium_until: newEnd.toISOString(),
        is_premium: true,
      })
      .eq('id', refereeId);

    if (error) throw error;
    return true;
  } catch (error) {
    if (__DEV__) console.error('[Referral] Error applying referee bonus:', error);
    return false;
  }
}

/**
 * Calculate the premium end date for local/demo use
 */
export function calculatePremiumUntil(
  currentPremiumUntil: string | undefined,
  daysToAdd: number = BASE_DAYS_PER_REFERRAL,
): string {
  const now = new Date();
  const currentEnd = currentPremiumUntil
    ? new Date(currentPremiumUntil)
    : now;
  const base = new Date(Math.max(currentEnd.getTime(), now.getTime()));
  base.setDate(base.getDate() + daysToAdd);
  return base.toISOString();
}
