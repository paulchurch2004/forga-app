// FORGA — Back navigation pour le flow onboarding.
//
// Problème résolu : `router.back()` ne fait RIEN quand le stack
// navigator n'a qu'une seule entrée. Ça arrive systématiquement quand
// l'user ferme l'app au milieu de l'onboarding puis la rouvre : on le
// redirige sur stepN avec `<Redirect>` (= replace), donc l'historique
// est vide et la flèche retour devient silencieusement inopérante.
//
// Ce hook retourne un handler qui :
//   1. Joue le retour stack si l'historique le permet (cas nominal).
//   2. Sinon fallback sur `router.replace(previousRoute)` pour
//      garantir que l'user puisse TOUJOURS revenir en arrière.

import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }).catch(() => {});
};

/**
 * Retourne un handler back garanti.
 *
 * @param previousRoute Route absolue vers laquelle replace si le stack
 *   ne peut pas faire back. Ex: `/(onboarding)/step1-identity`.
 */
export function useOnboardingBack(previousRoute: string) {
  const router = useRouter();
  return useCallback(() => {
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback : on REPLACE plutôt que push pour éviter d'empiler
      // step3 → step2 → step3 → step2 si l'user va-et-vient.
      router.replace(previousRoute as any);
    }
  }, [router, previousRoute]);
}
