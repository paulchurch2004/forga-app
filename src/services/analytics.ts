// PostHog Analytics — RGPD friendly
// Wraps analytics calls so we can easily swap providers

type EventProperties = Record<string, string | number | boolean | null>;

let isInitialized = false;

export async function initAnalytics(): Promise<void> {
  // PostHog initialization would go here
  // Using lazy init to avoid blocking app startup
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    console.warn('[Analytics] No PostHog key configured');
    return;
  }
  isInitialized = true;
}

export function trackEvent(event: string, properties?: EventProperties): void {
  if (!isInitialized) return;
  // PostHog capture would go here
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties);
  }
}

// ─── Événements prédéfinis ───

export const events = {
  // Auth
  signUp: (method: 'email' | 'apple' | 'google') =>
    trackEvent('sign_up', { method }),
  signIn: (method: 'email' | 'apple' | 'google') =>
    trackEvent('sign_in', { method }),

  // Onboarding
  onboardingStep: (step: number) =>
    trackEvent('onboarding_step', { step }),
  onboardingComplete: () =>
    trackEvent('onboarding_complete'),

  // Meals
  mealViewed: (mealId: string, slot: string) =>
    trackEvent('meal_viewed', { mealId, slot }),
  mealValidated: (mealId: string, slot: string) =>
    trackEvent('meal_validated', { mealId, slot }),
  mealFavorited: (mealId: string) =>
    trackEvent('meal_favorited', { mealId }),

  // Score
  scoreUpdated: (score: number) =>
    trackEvent('score_updated', { score }),
  scoreLevel: (level: string) =>
    trackEvent('score_level_reached', { level }),

  // Streak
  streakDay: (days: number) =>
    trackEvent('streak_day', { days }),
  streakLost: (previousStreak: number) =>
    trackEvent('streak_lost', { previousStreak }),
  streakFreezeUsed: () =>
    trackEvent('streak_freeze_used'),

  // Badge
  badgeUnlocked: (badge: string) =>
    trackEvent('badge_unlocked', { badge }),

  // Check-in
  checkInCompleted: () =>
    trackEvent('checkin_completed'),

  // Paywall
  paywallShown: (trigger: string) =>
    trackEvent('paywall_shown', { trigger }),
  paywallDismissed: () =>
    trackEvent('paywall_dismissed'),
  purchaseStarted: (plan: 'monthly' | 'annual') =>
    trackEvent('purchase_started', { plan }),
  purchaseCompleted: (plan: 'monthly' | 'annual') =>
    trackEvent('purchase_completed', { plan }),

  // Referral
  referralCodeShared: (method: 'copy' | 'share') =>
    trackEvent('referral_code_shared', { method }),
  referralCodeUsed: (code: string) =>
    trackEvent('referral_code_used', { code }),
  referralRewardEarned: (totalReferrals: number) =>
    trackEvent('referral_reward_earned', { totalReferrals }),

  // App
  appOpened: () =>
    trackEvent('app_opened'),
  screenViewed: (screen: string) =>
    trackEvent('screen_viewed', { screen }),
} as const;
