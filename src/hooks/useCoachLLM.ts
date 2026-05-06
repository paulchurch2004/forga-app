// FORGA — useCoachLLM: thin convenience hook for one-shot coach queries.
// The full chat in app/(tabs)/coach.tsx still drives `sendCoachMessage`
// directly because it manages rich state (streaming, memory parsing,
// quota notices). This hook is for ad-hoc integrations: a "ask the coach"
// button in a feature where you just want a single reply with offline
// fallback and analytics tracking baked in.

import { useCallback, useState } from 'react';
import { sendCoachMessage, type ChatHistoryEntry } from '../services/coachAI';
import { coachFallbackReply } from '../services/coachFallback';
import { events } from '../services/analytics';
import type { CoachContext } from '../engine/coachChatEngine';
import type { CoachMemory } from '../store/chatStore';

export type CoachAskResult = {
  /** The reply text to show the user. Always a non-empty string. */
  text: string;
  /** True if the reply came from the response cache (no LLM round-trip). */
  cached: boolean;
  /** True if we fell back to a deterministic template (LLM unavailable). */
  fallback: boolean;
  /** True if the daily quota has been exhausted. */
  quotaExceeded: boolean;
  /** Remaining messages in the user's daily quota, if known. */
  remaining?: number;
};

export function useCoachLLM() {
  const [loading, setLoading] = useState(false);

  const ask = useCallback(
    async (
      message: string,
      context: CoachContext,
      history: ChatHistoryEntry[] = [],
      memories: CoachMemory[] = [],
    ): Promise<CoachAskResult> => {
      setLoading(true);
      try {
        const result = await sendCoachMessage(message, context, history, memories);

        if (result.kind === 'ok') {
          events.coachMessageSent({
            cached: result.cached,
            remaining: result.quota.remaining,
            cap: result.quota.cap,
          });
          return {
            text: result.reply,
            cached: result.cached,
            fallback: false,
            quotaExceeded: false,
            remaining: result.quota.remaining,
          };
        }

        if (result.kind === 'quota_exceeded') {
          events.coachMessageFailed('quota');
          return {
            text: result.message,
            cached: false,
            fallback: false,
            quotaExceeded: true,
            remaining: 0,
          };
        }

        // Unauthenticated or generic error → deterministic fallback
        const reason = result.kind === 'unauthenticated' ? 'auth' : 'server';
        events.coachMessageFailed(reason);
        events.coachFallbackUsed();
        return {
          text: coachFallbackReply(message, context),
          cached: false,
          fallback: true,
          quotaExceeded: false,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { ask, loading };
}
