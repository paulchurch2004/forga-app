import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { checkPremiumStatus } from '../services/revenueCat';

export function usePremium() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [isChecking, setIsChecking] = useState(false);

  const isPremium = profile?.isPremium ?? false;

  // Check premium status on mount
  useEffect(() => {
    refreshPremiumStatus();
  }, []);

  const refreshPremiumStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      if (Platform.OS === 'web') {
        // On web, check premiumUntil expiry (Stripe / referral rewards)
        if (profile?.premiumUntil) {
          const now = new Date();
          const until = new Date(profile.premiumUntil);
          if (until <= now && profile.isPremium) {
            updateProfile({ isPremium: false });
          }
        }
      } else {
        const premium = await checkPremiumStatus();
        updateProfile({ isPremium: premium });
      }
    } catch {
      // Keep current status on error
    } finally {
      setIsChecking(false);
    }
  }, [updateProfile, profile]);

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
    refreshPremiumStatus,
    requirePremium,
  };
}
