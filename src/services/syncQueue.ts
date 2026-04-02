import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isDemoMode } from './supabase';

const QUEUE_KEY = 'forga-sync-queue';

interface SyncAction {
  id: string;
  table: string;
  operation: 'upsert';
  data: Record<string, any>;
  createdAt: string;
}

export async function enqueue(action: Omit<SyncAction, 'id' | 'createdAt'>) {
  const queue = await getQueue();
  queue.push({
    ...action,
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<SyncAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function processQueue(): Promise<void> {
  if (isDemoMode) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  const remaining: SyncAction[] = [];
  for (const action of queue) {
    try {
      const { error } = await supabase
        .from(action.table)
        .upsert(action.data);
      if (error) {
        remaining.push(action);
      }
    } catch {
      remaining.push(action);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}
