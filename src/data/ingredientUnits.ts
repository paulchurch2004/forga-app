// FORGA — Natural-unit display for countable ingredients.
//
// The dataset stores every quantity in grams (e.g. `banana: 100g`) which is
// great for macro calculations but lousy for the user reading the recipe —
// "1 banane" is more practical than "100g de banane".
//
// This table maps an `ingredientId` to the average grams per unit + the
// FR/EN singular/plural names. Display layers (IngredientRow,
// portionCalculator) consult it before rendering: if the ingredient has an
// entry AND the resulting count is ≥ 0.5, we display "X bananes" instead
// of grams. Otherwise we fall back to the gram value so spices, oils, etc.
// stay readable.
//
// To add a new countable ingredient, just append an entry below.

export interface IngredientUnitInfo {
  /** Average grams per single unit (one banana ≈ 120g). */
  gramsPerUnit: number;
  fr: { singular: string; plural: string };
  en: { singular: string; plural: string };
  /** Optional: minimum count below which we keep grams (default 0.5). */
  minCountToShow?: number;
}

export const INGREDIENT_UNIT_INFO: Record<string, IngredientUnitInfo> = {
  // ── FRUITS ──
  banana: { gramsPerUnit: 120, fr: { singular: 'banane', plural: 'bananes' }, en: { singular: 'banana', plural: 'bananas' } },
  apple: { gramsPerUnit: 180, fr: { singular: 'pomme', plural: 'pommes' }, en: { singular: 'apple', plural: 'apples' } },
  orange: { gramsPerUnit: 180, fr: { singular: 'orange', plural: 'oranges' }, en: { singular: 'orange', plural: 'oranges' } },
  kiwi: { gramsPerUnit: 75, fr: { singular: 'kiwi', plural: 'kiwis' }, en: { singular: 'kiwi', plural: 'kiwis' } },
  avocado: { gramsPerUnit: 150, fr: { singular: 'avocat', plural: 'avocats' }, en: { singular: 'avocado', plural: 'avocados' } },
  lemon: { gramsPerUnit: 60, fr: { singular: 'citron', plural: 'citrons' }, en: { singular: 'lemon', plural: 'lemons' } },
  lime: { gramsPerUnit: 50, fr: { singular: 'citron vert', plural: 'citrons verts' }, en: { singular: 'lime', plural: 'limes' } },
  peach: { gramsPerUnit: 150, fr: { singular: 'pêche', plural: 'pêches' }, en: { singular: 'peach', plural: 'peaches' } },
  pear: { gramsPerUnit: 170, fr: { singular: 'poire', plural: 'poires' }, en: { singular: 'pear', plural: 'pears' } },

  // ── VEGETABLES (countable) ──
  tomato: { gramsPerUnit: 120, fr: { singular: 'tomate', plural: 'tomates' }, en: { singular: 'tomato', plural: 'tomatoes' } },
  cherry_tomato: { gramsPerUnit: 8, fr: { singular: 'tomate cerise', plural: 'tomates cerises' }, en: { singular: 'cherry tomato', plural: 'cherry tomatoes' } },
  carrot: { gramsPerUnit: 60, fr: { singular: 'carotte', plural: 'carottes' }, en: { singular: 'carrot', plural: 'carrots' } },
  onion: { gramsPerUnit: 110, fr: { singular: 'oignon', plural: 'oignons' }, en: { singular: 'onion', plural: 'onions' } },
  bell_pepper: { gramsPerUnit: 150, fr: { singular: 'poivron', plural: 'poivrons' }, en: { singular: 'bell pepper', plural: 'bell peppers' } },
  zucchini: { gramsPerUnit: 200, fr: { singular: 'courgette', plural: 'courgettes' }, en: { singular: 'zucchini', plural: 'zucchinis' } },
  cucumber: { gramsPerUnit: 200, fr: { singular: 'concombre', plural: 'concombres' }, en: { singular: 'cucumber', plural: 'cucumbers' } },
  garlic: { gramsPerUnit: 5, fr: { singular: 'gousse d\'ail', plural: 'gousses d\'ail' }, en: { singular: 'clove of garlic', plural: 'cloves of garlic' } },
  shallot: { gramsPerUnit: 30, fr: { singular: 'échalote', plural: 'échalotes' }, en: { singular: 'shallot', plural: 'shallots' } },

  // ── PROTEINS (countable) ──
  egg: { gramsPerUnit: 60, fr: { singular: 'œuf', plural: 'œufs' }, en: { singular: 'egg', plural: 'eggs' } },
  eggs: { gramsPerUnit: 60, fr: { singular: 'œuf', plural: 'œufs' }, en: { singular: 'egg', plural: 'eggs' } },
  egg_white: { gramsPerUnit: 35, fr: { singular: 'blanc d\'œuf', plural: 'blancs d\'œuf' }, en: { singular: 'egg white', plural: 'egg whites' } },

  // ── BREAD / WRAPS ──
  bread_white: { gramsPerUnit: 30, fr: { singular: 'tranche de pain blanc', plural: 'tranches de pain blanc' }, en: { singular: 'slice of white bread', plural: 'slices of white bread' } },
  bread_whole: { gramsPerUnit: 35, fr: { singular: 'tranche de pain complet', plural: 'tranches de pain complet' }, en: { singular: 'slice of whole bread', plural: 'slices of whole bread' } },
  bread_rye: { gramsPerUnit: 35, fr: { singular: 'tranche de pain de seigle', plural: 'tranches de pain de seigle' }, en: { singular: 'slice of rye bread', plural: 'slices of rye bread' } },
  pita_bread: { gramsPerUnit: 60, fr: { singular: 'pain pita', plural: 'pains pita' }, en: { singular: 'pita bread', plural: 'pita breads' } },
  wrap_tortilla: { gramsPerUnit: 70, fr: { singular: 'tortilla', plural: 'tortillas' }, en: { singular: 'tortilla', plural: 'tortillas' } },
  tortilla: { gramsPerUnit: 70, fr: { singular: 'tortilla', plural: 'tortillas' }, en: { singular: 'tortilla', plural: 'tortillas' } },
  bagel: { gramsPerUnit: 90, fr: { singular: 'bagel', plural: 'bagels' }, en: { singular: 'bagel', plural: 'bagels' } },

  // ── PORTIONED PACKAGED ITEMS ──
  yogurt: { gramsPerUnit: 125, fr: { singular: 'pot de yaourt', plural: 'pots de yaourt' }, en: { singular: 'yogurt cup', plural: 'yogurt cups' } },
  greek_yogurt: { gramsPerUnit: 150, fr: { singular: 'pot de yaourt grec', plural: 'pots de yaourt grec' }, en: { singular: 'Greek yogurt cup', plural: 'Greek yogurt cups' } },
  skyr: { gramsPerUnit: 150, fr: { singular: 'pot de skyr', plural: 'pots de skyr' }, en: { singular: 'skyr cup', plural: 'skyr cups' } },
  protein_bar: { gramsPerUnit: 50, fr: { singular: 'barre protéinée', plural: 'barres protéinées' }, en: { singular: 'protein bar', plural: 'protein bars' } },
  rice_cake: { gramsPerUnit: 10, fr: { singular: 'galette de riz', plural: 'galettes de riz' }, en: { singular: 'rice cake', plural: 'rice cakes' } },
  cheese_slice: { gramsPerUnit: 20, fr: { singular: 'tranche de fromage', plural: 'tranches de fromage' }, en: { singular: 'cheese slice', plural: 'cheese slices' } },
};

