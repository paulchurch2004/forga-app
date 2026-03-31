// NutrEngine™ — Constantes nutritionnelles

// Multiplicateurs d'activité (Mifflin-St Jeor)
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Peu ou pas d'exercice
  light: 1.375,        // Exercice léger 1-3 jours/sem
  moderate: 1.55,      // Exercice modéré 3-5 jours/sem
  active: 1.725,       // Exercice intense 6-7 jours/sem
  very_active: 1.9,    // Exercice très intense + travail physique
} as const;

// Ajustements caloriques par objectif
export const CALORIE_ADJUSTMENTS = {
  bulk: 300,       // +300 kcal surplus
  cut: -400,       // -400 kcal déficit
  maintain: 0,     // Maintenance
  recomp: -100,    // Léger déficit pour recomposition
} as const;

// Répartition macros ISSN (g/kg de poids corporel ou % des calories)
export const MACRO_RATIOS = {
  bulk: {
    proteinPerKg: 2.0,     // 2g/kg
    fatPercent: 0.25,       // 25% des calories en lipides
    // Le reste en glucides
  },
  cut: {
    proteinPerKg: 2.4,     // Plus de protéines en déficit pour préserver le muscle
    fatPercent: 0.25,
  },
  maintain: {
    proteinPerKg: 1.8,
    fatPercent: 0.28,
  },
  recomp: {
    proteinPerKg: 2.2,
    fatPercent: 0.25,
  },
} as const;

// Calories par gramme de macro
export const CALS_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

// Distribution par créneau (% des calories quotidiennes)
// Configuration pour 6 repas (objectif bulk/recomp)
export const MEAL_DISTRIBUTION_6 = {
  breakfast: { caloriePercent: 0.22, label: 'Petit-déjeuner', time: '07:30' },
  morning_snack: { caloriePercent: 0.10, label: 'Collation matin', time: '10:00' },
  lunch: { caloriePercent: 0.28, label: 'Déjeuner', time: '12:30' },
  afternoon_snack: { caloriePercent: 0.10, label: 'Goûter', time: '16:30' },
  dinner: { caloriePercent: 0.22, label: 'Dîner', time: '20:00' },
  bedtime: { caloriePercent: 0.08, label: 'Avant dodo', time: '22:30' },
} as const;

// Configuration pour 5 repas (objectif maintain/cut modéré)
export const MEAL_DISTRIBUTION_5 = {
  breakfast: { caloriePercent: 0.25, label: 'Petit-déjeuner', time: '07:30' },
  morning_snack: { caloriePercent: 0.10, label: 'Collation matin', time: '10:00' },
  lunch: { caloriePercent: 0.30, label: 'Déjeuner', time: '12:30' },
  afternoon_snack: { caloriePercent: 0.10, label: 'Goûter', time: '16:30' },
  dinner: { caloriePercent: 0.25, label: 'Dîner', time: '20:00' },
} as const;

// Configuration pour 4 repas (cut agressif)
export const MEAL_DISTRIBUTION_4 = {
  breakfast: { caloriePercent: 0.25, label: 'Petit-déjeuner', time: '08:00' },
  lunch: { caloriePercent: 0.35, label: 'Déjeuner', time: '12:30' },
  afternoon_snack: { caloriePercent: 0.10, label: 'Goûter', time: '16:30' },
  dinner: { caloriePercent: 0.30, label: 'Dîner', time: '20:00' },
} as const;

// Limites de sécurité
export const SAFETY_LIMITS = {
  minCalories: 1200,
  maxCalories: 5000,
  minProteinPerKg: 1.2,
  maxProteinPerKg: 3.0,
  minFatPercent: 0.20,
  maxFatPercent: 0.35,
} as const;

// Limites d'ajustement adaptatif
export const ADAPTIVE_LIMITS = {
  maxAdjustmentPerWeek: 200,     // kcal max par semaine
  minAdjustmentThreshold: 50,    // En dessous, pas d'ajustement
  maxTotalAdjustment: 500,       // kcal max cumulé depuis le début
} as const;
