// FORGA — Hook qui décide quand afficher le popup de rappel parrainage.
//
// Critères d'affichage (tous doivent être vrais) :
//   1. User non Premium (les Premium ne sont pas la cible — ils ont
//      déjà l'abo, le rappel "1 semaine offerte" n'a pas de valeur)
//   2. firstActiveDate ≥ 2 jours (on n'embête pas les nouveaux users
//      qui n'ont rien à raconter à leurs amis)
//   3. Pas de popup montré dans les 5 derniers jours
//   4. L'user a un referral_code (set par défaut au signup)
//
// L'affichage se fait via le state local `shouldShow` que le composant
// parent passe au modal. Quand l'user dismiss, on stamp
// `referralPromptShownAt` pour ne pas le re-montrer avant 5j.

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import { usePremium } from './usePremium';

const MIN_DAYS_SINCE_FIRST_ACTIVE = 2;
const MIN_DAYS_BETWEEN_PROMPTS = 5;

function daysBetween(aIso: string, bIso: string): number {
  return Math.floor((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86400000);
}

export function useReferralPrompt() {
  const profile = useUserStore((s) => s.profile);
  const { isPremium } = usePremium();
  const firstActiveDate = useSettingsStore((s) => s.firstActiveDate);
  const referralPromptShownAt = useSettingsStore((s) => s.referralPromptShownAt);
  const [shouldShow, setShouldShow] = useState(false);

  // Évalue les critères au mount + à chaque changement des deps.
  // On délaye de 1.5s pour laisser le user voir le Home d'abord —
  // un popup immédiat à l'ouverture fait "spammy".
  useEffect(() => {
    if (isPremium) return; // Cible : free users uniquement
    if (!profile?.referralCode) return; // Pas de code → rien à partager
    if (!firstActiveDate) return; // Trop tôt — pas encore stamp

    const nowIso = new Date().toISOString();
    if (daysBetween(firstActiveDate, nowIso) < MIN_DAYS_SINCE_FIRST_ACTIVE) return;
    if (
      referralPromptShownAt &&
      daysBetween(referralPromptShownAt, nowIso) < MIN_DAYS_BETWEEN_PROMPTS
    ) return;

    // Tous les critères passent — on schedule l'affichage avec 1.5s
    // de délai pour ne pas couvrir le splash / le 1er paint.
    const timer = setTimeout(() => setShouldShow(true), 1500);
    return () => clearTimeout(timer);
  }, [isPremium, profile?.referralCode, firstActiveDate, referralPromptShownAt]);

  const dismiss = useCallback(() => {
    setShouldShow(false);
    // Stamp pour ne pas re-montrer avant 5 jours
    useSettingsStore.setState({ referralPromptShownAt: new Date().toISOString() });
  }, []);

  return {
    shouldShow,
    dismiss,
    referralCode: profile?.referralCode ?? '',
    referralCount: profile?.referralCount ?? 0,
  };
}