/** Format a quantity for display. If the ingredient has natural-unit info
 *  AND the count is >= minCountToShow (default 0.5), display as count.
 *  Otherwise fall back to the raw quantity with its original unit. */
export function formatIngredientQuantity(
  ingredientId: string,
  quantity: number,
  unit: 'g' | 'ml' | 'unit',
  locale: 'fr' | 'en' = 'fr',
): string {
  const info = INGREDIENT_UNIT_INFO[ingredientId];

  // If the data is already in "unit" mode, just render the count + label.
  if (unit === 'unit') {
    if (info) {
      const count = Math.round(quantity);
      const label = count > 1 ? info[locale].plural : info[locale].singular;
      return `${count} ${label}`;
    }
    return `${Math.round(quantity)}`;
  }

  // For mass-stored ingredients (g/ml), check if a natural unit makes sense.
  if (unit === 'g' && info) {
    const count = quantity / info.gramsPerUnit;
    const minToShow = info.minCountToShow ?? 0.5;
    if (count >= minToShow) {
      // Round to nearest 0.5 below 3, nearest int above.
      const rounded = count < 3 ? Math.round(count * 2) / 2 : Math.round(count);
      const label = rounded > 1 ? info[locale].plural : info[locale].singular;
      // Format "1.5 bananes" not "1.5bananes"; drop trailing ".0".
      const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
      return `${display} ${label}`;
    }
  }

  return `${Math.round(quantity)}${unit}`;
}
