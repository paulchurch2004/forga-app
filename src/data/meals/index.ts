import type { Meal, MealSlot } from '../../types/meal';

export { BREAKFASTS } from './breakfast';
export { MORNING_SNACKS } from './morningSnack';
export { LUNCHES } from './lunch';
export { AFTERNOON_SNACKS } from './afternoonSnack';
export { DINNERS } from './dinner';
export { BEDTIME_SNACKS } from './bedtime';

import { BREAKFASTS } from './breakfast';
import { MORNING_SNACKS } from './morningSnack';
import { LUNCHES } from './lunch';
import { AFTERNOON_SNACKS } from './afternoonSnack';
import { DINNERS } from './dinner';
import { BEDTIME_SNACKS } from './bedtime';

/**
 * Tous les repas de la base FORGA, indexés par slot.
 */
export const MEALS_BY_SLOT: Record<MealSlot, Meal[]> = {
  breakfast: BREAKFASTS,
  morning_snack: MORNING_SNACKS,
  lunch: LUNCHES,
  afternoon_snack: AFTERNOON_SNACKS,
  dinner: DINNERS,
  bedtime: BEDTIME_SNACKS,
};

/**
 * Liste complète de tous les repas (192 au total).
 */
export const ALL_MEALS: Meal[] = [
  ...BREAKFASTS,
  ...MORNING_SNACKS,
  ...LUNCHES,
  ...AFTERNOON_SNACKS,
  ...DINNERS,
  ...BEDTIME_SNACKS,
];

/**
 * Recherche un repas par son ID.
 */
export const getMealById = (id: string): Meal | undefined =>
  ALL_MEALS.find((m) => m.id === id);

/**
 * Filtre les repas par slot et budget.
 */
export const getMealsBySlotAndBudget = (
  slot: MealSlot,
  budget: 'eco' | 'premium' | 'both'
): Meal[] => {
  const meals = MEALS_BY_SLOT[slot];
  if (budget === 'both') return meals;
  return meals.filter((m) => m.budget === budget || m.budget === 'both');
};
