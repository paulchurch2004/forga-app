import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyMeal, MealSlot, DayPlan } from '../types/meal';

interface MealState {
  todayMeals: DailyMeal[];
  dayPlan: DayPlan | null;
  favorites: string[]; // meal IDs
  likedMeals: string[]; // meal IDs
  dislikedMeals: string[]; // meal IDs

  setTodayMeals: (meals: DailyMeal[]) => void;
  addValidatedMeal: (meal: DailyMeal) => void;
  removeValidatedMeal: (slot: MealSlot) => void;
  setDayPlan: (plan: DayPlan) => void;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (mealId: string) => void;
  isFavorite: (mealId: string) => boolean;
  toggleLike: (mealId: string) => void;
  toggleDislike: (mealId: string) => void;
  getMealScore: (mealId: string) => number; // +1 liked, -1 disliked, 0 neutral
  getMealForSlot: (slot: MealSlot) => DailyMeal | undefined;
  getValidatedCount: () => number;
  reset: () => void;
}

export const useMealStore = create<MealState>()(
  persist(
    (set, get) => ({
      todayMeals: [],
      dayPlan: null,
      favorites: [],
      likedMeals: [],
      dislikedMeals: [],

      setTodayMeals: (todayMeals) => set({ todayMeals }),
      addValidatedMeal: (meal) =>
        set((state) => ({
          todayMeals: [
            ...state.todayMeals.filter((m) => m.slot !== meal.slot),
            meal,
          ],
        })),
      removeValidatedMeal: (slot) =>
        set((state) => ({
          todayMeals: state.todayMeals.filter((m) => m.slot !== slot),
        })),
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
      getValidatedCount: () => get().todayMeals.length,
      reset: () => set({ todayMeals: [], dayPlan: null, favorites: [], likedMeals: [], dislikedMeals: [] }),
    }),
    {
      name: 'forga-meal-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        likedMeals: state.likedMeals,
        dislikedMeals: state.dislikedMeals,
      }),
    }
  )
);
