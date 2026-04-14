import { supabase, isDemoMode } from './supabase';
import type { CoachContext } from '../engine/coachChatEngine';

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
): Promise<string | null> {
  if (isDemoMode || !SUPABASE_URL) return null;

  try {
    // Use session token if authenticated, otherwise use anon key
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || SUPABASE_ANON_KEY || '';

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
