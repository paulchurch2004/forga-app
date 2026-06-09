import { generateMealPlan } from './mealPlanner';
import { getMealsBySlotAndBudget } from '../data/meals';
import type { MealSlot } from '../types/meal';
import type { Objective, Budget, Restriction } from '../types/user';
import { localIso } from '../utils/date';

interface WeeklyPlanInput {
  objective: Objective;
  dailyCalories: number;
  /** Macros cibles journalières. Sans elles, le planificateur ne
   *  pouvait pas vérifier que les repas choisis atteignent le quota
   *  de glucides/protéines/lipides — d'où le bug "je n'atteins jamais
   *  mes glucides". Optionnelles pour rétro-compat, mais fortement
   *  recommandées (sinon fallback sur sélection variété seule). */
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  mealsPerDay?: number;
  budget: Budget;
  restrictions: Restriction[];
  likedMeals: string[];
  dislikedMeals: string[];
}

/** Distance pondérée entre les macros d'un repas (scalé à la cible
 *  calorique du slot) et la cible macro du slot. Plus c'est bas, mieux
 *  le repas "remplit" le quota. On pondère glucides + protéines plus
 *  fort que lipides car ce sont les 2 leviers que l'user surveille le
 *  plus (et la source #1 du bug remonté = glucides). */
function macroFitDistance(
  scaled: { protein: number; carbs: number; fat: number },
  target: { protein: number; carbs: number; fat: number },
): number {
  const pErr = Math.abs(scaled.protein - target.protein) / Math.max(1, target.protein);
  const cErr = Math.abs(scaled.carbs - target.carbs) / Math.max(1, target.carbs);
  const fErr = Math.abs(scaled.fat - target.fat) / Math.max(1, target.fat);
  // Glucides 1.2, protéines 1.0, lipides 0.6
  return cErr * 1.2 + pErr * 1.0 + fErr * 0.6;
}

export interface WeeklyDayPlan {
  date: string; // 'YYYY-MM-DD'
  meals: { slot: MealSlot; mealId: string; mealName: string }[];
}

export function generateWeeklyPlan(input: WeeklyPlanInput): WeeklyDayPlan[] {
  const {
    objective, dailyCalories, dailyProtein, dailyCarbs, dailyFat,
    mealsPerDay, budget, restrictions, likedMeals, dislikedMeals,
  } = input;

  const planConfig = generateMealPlan({ objective, dailyCalories, mealsPerDay });
  const slots = planConfig.slots;

  // Cible macro par slot = % calorique du slot × macros journalières.
  // Sert à scorer le "fit" de chaque repas candidat. Si on n'a pas les
  // macros (vieux appelant), on désactive le scoring macro (= comporte-
  // ment legacy variété-seule).
  const hasMacroTargets = dailyProtein != null && dailyCarbs != null && dailyFat != null;
  const slotMacroTarget = (slot: MealSlot) => {
    const pct = planConfig.distribution[slot]?.caloriePercent ?? 0;
    return {
      protein: (dailyProtein ?? 0) * pct,
      carbs: (dailyCarbs ?? 0) * pct,
      fat: (dailyFat ?? 0) * pct,
      calories: dailyCalories * pct,
    };
  };

  const budgetParam: 'eco' | 'premium' | 'both' = budget === 'both' ? 'both' : budget;

  // Get Monday of current week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const recentlyUsed = new Set<string>();
  const days: WeeklyDayPlan[] = [];

  for (let d = 0; d < 7; d++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + d);
    const dateStr = localIso(date);

    const dayMeals: { slot: MealSlot; mealId: string; mealName: string }[] = [];

    for (const slot of slots) {
      const pool = getMealsBySlotAndBudget(slot, budgetParam)
        .filter((m) => !dislikedMeals.includes(m.id))
        .filter((m) => {
          if (restrictions.length === 0) return true;
          if (m.restrictions.length === 0) return true;
          return restrictions.every((r) => m.restrictions.includes(r));
        });

      const target = slotMacroTarget(slot);

      // Score combiné : fit macro (principal) + bonus liked + malus
      // "déjà utilisé cette semaine" (variété). Plus le score est BAS,
      // meilleur est le candidat.
      const scored = pool.map((m) => {
        let score = 0;

        if (hasMacroTargets && m.baseMacros.calories > 0) {
          // On scale le repas à la cible calorique du slot, puis on
          // mesure à quel point ses glucides/prot/lipides collent.
          const calRatio = target.calories / m.baseMacros.calories;
          const scaled = {
            protein: m.baseMacros.protein * calRatio,
            carbs: m.baseMacros.carbs * calRatio,
            fat: m.baseMacros.fat * calRatio,
          };
          score += macroFitDistance(scaled, target);
        }

        // Bonus repas aimé (réduit le score → remonte dans le tri)
        if (likedMeals.includes(m.id)) score -= 0.5;
        // Malus si déjà servi cette semaine (variété)
        if (recentlyUsed.has(m.id)) score += 0.8;
        // Petit bruit déterministe-ish pour éviter que tous les jours
        // tirent exactement le même repas quand les scores sont à égalité.
        score += Math.random() * 0.15;

        return { meal: m, score };
      });

      scored.sort((a, b) => a.score - b.score);

      const selected = scored[0]?.meal;
      if (selected) {
        dayMeals.push({ slot, mealId: selected.id, mealName: selected.name });
        recentlyUsed.add(selected.id);
      }
    }

    days.push({ date: dateStr, meals: dayMeals });
  }

  return days;
}

/**
 * Get Monday date string for current week
 */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return localIso(monday);
}
