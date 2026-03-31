// NutrEngine™ — Arrondi intelligent (RoundingEngine)

/**
 * Arrondit une quantité de façon intelligente pour que les grammages
 * soient réalistes et faciles à mesurer.
 *
 * Règles :
 * - Quantités < 10g : arrondi au g
 * - Quantités 10-50g : arrondi à 5g
 * - Quantités 50-200g : arrondi à 10g
 * - Quantités > 200g : arrondi à 25g
 * - Unités (oeufs, fruits) : arrondi à l'unité
 * - Le roundTo de l'ingrédient a priorité si défini
 *
 * Garantie : jamais 0, minimum 1 unité ou 5g
 */
export function smartRound(
  value: number,
  ingredientRoundTo: number,
  unit: 'g' | 'ml' | 'unit',
): number {
  if (unit === 'unit') {
    return Math.max(1, Math.round(value));
  }

  // Si l'ingrédient a un arrondi spécifique, l'utiliser
  if (ingredientRoundTo > 0) {
    const rounded = Math.round(value / ingredientRoundTo) * ingredientRoundTo;
    return Math.max(ingredientRoundTo, rounded);
  }

  // Arrondi automatique basé sur la valeur
  return autoRound(value);
}

function autoRound(value: number): number {
  if (value < 10) {
    return Math.max(1, Math.round(value));
  }
  if (value < 50) {
    return Math.max(5, Math.round(value / 5) * 5);
  }
  if (value < 200) {
    return Math.max(10, Math.round(value / 10) * 10);
  }
  return Math.max(25, Math.round(value / 25) * 25);
}

/**
 * Calcule l'erreur d'arrondi en pourcentage
 */
export function roundingError(original: number, rounded: number): number {
  if (original === 0) return 0;
  return Math.abs((rounded - original) / original) * 100;
}

/**
 * Vérifie que l'erreur d'arrondi est acceptable (< 15%)
 */
export function isAcceptableRounding(original: number, rounded: number): boolean {
  return roundingError(original, rounded) <= 15;
}
