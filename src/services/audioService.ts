// FORGA — Rest-end notification sound.
// Uses dynamic import for expo-audio so the app keeps working
// (silently, no sound) until expo-audio is installed and a sound
// asset is bundled.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_ENABLED_KEY = 'forga-rest-sound-enabled';

let player: any = null;
let initialized = false;
let unavailable = false;

/** True when expo-audio is available and the sound asset loaded successfully. */
export function isRestSoundAvailable(): boolean {
  return initialized && !unavailable;
}

/** Read the user's preference (defaults to enabled). */
export async function isRestSoundEnabled(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    return v !== 'false'; // default ON
  } catch {
    return true;
  }
}

export async function setRestSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

/**
 * Try to preload the rest-end sound. Safe to call even if expo-audio
 * isn't installed — flips the unavailable flag so subsequent plays no-op.
 */
export async function preloadRestEndSound(): Promise<void> {
  if (initialized || unavailable) return;
  if (Platform.OS === 'web') {
    unavailable = true;
    return;
  }
  try {
    // @ts-ignore — expo-audio may not be installed yet
    const audio = await import('expo-audio');
    if (!audio || !(audio as any).createAudioPlayer) {
      unavailable = true;
      return;
    }
    // The asset must exist at the path below. If it doesn't, the require
    // throws at bundle time — wrapped in try/catch above. We use a runtime
    // require() so Metro doesn't fail the bundle if the file is missing.
    const sound = await loadSoundAsset();
    if (!sound) {
      unavailable = true;
      return;
    }
    player = (audio as any).createAudioPlayer(sound);
    initialized = true;
  } catch {
    unavailable = true;
  }
}

async function loadSoundAsset(): Promise<any> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('../../assets/sounds/rest-end.mp3');
  } catch {
    return null;
  }
}

/** Play the rest-end notification (vibration is handled by the caller). */
export async function playRestEndSound(): Promise<void> {
  if (!initialized || unavailable || !player) return;
  const enabled = await isRestSoundEnabled();
  if (!enabled) return;
  try {
    if (typeof player.seekTo === 'function') player.seekTo(0);
    if (typeof player.play === 'function') player.play();
  } catch {
    /* ignore play errors */
  }
}

export async function unloadRestEndSound(): Promise<void> {
  if (!player) return;
  try {
    if (typeof player.remove === 'function') player.remove();
  } catch {
    /* ignore */
  }
  player = null;
  initialized = false;
}
