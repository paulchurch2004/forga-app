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

import { BREAKFASTS_EXTRA } from './breakfast_extra';
import { MORNING_SNACKS_EXTRA } from './morningSnack_extra';
import { LUNCHES_EXTRA } from './lunch_extra';
import { AFTERNOON_SNACKS_EXTRA } from './afternoonSnack_extra';
import { DINNERS_EXTRA } from './dinner_extra';
import { BEDTIME_SNACKS_EXTRA } from './bedtime_extra';

/**
 * Tous les repas de la base FORGA, indexés par slot.
 */
export const MEALS_BY_SLOT: Record<MealSlot, Meal[]> = {
  breakfast: [...BREAKFASTS, ...BREAKFASTS_EXTRA],
  morning_snack: [...MORNING_SNACKS, ...MORNING_SNACKS_EXTRA],
  lunch: [...LUNCHES, ...LUNCHES_EXTRA],
  afternoon_snack: [...AFTERNOON_SNACKS, ...AFTERNOON_SNACKS_EXTRA],
  dinner: [...DINNERS, ...DINNERS_EXTRA],
  bedtime: [...BEDTIME_SNACKS, ...BEDTIME_SNACKS_EXTRA],
};

/**
 * Liste complète de tous les repas (510 au total).
 */
export const ALL_MEALS: Meal[] = [
  ...BREAKFASTS, ...BREAKFASTS_EXTRA,
  ...MORNING_SNACKS, ...MORNING_SNACKS_EXTRA,
  ...LUNCHES, ...LUNCHES_EXTRA,
  ...AFTERNOON_SNACKS, ...AFTERNOON_SNACKS_EXTRA,
  ...DINNERS, ...DINNERS_EXTRA,
  ...BEDTIME_SNACKS, ...BEDTIME_SNACKS_EXTRA,
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
