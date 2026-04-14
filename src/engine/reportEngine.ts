// Report Engine — Weekly/Monthly data aggregation for FORGA
import type { DailyMeal } from '../types/meal';
import type { ForgaScore } from '../types/score';

// ──────────── TYPES ────────────

export interface MacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayReport {
  date: string;
  mealsLogged: number;
  macros: MacroSummary;
  score: ForgaScore | null;
  waterMl: number;
}

export interface PeriodReport {
  startDate: string;
  endDate: string;
  days: DayReport[];
  totalDays: number;
  daysWithMeals: number;
  adherencePct: number; // % of days with at least 1 meal
  avgMacros: MacroSummary;
  totalMacros: MacroSummary;
  avgScore: number;
  scoreTrend: number; // last score - first score
  weightStart: number | null;
  weightEnd: number | null;
  weightChange: number | null;
  waterAvgMl: number;
  waterDaysOnTarget: number;
  bestDay: { date: string; score: number } | null;
  worstDay: { date: string; score: number } | null;
}

// ──────────── HELPERS ────────────

function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ──────────── PERIOD REPORT BUILDER ────────────

export function buildPeriodReport(
  startDate: string,
  endDate: string,
  mealHistory: Record<string, DailyMeal[]>,
  scoreHistory: Record<string, ForgaScore>,
  waterHistory: Record<string, { amount: number }[]>,
  weightLog: { date: string; weight: number }[],
  dailyWaterTarget: number,
  mealsPerDay: number,
): PeriodReport {
  const dateRange = getDateRange(startDate, endDate);

  // Build day reports
  const days: DayReport[] = dateRange.map((date) => {
    const meals = mealHistory[date] ?? [];
    const macros: MacroSummary = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of meals) {
      macros.calories += meal.actualMacros.calories;
      macros.protein += meal.actualMacros.protein;
      macros.carbs += meal.actualMacros.carbs;
      macros.fat += meal.actualMacros.fat;
    }

    const waterEntries = waterHistory[date] ?? [];
    const waterMl = waterEntries.reduce((sum, e) => sum + e.amount, 0);

    return {
      date,
      mealsLogged: meals.length,
      macros: {
        calories: Math.round(macros.calories),
        protein: Math.round(macros.protein),
        carbs: Math.round(macros.carbs),
        fat: Math.round(macros.fat),
      },
      score: scoreHistory[date] ?? null,
      waterMl,
    };
  });

  // Aggregations
  const daysWithMeals = days.filter((d) => d.mealsLogged > 0).length;
  const totalDays = days.length;
  const adherencePct = totalDays > 0 ? Math.round((daysWithMeals / totalDays) * 100) : 0;

  const totalMacros: MacroSummary = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const d of days) {
    totalMacros.calories += d.macros.calories;
    totalMacros.protein += d.macros.protein;
    totalMacros.carbs += d.macros.carbs;
    totalMacros.fat += d.macros.fat;
  }

  const divisor = daysWithMeals || 1;
  const avgMacros: MacroSummary = {
    calories: Math.round(totalMacros.calories / divisor),
    protein: Math.round(totalMacros.protein / divisor),
    carbs: Math.round(totalMacros.carbs / divisor),
    fat: Math.round(totalMacros.fat / divisor),
  };

  // Score aggregation
  const daysWithScore = days.filter((d) => d.score !== null);
  const avgScore = daysWithScore.length > 0
    ? Math.round(daysWithScore.reduce((sum, d) => sum + (d.score?.total ?? 0), 0) / daysWithScore.length)
    : 0;

  const firstScore = daysWithScore[0]?.score?.total ?? 0;
  const lastScore = daysWithScore[daysWithScore.length - 1]?.score?.total ?? 0;
  const scoreTrend = lastScore - firstScore;

  // Weight
  const sortedWeights = weightLog
    .filter((w) => w.date >= startDate && w.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  const weightStart = sortedWeights[0]?.weight ?? null;
  const weightEnd = sortedWeights[sortedWeights.length - 1]?.weight ?? null;
  const weightChange = weightStart !== null && weightEnd !== null ? +(weightEnd - weightStart).toFixed(1) : null;

  // Water
  const totalWater = days.reduce((sum, d) => sum + d.waterMl, 0);
  const waterAvgMl = totalDays > 0 ? Math.round(totalWater / totalDays) : 0;
  const waterDaysOnTarget = days.filter((d) => d.waterMl >= dailyWaterTarget).length;

  // Best/worst days
  let bestDay: { date: string; score: number } | null = null;
  let worstDay: { date: string; score: number } | null = null;
  for (const d of daysWithScore) {
    const s = d.score!.total;
    if (!bestDay || s > bestDay.score) bestDay = { date: d.date, score: s };
    if (!worstDay || s < worstDay.score) worstDay = { date: d.date, score: s };
  }

  return {
    startDate,
    endDate,
    days,
    totalDays,
    daysWithMeals,
    adherencePct,
    avgMacros,
    totalMacros,
    avgScore,
    scoreTrend,
    weightStart,
    weightEnd,
    weightChange,
    waterAvgMl,
    waterDaysOnTarget,
    bestDay,
    worstDay,
  };
}

// ──────────── CONVENIENCE FUNCTIONS ────────────

export function getThisWeekRange(): { start: string; end: string } {
  const today = new Date();
  const start = getMondayOfWeek(today);
  const end = today.toISOString().split('T')[0];
  return { start, end };
}

export function getLastWeekRange(): { start: string; end: string } {
  const today = new Date();
  const thisMonday = getMondayOfWeek(today);
  const lastMonday = addDays(thisMonday, -7);
  const lastSunday = addDays(thisMonday, -1);
  return { start: lastMonday, end: lastSunday };
}

export function getThisMonthRange(): { start: string; end: string } {
  const today = new Date();
  const start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const end = today.toISOString().split('T')[0];
  return { start, end };
}

export function getLastMonthRange(): { start: string; end: string } {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
  const start = lastMonth.toISOString().split('T')[0];
  const end = lastDay.toISOString().split('T')[0];
  return { start, end };
}
