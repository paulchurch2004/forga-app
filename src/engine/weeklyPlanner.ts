import { generateMealPlan } from './mealPlanner';
import { getMealsBySlotAndBudget } from '../data/meals';
import type { MealSlot } from '../types/meal';
import type { Objective, Budget, Restriction } from '../types/user';

interface WeeklyPlanInput {
  objective: Objective;
  dailyCalories: number;
  budget: Budget;
  restrictions: Restriction[];
  likedMeals: string[];
  dislikedMeals: string[];
}

export interface WeeklyDayPlan {
  date: string; // 'YYYY-MM-DD'
  meals: { slot: MealSlot; mealId: string; mealName: string }[];
}

export function generateWeeklyPlan(input: WeeklyPlanInput): WeeklyDayPlan[] {
  const { objective, dailyCalories, budget, restrictions, likedMeals, dislikedMeals } = input;

  const planConfig = generateMealPlan({ objective, dailyCalories });
  const slots = planConfig.slots;

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
    const dateStr = date.toISOString().split('T')[0];

    const dayMeals: { slot: MealSlot; mealId: string; mealName: string }[] = [];

    for (const slot of slots) {
      const candidates = getMealsBySlotAndBudget(slot, budgetParam)
        .filter((m) => !dislikedMeals.includes(m.id))
        .filter((m) => {
          if (restrictions.length === 0) return true;
          if (m.restrictions.length === 0) return true;
          return restrictions.every((r) => m.restrictions.includes(r));
        })
        .sort((a, b) => {
          // Prefer liked meals
          const aLiked = likedMeals.includes(a.id) ? 1 : 0;
          const bLiked = likedMeals.includes(b.id) ? 1 : 0;
          if (aLiked !== bLiked) return bLiked - aLiked;
          // Deprioritize recently used for variety
          const aRecent = recentlyUsed.has(a.id) ? 1 : 0;
          const bRecent = recentlyUsed.has(b.id) ? 1 : 0;
          if (aRecent !== bRecent) return aRecent - bRecent;
          // Random tiebreak
          return Math.random() - 0.5;
        });

      const selected = candidates[0];
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
  return monday.toISOString().split('T')[0];
}
