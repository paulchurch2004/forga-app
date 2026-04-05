import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { checkPremiumStatus } from '../services/revenueCat';

export function usePremium() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [isChecking, setIsChecking] = useState(false);

  const isPremium = profile?.isPremium ?? false;

  // Calculate days left for trial
  const daysLeft = (() => {
    if (!profile?.premiumUntil) return null;
    const until = new Date(profile.premiumUntil);
    const now = new Date();
    const diff = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  const isTrialActive = isPremium && daysLeft !== null && daysLeft > 0;
  const isTrialExpired = daysLeft !== null && daysLeft <= 0 && !profile?.stripeSubscriptionId;

  const refreshPremiumStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      // Check premiumUntil expiry (works on all platforms for trial/referral)
      if (profile?.premiumUntil) {
        const now = new Date();
        const until = new Date(profile.premiumUntil);
        if (until <= now && profile.isPremium) {
          // Don't expire if user has an active Stripe subscription
          if (!profile.stripeSubscriptionId) {
            updateProfile({ isPremium: false });
          }
        }
      }

      // On native, also check RevenueCat for store subscriptions
      if (Platform.OS !== 'web') {
        const premium = await checkPremiumStatus();
        if (premium) {
          updateProfile({ isPremium: true });
        }
      }
    } catch {
      // Keep current status on error
    } finally {
      setIsChecking(false);
    }
  }, [updateProfile, profile]);

  // Check premium status on mount and when profile changes
  useEffect(() => {
    refreshPremiumStatus();
  }, [refreshPremiumStatus]);

  // Gate a feature behind premium
  const requirePremium = useCallback(
    (callback: () => void, onBlocked?: () => void) => {
      if (isPremium) {
        callback();
      } else {
        onBlocked?.();
      }
    },
    [isPremium]
  );

  return {
    isPremium,
    isChecking,
    isTrialActive,
    isTrialExpired,
    daysLeft,
    refreshPremiumStatus,
    requirePremium,
  };
}
