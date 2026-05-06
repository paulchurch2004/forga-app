// FORGA — Apple Health hook
// High-level API used by the Settings toggle and the post-workout flow.
// All operations are no-ops on Android/web. iOS only.

import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { usePremium } from './usePremium';
import {
  isHealthAvailable,
  requestHealthPermissions,
  readBodyWeights,
  writeBodyWeight,
  writeWorkout,
  type ForgaWorkoutForHealth,
  type ForgaWorkoutType,
} from '../services/appleHealth';
import type { Workout } from '../types/training';
import type { WeightEntry } from '../types/user';

interface SyncResult {
  imported: number;
  pushed: number;
  ok: boolean;
}

function toForgaWorkoutType(t: Workout['type']): ForgaWorkoutType {
  return t;
}

function workoutToHealthPayload(w: Workout): ForgaWorkoutForHealth {
  return {
    startedAt: w.timestamp,
    durationSec: Math.max(60, w.durationMinutes * 60),
    type: toForgaWorkoutType(w.type),
  };
}

/** Read the user's current opt-in state from the persisted store, without
 *  needing the hook to be mounted. Used by `pushWorkoutToHealth` so a
 *  caller doing post-workout cleanup doesn't accidentally write to Health
 *  for a Free user or a user who toggled the feature off. */
function isOptedIn(): boolean {
  if (Platform.OS !== 'ios') return false;
  const s = useSettingsStore.getState();
  if (!s.appleHealthEnabled) return false;
  const p = useUserStore.getState().profile;
  if (!p?.isPremium) return false;
  return true;
}

/** Push a completed workout to Apple Health, gated by the toggle + premium.
 *  Best-effort, never throws. Safe to call from anywhere. */
export async function pushWorkoutToHealth(workout: Workout): Promise<boolean> {
  if (!isOptedIn()) return false;
  try {
    return await writeWorkout(workoutToHealthPayload(workout));
  } catch {
    return false;
  }
}

/** Throttled background sync — invoked when the app returns to the
 *  foreground. Skips if the last successful sync is less than 30 min old
 *  to avoid hammering HealthKit on every app switch. */
const FOREGROUND_SYNC_THROTTLE_MS = 30 * 60 * 1000;
export async function syncHealthOnForeground(): Promise<void> {
  if (!isOptedIn()) return;
  const lastIso = useSettingsStore.getState().lastHealthSyncAt;
  if (lastIso && Date.now() - new Date(lastIso).getTime() < FOREGROUND_SYNC_THROTTLE_MS) {
    return;
  }
  await runSync();
}

/** Internal: full sync routine. Reads fresh store state on every call so
 *  it works correctly when called immediately after `setEnabled(true)`. */
async function runSync(): Promise<SyncResult> {
  if (!isOptedIn()) return { imported: 0, pushed: 0, ok: false };
  const userState = useUserStore.getState();
  const profile = userState.profile;
  if (!profile) return { imported: 0, pushed: 0, ok: false };

  let imported = 0;
  let pushed = 0;
  try {
    const samples = await readBodyWeights(60);
    const knownDates = new Set(userState.weightLog.map((e) => e.date.slice(0, 10)));
    for (const s of samples) {
      const dayKey = s.date.slice(0, 10);
      if (knownDates.has(dayKey)) continue;
      if (!s.weightKg || s.weightKg < 30 || s.weightKg > 300) continue;
      const entry: WeightEntry = {
        id: `health-${dayKey}`,
        userId: profile.id,
        date: dayKey,
        weight: Math.round(s.weightKg * 10) / 10,
        createdAt: s.date,
      };
      // re-read add fn to avoid stale closure
      useUserStore.getState().addWeightEntry(entry);
      knownDates.add(dayKey);
      imported += 1;
    }
    const latest = [...useUserStore.getState().weightLog]
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (latest && latest.weight > 0) {
      const ok = await writeBodyWeight(latest.weight, new Date(latest.createdAt));
      if (ok) pushed += 1;
    }
    useSettingsStore.getState().setLastHealthSyncAt(new Date().toISOString());
    return { imported, pushed, ok: true };
  } catch {
    return { imported, pushed, ok: false };
  }
}

export function useAppleHealth() {
  const { isPremium } = usePremium();
  const enabled = useSettingsStore((s) => s.appleHealthEnabled);
  const setEnabled = useSettingsStore((s) => s.setAppleHealthEnabled);
  const lastSyncAt = useSettingsStore((s) => s.lastHealthSyncAt);

  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    isHealthAvailable().then((r) => {
      if (!cancelled) setAvailable(r.available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    if (!isPremium) return false;
    const granted = await requestHealthPermissions();
    if (!granted) return false;
    setEnabled(true);
    // Initial sync — fire and forget, UI shouldn't wait for it.
    runSync().catch(() => {});
    return true;
  }, [isPremium, setEnabled]);

  const disable = useCallback(() => {
    setEnabled(false);
  }, [setEnabled]);

  const syncNow = useCallback(() => runSync(), []);

  return {
    /** True if the device supports HealthKit (iOS). null while detecting. */
    available,
    /** User's current preference. */
    enabled,
    /** Whether the user is Premium (toggle is gated). */
    isPremium,
    /** ISO timestamp of last successful sync, or null. */
    lastSyncAt,
    enable,
    disable,
    syncNow,
    pushWorkoutToHealth,
  };
}
