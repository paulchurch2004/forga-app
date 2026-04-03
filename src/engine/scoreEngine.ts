// Score FORGA — Cœur de l'engagement
import type { ForgaScore, ScoreInput } from '../types/score';

/**
 * Calcule le Score FORGA (0-100) basé sur 4 piliers :
 * - Nutrition (40 pts) : adherence repas + protéines + variété
 * - Constance (30 pts) : streak + check-ins
 * - Progression (20 pts) : tendance poids vs objectif + % objectif
 * - Discipline (10 pts) : jours actifs + check-in semaine
 */
export function calculateForgaScore(input: ScoreInput): ForgaScore {
  const nutrition = calculateNutritionScore(input);
  const consistency = calculateConsistencyScore(input);
  const progression = calculateProgressionScore(input);
  const discipline = calculateDisciplineScore(input);

  return {
    total: nutrition + consistency + progression + discipline,
    nutrition,
    consistency,
    progression,
    discipline,
  };
}

// ─── NUTRITION (40 points max) ───
function calculateNutritionScore(input: ScoreInput): number {
  let score = 0;

  // Macro adherence : repas validés vs plan (0-25)
  if (input.mealsExpected > 0) {
    const mealRatio = input.mealsValidated / input.mealsExpected;
    score += Math.round(Math.min(1, mealRatio) * 25);
  }

  // Protein target hit (0-10)
  score += Math.round((input.proteinTargetDays / 7) * 10);

  // Variété des repas (0-5)
  score += Math.min(5, Math.round(input.uniqueMealsChosen / 3));

  return Math.min(40, score);
}

// ─── CONSTANCE (30 points max) ───
function calculateConsistencyScore(input: ScoreInput): number {
  let score = 0;

  // Streak actuel (0-20)
  const streak = input.currentStreak;
  if (streak >= 30) score += 20;
  else if (streak >= 14) score += 15;
  else if (streak >= 7) score += 10;
  else if (streak >= 3) score += 5;
  else score += Math.min(3, streak);

  // Check-ins hebdomadaires sur 4 semaines (0-10)
  score += Math.round((input.checkInsCompleted / 4) * 10);

  return Math.min(30, score);
}

// ─── PROGRESSION (20 points max) ───
function calculateProgressionScore(input: ScoreInput): number {
  let score = 0;

  // Direction du poids vs objectif (0-12)
  const trend = input.weightTrendPerWeek;

  if (input.objective === 'bulk') {
    if (trend >= 0.2 && trend <= 0.5) score += 12;
    else if (trend > 0 && trend < 0.2) score += 8;
    else if (trend > 0.5 && trend <= 0.8) score += 8;
    else if (trend > 0.8) score += 4;
    else score += 2;
  } else if (input.objective === 'cut') {
    if (trend <= -0.3 && trend >= -0.7) score += 12;
    else if (trend < 0 && trend > -0.3) score += 8;
    else if (trend < -0.7 && trend >= -1.0) score += 8;
    else if (trend < -1.0) score += 4;
    else score += 2;
  } else if (input.objective === 'maintain') {
    if (Math.abs(trend) <= 0.15) score += 12;
    else if (Math.abs(trend) <= 0.3) score += 8;
    else score += 4;
  } else {
    // recomp
    if (Math.abs(trend) <= 0.2) score += 12;
    else if (Math.abs(trend) <= 0.4) score += 8;
    else score += 4;
  }

  // % de l'objectif atteint (0-8)
  score += Math.round((Math.min(100, input.goalProgressPercent) / 100) * 8);

  return Math.min(20, score);
}

// ─── DISCIPLINE (10 points max) ───
function calculateDisciplineScore(input: ScoreInput): number {
  let score = 0;

  // Jours actifs cette semaine / 7 (0-7)
  score += Math.round((input.activeDaysLast7 / 7) * 7);

  // A fait le check-in cette semaine (0-3)
  score += input.thisWeekCheckIn ? 3 : 0;

  // Bonus hydratation : +2 si objectif eau atteint 5+/7 jours
  if ((input.waterTargetDaysMet ?? 0) >= 5) {
    score += 2;
  }

  return Math.min(10, score);
}
