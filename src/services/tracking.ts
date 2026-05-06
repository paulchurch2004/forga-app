// FORGA — App Tracking Transparency (ATT) prompt.
// iOS 14.5+ requires asking the user before any tracking. We trigger the
// prompt AFTER the user has completed onboarding and seen real value
// (better acceptance rates than asking at first launch).

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'forga-att-prompted';

export type ATTStatus = 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unsupported';

export async function hasBeenPromptedForATT(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value === 'true';
}

/** Show the iOS ATT system prompt if not already prompted. No-op on Android/web. */
export async function requestATTIfNeeded(): Promise<ATTStatus> {
  if (Platform.OS !== 'ios') return 'unsupported';

  const alreadyPrompted = await hasBeenPromptedForATT();
  if (alreadyPrompted) {
    try {
      const att = await import('expo-tracking-transparency');
      const result = await att.getTrackingPermissionsAsync();
      return result.status as ATTStatus;
    } catch {
      return 'unsupported';
    }
  }

  try {
    const att = await import('expo-tracking-transparency');
    const result = await att.requestTrackingPermissionsAsync();
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    return result.status as ATTStatus;
  } catch {
    return 'unsupported';
  }
}
