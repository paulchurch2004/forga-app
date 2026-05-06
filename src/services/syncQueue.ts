// FORGA — Offline sync queue.
//
// Buffers Supabase writes when the user is offline or the backend is
// returning errors, then drains them when the app foregrounds or the
// network comes back.
//
// Resilience features:
// - Per-action exponential backoff (30s → 1m → 2m → … capped at 1h)
// - Max-attempts cap (drops actions after 10 failures so a permanently
//   broken row doesn't block the queue forever)
// - Queue size cap (1000 actions; oldest 10% dropped on overflow)
// - Logs permanently-failed actions to Sentry for triage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isDemoMode } from './supabase';
import { captureException } from './sentry';

const QUEUE_KEY = 'forga-sync-queue';
const MAX_QUEUE_SIZE = 1000;
const MAX_ATTEMPTS = 10;
const BASE_BACKOFF_MS = 30 * 1000; // 30s
const MAX_BACKOFF_MS = 60 * 60 * 1000; // 1h

interface SyncAction {
  id: string;
  table: string;
  operation: 'upsert';
  data: Record<string, any>;
  createdAt: string;
  /** Number of failed attempts so far. Optional for backwards compat
   *  with queues persisted before this field existed. */
  attempts?: number;
  /** ISO timestamp before which we should not retry this action.
   *  When undefined, the action is eligible immediately. */
  nextRetryAt?: string;
}

function backoffFor(attempts: number): number {
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1));
}

export async function enqueue(action: Omit<SyncAction, 'id' | 'createdAt'>) {
  const queue = await getQueue();
  queue.push({
    ...action,
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  });
  // Cap the queue: if we exceed the limit, drop the oldest 10%.
  if (queue.length > MAX_QUEUE_SIZE) {
    const drop = Math.ceil(MAX_QUEUE_SIZE * 0.1);
    queue.splice(0, drop);
    if (__DEV__) console.warn(`[SyncQueue] Capacity exceeded, dropped ${drop} oldest actions`);
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<SyncAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Test-only / debug helper to inspect queue size without parsing. */
export async function getQueueSize(): Promise<number> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return 0;
  try {
    return (JSON.parse(raw) as SyncAction[]).length;
  } catch {
    return 0;
  }
}

const ALLOWED_TABLES = [
  'daily_meals',
  'weight_log',
  'weekly_checkins',
  'score_history',
  'badges',
  'favorites',
  'workouts',
  'water_log',
  'measurements',
  'meal_preferences',
  'progress_photos',
  'weekly_plans',
  'program_progress',
  'users',
];

export async function processQueue(): Promise<void> {
  if (isDemoMode) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  const now = Date.now();
  const remaining: SyncAction[] = [];

  for (const action of queue) {
    // Allow-list table check — defends against a corrupted queue
    if (!ALLOWED_TABLES.includes(action.table)) {
      remaining.push(action);
      continue;
    }
    // Honor backoff schedule
    if (action.nextRetryAt && new Date(action.nextRetryAt).getTime() > now) {
      remaining.push(action);
      continue;
    }

    try {
      const { error } = await supabase
        .from(action.table)
        .upsert(action.data);
      if (error) {
        const attempts = (action.attempts ?? 0) + 1;
        if (attempts >= MAX_ATTEMPTS) {
          // Drop after too many failures and surface to Sentry for triage.
          captureException(new Error(`SyncQueue: action dropped after ${attempts} attempts`), {
            tags: { table: action.table, action_id: action.id },
            extra: { lastError: error.message, action },
          });
          continue;
        }
        remaining.push({
          ...action,
          attempts,
          nextRetryAt: new Date(now + backoffFor(attempts)).toISOString(),
        });
      }
    } catch (e) {
      // Network / fetch-level failure — keep the action with a fresh backoff.
      const attempts = (action.attempts ?? 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        captureException(e instanceof Error ? e : new Error(String(e)), {
          tags: { table: action.table, action_id: action.id },
          extra: { reason: 'max-attempts', action },
        });
        continue;
      }
      remaining.push({
        ...action,
        attempts,
        nextRetryAt: new Date(now + backoffFor(attempts)).toISOString(),
      });
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
