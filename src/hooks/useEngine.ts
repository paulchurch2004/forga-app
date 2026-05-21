import { useMemo } from 'react';
import { calculateTDEE } from '../engine/tdee';
import { calculateMacros, calculateSlotMacros } from '../engine/macros';
import { generateMealPlan } from '../engine/mealPlanner';
import { useUserStore } from '../store/userStore';
import { computeCyclingKcalPerDay } from '../services/cyclingRouting';
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

    // Bonus calories vélo-commute : si l'user a renseigné un trajet
    // régulier, on ajoute la dépense énergétique au TDEE pour éviter
    // de sous-évaluer ses besoins. Réparti sur 7 jours pour stabilité.
    let cyclingKcal = 0;
    if (profile.cycling?.enabled && profile.cycling.distanceKm) {
      cyclingKcal = computeCyclingKcalPerDay(
        profile.cycling.distanceKm,
        profile.cycling.daysPerWeek,
        profile.currentWeight,
      );
    }

    // Ajustement ménopause : la baisse d'œstrogène ralentit le
    // métabolisme. -5% en périménopause, -8% en post-ménopause établie.
    // Les protéines sont rehaussées séparément dans calculateMacros.
    // Source : NAMS 2022 + études Pinkerton et al.
    let menopauseFactor = 1.0;
    if (profile.menopauseStatus === 'peri') menopauseFactor = 0.95;
    if (profile.menopauseStatus === 'post') menopauseFactor = 0.92;

    const adjustedTdee = (tdeeResult.tdee + cyclingKcal) * menopauseFactor;

    const dailyMacros = calculateMacros({
      tdee: adjustedTdee,
      weightKg: profile.currentWeight,
      objective: profile.objective,
      menopauseStatus: profile.menopauseStatus,
    });

    const mealPlan = generateMealPlan({
      objective: profile.objective,
      dailyCalories: dailyMacros.calories,
      // Le profil stocke le mealsPerDay choisi à l'onboarding (4/5/6).
      // On le pousse au planner pour qu'il NE recalcule PAS un autre
      // nombre quand les calories sont ajustées. Sinon, ta mère
      // configurée sur 4 repas pourrait se retrouver avec 6 slots si
      // l'algo `determineMealCount` change d'avis.
      mealsPerDay: profile.mealsPerDay,
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
