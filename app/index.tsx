import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';

function isStandalone(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  return (
    (window as any).navigator?.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
  );
}

function isMobileDevice(): boolean {
  if (Platform.OS !== 'web') return false;
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  return /iPad|iPhone|iPod|Android/.test(ua);
}

// Ordre du flow onboarding. step0-archetype a été supprimé (redondant
// avec step3-objective), donc le 1er écran réel est step1-identity.
// Le fichier step0-archetype.tsx reste sous forme de redirect vers
// step1-identity pour les utilisateurs qui auraient une session
// d'onboarding sauvegardée à l'ancienne route.
//
// Indexé 1-based pour matcher `onboardingStep` persisté (step1 = 1,
// step2 = 2…). On garde un slot vide à l'index 0 pour éviter les
// off-by-one quand on indexe par numéro d'étape.
const ONBOARDING_ROUTES = [
  '/(onboarding)/step1-identity', // [0] safety fallback (onboardingStep < 1)
  '/(onboarding)/step1-identity', // [1]
  '/(onboarding)/step2-body',     // [2]
  '/(onboarding)/step3-objective',// [3]
  '/(onboarding)/step4-target',   // [4]
  '/(onboarding)/step5-activity', // [5]
  '/(onboarding)/step5b-cycling', // [6]
  '/(onboarding)/step6-preferences', // [7]
  '/(onboarding)/step7-summary',  // [8]
] as const;

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);
  const onboardingStep = useUserStore((s) => s.onboardingStep);

  // ── No session ──
  if (!session) {
    // PWA (standalone): go straight to login, skip landing page
    if (Platform.OS === 'web' && isStandalone()) {
      return <Redirect href="/(auth)/login" />;
    }
    // Browser: show landing page
    return <Redirect href="/(auth)/welcome" />;
  }

  // ── Not onboarded — resume at the last tracked step (or step1 by default) ──
  // `onboardingStep` est 1-based (step1=1, step2=2…) et matche directement
  // l'index dans ONBOARDING_ROUTES qui a un slot fantôme à [0].
  if (!isOnboarded) {
    const targetStep = Math.min(Math.max(onboardingStep, 1), ONBOARDING_ROUTES.length - 1);
    const route = ONBOARDING_ROUTES[targetStep] ?? '/(onboarding)/step1-identity';
    return <Redirect href={route as any} />;
  }

  // ── Mobile browser (not PWA): always show install guide ──
  if (Platform.OS === 'web' && !isStandalone() && isMobileDevice()) {
    return <Redirect href="/install-guide" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
