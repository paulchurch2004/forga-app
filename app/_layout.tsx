// CRITICAL : doit être la TOUTE PREMIÈRE ligne de l'app — sinon
// Reanimated peut foirer les animations au premier mount sur Android
// (l'audit cross-platform a flag ça en P1). Sur iOS c'est moins
// problématique mais l'import reste idempotent.
import 'react-native-gesture-handler';
import React, { useEffect, useRef, Component } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { View, Text, ActivityIndicator, ScrollView, Platform, AppState, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedSplash } from '../src/components/ui/AnimatedSplash';
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
import { useMealStore } from '../src/store/mealStore';
import type { MealSlot } from '../src/types/meal';
import { OfflineBanner } from '../src/components/ui/OfflineBanner';
import { HealthDisclaimerModal } from '../src/components/onboarding/HealthDisclaimerModal';
import { syncProfile } from '../src/services/userSync';
import { processQueue } from '../src/services/syncQueue';
import { initRevenueCat } from '../src/services/revenueCat';
import { initAnalytics, identifyUser, resetUser, events } from '../src/services/analytics';
import { setUser as setSentryUser } from '../src/services/sentry';
import { loadAllUserData, bumpLastActiveAt } from '../src/services/userSync';
import { calculateForgaScore } from '../src/engine/scoreEngine';
import { useWaterStore } from '../src/store/waterStore';
import type { ScoreInput } from '../src/types/score';
import { todayLocalIso, localIso } from '../src/utils/date';
import { BiometricLockGate } from '../src/components/auth/BiometricLockGate';
import { ToastHost } from '../src/components/ui/ToastHost';
import { initDeepLinks } from '../src/services/deepLinks';
import { syncHealthOnForeground } from '../src/hooks/useAppleHealth';
import { maybePromptReview } from '../src/services/reviewPrompt';

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
      // IMPORTANT : ne JAMAIS appeler de i18n / store / supabase ici.
      // Si l'erreur initiale vient de l'un de ces systèmes, le render
      // du fallback re-throw → double crash → app verrouillée. Texte
      // hardcodé bilingue minimal.
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1a0000', padding: 20 }}>
          <Text style={{ color: '#ff4444', fontSize: 24, fontWeight: 'bold', marginTop: 40 }}>
            Oups — quelque chose s'est mal passé
          </Text>
          <Text style={{ color: '#ff8888', fontSize: 14, marginTop: 8 }}>
            Something went wrong. Try reopening the app.
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

