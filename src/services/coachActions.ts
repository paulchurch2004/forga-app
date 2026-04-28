// Coach action protocol.
// The LLM may suggest actions to take on the user's behalf by emitting
// `[[ACTION:type]]{ ...json... }[[/ACTION]]` blocks at the end of its reply.
// The frontend parses them, strips them from the visible text, and shows
// a confirmation card. The user explicitly confirms before any mutation.

import { useMealStore } from '../store/mealStore';
import { useTrainingStore } from '../store/trainingStore';
import { useWaterStore } from '../store/waterStore';
import { useUserStore } from '../store/userStore';
import { useProgramStore } from '../store/programStore';
import { useAuthStore } from '../store/authStore';
import { syncMeal, syncWorkout, syncWater } from './userSync';
import { todayLocalIso } from '../utils/date';
import type { MealSlot } from '../types/meal';
import type { WorkoutType, Intensity } from '../types/training';

// ─── Action types ─────────────────────────────────────────────

export type CoachAction =
  | {
      type: 'log_meal';
      slot: MealSlot;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  | {
      type: 'log_workout';
      workoutType: WorkoutType;
      durationMinutes: number;
      intensity: Intensity;
      note?: string;
    }
  | {
      type: 'log_water';
      amountMl: number;
    }
  | {
      type: 'swap_exercise';
      date: string; // YYYY-MM-DD
      originalExerciseId: string;
      newExerciseId: string;
    }
  | {
      type: 'adjust_calories';
      /** Either deltaPct (e.g. -5) OR newDailyCalories absolute. Coach should prefer deltaPct. */
      deltaPct?: number;
      newDailyCalories?: number;
      reason?: string;
    }
  | {
      type: 'move_workout_day';
      /** Move the workout currently planned on `fromDate` to `toDate` (swap content). */
      fromDate: string;
      toDate: string;
    }
  | {
      type: 'mark_day_skipped';
      date: string;
    }
  | {
      type: 'set_water_goal';
      newDailyMl: number;
    };

/** Actions whose UI card should require an extra confirmation step. */
export const DESTRUCTIVE_ACTIONS: ActionType[] = ['adjust_calories', 'move_workout_day', 'set_water_goal'];

// ─── Memory protocol (silent, no UI confirmation) ─────────────
//
// The coach can also emit [[MEMORY]]{ ... }[[/MEMORY]] blocks alongside or
// instead of actions. Memories are stored long-term and re-injected into
// the LLM context so the coach can recall them naturally weeks later.

export type MemoryTag = 'injury' | 'pr' | 'goal' | 'preference' | 'event' | 'note';

export interface ParsedMemory {
  tag: MemoryTag;
  summary: string;
  weight: 1 | 2 | 3;
}

const MEMORY_RE = /\[\[MEMORY\]\]\s*([\s\S]*?)\s*\[\[\/MEMORY\]\]/g;

export interface ParsedReplyFull {
  text: string;
  actions: CoachAction[];
  memories: ParsedMemory[];
}

/**
 * Like parseCoachActions but also extracts [[MEMORY]] blocks. Strips both
 * action and memory blocks from the visible text.
 */
export function parseCoachActionsAndMemories(reply: string): ParsedReplyFull {
  const memories: ParsedMemory[] = [];
  let text = reply.replace(MEMORY_RE, (_match, rawJson: string) => {
    try {
      const json = JSON.parse(rawJson.trim());
      const valid = validateMemory(json);
      if (valid) memories.push(valid);
    } catch {
      /* ignore */
    }
    return '';
  });
  const { text: cleaned, actions } = parseCoachActions(text);
  text = cleaned;
  return { text, actions, memories };
}

function validateMemory(payload: any): ParsedMemory | null {
  const validTags: MemoryTag[] = ['injury', 'pr', 'goal', 'preference', 'event', 'note'];
  if (typeof payload?.summary !== 'string' || payload.summary.trim().length === 0) return null;
  const tag = validTags.includes(payload?.tag) ? (payload.tag as MemoryTag) : 'note';
  const w = payload?.weight;
  const weight: 1 | 2 | 3 = w === 1 || w === 2 || w === 3 ? w : 2;
  return { tag, summary: payload.summary.trim(), weight };
}

export type ActionType = CoachAction['type'];

// ─── Parser ───────────────────────────────────────────────────

const ACTION_RE = /\[\[ACTION:(\w+)\]\]\s*([\s\S]*?)\s*\[\[\/ACTION\]\]/g;

export interface ParsedReply {
  text: string;
  actions: CoachAction[];
}

/**
 * Strip `[[ACTION:...]]` blocks from a coach reply and return both the
 * cleaned user-facing text and the parsed action list. Malformed blocks
 * are silently dropped (better to show no action than a broken one).
 */
export function parseCoachActions(reply: string): ParsedReply {
  const actions: CoachAction[] = [];
  const cleanedText = reply.replace(ACTION_RE, (_match, rawType: string, rawJson: string) => {
    try {
      const json = JSON.parse(rawJson.trim());
      const action = validateAction(rawType, json);
      if (action) actions.push(action);
    } catch {
      /* swallow */
    }
    return '';
  });
  return {
    text: cleanedText.trim(),
    actions,
  };
}

function validateAction(type: string, payload: any): CoachAction | null {
  switch (type) {
    case 'log_meal': {
      if (
        typeof payload?.slot === 'string' &&
        typeof payload?.name === 'string' &&
        payload.name.trim().length > 0 &&
        isFiniteNum(payload.calories) &&
        isFiniteNum(payload.protein) &&
        isFiniteNum(payload.carbs) &&
        isFiniteNum(payload.fat)
      ) {
        return {
          type: 'log_meal',
          slot: payload.slot as MealSlot,
          name: payload.name.trim(),
          calories: Math.max(0, Math.round(payload.calories)),
          protein: Math.max(0, Math.round(payload.protein)),
          carbs: Math.max(0, Math.round(payload.carbs)),
          fat: Math.max(0, Math.round(payload.fat)),
        };
      }
      return null;
    }
    case 'log_workout': {
      if (
        typeof payload?.workoutType === 'string' &&
        isFiniteNum(payload.durationMinutes) &&
        typeof payload?.intensity === 'string'
      ) {
        return {
          type: 'log_workout',
          workoutType: payload.workoutType as WorkoutType,
          durationMinutes: Math.max(1, Math.round(payload.durationMinutes)),
          intensity: payload.intensity as Intensity,
          note: typeof payload.note === 'string' ? payload.note : undefined,
        };
      }
      return null;
    }
    case 'log_water': {
      if (isFiniteNum(payload?.amountMl)) {
        return { type: 'log_water', amountMl: Math.max(50, Math.round(payload.amountMl)) };
      }
      return null;
    }
    case 'swap_exercise': {
      if (
        typeof payload?.date === 'string' &&
        typeof payload?.originalExerciseId === 'string' &&
        typeof payload?.newExerciseId === 'string'
      ) {
        return {
          type: 'swap_exercise',
          date: payload.date,
          originalExerciseId: payload.originalExerciseId,
          newExerciseId: payload.newExerciseId,
        };
      }
      return null;
    }
    case 'adjust_calories': {
      const hasDelta = isFiniteNum(payload?.deltaPct);
      const hasAbs = isFiniteNum(payload?.newDailyCalories);
      if (!hasDelta && !hasAbs) return null;
      return {
        type: 'adjust_calories',
        deltaPct: hasDelta ? Math.max(-15, Math.min(15, payload.deltaPct)) : undefined, // hard cap ±15%
        newDailyCalories: hasAbs ? Math.max(1000, Math.min(5000, Math.round(payload.newDailyCalories))) : undefined,
        reason: typeof payload?.reason === 'string' ? payload.reason : undefined,
      };
    }
    case 'move_workout_day': {
      if (typeof payload?.fromDate === 'string' && typeof payload?.toDate === 'string' && payload.fromDate !== payload.toDate) {
        return { type: 'move_workout_day', fromDate: payload.fromDate, toDate: payload.toDate };
      }
      return null;
    }
    case 'mark_day_skipped': {
      if (typeof payload?.date === 'string') {
        return { type: 'mark_day_skipped', date: payload.date };
      }
      return null;
    }
    case 'set_water_goal': {
      if (isFiniteNum(payload?.newDailyMl)) {
        return { type: 'set_water_goal', newDailyMl: Math.max(500, Math.min(5000, Math.round(payload.newDailyMl))) };
      }
      return null;
    }
    default:
      return null;
  }
}

function isFiniteNum(v: any): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

// ─── Executors ────────────────────────────────────────────────

/**
 * Apply an action to the local stores + best-effort backend sync.
 * Idempotent on `id` — calling twice for the same action will create two entries.
 * Caller is responsible for marking the proposal as confirmed in the UI.
 */
export async function executeCoachAction(action: CoachAction): Promise<void> {
  switch (action.type) {
    case 'log_meal':
      return executeLogMeal(action);
    case 'log_workout':
      return executeLogWorkout(action);
    case 'log_water':
      return executeLogWater(action);
    case 'swap_exercise':
      return executeSwapExercise(action);
    case 'adjust_calories':
      return executeAdjustCalories(action);
    case 'move_workout_day':
      return executeMoveWorkoutDay(action);
    case 'mark_day_skipped':
      return executeMarkDaySkipped(action);
    case 'set_water_goal':
      return executeSetWaterGoal(action);
  }
}

async function executeLogMeal(a: Extract<CoachAction, { type: 'log_meal' }>) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  const today = todayLocalIso();
  const meal = {
    id: `coach-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: profile.id,
    date: today,
    slot: a.slot,
    mealId: 'custom',
    customName: a.name,
    adjustedQuantities: {},
    actualMacros: {
      calories: a.calories,
      protein: a.protein,
      carbs: a.carbs,
      fat: a.fat,
    },
    validatedAt: new Date().toISOString(),
  };
  useMealStore.getState().addValidatedMeal(meal);
  syncMeal(meal);
}

async function executeLogWorkout(a: Extract<CoachAction, { type: 'log_workout' }>) {
  const userId = useAuthStore.getState().session?.user?.id;
  const today = todayLocalIso();
  const workout = {
    id: `coach-w-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: today,
    timestamp: new Date().toISOString(),
    type: a.workoutType,
    durationMinutes: a.durationMinutes,
    intensity: a.intensity,
    exercises: [],
    note: a.note,
  };
  useTrainingStore.getState().addWorkout(workout);
  if (userId) syncWorkout(workout, userId);
}

