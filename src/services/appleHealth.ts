// FORGA — Apple Health (HealthKit) integration.
// Premium-only feature. Provides bidirectional sync of bodyweight, calories,
// and workouts between FORGA and Apple Health.
//
// All functions are no-ops on Android/web — HealthKit is iOS only.
// The `@kingstinct/react-native-healthkit` package is dynamically imported
// so the app keeps building when the native module is not yet linked
// (e.g. in dev or before EAS build).

import { Platform } from 'react-native';

let HK: any = null;

async function loadHK() {
  if (Platform.OS !== 'ios') return null;
  if (HK) return HK;
  try {
    HK = await import('@kingstinct/react-native-healthkit');
    return HK;
  } catch {
    return null;
  }
}

const READ_PERMISSIONS = [
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierActiveEnergyBurned',
  'HKQuantityTypeIdentifierBasalEnergyBurned',
];

const WRITE_PERMISSIONS = [
  'HKWorkoutTypeIdentifier',
  'HKQuantityTypeIdentifierBodyMass',
];

export type HealthAvailability =
  | { available: false; reason: 'platform' | 'native-missing' | 'denied' }
  | { available: true };

/** Whether HealthKit is available on this device. */
export async function isHealthAvailable(): Promise<HealthAvailability> {
  if (Platform.OS !== 'ios') return { available: false, reason: 'platform' };
  const hk = await loadHK();
  if (!hk) return { available: false, reason: 'native-missing' };
  try {
    const isAvailable = await hk.isHealthDataAvailableAsync?.();
    if (isAvailable === false) return { available: false, reason: 'denied' };
    return { available: true };
  } catch {
    return { available: false, reason: 'native-missing' };
  }
}

/** Request all read + write permissions FORGA needs. Returns true if at
 *  least the bare minimum (read body mass) is granted. */
export async function requestHealthPermissions(): Promise<boolean> {
  const hk = await loadHK();
  if (!hk) return false;
  try {
    const result = await hk.requestAuthorization(READ_PERMISSIONS, WRITE_PERMISSIONS);
    return Boolean(result);
  } catch {
    return false;
  }
}

export interface BodyMassEntry {
  date: string; // ISO string
  weightKg: number;
}

/** Read the most recent N body weight samples (default 30). */
export async function readBodyWeights(limit = 30): Promise<BodyMassEntry[]> {
  const hk = await loadHK();
  if (!hk) return [];
  try {
    const samples = await hk.queryQuantitySamples?.('HKQuantityTypeIdentifierBodyMass', {
      limit,
      ascending: false,
    });
    if (!Array.isArray(samples)) return [];
    return samples.map((s: any) => ({
      date: new Date(s.startDate ?? s.date).toISOString(),
      weightKg: typeof s.quantity === 'number' ? s.quantity : 0,
    }));
  } catch {
    return [];
  }
}

/** Write a single body weight sample to Apple Health. */
export async function writeBodyWeight(weightKg: number, date = new Date()): Promise<boolean> {
  const hk = await loadHK();
  if (!hk) return false;
  try {
    await hk.saveQuantitySample?.('HKQuantityTypeIdentifierBodyMass', 'kg', weightKg, {
      startDate: date.toISOString(),
      endDate: date.toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}

/** Read total calories burned (active + basal) for a date range. */
export async function readCaloriesBurned(start: Date, end: Date): Promise<number> {
  const hk = await loadHK();
  if (!hk) return 0;
  try {
    const [active, basal] = await Promise.all([
      hk.queryStatisticsForQuantity?.('HKQuantityTypeIdentifierActiveEnergyBurned', ['cumulativeSum'], {
        from: start.toISOString(),
        to: end.toISOString(),
      }),
      hk.queryStatisticsForQuantity?.('HKQuantityTypeIdentifierBasalEnergyBurned', ['cumulativeSum'], {
        from: start.toISOString(),
        to: end.toISOString(),
      }),
    ]);
    const a = active?.sumQuantity?.quantity ?? 0;
    const b = basal?.sumQuantity?.quantity ?? 0;
    return a + b;
  } catch {
    return 0;
  }
}

/** Read step count total for a day. */
export async function readDailySteps(date: Date): Promise<number> {
  const hk = await loadHK();
  if (!hk) return 0;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  try {
    const result = await hk.queryStatisticsForQuantity?.('HKQuantityTypeIdentifierStepCount', ['cumulativeSum'], {
      from: start.toISOString(),
      to: end.toISOString(),
    });
    return result?.sumQuantity?.quantity ?? 0;
  } catch {
    return 0;
  }
}

export type ForgaWorkoutType =
  | 'musculation'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'hiit'
  | 'sport_collectif'
  | 'yoga_stretching'
  | 'marche'
  | 'autre';

export interface ForgaWorkoutForHealth {
  /** Start time as ISO string. */
  startedAt: string;
  /** Duration in seconds. */
  durationSec: number;
  /** Estimated calories burned (optional). */
  caloriesBurned?: number;
  /** Mapped to HKWorkoutActivityType. */
  type: ForgaWorkoutType;
}

const ACTIVITY_TYPE_MAP: Record<ForgaWorkoutType, string> = {
  musculation: 'HKWorkoutActivityTypeFunctionalStrengthTraining',
  running: 'HKWorkoutActivityTypeRunning',
  cycling: 'HKWorkoutActivityTypeCycling',
  swimming: 'HKWorkoutActivityTypeSwimming',
  hiit: 'HKWorkoutActivityTypeHighIntensityIntervalTraining',
  sport_collectif: 'HKWorkoutActivityTypeSoccer',
  yoga_stretching: 'HKWorkoutActivityTypeYoga',
  marche: 'HKWorkoutActivityTypeWalking',
  autre: 'HKWorkoutActivityTypeOther',
};

/** Push a completed FORGA workout to Apple Health. */
export async function writeWorkout(workout: ForgaWorkoutForHealth): Promise<boolean> {
  const hk = await loadHK();
  if (!hk) return false;
  try {
    const start = new Date(workout.startedAt);
    const end = new Date(start.getTime() + workout.durationSec * 1000);
    await hk.saveWorkoutSample?.({
      activityType: ACTIVITY_TYPE_MAP[workout.type],
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      energyBurned: workout.caloriesBurned ?? 0,
      energyBurnedUnit: 'kcal',
    });
    return true;
  } catch {
    return false;
  }
}
