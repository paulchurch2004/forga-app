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
      setLastHealthSyncAt: (lastHealthSyncAt) => set({ lastHealthSyncAt }),
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
      }),
    }
  )
);
