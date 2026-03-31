// NutrEngine™ — Planification des repas
import {
  MEAL_DISTRIBUTION_4,
  MEAL_DISTRIBUTION_5,
  MEAL_DISTRIBUTION_6,
} from './constants';
import type { MealPlanConfig, MealPlanInput } from '../types/engine';
import type { MealSlot } from '../types/meal';

/**
 * Détermine le nombre optimal de repas par jour selon l'objectif et les calories
 * - Bulk / Recomp avec >2500 kcal → 6 repas
 * - Maintain ou Cut modéré (>1800 kcal) → 5 repas
 * - Cut agressif (<1800 kcal) → 4 repas
 */
export function determineMealCount(input: MealPlanInput): number {
  const { objective, dailyCalories } = input;

  if ((objective === 'bulk' || objective === 'recomp') && dailyCalories >= 2500) {
    return 6;
  }
  if (dailyCalories < 1800) {
    return 4;
  }
  return 5;
}

/**
 * Génère la configuration complète du plan repas
 */
export function generateMealPlan(input: MealPlanInput): MealPlanConfig {
  const mealsPerDay = determineMealCount(input);

  let distribution: Record<string, { caloriePercent: number; label: string; time: string }>;

  switch (mealsPerDay) {
    case 6:
      distribution = { ...MEAL_DISTRIBUTION_6 };
      break;
    case 4:
      distribution = { ...MEAL_DISTRIBUTION_4 };
      break;
    default:
      distribution = { ...MEAL_DISTRIBUTION_5 };
  }

  const slots = Object.keys(distribution) as MealSlot[];

  return {
    mealsPerDay,
    slots,
    distribution: distribution as MealPlanConfig['distribution'],
  };
}
