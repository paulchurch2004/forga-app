import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MealSlot } from '../types/meal';
import type { WeeklyDayPlan } from '../engine/weeklyPlanner';

interface WeeklyPlanState {
  weekStart: string | null;
  days: WeeklyDayPlan[];
  generatedAt: string | null;

  setWeeklyPlan: (weekStart: string, days: WeeklyDayPlan[]) => void;
  swapMeal: (date: string, slot: MealSlot, newMealId: string, newMealName: string) => void;
  reset: () => void;
}

export const useWeeklyPlanStore = create<WeeklyPlanState>()(
  persist(
    (set) => ({
      weekStart: null,
      days: [],
      generatedAt: null,

      setWeeklyPlan: (weekStart, days) => {
        set({ weekStart, days, generatedAt: new Date().toISOString() });
        // Sync to Supabase
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncWeeklyPlan }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncWeeklyPlan(userId);
          });
        });
      },

      swapMeal: (date, slot, newMealId, newMealName) => {
        set((state) => ({
          days: state.days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  meals: day.meals.map((m) =>
                    m.slot === slot ? { ...m, mealId: newMealId, mealName: newMealName } : m
                  ),
                }
              : day
          ),
        }));
        // Sync to Supabase
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncWeeklyPlan }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncWeeklyPlan(userId);
          });
        });
      },

      reset: () => set({ weekStart: null, days: [], generatedAt: null }),
    }),
    {
      name: 'forga-weekly-plan-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
