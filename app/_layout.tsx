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
import { useScoreStore } from '../src/store/scoreStore';
import { useTrainingStore } from '../src/store/trainingStore';
import { getTranslation } from '../src/i18n';
import { useMealStore } from '../src/store/mealStore';
import type { MealSlot } from '../src/types/meal';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { processQueue } from '../src/services/syncQueue';
import { initRevenueCat } from '../src/services/revenueCat';
import { initAnalytics, events } from '../src/services/analytics';
import { calculateForgaScore } from '../src/engine/scoreEngine';
import { useWaterStore } from '../src/store/waterStore';
import type { ScoreInput } from '../src/types/score';

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
  const { colors: themeColors, isDark } = useTheme();

  useEffect(() => {
    initSentry();
    initAnalytics();
    events.appOpened();
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
      } catch (error) {
        console.warn('[Notifications] Failed to schedule:', error);
        captureException(error instanceof Error ? error : new Error(String(error)), { component: 'NotificationScheduler' });
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
        initRevenueCat(session.user.id);
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
    const checkDayReset = () => {
      useMealStore.getState().checkDayReset();
      useScoreStore.getState().checkDayReset();
      useTrainingStore.getState().checkDayReset();
    };

    const flush = () => {
      const session = useAuthStore.getState().session;
      if (!session) return;
      processQueue().catch((err) => console.warn('[SyncQueue] Failed:', err));
    };

    // Auto-recalculate and save score so it persists even if nutrition screen is never opened
    const autoSaveScore = () => {
      const profile = useUserStore.getState().profile;
      if (!profile) return;
      const todayMeals = useMealStore.getState().todayMeals;
      const mealHistory = useMealStore.getState().mealHistory;
      const checkIns = useUserStore.getState().checkIns;
      const weightLog = useUserStore.getState().weightLog;
      const waterStore = useWaterStore.getState();
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];

      const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000);
      const recentCheckIns = checkIns.filter((c) => new Date(c.createdAt) >= fourWeeksAgo);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const thisWeekCheckIn = checkIns.some((c) => new Date(c.createdAt) >= weekStart);

      const sortedWeights = [...weightLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      let weightTrend = 0;
      if (sortedWeights.length >= 2) {
        const daysDiff = (new Date(sortedWeights[0].date).getTime() - new Date(sortedWeights[1].date).getTime()) / 86400000;
        if (daysDiff > 0) weightTrend = ((sortedWeights[0].weight - sortedWeights[1].weight) / daysDiff) * 7;
      }
      const totalToLose = Math.abs(profile.currentWeight - profile.targetWeight);
      const latestWeight = sortedWeights[0]?.weight ?? profile.currentWeight;
      const goalPct = totalToLose > 0 ? Math.min(100, (Math.abs(profile.currentWeight - latestWeight) / totalToLose) * 100) : profile.objective === 'maintain' ? 100 : 0;

      let proteinDaysHit = 0;
      if (profile.dailyProtein > 0) {
        for (let i = 0; i < 7; i++) {
          const date = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
          const meals = i === 0 ? todayMeals : (mealHistory[date] ?? []);
          if (meals.length === 0) continue;
          const totalP = meals.reduce((s, m) => s + m.actualMacros.protein, 0);
          if (Math.abs(totalP - profile.dailyProtein) / profile.dailyProtein <= 0.10) proteinDaysHit++;
        }
      }
      const waterWeek = waterStore.getWeekHistory(todayDate);
      const waterDaysMet = waterWeek.filter((d) => d.total >= waterStore.dailyTargetMl).length;

      const input: ScoreInput = {
        mealsValidated: todayMeals.length,
        mealsExpected: profile.mealsPerDay,
        proteinTargetDays: proteinDaysHit,
        uniqueMealsChosen: new Set(todayMeals.map((m) => m.mealId)).size,
        currentStreak: profile.currentStreak,
        checkInsCompleted: recentCheckIns.length,
        weightTrendPerWeek: weightTrend,
        objective: profile.objective,
        goalProgressPercent: goalPct,
        hasWeightData: weightLog.length >= 2,
        activeDaysLast7: useTrainingStore.getState().getActiveDaysLast7(todayDate),
        thisWeekCheckIn,
        waterTargetDaysMet: waterDaysMet,
      };
      const score = calculateForgaScore(input);
      useScoreStore.getState().setCurrentScore(score);
      useScoreStore.getState().saveDailyScore(todayDate, score);
    };

    // 1. Reset daily data if date changed (all platforms)
    checkDayReset();

    // 1b. Auto-save score on startup
    setTimeout(autoSaveScore, 500);

    // 2. Process sync queue at app startup (all platforms)
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
          checkDayReset();
          autoSaveScore();
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
