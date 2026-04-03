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

  setNotificationsEnabled: (enabled: boolean) => void;
  setMealReminders: (enabled: boolean) => void;
  setStreakAlerts: (enabled: boolean) => void;
  setWeeklyCheckInReminder: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
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

      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setMealReminders: (mealReminders) => set({ mealReminders }),
      setStreakAlerts: (streakAlerts) => set({ streakAlerts }),
      setWeeklyCheckInReminder: (weeklyCheckInReminder) => set({ weeklyCheckInReminder }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setLocale: (locale) => set({ locale }),
      reset: () =>
        set({
          notificationsEnabled: true,
          mealReminders: true,
          streakAlerts: true,
          weeklyCheckInReminder: true,
          themeMode: 'dark' as ThemeMode,
          locale: 'fr' as Locale,
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
      }),
    }
  )
);
