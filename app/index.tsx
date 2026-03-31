import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

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

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);

  // ── No session ──
  if (!session) {
    // PWA (standalone): go straight to login, skip landing page
    if (Platform.OS === 'web' && isStandalone()) {
      return <Redirect href="/(auth)/login" />;
    }
    // Browser: show landing page
    return <Redirect href="/(auth)/welcome" />;
  }

  // ── Not onboarded ──
  if (!isOnboarded) {
    return <Redirect href="/(onboarding)/step1-identity" />;
  }

  // ── Mobile browser (not PWA): always show install guide ──
  if (Platform.OS === 'web' && !isStandalone() && isMobileDevice()) {
    return <Redirect href="/install-guide" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
