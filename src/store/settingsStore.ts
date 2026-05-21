import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Locale = 'fr' | 'en';

/** Lazy sync setting to Supabase profile (non-blocking, errors ignored) */
function syncSettingToProfile(updates: Record<string, any>) {
  // Use setTimeout to defer and avoid circular deps at module init
  setTimeout(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useUserStore } = require('./userStore');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { syncProfile } = require('../services/userSync');
      const userId = useUserStore.getState().profile?.id;
      if (userId) syncProfile(updates, userId);
    } catch {
      /* noop */
    }
  }, 0);
}

interface SettingsState {
  notificationsEnabled: boolean;
  mealReminders: boolean;
  streakAlerts: boolean;
  weeklyCheckInReminder: boolean;
  themeMode: ThemeMode;
  locale: Locale;
  tutorialStep: number; // 0 = not started, 1-5 = current step, -1 = completed
  weightPromptDismissedDate: string | null;
  /** DEV/observation flag — shows the Core State debug card on the profile.
   *  Off by default. Toggle hidden behind a long-press on the app version
   *  in Settings to keep it out of the regular UX. */
  showCoreStateDebug: boolean;
  /** Require biometric auth (Face ID / Touch ID) at app launch + after backgrounding. */
  biometricLockEnabled: boolean;
  /** Apple Health (HealthKit) sync — Premium-only. iOS only. */
  appleHealthEnabled: boolean;
  /** ISO timestamp of last successful Health sync; null if never synced. */
  lastHealthSyncAt: string | null;
  /** Compteur de pas via Apple Health affiché sur le Home. iOS uniquement.
   *  Off par défaut — l'user doit activer dans Settings (opt-in)
   *  pour qu'on lise les pas. Compatible avec appleHealthEnabled
   *  mais reste un toggle séparé : un user peut vouloir sync son
   *  poids sans pour autant qu'on lui montre les pas. */
  stepsEnabled: boolean;
  /** ISO date de la première session de l'app sur ce device. Set
   *  une seule fois à null → today. Sert à déclencher la demande de
   *  note App Store après 2 jours d'utilisation. */
  firstActiveDate: string | null;
  /** ISO timestamp de la dernière fois où on a montré le prompt
   *  Apple "Note l'app". iOS limite ça à 3×/an quoi qu'il arrive,
   *  mais on garde notre propre flag pour ne pas l'appeler à chaque
   *  foreground inutilement. */
  reviewPromptShownAt: string | null;
  /** ISO timestamp du dernier prompt parrainage affiché aux free
   *  users. On en montre un toutes les 5 nuits max (à l'ouverture
   *  de l'app) pour inciter à partager sans spammer. */
  referralPromptShownAt: string | null;

  setNotificationsEnabled: (enabled: boolean) => void;
  setMealReminders: (enabled: boolean) => void;
  setStreakAlerts: (enabled: boolean) => void;
  setWeeklyCheckInReminder: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setTutorialStep: (step: number) => void;
  setWeightPromptDismissedDate: (date: string | null) => void;
  setShowCoreStateDebug: (enabled: boolean) => void;
  setBiometricLockEnabled: (enabled: boolean) => void;
  setAppleHealthEnabled: (enabled: boolean) => void;
  setLastHealthSyncAt: (iso: string | null) => void;
  setStepsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      mealReminders: true,
      streakAlerts: true,
      weeklyCheckInReminder: true,
      themeMode: 'dark' as ThemeMode,
      locale: 'fr' as Locale,
      tutorialStep: 0,
      weightPromptDismissedDate: null,
      showCoreStateDebug: false,
      biometricLockEnabled: false,
      appleHealthEnabled: false,
      lastHealthSyncAt: null,
      stepsEnabled: false,
      firstActiveDate: null,
      reviewPromptShownAt: null,
      referralPromptShownAt: null,

      setNotificationsEnabled: (notificationsEnabled) => {
        set({ notificationsEnabled });
        syncSettingToProfile({ notifications_enabled: notificationsEnabled });
      },
      setMealReminders: (mealReminders) => {
        set({ mealReminders });
        syncSettingToProfile({ meal_reminders: mealReminders });
      },
      setStreakAlerts: (streakAlerts) => {
        set({ streakAlerts });
        syncSettingToProfile({ streak_alerts: streakAlerts });
      },
      setWeeklyCheckInReminder: (weeklyCheckInReminder) => {
        set({ weeklyCheckInReminder });
        syncSettingToProfile({ weekly_checkin_reminder: weeklyCheckInReminder });
      },
      setThemeMode: (themeMode) => {
        set({ themeMode });
        syncSettingToProfile({ theme_mode: themeMode });
      },
      setLocale: (locale) => {
        set({ locale });
        syncSettingToProfile({ locale });
      },
      setTutorialStep: (tutorialStep) => {
        set({ tutorialStep });
        syncSettingToProfile({ tutorial_step: tutorialStep });
      },
      setWeightPromptDismissedDate: (weightPromptDismissedDate) => set({ weightPromptDismissedDate }),
      setShowCoreStateDebug: (showCoreStateDebug) => set({ showCoreStateDebug }),
      setBiometricLockEnabled: (biometricLockEnabled) => set({ biometricLockEnabled }),
      setAppleHealthEnabled: (appleHealthEnabled) => {
        set({ appleHealthEnabled });
        syncSettingToProfile({ apple_health_enabled: appleHealthEnabled });
      },
      setLastHealthSyncAt: (lastHealthSyncAt) => {
        set({ lastHealthSyncAt });
        // Sync à Supabase pour permettre le delta-sync cross-device.
        syncSettingToProfile({ last_health_sync_at: lastHealthSyncAt });
      },
      setStepsEnabled: (stepsEnabled) => {
        set({ stepsEnabled });
        syncSettingToProfile({ steps_enabled: stepsEnabled });
      },
      reset: () =>
        set({
          notificationsEnabled: true,
          mealReminders: true,
          streakAlerts: true,
          weeklyCheckInReminder: true,
          themeMode: 'dark' as ThemeMode,
          locale: 'fr' as Locale,
          tutorialStep: 0,
          weightPromptDismissedDate: null,
          showCoreStateDebug: false,
          biometricLockEnabled: false,
          appleHealthEnabled: false,
          lastHealthSyncAt: null,
          stepsEnabled: false,
        }),
    }),
    {
      name: 'forga-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        locale: state.locale,
        notificationsEnabled: state.notificationsEnabled,
        mealReminders: state.mealReminders,
        streakAlerts: state.streakAlerts,
        weeklyCheckInReminder: state.weeklyCheckInReminder,
        tutorialStep: state.tutorialStep,
        weightPromptDismissedDate: state.weightPromptDismissedDate,
        showCoreStateDebug: state.showCoreStateDebug,
        biometricLockEnabled: state.biometricLockEnabled,
        appleHealthEnabled: state.appleHealthEnabled,
        lastHealthSyncAt: state.lastHealthSyncAt,
        firstActiveDate: state.firstActiveDate,
        reviewPromptShownAt: state.reviewPromptShownAt,
        referralPromptShownAt: state.referralPromptShownAt,
        stepsEnabled: state.stepsEnabled,
      }),
    }
  )
);
