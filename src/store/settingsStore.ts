import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Locale = 'fr' | 'en';

interface SettingsState {
  notificationsEnabled: boolean;
  mealReminders: boolean;
  streakAlerts: boolean;
  weeklyCheckInReminder: boolean;
  themeMode: ThemeMode;
  locale: Locale;
  tutorialStep: number; // 0 = not started, 1-5 = current step, -1 = completed
  weightPromptDismissedDate: string | null;

  setNotificationsEnabled: (enabled: boolean) => void;
  setMealReminders: (enabled: boolean) => void;
  setStreakAlerts: (enabled: boolean) => void;
  setWeeklyCheckInReminder: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setTutorialStep: (step: number) => void;
  setWeightPromptDismissedDate: (date: string | null) => void;
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

      setNotificationsEnabled: (notificationsEnabled) => {
        set({ notificationsEnabled });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ notifications_enabled: notificationsEnabled } as any, userId);
          });
        });
      },
      setMealReminders: (mealReminders) => {
        set({ mealReminders });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ meal_reminders: mealReminders } as any, userId);
          });
        });
      },
      setStreakAlerts: (streakAlerts) => {
        set({ streakAlerts });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ streak_alerts: streakAlerts } as any, userId);
          });
        });
      },
      setWeeklyCheckInReminder: (weeklyCheckInReminder) => {
        set({ weeklyCheckInReminder });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ weekly_checkin_reminder: weeklyCheckInReminder } as any, userId);
          });
        });
      },
      setThemeMode: (themeMode) => {
        set({ themeMode });
        // Sync to Supabase profile
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ theme_mode: themeMode } as any, userId);
          });
        });
      },
      setLocale: (locale) => {
        set({ locale });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ locale } as any, userId);
          });
        });
      },
      setTutorialStep: (tutorialStep) => {
        set({ tutorialStep });
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProfile }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProfile({ tutorial_step: tutorialStep } as any, userId);
          });
        });
      },
      setWeightPromptDismissedDate: (weightPromptDismissedDate) => set({ weightPromptDismissedDate }),
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
      }),
    }
  )
);
