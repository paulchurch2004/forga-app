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
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    // Queue corrompue (kill -9 pendant write, low disk, etc.). Sans
    // ce try/catch, l'app crashait au boot ET la queue restait
    // permanently broken — aucune sync n'aurait plus jamais marché
    // jusqu'à reset/réinstall. On reset et on continue.
    if (__DEV__) console.warn('[SyncQueue] Corrupted queue, resetting:', err);
    try { captureException(err as Error, { component: 'SyncQueue.getQueue' }); } catch {}
    await AsyncStorage.removeItem(QUEUE_KEY);
    return [];
  }
}

/** Wipe la queue locale. À utiliser au logout/delete-account pour
 *  éviter que les actions du user A soient sync sous l'identité du
 *  user B au prochain login sur le même device. processQueue() est
 *  appelé AVANT le logout pour drainer ce qui peut l'être ; ce qui
 *  reste est legitimement perdu (sinon fuite cross-compte). */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
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
  // Audit persistance v1 (migration 014) — tables qui closent les
  // trous identifiés au launch :
  //   - one_rep_max : historique 1RM par exercice
  //   - coach_memories : mémoires structurées du coach IA
  //   - shopping_lists : listes de courses (current + archivées)
  'one_rep_max',
  'coach_memories',
  'shopping_lists',
  // Frise gamification quotidienne (migration 018) — sans sync ici
  // l'user perdait sa frise à chaque réinstall/changement de device.
  'metal_history',
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
          // ⚠️ Ne JAMAIS joindre `action` (action.data = données santé/perso :
          // poids, mensurations, profil). On n'envoie que des métadonnées
          // non-PII à Sentry. (audit sécurité — RGPD art. 9)
          captureException(new Error(`SyncQueue: action dropped after ${attempts} attempts`), {
            tags: { table: action.table, action_id: action.id },
            extra: { lastError: error.message, operation: action.operation, attempts },
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
          extra: { reason: 'max-attempts', operation: action.operation, attempts },
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
