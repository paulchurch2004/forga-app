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

  setNotificationsEnabled: (enabled: boolean) => void;
  setMealReminders: (enabled: boolean) => void;
  setStreakAlerts: (enabled: boolean) => void;
  setWeeklyCheckInReminder: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setTutorialStep: (step: number) => void;
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

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setMealReminders: (mealReminders) => set({ mealReminders }),
      setStreakAlerts: (streakAlerts) => set({ streakAlerts }),
      setWeeklyCheckInReminder: (weeklyCheckInReminder) => set({ weeklyCheckInReminder }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLocale: (locale) => set({ locale }),
      setTutorialStep: (tutorialStep) => set({ tutorialStep }),
      reset: () =>
        set({
          notificationsEnabled: true,
          mealReminders: true,
          streakAlerts: true,
          weeklyCheckInReminder: true,
          themeMode: 'dark' as ThemeMode,
          locale: 'fr' as Locale,
          tutorialStep: 0,
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
      }),
    }
  )
);
