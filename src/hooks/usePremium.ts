import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { checkPremiumStatus } from '../services/revenueCat';
import { events } from '../services/analytics';
import { syncProfile } from '../services/userSync';

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

  // Date d'expiration formatée pour affichage. Avant : on n'avait que
  // `daysLeft` (ex: "3 jours"), ambigu car l'user ne sait pas si ça
  // signifie 3*24h depuis maintenant ou jusqu'à une date X à minuit.
  // Maintenant on expose les deux pour que l'UI puisse afficher
  // "Expire le 15 juin (3 jours)".
  const expiresAtFormatted = (() => {
    if (!profile?.premiumUntil) return null;
    try {
      const until = new Date(profile.premiumUntil);
      if (Number.isNaN(until.getTime())) return null;
      return until.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return null;
    }
  })();

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
            // Sync vers Supabase — sans ça, l'expiration de trial
            // n'était propagée qu'en local : sur un autre device,
            // l'user restait "premium" alors que son trial venait
            // de finir → revenue leak.
            if (profile.id) syncProfile({ isPremium: false }, profile.id);
            events.trialExpired();
          }
        }
      }

      // On native, also check RevenueCat for store subscriptions.
      // If we find an active subscription while the trial is about to
      // expire (or already expired), that's a conversion — fire the event.
      if (Platform.OS !== 'web') {
        const premium = await checkPremiumStatus();
        if (premium) {
          const wasTrialActive = profile?.isPremium && profile?.premiumUntil &&
            new Date(profile.premiumUntil).getTime() < Date.now() + 24 * 60 * 60 * 1000;
          updateProfile({ isPremium: true });
          // Sync — un upgrade RevenueCat (App Store / Play) doit être
          // visible côté DB pour le coach IA (contexte premium → débloque
          // certains conseils) et pour la rétention multi-device.
          if (profile?.id) syncProfile({ isPremium: true }, profile.id);
          if (wasTrialActive && !profile?.stripeSubscriptionId) {
            events.trialConverted();
          }
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
    expiresAtFormatted,
    refreshPremiumStatus,
    requirePremium,
  };
}
