// Demande de note App Store après 2 jours d'utilisation.
//
// Stratégie :
//   1. Au tout premier foreground, on stamp `firstActiveDate` dans
//      settingsStore.
//   2. À chaque foreground suivant, on check :
//        - iOS uniquement (Android Play a son propre mécanisme natif)
//        - ≥ 48h depuis firstActiveDate
//        - Pas déjà montré dans les 60 derniers jours
//        - User a au moins UNE preuve d'engagement (1+ meal validé OU
//          1+ workout) — pour ne pas montrer à un user qui a juste
//          ouvert et fermé sans rien faire.
//   3. Si tout est OK, on appelle `StoreReview.requestReview()`.
//      Apple gère lui-même la limite à 3×/an et l'affichage natif.
//
// Pourquoi pas de modal custom "Tu aimes l'app ? Oui/Non" : la doc
// Apple est claire — passer par leur prompt natif. Les modals custom
// avant le prompt sont mal vus en revue App Store.

import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { useMealStore } from '../store/mealStore';
import { useTrainingStore } from '../store/trainingStore';

const MIN_DAYS_BEFORE_PROMPT = 2;
const MIN_DAYS_BETWEEN_PROMPTS = 60;

function daysBetween(aIso: string, bIso: string): number {
  return Math.floor((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86400000);
}

/**
 * À appeler au foreground de l'app (depuis _layout.tsx). Garantit que
 * `firstActiveDate` est stamp dès le 1er appel, puis tente de prompt
 * la review selon les critères ci-dessus. Toutes les checks sont
 * synchrones — on n'appelle expo-store-review que si tous les feux
 * sont au vert.
 */
export async function maybePromptReview(): Promise<void> {
  const settings = useSettingsStore.getState();
  const nowIso = new Date().toISOString();

  // 1) Stamp la première date d'activité si pas encore set — AVANT le
  //    guard iOS pour que `useReferralPrompt` (qui dépend du même
  //    timestamp) fonctionne aussi sur Android. Sinon les users Android
  //    ne voient jamais le referral prompt parce que firstActiveDate
  //    reste null à vie.
  if (!settings.firstActiveDate) {
    useSettingsStore.setState({ firstActiveDate: nowIso });
    return; // pas de prompt au tout premier foreground
  }

  // iOS only — Android Play utilise un autre API (in-app review).
  // À implémenter en v1.1 si besoin avec `expo-store-review` Android
  // qui le supporte aussi mais avec un comportement différent.
  if (Platform.OS !== 'ios') return;

  // 2) Check délai ≥ 2 jours depuis firstActiveDate.
  if (daysBetween(settings.firstActiveDate, nowIso) < MIN_DAYS_BEFORE_PROMPT) {
    return;
  }

  // 3) Check pas déjà prompt récemment.
  if (settings.reviewPromptShownAt) {
    if (daysBetween(settings.reviewPromptShownAt, nowIso) < MIN_DAYS_BETWEEN_PROMPTS) {
      return;
    }
  }

  // 4) Engagement minimum : au moins un meal validé OU un workout
  //    enregistré. Sinon on prompt un user qui n'a rien fait → review
  //    négative garantie.
  const mealCount = Object.values(useMealStore.getState().mealHistory)
    .reduce((acc, day) => acc + day.length, 0);
  const workoutDays = Object.keys(useTrainingStore.getState().workouts).length;
  if (mealCount === 0 && workoutDays === 0) return;

  // 5) Tout est OK — on appelle Apple. Si l'API n'est pas dispo
  //    (simulator, vieux iOS) on no-op silencieusement.
  try {
    const StoreReview = await import('expo-store-review');
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;
    await StoreReview.requestReview();
    // Stamp même si Apple a refusé de montrer (limite 3×/an) — on ne
    // peut pas le savoir côté app, donc on assume "shown" pour ne pas
    // retenter immédiatement.
    useSettingsStore.setState({ reviewPromptShownAt: nowIso });
  } catch {
    // expo-store-review non installé ou crash — silent.
  }
}
