import { create } from 'zustand';

interface SettingsState {
  notificationsEnabled: boolean;
  mealReminders: boolean;
  streakAlerts: boolean;
  weeklyCheckInReminder: boolean;

  setNotificationsEnabled: (enabled: boolean) => void;
  setMealReminders: (enabled: boolean) => void;
  setStreakAlerts: (enabled: boolean) => void;
  setWeeklyCheckInReminder: (enabled: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  mealReminders: true,
  streakAlerts: true,
  weeklyCheckInReminder: true,

  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setMealReminders: (mealReminders) => set({ mealReminders }),
  setStreakAlerts: (streakAlerts) => set({ streakAlerts }),
  setWeeklyCheckInReminder: (weeklyCheckInReminder) => set({ weeklyCheckInReminder }),
  reset: () =>
    set({
      notificationsEnabled: true,
      mealReminders: true,
      streakAlerts: true,
      weeklyCheckInReminder: true,
    }),
}));
