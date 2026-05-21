import type { ActivityLevel, Objective, Sex } from './user';
import type { MealSlot } from './meal';

export interface TDEEInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}

export interface TDEEResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
}

export interface MacroTarget {
  calories: number;
  protein: number;  // g
  carbs: number;    // g
  fat: number;      // g
}

export interface MacroInput {
  tdee: number;
  weightKg: number;
  objective: Objective;
  /** Statut ménopausique pour ajustement nutritionnel. Quand 'peri' ou
   *  'post', les protéines passent à 2.0 g/kg (lutte contre sarcopénie
   *  accélérée pendant la transition hormonale). */
  menopauseStatus?: 'none' | 'peri' | 'post';
}

export interface MealPlanConfig {
  mealsPerDay: number;
  slots: MealSlot[];
  distribution: Record<MealSlot, {
    caloriePercent: number;
    label: string;
    time: string;
  }>;
}

export interface MealPlanInput {
  objective: Objective;
  dailyCalories: number;
  /** Nombre de repas explicitement défini par l'utilisateur (à
   *  l'onboarding ou via une modification ultérieure). Quand fourni,
   *  ce nombre EST la source de vérité — il court-circuite la
   *  détermination algorithmique. Garantit que le user qui a été
   *  configuré sur 4 repas n'en voit pas soudainement 6 si ses
   *  calories sont ré-ajustées. */
  mealsPerDay?: number;
}

export interface PortionInput {
  targetMacros: MacroTarget;
  mealBaseMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: {
    ingredientId: string;
    name: string;
    baseQuantityG: number;
    unit: 'g' | 'ml' | 'unit';
    roundTo: number;
  }[];
}

export interface AdaptiveInput {
  currentCalories: number;
  objective: Objective;
  weightTrendPerWeek: number;
  energy: 1 | 2 | 3 | 4 | 5;
  hunger: 1 | 2 | 3 | 4 | 5;
  performance: 1 | 2 | 3 | 4;
  sleep: 1 | 2 | 3 | 4;
}

export interface AdaptiveResult {
  calorieAdjustment: number; // kcal to add/remove
  reason: string;
  newDailyCalories: number;
}
