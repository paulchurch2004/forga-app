import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleTrialNotifications(trialEndsAt: Date) {
  // Annuler les anciennes notifs trial
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'trial_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  const now = new Date();

  // J-2 (douce, encouragement)
  const j2 = new Date(trialEndsAt.getTime() - 2 * 24 * 60 * 60 * 1000);
  if (j2 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Plus que 2 jours de PRO',
        body: 'Profite-en à fond — coach illimité, scans, programmes...',
        data: { type: 'trial_reminder', day: 'J-2' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: j2,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }

  // J-1 (urgente)
  const j1 = new Date(trialEndsAt.getTime() - 24 * 60 * 60 * 1000);
  if (j1 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Ton trial PRO se termine demain',
        body: 'Continue ta progression sans interruption — voir les options',
        data: { type: 'trial_reminder', day: 'J-1' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: j1,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }

  // J0 (le jour J, à 10h)
  const j0 = new Date(trialEndsAt);
  j0.setHours(10, 0, 0, 0);
  if (j0 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Ton trial PRO se termine aujourd\'hui',
        body: 'Ouvre l\'app pour finaliser ton choix',
        data: { type: 'trial_reminder', day: 'J0' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: j0,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }
}

export async function cancelAllTrialNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'trial_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
