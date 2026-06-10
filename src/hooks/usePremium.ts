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
    if (!profile) return;
    setIsChecking(true);
    try {
      // 1. Abonnement store actif (RevenueCat App Store / Play) ? C'est la
      //    source de vérité PRIORITAIRE : un abonné ne doit jamais être
      //    expiré par la logique de trial ci-dessous (sinon ping-pong
      //    isPremium true↔false → boucle de rendu).
      let storePremium = false;
      if (Platform.OS !== 'web') {
        storePremium = await checkPremiumStatus();
      }

      if (storePremium) {
        // ⚠️ On ne met à jour le profil QUE si la valeur change réellement.
        // Sans ce garde, updateProfile crée un nouvel objet `profile` à
        // chaque rendu → ce hook (dépendant de `profile`) se redéclenche
        // en boucle infinie ("Maximum update depth exceeded") → app FIGÉE
        // juste après l'achat. C'était la cause du freeze post-paiement.
        if (!profile.isPremium) {
          const wasTrialActive = !!profile.premiumUntil &&
            new Date(profile.premiumUntil).getTime() < Date.now() + 24 * 60 * 60 * 1000;
          updateProfile({ isPremium: true });
          // Sync — un upgrade RevenueCat doit être visible côté DB pour le
          // coach IA (contexte premium) et la rétention multi-device.
          if (profile.id) syncProfile({ isPremium: true }, profile.id);
          if (wasTrialActive && !profile.stripeSubscriptionId) {
            events.trialConverted();
          }
        }
        return;
      }

      // 2. Pas d'abonnement store → expirer le trial/référral si la date
      //    est passée (et seulement si on est encore premium : no-op sinon,
      //    donc pas de boucle). Garde le sync Supabase pour la cohérence
      //    multi-device (sinon l'user reste "premium" sur un autre device).
      if (
        profile.isPremium &&
        profile.premiumUntil &&
        !profile.stripeSubscriptionId &&
        new Date(profile.premiumUntil) <= new Date()
      ) {
        updateProfile({ isPremium: false });
        if (profile.id) syncProfile({ isPremium: false }, profile.id);
        events.trialExpired();
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
