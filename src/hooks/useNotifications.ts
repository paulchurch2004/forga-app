import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestPermissions,
  scheduleMealReminder,
  scheduleWeeklyCheckIn,
  scheduleStreakDanger,
  cancelAllNotifications,
} from '../services/notifications';
import type { MealSlot } from '../types/meal';

const STORAGE_KEY = 'forga-notifications-enabled';

const ALL_MEAL_SLOTS: MealSlot[] = [
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'dinner',
  'bedtime',
];

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setIsEnabled(value === 'true');
      setLoading(false);
    });
  }, []);

  const scheduleAll = useCallback(async (currentStreak: number) => {
    // Notifications not supported on web
    if (Platform.OS === 'web') return;

    try {
      for (const slot of ALL_MEAL_SLOTS) {
        await scheduleMealReminder(slot);
      }
      await scheduleWeeklyCheckIn();
      if (currentStreak > 0) {
        await scheduleStreakDanger(currentStreak);
      }
    } catch {
      // Silent fail on devices where notifications are restricted
    }
  }, []);

  const cancelAll = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await cancelAllNotifications();
    } catch {
      // Silent fail
    }
  }, []);

  const toggle = useCallback(
    async (currentStreak: number) => {
      if (Platform.OS === 'web') {
        // No native notifications on web
        return;
      }

      if (!isEnabled) {
        // Enable: request permissions first
        const granted = await requestPermissions();
        if (!granted) return; // User denied, don't enable

        await scheduleAll(currentStreak);
        await AsyncStorage.setItem(STORAGE_KEY, 'true');
        setIsEnabled(true);
      } else {
        // Disable
        await cancelAll();
        await AsyncStorage.setItem(STORAGE_KEY, 'false');
        setIsEnabled(false);
      }
    },
    [isEnabled, scheduleAll, cancelAll]
  );

  return { isEnabled, loading, toggle, scheduleAll, cancelAll };
}
