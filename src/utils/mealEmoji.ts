// FORGA — Meal visual identity helpers.
//
// We don't trust photoUrl values anymore: the Wikimedia URLs were unreliable
// (broken thumbnails, mismatched dishes — "chicken+rice" pointing at a kebab
// photo, "tuna salad" pointing at a tuna classification chart, etc.) and
// hand-curating 500+ stock photos before launch isn't worth the time.
//
// Instead: every card displays a slot-aware gradient + a generous emoji
// derived from the meal's name keywords. Lifesum / Yazio / MyFitnessPal use
// the same pattern when they lack a curated photo and it looks intentional
// (visually consistent, branded) rather than half-baked.
//
// `getMealEmoji` runs once at render and is pure — no async, no API.

import type { Meal, MealSlot } from '../types/meal';

/** Keyword → emoji map. Ordered most-specific first so e.g. "poulet rôti"
 *  resolves to chicken before falling through to a generic meal emoji. */
const KEYWORD_EMOJI: Array<[RegExp, string]> = [
  // Proteins
  [/\b(saumon|truite|poisson|cabillaud|merlu|maquereau|thon|crevettes?|moules?|fruits de mer)\b/i, '🐟'],
  [/\b(poulet|dinde|escalope|volaille)\b/i, '🍗'],
  [/\b(b[oœ]uf|steak|bavette|entrec[oô]te|tartare|burger|hach[ée]?)\b/i, '🥩'],
  [/\b(porc|jambon|bacon|lardons)\b/i, '🥓'],
  [/\b(oeufs?|omelette|brouill[ée]s?)\b/i, '🥚'],
  [/\b(tofu|seitan|tempeh)\b/i, '🌱'],

  // Composed dishes
  [/\b(pizza)\b/i, '🍕'],
  [/\b(sushi|maki|sashimi|onigiri)\b/i, '🍣'],
  [/\b(pasta|p[âa]tes|spaghetti|lasagnes?|tagliatelles?|bolognaise|carbonara|raviolis?)\b/i, '🍝'],
  [/\b(salade|salad)\b/i, '🥗'],
  [/\b(soupe|velout[ée]?|bouillon)\b/i, '🍲'],
  [/\b(curry|tikka|masala|tajine|chili)\b/i, '🍛'],
  [/\b(wrap|burrito|tortilla|fajitas?)\b/i, '🌯'],
  [/\b(taco)\b/i, '🌮'],
  [/\b(sandwich|club|panini|baguette)\b/i, '🥪'],
  [/\b(burger|cheeseburger)\b/i, '🍔'],
  [/\b(quiche|tarte sal[ée]e?)\b/i, '🥧'],
  [/\b(crepes?|cr[êe]pe)\b/i, '🥞'],
  [/\b(pancakes?|gaufres?)\b/i, '🥞'],

  // Carbs / sides
  [/\b(riz|risotto|paella)\b/i, '🍚'],
  [/\b(quinoa|boulgour|sarrasin|semoule|couscous)\b/i, '🌾'],
  [/\b(pain|toast|tartine|baguette)\b/i, '🍞'],
  [/\b(patate|pomme de terre|frites|gratin)\b/i, '🥔'],

  // Breakfast staples
  [/\b(yaourt|skyr|fromage blanc|cottage)\b/i, '🥛'],
  [/\b(porridge|flocons d[' ]?avoine|m[ûu]esli|gran[oô]la|c[ée]r[ée]ales)\b/i, '🥣'],
  [/\b(smoothie|milkshake|shake)\b/i, '🥤'],
  [/\b(caf[ée]|expresso|cappuccino)\b/i, '☕'],

  // Desserts / fruit
  [/\b(brownie|cookie|biscuit|gateau|cake|muffin|donut)\b/i, '🍪'],
  [/\b(chocolat|cacao)\b/i, '🍫'],
  [/\b(banane|fraises?|myrtilles?|framboises?|pomme|orange|kiwi|raisins?|p[êe]che|abricot|fruit)\b/i, '🍓'],

  // Generic
  [/\b(snack|encas|barre|prot[ée]in[ée]?e?)\b/i, '🍫'],
];

/** Slot-default emoji used when no keyword matches. */
const SLOT_DEFAULT_EMOJI: Record<MealSlot, string> = {
  breakfast: '🥐',
  morning_snack: '🍎',
  lunch: '🍽️',
  afternoon_snack: '🍪',
  dinner: '🍲',
  bedtime: '🥛',
};

export function getMealEmoji(meal: Pick<Meal, 'name' | 'slot'>): string {
  const text = meal.name ?? '';
  for (const [pattern, emoji] of KEYWORD_EMOJI) {
    if (pattern.test(text)) return emoji;
  }
  return SLOT_DEFAULT_EMOJI[meal.slot] ?? '🍽️';
}

/** Pseudo-stable hash on the meal id, mapped to a gradient bucket. Two
 *  different meals in the same slot get visually distinct gradients (avoids
 *  the "they all look the same" feel). */
export function gradientIndexFor(mealId: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < mealId.length; i++) {
    h = (h * 31 + mealId.charCodeAt(i)) >>> 0;
  }
  return h % buckets;
}

/** Variation gradients per slot — each slot has 3 palette variants so the
 *  library doesn't feel monotonous when scrolling. */
export const SLOT_GRADIENT_BUCKETS: Record<MealSlot, [string, string][]> = {
  breakfast: [
    ['#FF8C42', '#FFB347'],
    ['#FFA552', '#E8893A'],
    ['#FFB347', '#F4A261'],
  ],
  morning_snack: [
    ['#F4A261', '#E76F51'],
    ['#E27D60', '#C0392B'],
    ['#FFB347', '#E08E45'],
  ],
  lunch: [
    ['#FF6B35', '#E8543F'],
    ['#FF8254', '#D34924'],
    ['#FF6B35', '#B8331A'],
  ],
  afternoon_snack: [
    ['#E27D60', '#A0382C'],
    ['#FF6B35', '#A23522'],
    ['#D87A4A', '#7A2E1E'],
  ],
  dinner: [
    ['#8E44AD', '#5B2376'],
    ['#6A4090', '#3F1F60'],
    ['#754C9A', '#3D1B5C'],
  ],
  bedtime: [
    ['#34495E', '#2C3E50'],
    ['#2C3E50', '#1B2838'],
    ['#3D5468', '#1F2D3D'],
  ],
};
