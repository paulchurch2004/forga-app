import { useMemo } from 'react';
import { calculateTDEE } from '../engine/tdee';
import { calculateMacros, calculateSlotMacros } from '../engine/macros';
import { generateMealPlan } from '../engine/mealPlanner';
import { useUserStore } from '../store/userStore';
import type { MacroTarget, MealPlanConfig } from '../types/engine';
import type { MealSlot } from '../types/meal';

interface EngineResult {
  dailyMacros: MacroTarget;
  mealPlan: MealPlanConfig;
  getSlotMacros: (slot: MealSlot) => MacroTarget;
}

export function useEngine(): EngineResult | null {
  const profile = useUserStore((s) => s.profile);

  return useMemo(() => {
    if (!profile) return null;

    const tdeeResult = calculateTDEE({
      sex: profile.sex,
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.currentWeight,
      activityLevel: profile.activityLevel,
    });

    const dailyMacros = calculateMacros({
      tdee: tdeeResult.tdee,
      weightKg: profile.currentWeight,
      objective: profile.objective,
    });

    const mealPlan = generateMealPlan({
      objective: profile.objective,
      dailyCalories: dailyMacros.calories,
    });

    const getSlotMacros = (slot: MealSlot): MacroTarget => {
      const dist = mealPlan.distribution[slot];
      if (!dist) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      return calculateSlotMacros(dailyMacros, dist.caloriePercent);
    };

    return { dailyMacros, mealPlan, getSlotMacros };
  }, [profile]);
}
