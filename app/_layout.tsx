import React, { useEffect, useRef, Component } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '../src/theme/colors';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { isDemoMode, supabase } from '../src/services/supabase';
import { useAuthStore } from '../src/store/authStore';
import { loadProfileFromSupabase } from '../src/services/profile';
import { initSentry, captureException } from '../src/services/sentry';
import { View, Text, ActivityIndicator, ScrollView, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  scheduleMealReminder,
  scheduleWeeklyCheckIn,
  scheduleStreakDanger,
  scheduleReactivation,
} from '../src/services/notifications';
import { useUserStore } from '../src/store/userStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { getTranslation } from '../src/i18n';
import { useMealStore } from '../src/store/mealStore';
import type { MealSlot } from '../src/types/meal';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { processQueue } from '../src/services/syncQueue';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    captureException(error, { component: 'ErrorBoundary' });
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1a0000', padding: 20 }}>
          <Text style={{ color: '#ff4444', fontSize: 24, fontWeight: 'bold', marginTop: 40 }}>
            {getTranslation(useSettingsStore.getState().locale)('forgaError')}
          </Text>
          <Text style={{ color: '#ff8888', fontSize: 14, marginTop: 16 }}>
            {this.state.error?.message}
          </Text>
          {__DEV__ && (
            <Text style={{ color: '#888', fontSize: 12, marginTop: 12 }}>
              {this.state.error?.stack}
            </Text>
          )}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function RootLayoutInner() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit: Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    DMSans: DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-SemiBold': DMSans_600SemiBold,
    'DMSans-Bold': DMSans_700Bold,
    JetBrainsMono: JetBrainsMono_400Regular,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  const { isLoading, setSession, setLoading, setOnboarded } = useAuthStore();

  useEffect(() => {
    initSentry();
  }, []);

  // Notification init + tap listener
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: Notifications.EventSubscription | null = null;

    AsyncStorage.getItem('forga-notifications-enabled').then(async (value) => {
      if (value !== 'true') return;

      const profile = useUserStore.getState().profile;
      const streak = profile?.currentStreak ?? 0;

      try {
        const slots: MealSlot[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'bedtime'];
        for (const slot of slots) {
          await scheduleMealReminder(slot);
        }
        await scheduleWeeklyCheckIn();
        if (streak > 0) await scheduleStreakDanger(streak);

        // Reactivation: check last meal activity
        const mealHistory = useMealStore.getState().mealHistory;
        const lastDate = Object.keys(mealHistory).sort().pop();
        if (lastDate) {
          const daysSince = Math.floor(
            (Date.now() - new Date(lastDate).getTime()) / 86400000
          );
          if ([2, 3, 5].includes(daysSince)) {
            await scheduleReactivation(daysSince);
          }
        }
      } catch {
        // Silent fail
      }
    });

    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string };
      if (data?.type === 'weekly_checkin') {
        router.push('/checkin');
      } else if (data?.type === 'streak_danger' || data?.type === 'reactivation' || data?.type === 'meal_reminder') {
        router.push('/(tabs)/meals');
      } else if (data?.type === 'badge_unlocked') {
        router.push('/(tabs)/profile');
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      // En mode démo, on ne crée pas de session automatiquement
      // L'utilisateur verra la landing page d'abord, puis la session démo
      // sera créée quand il clique sur "Commencer" (via register)
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfileFromSupabase(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfileFromSupabase(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync queue: process pending actions on startup, when coming back
  // online (web), and when the app returns to foreground (native).
  // All calls are guarded by a valid auth session check.
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const flush = () => {
      const session = useAuthStore.getState().session;
      if (!session) return;
      processQueue().catch(() => {});
    };

    // 1. Process at app startup (all platforms)
    flush();

    // 2. Web: process when the browser goes back online
    let handleOnline: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      handleOnline = () => flush();
      window.addEventListener('online', handleOnline);
    }

    // 3. Native: process when the app comes back to foreground
    let appStateSub: ReturnType<typeof AppState.addEventListener> | undefined;
    if (Platform.OS !== 'web') {
      appStateSub = AppState.addEventListener('change', (nextState) => {
        if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
          flush();
        }
        appStateRef.current = nextState;
      });
    }

    return () => {
      if (handleOnline && typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
      appStateSub?.remove();
    };
  }, []);

  // Cacher le splash screen quand tout est prêt
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>{getTranslation(useSettingsStore.getState().locale)('loading')}</Text>
      </View>
    );
  }

  const { colors: themeColors, isDark } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.background } }} />
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
