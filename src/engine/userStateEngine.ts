// FORGA Core State — observation-only v1.
// All metrics normalized to 0-100 unless otherwise noted.
// Pure function: no store imports, no side effects.
//
// Adaptive actions are intentionally absent at this stage — we observe
// for ~1 week of real data before calibrating thresholds.

import type { UserProfile, WeeklyCheckIn, WeightEntry } from '../types/user';
import type { Workout } from '../types/training';
import type { DailyMeal } from '../types/meal';
import type { PlannedDay } from '../types/program';

// ─── Output shape ─────────────────────────────────────────────

export interface UserState {
  body: {
    weight: number | null;
    weightTrendKg7d: number | null; // negative = losing, positive = gaining
  };
  training: {
    weeklyVolumeKg: number;
    weeklyVolumeTargetKg: number;
    adherenceScore: number; // 0-100, completed/planned over last 7 days
    lastWorkoutDaysAgo: number | null;
  };
  nutrition: {
    avgCaloriesDelta: number; // average (consumed - target) over last 7 logged days
    proteinConsistency: number; // 0-100, % of last 7 days hitting >=80% protein target
    macroBalance: number; // 0-100, how close to target P/C/F ratio
  };
  recovery: {
    energy: number | null; // 0-100 (from last weekly check-in)
    sleepQuality: number | null; // 0-100
    soreness: number | null; // 0-100, not yet collected → null
  };
  behavior: {
    streak: number;
    skippedDaysLast7: number;
  };
  derived: {
    fatigueIndex: number | null; // 0-100, requires recovery data
    readinessScore: number | null; // 0-100
    progressionPotential: number | null; // 0-100
  };
  /** Per-component contribution and inputs that fed each derived metric. */
  trace: DecisionTrace[];
}

export interface DecisionTrace {
  metric: 'fatigueIndex' | 'readinessScore' | 'progressionPotential';
  value: number | null;
  inputs: { name: string; value: number | null; weight: number; contribution: number | null }[];
  notes?: string;
}

// ─── Inputs ───────────────────────────────────────────────────

