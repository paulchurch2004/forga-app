import type { Budget, Restriction } from './user';

export type MealSlot =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'afternoon_snack'
  | 'dinner'
  | 'bedtime';

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Petit-déjeuner',
  morning_snack: 'Collation matin',
  lunch: 'Déjeuner',
  afternoon_snack: 'Goûter',
  dinner: 'Dîner',
  bedtime: 'Avant dodo',
};

export const MEAL_SLOT_TIMES: Record<MealSlot, string> = {
  breakfast: '07:30',
  morning_snack: '10:00',
  lunch: '12:30',
  afternoon_snack: '16:30',
  dinner: '20:00',
  bedtime: '22:30',
};

export interface Ingredient {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  unit: 'g' | 'ml' | 'unit';
  roundTo: number; // arrondi intelligent (ex: 5, 10, 25, 50)
}

export interface MealIngredient {
  ingredientId: string;
  name: string;
  baseQuantityG: number; // quantité de base pour 1 portion "standard"
  unit: 'g' | 'ml' | 'unit';
  roundTo: number;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  slot: MealSlot;
  photoUrl: string;
  budget: Budget;
  restrictions: Restriction[];
  prepTimeMin: number;
  difficulty: 1 | 2 | 3;
  ingredients: MealIngredient[];
  recipeSteps: string[];

  // Macros de base (pour 1 portion standard)
  baseMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  tags: string[];
}

export interface AdjustedMeal extends Meal {
  adjustedIngredients: AdjustedIngredient[];
  adjustedMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface AdjustedIngredient {
  ingredientId: string;
  name: string;
  originalQuantity: number;
  adjustedQuantity: number;
  roundedQuantity: number;
  displayQuantity: string; // "150g", "2 oeufs", etc.
  unit: 'g' | 'ml' | 'unit';
}

export interface DailyMeal {
  id: string;
  userId: string;
  date: string;
  slot: MealSlot;
  mealId: string;
  customName?: string;
  adjustedQuantities: Record<string, number>;
  actualMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  validatedAt: string;
}

export type MealSlotStatus = 'done' | 'current' | 'upcoming';

export interface DayPlan {
  date: string;
  slots: {
    slot: MealSlot;
    status: MealSlotStatus;
    meal?: DailyMeal;
    targetMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }[];
  totalConsumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  totalTarget: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
