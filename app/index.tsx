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

const ONBOARDING_ROUTES = [
  '/(onboarding)/step0-archetype',
  '/(onboarding)/step1-identity',
  '/(onboarding)/step2-body',
  '/(onboarding)/step3-objective',
  '/(onboarding)/step4-target',
  '/(onboarding)/step5-activity',
  '/(onboarding)/step6-preferences',
  '/(onboarding)/step7-summary',
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

  // ── Not onboarded — resume at the last completed step (or step1 by default) ──
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
