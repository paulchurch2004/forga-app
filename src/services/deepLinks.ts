// FORGA — Deep link handler.
// Supports:
//   - Universal Links: https://forga.fr/r/<CODE> → set referral code
//   - Custom scheme:   forga://r/<CODE>          → set referral code
//
// Referral codes are stored in the onboarding data so the register screen
// can pre-fill the input. If the user is already signed in and has
// completed onboarding, the code is ignored — referrals only apply at
// signup.

import * as Linking from 'expo-linking';
import { useUserStore } from '../store/userStore';
import { events } from './analytics';

const REFERRAL_PATH_REGEX = /^\/r\/([A-Z0-9-]{3,16})$/i;

function extractReferralCode(url: string): string | null {
  try {
    const parsed = new URL(url.replace('forga://', 'https://forga.fr/'));
    const match = parsed.pathname.match(REFERRAL_PATH_REGEX);
    if (!match) return null;
    return match[1].toUpperCase();
  } catch {
    return null;
  }
}

function applyReferralCode(code: string) {
  const userStore = useUserStore.getState();
  if (userStore.profile) return; // user already signed up — ignore
  if (userStore.onboardingData.referredByCode) return; // already set
  userStore.setOnboardingData({ referredByCode: code });
  events.referralCodeUsed(code);
}

/** Process a single URL — extract a referral code if present and apply it. */
export function handleDeepLink(url: string | null | undefined) {
  if (!url) return;
  const code = extractReferralCode(url);
  if (code) applyReferralCode(code);
}

/** Subscribe to incoming deep links + process the URL the app was opened
 *  with. Returns an unsubscribe function. */
export function initDeepLinks(): () => void {
  Linking.getInitialURL().then(handleDeepLink).catch(() => {});
  const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
  return () => sub.remove();
}
