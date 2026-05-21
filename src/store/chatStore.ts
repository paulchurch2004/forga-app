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
  /** System-style notice rendered as a centered card with a CTA (e.g. quota exceeded). */
  kind?: 'quota_notice';
}

export type MemoryTag =
  | 'injury' // douleurs, blessures aiguës
  | 'condition' // conditions chroniques, médicaments, allergies
  | 'pr' // records battus
  | 'goal' // objectifs personnels (poids, perf, événement)
  | 'preference_food' // aliments aimés/détestés/refusés
  | 'preference_training' // exos / types de séance aimés/détestés
  | 'constraint' // contraintes pratiques (budget, équipement, horaires)
  | 'lifestyle' // vie perso (boulot, famille, voyages, déménagement)
  | 'mood_pattern' // patterns émotionnels récurrents (stress période X)
  | 'event' // moments marquants (compétition, mariage, premier X)
  | 'feedback' // ce qui a marché ou pas dans nos conseils précédents
  | 'note'; // fourre-tout

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
  /** True when the user has tapped "Ne plus afficher" on the welcome card.
   *  Reset to false on logout so re-logged-in users see it again. */
  welcomeDismissed: boolean;
  /** Date ISO (YYYY-MM-DD) du dernier greeting auto envoyé. Persisté pour
   *  éviter qu'un remount rapide du composant Coach (nav → Home → Coach)
   *  re-déclenche un greeting tant que `persistedMessages` n'a pas eu
   *  le temps de commit. */
  lastGreetingDate: string | null;

  appendMessage: (msg: ChatMessage) => void;
  /** Append une mémoire et retourne celle créée si nouvelle (null si
   *  dédupliquée). Le caller peut sync l'objet retourné vers Supabase. */
  appendMemory: (mem: Omit<CoachMemory, 'id' | 'date'> & { date?: string }) => CoachMemory | null;
  dismissWelcome: () => void;
  /** Wipe all current-week messages but keep memories. Called on week rotation. */
  rotateIfNewWeek: () => void;
  /** Full reset triggered on logout. Clears messages + memories + welcome flag. */
  resetOnLogout: () => void;
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
      welcomeDismissed: false,
      lastGreetingDate: null,

      appendMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      appendMemory: (mem) => {
        const state = get();
        const newMem: CoachMemory = {
          id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date: mem.date ?? todayLocalIso(),
          tag: mem.tag,
          summary: mem.summary,
          weight: mem.weight,
        };
        // Dedupe on summary text (avoid LLM re-asserting the same thing)
        const exists = state.memories.some((m) => m.summary.toLowerCase() === mem.summary.toLowerCase());
        if (exists) return null;
        let next = [...state.memories, newMem];
        // Cap at MAX_MEMORIES — drop oldest low-weight first.
        if (next.length > MAX_MEMORIES) {
          next = [...next].sort((a, b) => {
            if (a.weight !== b.weight) return b.weight - a.weight; // higher weight stays
            return b.date.localeCompare(a.date); // newer stays
          }).slice(0, MAX_MEMORIES);
        }
        set({ memories: next });
        // Retourne la mémoire pour que le caller la sync à Supabase.
        return newMem;
      },

      dismissWelcome: () => set({ welcomeDismissed: true }),

      rotateIfNewWeek: () => {
        const currentMonday = getMondayIso();
        if (get().weekStart !== currentMonday) {
          set({ messages: [], weekStart: currentMonday });
        }
      },

      resetOnLogout: () =>
        set({
          messages: [],
          memories: [],
          weekStart: getMondayIso(),
          welcomeDismissed: false,
          lastGreetingDate: null,
        }),

      clearAll: () => set({ messages: [], memories: [], weekStart: getMondayIso(), welcomeDismissed: false, lastGreetingDate: null }),
    }),
    {
      name: 'forga-chat-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        messages: state.messages,
        memories: state.memories,
        weekStart: state.weekStart,
        welcomeDismissed: state.welcomeDismissed,
        lastGreetingDate: state.lastGreetingDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.rotateIfNewWeek();
      },
    }
  )
);
