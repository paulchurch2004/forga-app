import { Platform } from 'react-native';
import { isDemoMode, supabase } from './supabase';

const isWeb = Platform.OS === 'web';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

function getFunctionsUrl(): string {
  return `${SUPABASE_URL}/functions/v1`;
}

function getReturnUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5557';
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

export interface VerifyResult {
  isPremium: boolean;
  premiumUntil?: string;
  error?: string;
}

/**
 * Create a Stripe Checkout Session and return the redirect URL.
 * Web only. Returns null on mobile or in demo mode.
 */
export async function createCheckoutSession(
  plan: 'monthly' | 'annual',
  userId: string,
): Promise<CheckoutResult | null> {
  if (!isWeb) return null;
  if (isDemoMode) return null;

  const { data: { session: authSession } } = await supabase.auth.getSession();
  const response = await fetch(`${getFunctionsUrl()}/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authSession?.access_token ? { Authorization: `Bearer ${authSession.access_token}` } : {}),
    },
    body: JSON.stringify({
      plan,
      userId,
      returnUrl: getReturnUrl(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Erreur lors de la création de la session');
  }

  return response.json();
}

/**
 * Verify a completed Checkout Session and update premium status.
 */
export async function verifyCheckoutSession(
  sessionId: string,
): Promise<VerifyResult> {
  if (isDemoMode) {
    return {
      isPremium: true,
      premiumUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    };
  }

  const response = await fetch(`${getFunctionsUrl()}/verify-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Erreur lors de la vérification');
  }

  return response.json();
}