// Minimal fallback while fonts load (before AnimatedSplash can render)
function SplashLogo() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B14' }} />
  );
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
    const unsubscribeDeepLinks = initDeepLinks();
    return () => {
      unsubscribeDeepLinks();
    };
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
        // Cap à 3 repas principaux (breakfast/lunch/dinner) — cf
        // step7-summary.tsx pour la justification. Le re-schedule au
        // launch doit respecter la même règle pour ne pas re-créer des
        // notifs snack supprimées par l'user via Profil > Notifications.
        const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
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
        if (__DEV__) console.warn('[Notifications] Failed to schedule:', error);
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
        identifyUser(session.user.id);
        setSentryUser({ id: session.user.id, email: session.user.email });
        initRevenueCat(session.user.id);
        // Bump last_active_at au démarrage — l'user vient juste d'ouvrir
        // l'app, il est actif. Évite la suppression auto à 180j si
        // l'app fait des cold starts longs.
        void bumpLastActiveAt(session.user.id);
        loadProfileFromSupabase(session.user.id)
          .then(() => loadAllUserData(session.user.id))
          // Tente la review prompt après le chargement (à ce moment-là
          // mealCount/workoutCount sont synced → check engagement OK).
          // Petit délai pour ne pas spammer pendant le splash.
          .then(() => { setTimeout(() => { void maybePromptReview(); }, 4000); })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session && event === 'SIGNED_IN') {
        identifyUser(session.user.id);
        setSentryUser({ id: session.user.id, email: session.user.email });
        setLoading(true);
        // Avant de PULL les données du nouveau user, on tente de drainer
        // la queue. Pourquoi : si l'user précédent avait des actions en
        // attente et que le signOut a foiré (réseau down), la queue
        // contient des opérations avec user_id ≠ session courante. Le
        // drain ici va soit les pousser (RLS rejette s'il y a mismatch
        // → l'action est retried jusqu'à drop), soit les laisser en
        // place. Dans tous les cas, on évite que des actions d'un
        // précédent user contaminent les données du nouveau.
        processQueue()
          .catch((err) => { if (__DEV__) console.warn('[SyncQueue] Pre-login drain failed:', err); })
          .finally(() => {
            loadProfileFromSupabase(session.user.id)
              .then(() => loadAllUserData(session.user.id))
              .finally(() => setLoading(false));
          });
      } else if (event === 'SIGNED_OUT') {
        resetUser();
        setSentryUser(null);
        // Drop the user back to the entry point so the auth-aware index.tsx
        // can route them to welcome/login. Without this, the profile tab stays
        // mounted with no session and renders blank.
        router.replace('/');
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
      processQueue().catch((err) => { if (__DEV__) console.warn('[SyncQueue] Failed:', err); });
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
      const todayDate = todayLocalIso();

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
          const date = localIso(new Date(now.getTime() - i * 86400000));
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
          syncHealthOnForeground().catch(() => {});
          // Bump last_active_at — utilisé par le cron pg de suppression
          // à 180j d'inactivité. Sans ce bump, un user actif au quotidien
          // serait quand même supprimé par le cron.
          const uid = useAuthStore.getState().session?.user?.id;
          if (uid) void bumpLastActiveAt(uid);
          // Tente la demande de note App Store après 2 jours d'usage
          // (toutes les conditions sont vérifiées dans le service —
          // safe à appeler à chaque foreground).
          void maybePromptReview();
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

  // Animated splash state
  const [showAnimatedSplash, setShowAnimatedSplash] = React.useState(true);
  const appReady = (fontsLoaded || fontError) && !isLoading;

  // Hide native splash as soon as fonts are loaded (animated splash takes over)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // When animated splash finishes AND app is ready, show the app
  const handleSplashFinish = React.useCallback(() => {
    if (appReady) {
      setShowAnimatedSplash(false);
    } else {
      // App not ready yet — wait and check again
      const check = setInterval(() => {
        if ((useUserStore.getState().profile || !useAuthStore.getState().session)) {
          setShowAnimatedSplash(false);
          clearInterval(check);
        }
      }, 200);
      setTimeout(() => { clearInterval(check); setShowAnimatedSplash(false); }, 3000);
    }
  }, [appReady]);

  if (!fontsLoaded && !fontError) {
    return <SplashLogo />;
  }

  if (showAnimatedSplash) {
    return <AnimatedSplash onFinish={handleSplashFinish} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <OfflineBanner />
      <BiometricLockGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: themeColors.background } }} />
      </BiometricLockGate>
      <ToastHost />
      <HealthDisclaimerGate />
    </QueryClientProvider>
  );
}

/** Affiche le modal "Disclaimer santé" une seule fois après l'onboarding,
 *  avant que l'user puisse utiliser le coach IA ou les plans nutrition.
 *  Apple Guideline 1.4.1 — bloquant pour la review. */
function HealthDisclaimerGate() {
  const profile = useUserStore((s) => s.profile);
  const accepted = useUserStore((s) => s.healthDisclaimerAcceptedAt);
  const acceptHealthDisclaimer = useUserStore((s) => s.acceptHealthDisclaimer);

  // Affiché seulement si l'user a un profil (onboarding terminé) ET
  // n'a pas encore accepté. On évite de l'afficher pendant les écrans
  // d'auth (welcome/login) pour ne pas prompter avant que l'user
  // s'engage.
  if (!profile || accepted) return null;

  return (
    <HealthDisclaimerModal
      visible
      onAccept={() => {
        acceptHealthDisclaimer();
        // Sync vers Supabase pour que l'acceptation ne soit pas
        // re-demandée sur un autre device.
        if (profile.id) {
          syncProfile({ healthDisclaimerAcceptedAt: new Date().toISOString() }, profile.id);
        }
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootLayoutInner />
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
