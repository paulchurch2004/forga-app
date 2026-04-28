import { supabase, isDemoMode } from './supabase';
import type { CoachContext } from '../engine/coachChatEngine';
import type { CoachMemory } from '../store/chatStore';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendCoachMessage(
  message: string,
  context: CoachContext,
  history: ChatHistoryEntry[],
  memories: CoachMemory[] = [],
): Promise<string | null> {
  if (isDemoMode || !SUPABASE_URL) return null;

  try {
    // Use session token if authenticated, otherwise use anon key
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || SUPABASE_ANON_KEY || '';

    // Trim memories to most recent 15 to keep prompt size sane.
    const trimmedMemories = [...memories]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)
      .map((m) => ({ date: m.date, tag: m.tag, summary: m.summary }));

    const res = await fetch(`${SUPABASE_URL}/functions/v1/coach-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        message,
        context,
        history: history.slice(-10),
        memories: trimmedMemories,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return data.reply || null;
  } catch {
    return null;
  }
}
