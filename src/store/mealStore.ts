import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyMeal, MealSlot, DayPlan } from '../types/meal';
import { todayLocalIso } from '../utils/date';

interface MealState {
  todayMeals: DailyMeal[];
  lastMealDate: string; // 'YYYY-MM-DD' — tracks which day todayMeals belongs to
  dayPlan: DayPlan | null;
  favorites: string[]; // meal IDs
  likedMeals: string[]; // meal IDs
  dislikedMeals: string[]; // meal IDs
  mealHistory: Record<string, DailyMeal[]>; // key = 'YYYY-MM-DD'

  setTodayMeals: (meals: DailyMeal[]) => void;
  addValidatedMeal: (meal: DailyMeal) => void;
  /** Remove all meals for a given slot. */
  removeValidatedMeal: (slot: MealSlot) => void;
  /** Remove a single meal by id (within today). */
  removeValidatedMealById: (id: string) => void;
  setDayPlan: (plan: DayPlan) => void;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (mealId: string) => void;
  isFavorite: (mealId: string) => boolean;
  toggleLike: (mealId: string) => void;
  toggleDislike: (mealId: string) => void;
  getMealScore: (mealId: string) => number; // +1 liked, -1 disliked, 0 neutral
  getMealForSlot: (slot: MealSlot) => DailyMeal | undefined;
  /** Returns ALL meals for a given slot (a single slot can hold multiple
   *  items — e.g. main dish + dessert at lunch). */
  getMealsForSlot: (slot: MealSlot) => DailyMeal[];
  getValidatedCount: () => number;
  getHistoryForDate: (date: string) => DailyMeal[];
  checkDayReset: () => void;
  reset: () => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      todayMeals: [],
      lastMealDate: todayLocalIso(),
      dayPlan: null,
      favorites: [],
      likedMeals: [],
      dislikedMeals: [],
      mealHistory: {},

      setTodayMeals: (todayMeals) => set({ todayMeals }),
      // A slot can hold MULTIPLE meals (e.g. main + dessert at lunch). Also
      // a meal can be retroactively added to a past date (user forgot to
      // log yesterday's dinner) — in that case we only touch `mealHistory`,
      // never `todayMeals`, otherwise the past entry would pollute today's
      // score and macro displays. De-dup is exact (mealId+slot+date) so an
      // accidental double-tap doesn't create two copies of the same dish.
      addValidatedMeal: (meal) =>
        set((state) => {
          const date = meal.date;
          const today = todayLocalIso();
          const isExactDupe = (m: DailyMeal) =>
            m.slot === meal.slot && m.mealId === meal.mealId && m.date === meal.date;
          const isToday = date === today;
          return {
            todayMeals: isToday
              ? [...state.todayMeals.filter((m) => !isExactDupe(m)), meal]
              : state.todayMeals,
            mealHistory: {
              ...state.mealHistory,
              [date]: [
                ...(state.mealHistory[date] ?? []).filter((m) => !isExactDupe(m)),
                meal,
              ],
            },
          };
        }),
      removeValidatedMeal: (slot) =>
        set((state) => {
          const date = state.lastMealDate;
          const updatedHistory = { ...state.mealHistory };
          if (date && updatedHistory[date]) {
            updatedHistory[date] = updatedHistory[date].filter((m) => m.slot !== slot);
            if (updatedHistory[date].length === 0) delete updatedHistory[date];
          }
          return {
            todayMeals: state.todayMeals.filter((m) => m.slot !== slot),
            mealHistory: updatedHistory,
          };
        }),
      // Removes a meal by id from BOTH today's working set and every date in
      // history. Necessary because the user can now delete a meal logged
      // yesterday from the history screen — the meal lives only in
      // `mealHistory[<that-date>]`, never in `todayMeals`.
      removeValidatedMealById: (id) =>
        set((state) => {
          const updatedHistory: Record<string, DailyMeal[]> = {};
          for (const [date, meals] of Object.entries(state.mealHistory)) {
            const filtered = meals.filter((m) => m.id !== id);
            if (filtered.length > 0) updatedHistory[date] = filtered;
          }
          return {
            todayMeals: state.todayMeals.filter((m) => m.id !== id),
            mealHistory: updatedHistory,
          };
        }),
      setDayPlan: (dayPlan) => set({ dayPlan }),
      setFavorites: (favorites) => set({ favorites }),
      toggleFavorite: (mealId) =>
        set((state) => ({
          favorites: state.favorites.includes(mealId)
            ? state.favorites.filter((id) => id !== mealId)
            : [...state.favorites, mealId],
        })),
      isFavorite: (mealId) => get().favorites.includes(mealId),
      toggleLike: (mealId) =>
        set((state) => ({
          likedMeals: state.likedMeals.includes(mealId)
            ? state.likedMeals.filter((id) => id !== mealId)
            : [...state.likedMeals, mealId],
          dislikedMeals: state.dislikedMeals.filter((id) => id !== mealId),
        })),
      toggleDislike: (mealId) =>
        set((state) => ({
          dislikedMeals: state.dislikedMeals.includes(mealId)
            ? state.dislikedMeals.filter((id) => id !== mealId)
            : [...state.dislikedMeals, mealId],
          likedMeals: state.likedMeals.filter((id) => id !== mealId),
        })),
      getMealScore: (mealId) => {
        const { likedMeals, dislikedMeals } = get();
        if (likedMeals.includes(mealId)) return 1;
        if (dislikedMeals.includes(mealId)) return -1;
        return 0;
      },
      getMealForSlot: (slot) => get().todayMeals.find((m) => m.slot === slot),
      getMealsForSlot: (slot) => get().todayMeals.filter((m) => m.slot === slot),
      getValidatedCount: () => get().todayMeals.length,
      getHistoryForDate: (date) => get().mealHistory[date] ?? [],
      checkDayReset: () => {
        const today = todayLocalIso();
        const { lastMealDate, todayMeals, mealHistory } = get();
        if (lastMealDate && lastMealDate !== today) {
          // Archive yesterday's meals to history if not already there
          const archived = { ...mealHistory };
          if (todayMeals.length > 0 && !(lastMealDate in archived)) {
            archived[lastMealDate] = todayMeals;
          }
          set({ todayMeals: [], dayPlan: null, lastMealDate: today, mealHistory: archived });
        } else if (!lastMealDate) {
          set({ lastMealDate: today });
        }
      },
      reset: () => set({ todayMeals: [], lastMealDate: todayLocalIso(), dayPlan: null, favorites: [], likedMeals: [], dislikedMeals: [], mealHistory: {} }),
    }),
    {
      name: 'forga-meal-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        likedMeals: state.likedMeals,
        dislikedMeals: state.dislikedMeals,
        todayMeals: state.todayMeals,
        lastMealDate: state.lastMealDate,
        dayPlan: state.dayPlan,
        mealHistory: state.mealHistory,
      }),
      onRehydrateStorage: () => (state) => {
        // Run AFTER persist has loaded data from AsyncStorage
        if (state) state.checkDayReset();
      },
    }
  )
);
