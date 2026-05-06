// Lightweight PostHog client — no SDK, just fetch to the ingest endpoint.
// Activates automatically when EXPO_PUBLIC_POSTHOG_KEY is set.
// Buffers events when offline / not yet initialized; flushes on init or app foreground.

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type EventProperties = Record<string, string | number | boolean | null>;

interface QueuedEvent {
  event: string;
  properties: EventProperties;
  timestamp: string;
}

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
const DISTINCT_ID_KEY = 'forga-posthog-distinct-id';

let isInitialized = false;
let distinctId: string | null = null;
let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let userId: string | null = null;

function uuidV4(): string {
  // RFC4122 v4 — sufficient for analytics distinct IDs
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function ensureDistinctId(): Promise<string> {
  if (distinctId) return distinctId;
  let stored = await AsyncStorage.getItem(DISTINCT_ID_KEY).catch(() => null);
  if (!stored) {
    stored = uuidV4();
    await AsyncStorage.setItem(DISTINCT_ID_KEY, stored).catch(() => {});
  }
  distinctId = stored;
  return stored;
}

export async function initAnalytics(): Promise<void> {
  if (!POSTHOG_KEY) {
    if (__DEV__) console.warn('[Analytics] No PostHog key configured — events will be discarded');
    return;
  }
  await ensureDistinctId();
  isInitialized = true;
  scheduleFlush();
}

/** Call once we know who the user is so events can be linked across sessions. */
export function identifyUser(supabaseUserId: string): void {
  userId = supabaseUserId;
  trackEvent('$identify', { $set: { user_id: supabaseUserId } as never });
}

export function resetUser(): void {
  userId = null;
}

export function trackEvent(event: string, properties?: EventProperties): void {
  if (!POSTHOG_KEY) return;
  const enriched: EventProperties = {
    ...(properties ?? {}),
    platform: Platform.OS,
    app_version: Constants.expoConfig?.version ?? 'unknown',
    build:
      (Constants.expoConfig?.ios as any)?.buildNumber ??
      (Constants.expoConfig?.android as any)?.versionCode ??
      'unknown',
    ...(userId ? { user_id: userId } : {}),
  };
  queue.push({ event, properties: enriched, timestamp: new Date().toISOString() });
  if (__DEV__) console.log(`[Analytics] ${event}`, enriched);
  scheduleFlush();
}

function scheduleFlush() {
  if (!isInitialized || queue.length === 0 || flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 1500);
}

async function flush(): Promise<void> {
  if (!POSTHOG_KEY || !isInitialized || queue.length === 0) return;
  const id = await ensureDistinctId();
  const batch = queue.splice(0, queue.length);

  try {
    await fetch(`${POSTHOG_HOST}/batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        batch: batch.map((e) => ({
          event: e.event,
          distinct_id: id,
          properties: e.properties,
          timestamp: e.timestamp,
        })),
      }),
      // Network errors should not crash the app
    });
  } catch {
    // On failure, push events back to the queue for next attempt
    queue = [...batch, ...queue];
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

  // Quotas
  quotaExceeded: (feature: 'coach_message' | 'food_scan') =>
    trackEvent('quota_exceeded', { feature }),

  // Coach LLM
  coachMessageSent: (props: { cached: boolean; remaining: number; cap: number }) =>
    trackEvent('coach_message_sent', props),
  coachMessageFailed: (reason: 'network' | 'auth' | 'quota' | 'server') =>
    trackEvent('coach_message_failed', { reason }),
  coachFallbackUsed: () =>
    trackEvent('coach_fallback_used'),

  // Trial
  trialStarted: () => trackEvent('trial_started'),
  trialExpired: () => trackEvent('trial_expired'),
  trialExtended: () => trackEvent('trial_extended'),
  trialConverted: () => trackEvent('trial_converted'),

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
