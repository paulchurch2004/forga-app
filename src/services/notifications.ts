import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { MealSlot } from '../types/meal';
import { MEAL_SLOT_TIMES } from '../types/meal';
import { getTranslation } from '../i18n';
import { useSettingsStore } from '../store/settingsStore';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function t(key: Parameters<ReturnType<typeof getTranslation>>[0], vars?: Record<string, string | number>) {
  const locale = useSettingsStore.getState().locale;
  return getTranslation(locale)(key, vars);
}

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FORGA',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

// Slot key mapping for i18n
const SLOT_I18N_KEY: Record<MealSlot, Parameters<ReturnType<typeof getTranslation>>[0]> = {
  breakfast: 'slotBreakfast',
  morning_snack: 'slotMorningSnack',
  lunch: 'slotLunch',
  afternoon_snack: 'slotAfternoonSnack',
  dinner: 'slotDinner',
  bedtime: 'slotBedtime',
};

// ─── Rappel repas ───
export async function scheduleMealReminder(slot: MealSlot): Promise<string> {
  const time = MEAL_SLOT_TIMES[slot];
  const [hours, minutes] = time.split(':').map(Number);
  const slotLabel = t(SLOT_I18N_KEY[slot]).toLowerCase();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: t('notifMealReminder', { slot: slotLabel }),
      data: { type: 'meal_reminder', slot },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return id;
}

// ─── Streak en danger ───
export async function scheduleStreakDanger(streakDays: number): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: t('notifStreakDanger', { days: streakDays }),
      data: { type: 'streak_danger' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  return id;
}

// ─── Check-in hebdomadaire ───
export async function scheduleWeeklyCheckIn(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: t('notifWeeklyCheckIn'),
      data: { type: 'weekly_checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 20,
      minute: 0,
    },
  });

  return id;
}

// ─── Badge débloqué ───
export async function sendBadgeNotification(badgeName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notifBadgeTitle'),
      body: t('notifBadgeBody', { name: badgeName }),
      data: { type: 'badge_unlocked' },
    },
    trigger: null,
  });
}

// ─── Réactivation ───
export async function scheduleReactivation(daysSinceLastActivity: number): Promise<void> {
  const messageKey: Record<number, Parameters<ReturnType<typeof getTranslation>>[0]> = {
    2: 'notifReactivation2',
    3: 'notifReactivation3',
    5: 'notifReactivation5',
  };

  const key = messageKey[daysSinceLastActivity];
  if (!key) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: t(key),
      data: { type: 'reactivation' },
    },
    trigger: null,
  });
}

// ─── Annuler toutes ───
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
