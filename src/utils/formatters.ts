/**
 * FORGA — Fonctions de formatage
 * Toutes les sorties sont en français.
 */

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

/**
 * Formate une valeur de macro-nutriment avec son unité.
 * @example formatMacro(156) → "156g"
 */
export function formatMacro(value: number): string {
  return `${Math.round(value)}g`;
}

/**
 * Formate un nombre de calories avec séparateur de milliers (espace insécable)
 * et l'unité "kcal".
 * @example formatCalories(2450) → "2 450 kcal"
 */
export function formatCalories(value: number): string {
  const rounded = Math.round(value);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); // espace insécable
  return `${formatted} kcal`;
}

/**
 * Formate un poids en kilogrammes avec une décimale et virgule française.
 * @example formatWeight(82.5) → "82,5 kg"
 */
export function formatWeight(value: number): string {
  const fixed = value.toFixed(1);
  const formatted = fixed.replace('.', ',');
  return `${formatted} kg`;
}

/**
 * Formate une date ISO en format français lisible.
 * @example formatDate("2026-03-02") → "2 mars 2026"
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return date; // retourne tel quel si invalide
  }
  const day = d.getDate();
  const month = MONTHS_FR[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formate un nombre de jours de streak.
 * @example formatStreak(14) → "14 jours"
 * @example formatStreak(1)  → "1 jour"
 * @example formatStreak(0)  → "0 jour"
 */
export function formatStreak(days: number): string {
  const rounded = Math.round(days);
  if (rounded <= 1) {
    return `${rounded} jour`;
  }
  return `${rounded} jours`;
}

/**
 * Formate un score FORGA sur 100.
 * @example formatScore(87) → "87/100"
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}