async function executeLogWater(a: Extract<CoachAction, { type: 'log_water' }>) {
  const userId = useAuthStore.getState().session?.user?.id;
  const today = todayLocalIso();
  useWaterStore.getState().addWater(today, a.amountMl);
  if (userId) {
    // Pull the entry we just inserted so we sync the same id
    const entries = useWaterStore.getState().history[today] ?? [];
    const last = entries[entries.length - 1];
    if (last) syncWater(last, today, userId);
  }
}

async function executeSwapExercise(a: Extract<CoachAction, { type: 'swap_exercise' }>) {
  useProgramStore
    .getState()
    .replaceExerciseInDay(a.date, a.originalExerciseId, a.newExerciseId);
}

async function executeAdjustCalories(a: Extract<CoachAction, { type: 'adjust_calories' }>) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  let next = profile.dailyCalories;
  if (typeof a.newDailyCalories === 'number') {
    next = a.newDailyCalories;
  } else if (typeof a.deltaPct === 'number') {
    next = Math.round(profile.dailyCalories * (1 + a.deltaPct / 100));
  }
  // Clamp safety net.
  next = Math.max(1000, Math.min(5000, next));
  // Re-derive macro split keeping the same protein/carb/fat ratios.
  const totalOld = profile.dailyCalories;
  const proteinRatio = totalOld > 0 ? profile.dailyProtein / totalOld : 0.3 / 4;
  const carbsRatio = totalOld > 0 ? profile.dailyCarbs / totalOld : 0.45 / 4;
  const fatRatio = totalOld > 0 ? profile.dailyFat / totalOld : 0.25 / 9;
  useUserStore.getState().updateProfile({
    dailyCalories: next,
    dailyProtein: Math.round(next * proteinRatio),
    dailyCarbs: Math.round(next * carbsRatio),
    dailyFat: Math.round(next * fatRatio),
  });
  const userId = useAuthStore.getState().session?.user?.id;
  if (userId) {
    const { syncProfile } = await import('./userSync');
    syncProfile(
      {
        daily_calories: next,
        daily_protein: Math.round(next * proteinRatio),
        daily_carbs: Math.round(next * carbsRatio),
        daily_fat: Math.round(next * fatRatio),
      },
      userId
    );
  }
}

