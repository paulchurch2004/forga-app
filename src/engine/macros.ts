// NutrEngine™ — Répartition macros par objectif (ISSN)
import { CALORIE_ADJUSTMENTS, MACRO_RATIOS, CALS_PER_GRAM, SAFETY_LIMITS } from './constants';
import type { MacroInput, MacroTarget } from '../types/engine';

/**
 * Calcule les macros quotidiennes en fonction du TDEE, poids et objectif
 * Protocole ISSN :
 * 1. Protéines : g/kg de poids corporel selon objectif
 * 2. Lipides : % des calories totales
 * 3. Glucides : reste des calories
 */
export function calculateMacros(input: MacroInput): MacroTarget {
  const { tdee, weightKg, objective } = input;
  const ratios = MACRO_RATIOS[objective];
  const adjustment = CALORIE_ADJUSTMENTS[objective];

  // Calories ajustées
  let calories = tdee + adjustment;
  calories = Math.max(SAFETY_LIMITS.minCalories, Math.min(SAFETY_LIMITS.maxCalories, calories));

  // Protéines (g/kg)
  const protein = Math.round(ratios.proteinPerKg * weightKg);
  const proteinCals = protein * CALS_PER_GRAM.protein;

  // Lipides (% des calories)
  const fatCals = Math.round(calories * ratios.fatPercent);
  const fat = Math.round(fatCals / CALS_PER_GRAM.fat);

  // Glucides (reste)
  const carbsCals = calories - proteinCals - fatCals;
  const carbs = Math.max(0, Math.round(carbsCals / CALS_PER_GRAM.carbs));

  // Recalcul calories réelles (à cause des arrondis)
  const realCalories = (protein * CALS_PER_GRAM.protein) +
                       (carbs * CALS_PER_GRAM.carbs) +
                       (fat * CALS_PER_GRAM.fat);

  return {
    calories: Math.round(realCalories),
    protein,
    carbs,
    fat,
  };
}

/**
 * Calcule les macros pour un créneau spécifique
 */
export function calculateSlotMacros(dailyMacros: MacroTarget, caloriePercent: number): MacroTarget {
  return {
    calories: Math.round(dailyMacros.calories * caloriePercent),
    protein: Math.round(dailyMacros.protein * caloriePercent),
    carbs: Math.round(dailyMacros.carbs * caloriePercent),
    fat: Math.round(dailyMacros.fat * caloriePercent),
  };
}
