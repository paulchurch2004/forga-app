import { supabase, isDemoMode } from './supabase';
import type { CoachContext } from '../engine/coachChatEngine';
import type { CoachMemory } from '../store/chatStore';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuotaInfo {
  used: number;
  cap: number;
  bonus: number;
  remaining: number;
}

export type CoachReply =
  | { kind: 'ok'; reply: string; quota: QuotaInfo }
  | { kind: 'quota_exceeded'; message: string; quota: QuotaInfo }
  | { kind: 'unauthenticated' }
  | { kind: 'error' };

export async function sendCoachMessage(
  message: string,
  context: CoachContext,
  history: ChatHistoryEntry[],
  memories: CoachMemory[] = [],
): Promise<CoachReply> {
  if (isDemoMode || !SUPABASE_URL) return { kind: 'error' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return { kind: 'unauthenticated' };

    const trimmedMemories = [...memories]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)
      .map((m) => ({ date: m.date, tag: m.tag, summary: m.summary }));

    const res = await fetch(`${SUPABASE_URL}/functions/v1/coach-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        message,
        context,
        history: history.slice(-10),
        memories: trimmedMemories,
      }),
    });

    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      return {
        kind: 'quota_exceeded',
        message: body?.message ?? 'Limite de messages atteinte aujourd\'hui.',
        quota: body?.quota ?? { used: 0, cap: 5, bonus: 0, remaining: 0 },
      };
    }

    if (res.status === 401) return { kind: 'unauthenticated' };
    if (!res.ok) return { kind: 'error' };

    const data = await res.json();
    if (data.error || !data.reply) return { kind: 'error' };

    return {
      kind: 'ok',
      reply: data.reply,
      quota: data.quota ?? { used: 0, cap: 5, bonus: 0, remaining: 0 },
    };
  } catch {
    return { kind: 'error' };
  }
}
