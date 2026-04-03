import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WaterEntry {
  id: string;
  amount: number; // ml
  timestamp: string; // ISO
}

interface WaterState {
  history: Record<string, WaterEntry[]>; // key = 'YYYY-MM-DD'
  dailyTargetMl: number;

  addWater: (date: string, amount: number) => void;
  removeWater: (date: string, entryId: string) => void;
  setDailyTarget: (targetMl: number) => void;
  getTodayTotal: (date: string) => number;
  getWeekHistory: (todayDate: string) => { date: string; total: number }[];
  reset: () => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      history: {},
      dailyTargetMl: 2500,

      addWater: (date, amount) =>
        set((state) => {
          const entry: WaterEntry = {
            id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            amount,
            timestamp: new Date().toISOString(),
          };
          return {
            history: {
              ...state.history,
              [date]: [...(state.history[date] ?? []), entry],
            },
          };
        }),

      removeWater: (date, entryId) =>
        set((state) => ({
          history: {
            ...state.history,
            [date]: (state.history[date] ?? []).filter((e) => e.id !== entryId),
          },
        })),

      setDailyTarget: (dailyTargetMl) => set({ dailyTargetMl }),

      getTodayTotal: (date) => {
        const entries = get().history[date] ?? [];
        return entries.reduce((sum, e) => sum + e.amount, 0);
      },

      getWeekHistory: (todayDate) => {
        const result: { date: string; total: number }[] = [];
        const today = new Date(todayDate);
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          const entries = get().history[key] ?? [];
          result.push({
            date: key,
            total: entries.reduce((sum, e) => sum + e.amount, 0),
          });
        }
        return result;
      },

      reset: () => set({ history: {}, dailyTargetMl: 2500 }),
    }),
    {
      name: 'forga-water-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        dailyTargetMl: state.dailyTargetMl,
      }),
    }
  )
);