async function executeMoveWorkoutDay(a: Extract<CoachAction, { type: 'move_workout_day' }>) {
  useProgramStore.getState().swapPlannedDays(a.fromDate, a.toDate);
}

async function executeMarkDaySkipped(a: Extract<CoachAction, { type: 'mark_day_skipped' }>) {
  useProgramStore.getState().markDaySkipped(a.date);
}

async function executeSetWaterGoal(a: Extract<CoachAction, { type: 'set_water_goal' }>) {
  useWaterStore.getState().setDailyTarget(a.newDailyMl);
}

// ─── Display helpers (used by the proposal card) ─────────────

export function describeAction(action: CoachAction): { tag: string; title: string; subtitle: string } {
  switch (action.type) {
    case 'log_meal': {
      const slotLabel = SLOT_LABELS[action.slot] ?? action.slot;
      return {
        tag: `Repas · ${slotLabel}`,
        title: action.name,
        subtitle: `${action.calories} kcal · ${action.protein}g P · ${action.carbs}g G · ${action.fat}g L`,
      };
    }
    case 'log_workout':
      return {
        tag: 'Séance',
        title: `${action.workoutType} · ${action.durationMinutes} min`,
        subtitle: `Intensité : ${action.intensity}${action.note ? ` · ${action.note}` : ''}`,
      };
    case 'log_water':
      return {
        tag: 'Hydratation',
        title: `+${action.amountMl} ml`,
        subtitle: 'Ajouté à ton total du jour',
      };
    case 'swap_exercise':
      return {
        tag: 'Remplacement',
        title: 'Remplacer un exercice',
        subtitle: `${action.originalExerciseId} → ${action.newExerciseId}`,
      };
    case 'adjust_calories': {
      const profile = useUserStore.getState().profile;
      const current = profile?.dailyCalories ?? 0;
      let target = current;
      if (typeof action.newDailyCalories === 'number') target = action.newDailyCalories;
      else if (typeof action.deltaPct === 'number') target = Math.round(current * (1 + action.deltaPct / 100));
      const sign = target > current ? '+' : '';
      return {
        tag: 'Calories · cible',
        title: `${current} → ${target} kcal/j`,
        subtitle: action.reason ?? `Ajustement ${sign}${target - current} kcal/jour. Macros recalibrées au pro-rata.`,
      };
    }
    case 'move_workout_day':
      return {
        tag: 'Plan training',
        title: 'Déplacer une séance',
        subtitle: `${action.fromDate} ↔ ${action.toDate}`,
      };
    case 'mark_day_skipped':
      return {
        tag: 'Plan training',
        title: 'Marquer comme skippée',
        subtitle: `${action.date}. La séance ne casse pas le streak.`,
      };
    case 'set_water_goal': {
      const current = useWaterStore.getState().dailyTargetMl;
      return {
        tag: 'Hydratation · cible',
        title: `${current}ml → ${action.newDailyMl}ml/j`,
        subtitle: 'Nouvelle cible quotidienne.',
      };
    }
  }
}

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Petit-déj',
  morning_snack: 'Encas matin',
  lunch: 'Déjeuner',
  afternoon_snack: 'Goûter',
  dinner: 'Dîner',
  bedtime: 'Avant coucher',
};
