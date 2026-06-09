// NutrEngine™ — Calcul des portions personnalisées
import type { MacroTarget } from '../types/engine';
import type { MealIngredient, AdjustedIngredient } from '../types/meal';
import { smartRound } from './roundingEngine';
import { formatIngredientQuantity } from '../data/ingredientUnits';

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
  // Guard against division by zero
  if (mealBaseMacros.calories === 0 || mealBaseMacros.protein === 0 || ingredients.length === 0) {
    return {
      adjustedIngredients: ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        name: ing.name,
        originalQuantity: ing.baseQuantityG,
        adjustedQuantity: ing.baseQuantityG,
        roundedQuantity: ing.baseQuantityG,
        displayQuantity: formatIngredientQuantity(ing.ingredientId, ing.baseQuantityG, ing.unit),
        unit: ing.unit,
      })),
      adjustedMacros: { calories: mealBaseMacros.calories, protein: mealBaseMacros.protein, carbs: mealBaseMacros.carbs, fat: mealBaseMacros.fat },
    };
  }

  // Ratio d'ajustement optimal sur les 4 macros (pas juste cal+prot).
  //
  // Avant : (calorieRatio*0.6 + proteinRatio*0.4) → les GLUCIDES et les
  // LIPIDES n'entraient pas dans le calcul. Conséquence : un repas
  // scalé pour atteindre calories+protéines pouvait largement
  // sous-doser les glucides → l'user n'atteignait jamais son quota
  // de glucides (bug remonté sur le plan hebdo).
  //
  // Maintenant : on cherche le SEUL facteur d'échelle `r` qui minimise
  // l'erreur relative pondérée sur les 4 macros simultanément
  // (moindres carrés pondérés). Pour chaque macro i, on pose
  // u_i = base_i / target_i, et on minimise Σ w_i·(r·u_i − 1)².
  // Solution analytique : r* = Σ(w_i·u_i) / Σ(w_i·u_i²).
  //
  // C'est scale-invariant par macro (les calories qui sont des grands
  // nombres ne dominent pas mécaniquement protéines/glucides).
  const WEIGHTS: Array<{ base: number; target: number; w: number }> = [
    { base: mealBaseMacros.calories, target: targetMacros.calories, w: 1.2 },
    { base: mealBaseMacros.protein, target: targetMacros.protein, w: 1.0 },
    { base: mealBaseMacros.carbs, target: targetMacros.carbs, w: 1.0 },
    { base: mealBaseMacros.fat, target: targetMacros.fat, w: 0.6 },
  ];
  let num = 0;
  let den = 0;
  for (const { base, target, w } of WEIGHTS) {
    if (target <= 0 || base <= 0) continue; // macro non contrainte → ignorée
    const u = base / target;
    num += w * u;
    den += w * u * u;
  }
  // Fallback calorie-only si tout est dégénéré (ne devrait pas arriver)
  const rawRatio = den > 0 ? num / den : targetMacros.calories / mealBaseMacros.calories;
  // Clamp : on borne le facteur entre 0.4× et 2.5× la portion de base.
  // Au-delà, les portions deviennent irréalistes (assiette minuscule ou
  // énorme) — mieux vaut une légère imprécision macro qu'un repas
  // ingérable. La sélection de repas (weeklyPlanner) limite déjà les
  // cas extrêmes en amont.
  const adjustmentRatio = Math.max(0.4, Math.min(2.5, rawRatio));

  const adjustedIngredients: AdjustedIngredient[] = ingredients.map((ing) => {
    const adjustedQuantity = ing.baseQuantityG * adjustmentRatio;
    const roundedQuantity = smartRound(adjustedQuantity, ing.roundTo, ing.unit);

    return {
      ingredientId: ing.ingredientId,
      name: ing.name,
      originalQuantity: ing.baseQuantityG,
      adjustedQuantity: Math.round(adjustedQuantity * 10) / 10,
      roundedQuantity,
      displayQuantity: formatIngredientQuantity(ing.ingredientId, roundedQuantity, ing.unit),
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