export interface UserStateInput {
  profile: UserProfile | null;
  checkIns: WeeklyCheckIn[];
  weightLog: WeightEntry[];
  /** Workouts indexed by date 'YYYY-MM-DD' */
  workoutsByDate: Record<string, Workout[]>;
  /** Validated meals indexed by date 'YYYY-MM-DD' */
  mealsByDate: Record<string, DailyMeal[]>;
  /** Planned days from the active plan, used for adherence + skipped count. */
  plannedDays: PlannedDay[];
  /** Daily protein/calorie targets from the profile. */
  todayIso: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function isoNDaysAgo(todayIso: string, n: number): string {
  const d = new Date(todayIso + 'T00:00:00');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function last7Dates(todayIso: string): string[] {
  return Array.from({ length: 7 }, (_, i) => isoNDaysAgo(todayIso, i));
}

// Scale 1..maxScale to 0..100 (linear).
function scaleTo100(value: number, maxScale: number): number {
  return clamp(((value - 1) / (maxScale - 1)) * 100);
}

// ─── Main computation ────────────────────────────────────────

export function computeUserState(input: UserStateInput): UserState {
  const { profile, checkIns, weightLog, workoutsByDate, mealsByDate, plannedDays, todayIso } = input;

  // ── BODY ──
  const sortedWeights = [...weightLog].sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = sortedWeights.at(-1)?.weight ?? profile?.currentWeight ?? null;
  const weight7dAgoIso = isoNDaysAgo(todayIso, 7);
  const earlierWeight = [...sortedWeights]
    .reverse()
    .find((w) => w.date <= weight7dAgoIso)?.weight ?? null;
  const weightTrendKg7d =
    latestWeight !== null && earlierWeight !== null
      ? Math.round((latestWeight - earlierWeight) * 10) / 10
      : null;

  // ── TRAINING ──
  const window7 = last7Dates(todayIso);
  const weeklyVolumeKg = window7.reduce((acc, iso) => {
    const list = workoutsByDate[iso] ?? [];
    return (
      acc +
      list.reduce(
        (s, w) =>
          s +
          w.exercises.reduce(
            (ss, ex) => ss + ex.sets.reduce((sss, set) => sss + (set.weight ?? 0) * (set.reps ?? 0), 0),
            0
          ),
        0
      )
    );
  }, 0);

  // Naive volume target — same approximation used in the training tab.
  const sessionsPerWeek = plannedDays.length > 0
    ? plannedDays.filter((d) => d.programDayId && !d.programDayId.startsWith('cardio_')).length
    : 4;
  const weeklyVolumeTargetKg = sessionsPerWeek * 4500;

  const plannedLast7 = plannedDays.filter(
    (d) => window7.includes(d.date) && d.programDayId && !d.programDayId.startsWith('cardio_')
  );
  const completedLast7 = plannedLast7.filter((d) => d.status === 'completed').length;
  const adherenceScore = plannedLast7.length > 0 ? clamp((completedLast7 / plannedLast7.length) * 100) : 100;

  let lastWorkoutDaysAgo: number | null = null;
  for (let i = 0; i < 60; i++) {
    const iso = isoNDaysAgo(todayIso, i);
    if ((workoutsByDate[iso] ?? []).length > 0) {
      lastWorkoutDaysAgo = i;
      break;
    }
  }

  // ── NUTRITION ──
  const dailyTarget = profile?.dailyCalories ?? 0;
  const dailyProteinTarget = profile?.dailyProtein ?? 0;
  const dailyCarbsTarget = profile?.dailyCarbs ?? 0;
  const dailyFatTarget = profile?.dailyFat ?? 0;

  const dailyTotals = window7.map((iso) => {
    const meals = mealsByDate[iso] ?? [];
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.actualMacros.calories,
        protein: acc.protein + m.actualMacros.protein,
        carbs: acc.carbs + m.actualMacros.carbs,
        fat: acc.fat + m.actualMacros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  });

  const loggedDays = dailyTotals.filter((d) => d.calories > 0);
  const avgCaloriesDelta =
    loggedDays.length > 0 && dailyTarget > 0
      ? Math.round(loggedDays.reduce((s, d) => s + (d.calories - dailyTarget), 0) / loggedDays.length)
      : 0;

  const proteinHits =
    dailyProteinTarget > 0
      ? loggedDays.filter((d) => d.protein >= dailyProteinTarget * 0.8).length
      : 0;
  const proteinConsistency =
    loggedDays.length > 0 ? clamp((proteinHits / loggedDays.length) * 100) : 0;

  // macroBalance = 100 - average %dev across the 3 macros for logged days
  const macroBalance = (() => {
    if (loggedDays.length === 0 || dailyProteinTarget === 0) return 0;
    const devs = loggedDays.map((d) => {
      const dp = Math.abs(d.protein - dailyProteinTarget) / Math.max(dailyProteinTarget, 1);
      const dc = dailyCarbsTarget > 0 ? Math.abs(d.carbs - dailyCarbsTarget) / dailyCarbsTarget : 0;
      const df = dailyFatTarget > 0 ? Math.abs(d.fat - dailyFatTarget) / dailyFatTarget : 0;
      return ((dp + dc + df) / 3) * 100;
    });
    const avgDev = devs.reduce((s, v) => s + v, 0) / devs.length;
    return clamp(100 - avgDev);
  })();

  // ── RECOVERY ──
  const latestCheckIn = [...checkIns].sort((a, b) => a.weekStart.localeCompare(b.weekStart)).at(-1);
  const energy = latestCheckIn ? scaleTo100(latestCheckIn.energy, 5) : null;
  const sleepQuality = latestCheckIn ? scaleTo100(latestCheckIn.sleep, 4) : null;
  const soreness: number | null = null; // not yet collected — see TODO at bottom

  // ── BEHAVIOR ──
  const streak = profile?.currentStreak ?? 0;
  const skippedDaysLast7 = plannedDays.filter((d) => window7.includes(d.date) && d.status === 'skipped').length;

  // ── DERIVED ──
  // fatigueIndex weights (corrected blueprint):
  //   weeklyVolume normalized → 35%
  //   (100 - energy) → 25%
  //   (100 - sleep)  → 20%
  //   soreness       → 20% (skipped if null; weights renormalized)
  const trace: DecisionTrace[] = [];

  const fatigueParts: { name: string; value: number | null; weight: number; contribution: number | null }[] = [
    {
      name: 'volume vs target',
      value: weeklyVolumeTargetKg > 0 ? clamp((weeklyVolumeKg / weeklyVolumeTargetKg) * 100) : null,
      weight: 0.35,
      contribution: null,
    },
    { name: 'low energy', value: energy !== null ? 100 - energy : null, weight: 0.25, contribution: null },
    { name: 'poor sleep', value: sleepQuality !== null ? 100 - sleepQuality : null, weight: 0.2, contribution: null },
    { name: 'soreness', value: soreness, weight: 0.2, contribution: null },
  ];

  const knownParts = fatigueParts.filter((p) => p.value !== null);
  const totalWeight = knownParts.reduce((s, p) => s + p.weight, 0);
  let fatigueIndex: number | null = null;
  if (knownParts.length >= 2 && totalWeight > 0) {
    let sum = 0;
    for (const p of knownParts) {
      const contrib = ((p.value as number) * p.weight) / totalWeight;
      p.contribution = Math.round(contrib * 10) / 10;
      sum += contrib;
    }
    fatigueIndex = Math.round(clamp(sum));
  }
  trace.push({
    metric: 'fatigueIndex',
    value: fatigueIndex,
    inputs: fatigueParts,
    notes: soreness === null ? 'Soreness non collectée — weights renormalisés sur les 3 autres signaux.' : undefined,
  });

  const readinessScore = fatigueIndex !== null ? clamp(100 - fatigueIndex) : null;
  trace.push({
    metric: 'readinessScore',
    value: readinessScore,
    inputs: [{ name: '100 − fatigueIndex', value: fatigueIndex, weight: 1, contribution: readinessScore }],
  });

  // progressionPotential = adherence(0.4) + (100-fatigue)(0.4) + proteinConsistency(0.2)
  const progParts = [
    { name: 'adherence', value: adherenceScore, weight: 0.4, contribution: 0 },
    {
      name: 'recovery (100 − fatigue)',
      value: fatigueIndex !== null ? 100 - fatigueIndex : null,
      weight: 0.4,
      contribution: null as number | null,
    },
    { name: 'protein consistency', value: proteinConsistency, weight: 0.2, contribution: 0 },
  ];
  let progressionPotential: number | null = null;
  if (fatigueIndex !== null) {
    progParts[0].contribution = Math.round(adherenceScore * 0.4 * 10) / 10;
    progParts[1].contribution = Math.round((100 - fatigueIndex) * 0.4 * 10) / 10;
    progParts[2].contribution = Math.round(proteinConsistency * 0.2 * 10) / 10;
    progressionPotential = Math.round(
      clamp(adherenceScore * 0.4 + (100 - fatigueIndex) * 0.4 + proteinConsistency * 0.2)
    );
  }
  trace.push({
    metric: 'progressionPotential',
    value: progressionPotential,
    inputs: progParts,
    notes: fatigueIndex === null ? 'Bloqué tant que la recovery n\'est pas calculable.' : undefined,
  });

  return {
    body: { weight: latestWeight, weightTrendKg7d },
    training: {
      weeklyVolumeKg: Math.round(weeklyVolumeKg),
      weeklyVolumeTargetKg,
      adherenceScore: Math.round(adherenceScore),
      lastWorkoutDaysAgo,
    },
    nutrition: {
      avgCaloriesDelta,
      proteinConsistency: Math.round(proteinConsistency),
      macroBalance: Math.round(macroBalance),
    },
    recovery: { energy, sleepQuality, soreness },
    behavior: { streak, skippedDaysLast7 },
    derived: { fatigueIndex, readinessScore, progressionPotential },
    trace,
  };
}

// TODO Phase 1.5:
// - add `soreness` (1-5) to WeeklyCheckIn (or a new daily mini check-in) so
//   recovery has 3 signals instead of 2.
// - add a daily energy slider so readinessScore is fresh every day, not stale
//   for 6 of 7 days.
