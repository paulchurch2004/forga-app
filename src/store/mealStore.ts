import { create } from 'zustand';
import type { DailyMeal, MealSlot, DayPlan } from '../types/meal';

interface MealState {
  todayMeals: DailyMeal[];
  dayPlan: DayPlan | null;
  favorites: string[]; // meal IDs

  setTodayMeals: (meals: DailyMeal[]) => void;
  addValidatedMeal: (meal: DailyMeal) => void;
  removeValidatedMeal: (slot: MealSlot) => void;
  setDayPlan: (plan: DayPlan) => void;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (mealId: string) => void;
  isFavorite: (mealId: string) => boolean;
  getMealForSlot: (slot: MealSlot) => DailyMeal | undefined;
  getValidatedCount: () => number;
  reset: () => void;
}

export const useMealStore = create<MealState>((set, get) => ({
  todayMeals: [],
  dayPlan: null,
  favorites: [],

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
  getMealForSlot: (slot) => get().todayMeals.find((m) => m.slot === slot),
  getValidatedCount: () => get().todayMeals.length,
  reset: () => set({ todayMeals: [], dayPlan: null, favorites: [] }),
}));
