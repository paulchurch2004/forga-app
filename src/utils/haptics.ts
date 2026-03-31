import { Platform } from 'react-native';

export async function impactLight() {
  if (Platform.OS === 'web') return;
  const Haptics = (await import('expo-haptics')).default ?? await import('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function impactMedium() {
  if (Platform.OS === 'web') return;
  const Haptics = (await import('expo-haptics')).default ?? await import('expo-haptics');
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function selectionFeedback() {
  if (Platform.OS === 'web') return;
  const Haptics = (await import('expo-haptics')).default ?? await import('expo-haptics');
  Haptics.selectionAsync();
}

export async function notificationSuccess() {
  if (Platform.OS === 'web') return;
  const Haptics = (await import('expo-haptics')).default ?? await import('expo-haptics');
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
