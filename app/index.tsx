import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../src/store/authStore';

const INSTALL_GUIDE_KEY = 'forga_install_guide_shown';

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
  const [guideCheck, setGuideCheck] = useState<'loading' | 'needed' | 'not_needed'>('loading');

  useEffect(() => {
    // Not on web, or not fully onboarded yet: no guide check needed
    if (Platform.OS !== 'web' || !session || !isOnboarded) {
      setGuideCheck('not_needed');
      return;
    }
    // Already installed as PWA: skip guide
    if (isStandalone()) {
      setGuideCheck('not_needed');
      return;
    }
    // Desktop: skip guide
    if (!isMobileDevice()) {
      setGuideCheck('not_needed');
      return;
    }
    // Mobile browser: check if guide was already shown
    AsyncStorage.getItem(INSTALL_GUIDE_KEY).then((val) => {
      setGuideCheck(val ? 'not_needed' : 'needed');
    });
  }, [session, isOnboarded]);

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

  // ── Onboarded: check install guide ──
  if (guideCheck === 'loading') return null;

  if (guideCheck === 'needed') {
    return <Redirect href="/install-guide" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
