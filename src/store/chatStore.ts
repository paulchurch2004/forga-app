// Coach chat persistence — short-term week of conversation + long-term memories.
//
// Architecture:
// - `messages`: full visible conversation, scoped to the current calendar week.
//   Auto-rotates: on Monday, last week's messages are dropped (the coach has
//   the memories to remember what mattered, no need to keep raw chat forever).
// - `memories`: structured "important things" extracted by the LLM via
//   [[MEMORY]]...[[/MEMORY]] blocks. Persisted forever (or until pruned).
//   Sent back into the LLM context so it can naturally recall past events.
//
// Both are persisted via Zustand + AsyncStorage so survival across app restarts.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayLocalIso } from '../utils/date';

export interface ChatMessage {
  id: string;
  text: string;
  isCoach: boolean;
  timestamp: number;
  /** Optional structured actions parsed from the coach reply (display-only persistence). */
  actions?: unknown[]; // CoachAction[] but kept loose to avoid circular import
}

export type MemoryTag = 'injury' | 'pr' | 'goal' | 'preference' | 'event' | 'note';

export interface CoachMemory {
  id: string;
  /** YYYY-MM-DD — when the underlying event happened. */
  date: string;
  tag: MemoryTag;
  /** Short, self-contained sentence the coach can quote back later. */
  summary: string;
  /** Higher = more important. Used when memory list grows and we have to prune. */
  weight: 1 | 2 | 3;
}

const MAX_MEMORIES = 50;

interface ChatState {
  messages: ChatMessage[];
  memories: CoachMemory[];
  /** ISO week-start (Monday) of the conversation. Used to detect rotation. */
  weekStart: string;

  appendMessage: (msg: ChatMessage) => void;
  appendMemory: (mem: Omit<CoachMemory, 'id' | 'date'> & { date?: string }) => void;
  /** Wipe all current-week messages but keep memories. Called on week rotation. */
  rotateIfNewWeek: () => void;
  clearAll: () => void;
}

function getMondayIso(): string {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun..6=Sat
  const offset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + offset);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      memories: [],
      weekStart: getMondayIso(),

      appendMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      appendMemory: (mem) =>
        set((s) => {
          const newMem: CoachMemory = {
            id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            date: mem.date ?? todayLocalIso(),
            tag: mem.tag,
            summary: mem.summary,
            weight: mem.weight,
          };
          // Dedupe on summary text (avoid LLM re-asserting the same thing)
          const exists = s.memories.some((m) => m.summary.toLowerCase() === mem.summary.toLowerCase());
          if (exists) return {};
          let next = [...s.memories, newMem];
          // Cap at MAX_MEMORIES — drop oldest low-weight first.
          if (next.length > MAX_MEMORIES) {
            next = [...next].sort((a, b) => {
              if (a.weight !== b.weight) return b.weight - a.weight; // higher weight stays
              return b.date.localeCompare(a.date); // newer stays
            }).slice(0, MAX_MEMORIES);
          }
          return { memories: next };
        }),

      rotateIfNewWeek: () => {
        const currentMonday = getMondayIso();
        if (get().weekStart !== currentMonday) {
          set({ messages: [], weekStart: currentMonday });
        }
      },

      clearAll: () => set({ messages: [], memories: [], weekStart: getMondayIso() }),
    }),
    {
      name: 'forga-chat-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        memories: state.memories,
        weekStart: state.weekStart,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.rotateIfNewWeek();
      },
    }
  )
);
