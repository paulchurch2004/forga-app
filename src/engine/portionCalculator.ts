// NutrEngine™ — Calcul des portions personnalisées
import type { MacroTarget } from '../types/engine';
import type { MealIngredient, AdjustedIngredient } from '../types/meal';
import { smartRound } from './roundingEngine';

interface PortionResult {
  adjustedIngredients: AdjustedIngredient[];
  adjustedMacros: MacroTarget;
}

/**
 * Calcule les portions personnalisées d'un repas en fonction des macros cibles du créneau.
 *
 * Stratégie : on utilise un ratio basé sur les calories cibles / calories de base
 * puis on ajuste les protéines prioritairement.
 */
export function calculatePortions(
  targetMacros: MacroTarget,
  mealBaseMacros: { calories: number; protein: number; carbs: number; fat: number },
  ingredients: MealIngredient[],
): PortionResult {
  // Ratio d'ajustement basé sur les calories
  const calorieRatio = targetMacros.calories / mealBaseMacros.calories;

  // Ajustement supplémentaire pour prioriser les protéines
  const proteinRatio = targetMacros.protein / mealBaseMacros.protein;

  // On pondère : 60% ratio calorique + 40% ratio protéique
  const adjustmentRatio = (calorieRatio * 0.6) + (proteinRatio * 0.4);

  const adjustedIngredients: AdjustedIngredient[] = ingredients.map((ing) => {
    const adjustedQuantity = ing.baseQuantityG * adjustmentRatio;
    const roundedQuantity = smartRound(adjustedQuantity, ing.roundTo, ing.unit);

    return {
      ingredientId: ing.ingredientId,
      name: ing.name,
      originalQuantity: ing.baseQuantityG,
      adjustedQuantity: Math.round(adjustedQuantity * 10) / 10,
      roundedQuantity,
      displayQuantity: formatQuantity(roundedQuantity, ing.unit),
      unit: ing.unit,
    };
  });

  // Recalculer les macros réelles après arrondi
  const totalRatio = adjustedIngredients.reduce((sum, ing) => {
    const original = ingredients.find(i => i.ingredientId === ing.ingredientId);
    if (!original) return sum;
    return sum + (ing.roundedQuantity / original.baseQuantityG);
  }, 0) / adjustedIngredients.length;

  const adjustedMacros: MacroTarget = {
    calories: Math.round(mealBaseMacros.calories * totalRatio),
    protein: Math.round(mealBaseMacros.protein * totalRatio),
    carbs: Math.round(mealBaseMacros.carbs * totalRatio),
    fat: Math.round(mealBaseMacros.fat * totalRatio),
  };

  return { adjustedIngredients, adjustedMacros };
}

function formatQuantity(quantity: number, unit: 'g' | 'ml' | 'unit'): string {
  if (unit === 'unit') {
    return quantity === 1 ? '1' : `${quantity}`;
  }
  return `${quantity}${unit}`;
}
