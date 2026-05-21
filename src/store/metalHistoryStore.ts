import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MetalId = 'plomb' | 'bronze' | 'fer' | 'acier' | 'or';

interface MetalHistoryState {
  /** Map of YYYY-MM-DD -> chosen metal */
  history: Record<string, MetalId>;
  setMetalForDate: (date: string, metal: MetalId) => void;
  clearMetalForDate: (date: string) => void;
  getLastNDays: (days: number) => Array<{ date: string; metal: MetalId | null }>;
  /** Wipe complet — appelé au logout pour éviter que user B voit la
   *  frise gamification de user A sur un device partagé. */
  reset: () => void;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const useMetalHistoryStore = create<MetalHistoryState>()(
  persist(
    (set, get) => ({
      history: {},
      setMetalForDate: (date, metal) =>
        set((state) => ({ history: { ...state.history, [date]: metal } })),
      clearMetalForDate: (date) =>
        set((state) => {
          const next = { ...state.history };
          delete next[date];
          return { history: next };
        }),
      getLastNDays: (days) => {
        const result: Array<{ date: string; metal: MetalId | null }> = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = dateKey(d);
          result.push({ date: key, metal: get().history[key] ?? null });
        }
        return result;
      },
      reset: () => set({ history: {} }),
    }),
    {
      name: 'forga.metalHistory.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
