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
  | { kind: 'ok'; reply: string; quota: QuotaInfo; cached: boolean }
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

    // Timeout fail-fast à 20s. Sans ça, un Edge Function qui hang
    // (LLM upstream timeout, cold start lent) faisait poireauter
    // l'user indéfiniment sur "..." dans le chat coach. 20s laisse
    // place aux cold starts Supabase (~5s) + génération LLM
    // (jusqu'à 10s sur GPT-4o-mini long context).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    let res: Response;
    try {
      res = await fetch(`${SUPABASE_URL}/functions/v1/coach-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          apikey: SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          message,
          context,
          history: history.slice(-16),
          memories: trimmedMemories,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

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
      cached: Boolean(data.cached),
    };
  } catch {
    return { kind: 'error' };
  }
}

/**
 * Soumet un pouce-haut ou pouce-bas sur une réponse du coach.
 *
 * Upsert sur (user_id, message_id) → un vote ultérieur sur le même
 * message remplace le précédent (l'user peut changer d'avis).
 *
 * Best-effort : si la DB est down ou si l'user n'est pas auth,
 * silent fail (on ne veut pas casser l'UX pour un feedback).
 */
export async function submitCoachFeedback(input: {
  messageId: string;
  messageText: string;
  rating: 'up' | 'down';
  comment?: string;
  precedingUserMessage?: string;
}): Promise<boolean> {
  if (isDemoMode) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return false;

    const { error } = await supabase
      .from('coach_feedback')
      .upsert(
        {
          user_id: session.user.id,
          message_id: input.messageId,
          // Tronqué côté client par sécurité (la colonne est TEXT mais
          // on évite de transporter une réponse aberrante par mégarde).
          message_text: input.messageText.slice(0, 2000),
          rating: input.rating,
          comment: input.comment?.slice(0, 500) ?? null,
          preceding_user_message: input.precedingUserMessage?.slice(0, 1000) ?? null,
        },
        { onConflict: 'user_id,message_id' },
      );

    return !error;
  } catch {
    return false;
  }
}
