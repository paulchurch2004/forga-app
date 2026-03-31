import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { MealSlot } from '../types/meal';
import { MEAL_SLOT_LABELS, MEAL_SLOT_TIMES } from '../types/meal';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

// ─── Rappel repas ───
export async function scheduleMealReminder(slot: MealSlot): Promise<string> {
  const time = MEAL_SLOT_TIMES[slot];
  const [hours, minutes] = time.split(':').map(Number);
  const label = MEAL_SLOT_LABELS[slot];

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: `C'est l'heure de ton ${label.toLowerCase()}. Choisis ton repas.`,
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
      body: `Ta série de ${streakDays} jours est en danger. Valide tes repas.`,
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
      body: 'Check-in hebdo : 30 secondes pour mettre à jour ton plan.',
      data: { type: 'weekly_checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Dimanche
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
      title: 'Badge débloqué !',
      body: `Tu as obtenu le badge "${badgeName}". Continue comme ça.`,
      data: { type: 'badge_unlocked' },
    },
    trigger: null, // Immédiat
  });
}

// ─── Réactivation ───
export async function scheduleReactivation(daysSinceLastActivity: number): Promise<void> {
  const messages: Record<number, string> = {
    2: 'Ton score baisse. Reviens.',
    3: 'Ta série va se casser.',
    5: 'Ton plan t\'attend. 10 secondes pour reprendre.',
  };

  const message = messages[daysSinceLastActivity];
  if (!message) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FORGA',
      body: message,
      data: { type: 'reactivation' },
    },
    trigger: null,
  });
}

// ─── Annuler toutes ───
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
