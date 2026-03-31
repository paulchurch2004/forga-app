import { supabase, isDemoMode } from './supabase';

const REWARD_DAYS = 7; // 1 week premium per referral

/**
 * Generate a unique referral code (FORGA-XXXX)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for readability
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FORGA-${code}`;
}

/**
 * Validate a referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^FORGA-[A-Z0-9]{4}$/i.test(code.trim());
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

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', code.trim().toUpperCase())
    .single();

  return data?.id ?? null;
}

/**
 * Apply a referral: reward the referrer with 1 week premium
 * Called when a new user signs up with a referral code
 */
export async function applyReferral(
  referrerId: string,
  refereeId: string,
  referralCode: string,
): Promise<boolean> {
  if (isDemoMode) {
    console.log('[Referral] Demo mode — referral applied locally');
    return true;
  }

  try {
    // 1. Log the referral
    const { error: logError } = await supabase
      .from('referral_log')
      .insert({
        referrer_id: referrerId,
        referee_id: refereeId,
        referral_code: referralCode,
        reward_type: '1_week_premium',
        reward_applied: true,
      });

    if (logError) throw logError;

    // 2. Increment referrer's referral count
    const { data: referrer } = await supabase
      .from('users')
      .select('referral_count, premium_until, is_premium')
      .eq('id', referrerId)
      .single();

    if (!referrer) return false;

    // 3. Extend referrer's premium by 1 week
    const now = new Date();
    const currentEnd = referrer.premium_until
      ? new Date(referrer.premium_until)
      : now;
    const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()));
    newEnd.setDate(newEnd.getDate() + REWARD_DAYS);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        referral_count: (referrer.referral_count ?? 0) + 1,
        premium_until: newEnd.toISOString(),
        is_premium: true,
      })
      .eq('id', referrerId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('[Referral] Error applying referral:', error);
    return false;
  }
}

/**
 * Calculate the premium end date for local/demo use
 */
export function calculatePremiumUntil(
  currentPremiumUntil: string | undefined,
  weeksToAdd: number = 1,
): string {
  const now = new Date();
  const currentEnd = currentPremiumUntil
    ? new Date(currentPremiumUntil)
    : now;
  const base = new Date(Math.max(currentEnd.getTime(), now.getTime()));
  base.setDate(base.getDate() + weeksToAdd * REWARD_DAYS);
  return base.toISOString();
}
