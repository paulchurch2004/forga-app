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
    }
  | {
      type: 'generate_workout';
      name: string;
      workoutType: WorkoutType;
      durationMinutes: number;
      intensity: Intensity;
      exercises: Array<{
        exerciseId: string;
        exerciseName: string;
        sets: Array<{ reps: number; weight: number }>;
      }>;
      note?: string;
    }
  | {
      type: 'change_objective';
      newObjective: 'bulk' | 'cut' | 'maintain' | 'recomp';
      reason?: string;
    }
  | {
      type: 'update_target';
      targetWeight?: number; // kg
      targetDeadline?: string; // YYYY-MM-DD
      reason?: string;
    }
  | {
      type: 'generate_shopping_list';
      title: string;
      items: Array<{ label: string; quantity?: string; category?: string }>;
    };

/** Actions whose UI card should require an extra confirmation step. */
export const DESTRUCTIVE_ACTIONS: ActionType[] = [
  'adjust_calories',
  'move_workout_day',
  'set_water_goal',
  'change_objective',
  'update_target',
];

// ─── Memory protocol (silent, no UI confirmation) ─────────────
//
// The coach can also emit [[MEMORY]]{ ... }[[/MEMORY]] blocks alongside or
// instead of actions. Memories are stored long-term and re-injected into
// the LLM context so the coach can recall them naturally weeks later.

export type MemoryTag =
  | 'injury'
  | 'condition'
  | 'pr'
  | 'goal'
  | 'preference_food'
  | 'preference_training'
  | 'constraint'
  | 'lifestyle'
  | 'mood_pattern'
  | 'event'
  | 'feedback'
  | 'note';

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
  const validTags: MemoryTag[] = [
    'injury', 'condition', 'pr', 'goal',
    'preference_food', 'preference_training',
    'constraint', 'lifestyle', 'mood_pattern',
    'event', 'feedback', 'note',
  ];
  if (typeof payload?.summary !== 'string' || payload.summary.trim().length === 0) return null;
  // Backwards-compat: old 'preference' tag from earlier versions stays valid → maps to preference_food.
  let tag: MemoryTag = 'note';
  if (payload?.tag === 'preference') tag = 'preference_food';
  else if (validTags.includes(payload?.tag)) tag = payload.tag as MemoryTag;
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
    case 'generate_workout': {
      if (
        typeof payload?.name === 'string' &&
        typeof payload?.workoutType === 'string' &&
        isFiniteNum(payload.durationMinutes) &&
        typeof payload?.intensity === 'string' &&
        Array.isArray(payload?.exercises) &&
        payload.exercises.length > 0
      ) {
        const cleanedExercises: Extract<CoachAction, { type: 'generate_workout' }>['exercises'] = [];
        for (const ex of payload.exercises) {
          if (typeof ex?.exerciseId !== 'string' || typeof ex?.exerciseName !== 'string') continue;
          if (!Array.isArray(ex?.sets)) continue;
          const sets = ex.sets
            .filter((s: any) => isFiniteNum(s?.reps) && isFiniteNum(s?.weight))
            .map((s: any) => ({ reps: Math.max(1, Math.round(s.reps)), weight: Math.max(0, s.weight) }));
          if (sets.length === 0) continue;
          cleanedExercises.push({ exerciseId: ex.exerciseId, exerciseName: ex.exerciseName.trim(), sets });
        }
        if (cleanedExercises.length === 0) return null;
        return {
          type: 'generate_workout',
          name: payload.name.trim().slice(0, 80),
          workoutType: payload.workoutType as WorkoutType,
          durationMinutes: Math.max(5, Math.min(180, Math.round(payload.durationMinutes))),
          intensity: payload.intensity as Intensity,
          exercises: cleanedExercises,
          note: typeof payload.note === 'string' ? payload.note.slice(0, 200) : undefined,
        };
      }
      return null;
    }
    case 'change_objective': {
      const valid = ['bulk', 'cut', 'maintain', 'recomp'];
      if (typeof payload?.newObjective === 'string' && valid.includes(payload.newObjective)) {
        return {
          type: 'change_objective',
          newObjective: payload.newObjective as 'bulk' | 'cut' | 'maintain' | 'recomp',
          reason: typeof payload.reason === 'string' ? payload.reason : undefined,
        };
      }
      return null;
    }
    case 'update_target': {
      const hasW = isFiniteNum(payload?.targetWeight);
      const hasD = typeof payload?.targetDeadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.targetDeadline);
      if (!hasW && !hasD) return null;
      return {
        type: 'update_target',
        targetWeight: hasW ? Math.max(30, Math.min(300, payload.targetWeight)) : undefined,
        targetDeadline: hasD ? payload.targetDeadline : undefined,
        reason: typeof payload.reason === 'string' ? payload.reason : undefined,
      };
    }
    case 'generate_shopping_list': {
      if (typeof payload?.title === 'string' && Array.isArray(payload?.items) && payload.items.length > 0) {
        const cleaned = payload.items
          .filter((it: any) => typeof it?.label === 'string' && it.label.trim().length > 0)
          .slice(0, 60)
          .map((it: any) => ({
            label: it.label.trim().slice(0, 80),
            quantity: typeof it.quantity === 'string' ? it.quantity.trim().slice(0, 30) : undefined,
            category: typeof it.category === 'string' ? it.category.trim().slice(0, 30) : undefined,
          }));
        if (cleaned.length === 0) return null;
        return {
          type: 'generate_shopping_list',
          title: payload.title.trim().slice(0, 80),
          items: cleaned,
        };
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
    case 'generate_workout':
      return executeGenerateWorkout(action);
    case 'change_objective':
      return executeChangeObjective(action);
    case 'update_target':
      return executeUpdateTarget(action);
    case 'generate_shopping_list':
      return executeGenerateShoppingList(action);
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

async function executeGenerateWorkout(a: Extract<CoachAction, { type: 'generate_workout' }>) {
  const userId = useAuthStore.getState().session?.user?.id;
  const today = todayLocalIso();
  const workoutId = `coach-w-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const workout = {
    id: workoutId,
    date: today,
    timestamp: new Date().toISOString(),
    type: a.workoutType,
    durationMinutes: a.durationMinutes,
    intensity: a.intensity,
    name: a.name,
    note: a.note,
    exercises: a.exercises.map((ex, i) => ({
      id: `we_${Date.now()}_${i}`,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets.map((s, j) => ({
        id: `s_${Date.now()}_${i}_${j}`,
        reps: s.reps,
        weight: s.weight,
      })),
    })),
  };
  useTrainingStore.getState().addWorkout(workout);
  if (userId) {
    const { syncWorkout } = await import('./userSync');
    syncWorkout(workout, userId);
  }
}

async function executeChangeObjective(a: Extract<CoachAction, { type: 'change_objective' }>) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  // Recompute macros with the new objective using existing engines.
  const { calculateTDEE } = await import('../engine/tdee');
  const { calculateMacros } = await import('../engine/macros');
  const { determineMealCount } = await import('../engine/mealPlanner');
  const tdee = calculateTDEE({
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.heightCm,
    currentWeight: profile.currentWeight,
    activityLevel: profile.activityLevel,
  });
  const macros = calculateMacros(tdee, a.newObjective, profile.currentWeight);
  const mealsPerDay = determineMealCount(profile.activityLevel, a.newObjective);
  useUserStore.getState().updateProfile({
    objective: a.newObjective,
    tdee,
    dailyCalories: macros.calories,
    dailyProtein: macros.protein,
    dailyCarbs: macros.carbs,
    dailyFat: macros.fat,
    mealsPerDay,
  });
  const userId = useAuthStore.getState().session?.user?.id;
  if (userId) {
    const { syncProfile } = await import('./userSync');
    syncProfile(
      {
        objective: a.newObjective,
        tdee,
        daily_calories: macros.calories,
        daily_protein: macros.protein,
        daily_carbs: macros.carbs,
        daily_fat: macros.fat,
        meals_per_day: mealsPerDay,
      },
      userId
    );
  }
}

async function executeUpdateTarget(a: Extract<CoachAction, { type: 'update_target' }>) {
  const updates: Record<string, any> = {};
  if (typeof a.targetWeight === 'number') updates.targetWeight = a.targetWeight;
  if (typeof a.targetDeadline === 'string') updates.targetDeadline = a.targetDeadline;
  if (Object.keys(updates).length === 0) return;
  useUserStore.getState().updateProfile(updates);
  const userId = useAuthStore.getState().session?.user?.id;
  if (userId) {
    const { syncProfile } = await import('./userSync');
    const dbUpdates: Record<string, any> = {};
    if (updates.targetWeight !== undefined) dbUpdates.target_weight = updates.targetWeight;
    if (updates.targetDeadline !== undefined) dbUpdates.target_deadline = updates.targetDeadline;
    syncProfile(dbUpdates, userId);
  }
}

async function executeGenerateShoppingList(a: Extract<CoachAction, { type: 'generate_shopping_list' }>) {
  const { useShoppingListStore } = await import('../store/shoppingListStore');
  useShoppingListStore.getState().setCurrent({
    id: `sl_${Date.now()}`,
    title: a.title,
    createdAt: new Date().toISOString(),
    items: a.items.map((it, i) => ({
      id: `sli_${Date.now()}_${i}`,
      label: it.label,
      quantity: it.quantity,
      category: it.category,
      checked: false,
    })),
  });
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
    case 'generate_workout': {
      const totalSets = action.exercises.reduce((s, e) => s + e.sets.length, 0);
      return {
        tag: 'Séance générée',
        title: action.name,
        subtitle: `${action.exercises.length} exercices · ${totalSets} séries · ${action.durationMinutes} min · ${action.intensity}`,
      };
    }
    case 'change_objective': {
      const labels: Record<string, string> = {
        bulk: 'Prise de masse',
        cut: 'Sèche',
        maintain: 'Maintien',
        recomp: 'Recomposition',
      };
      const profile = useUserStore.getState().profile;
      const current = profile?.objective ?? '';
      return {
        tag: 'Objectif',
        title: `${labels[current] ?? current} → ${labels[action.newObjective]}`,
        subtitle: action.reason ?? 'Macros recalculées automatiquement.',
      };
    }
    case 'update_target': {
      const parts: string[] = [];
      if (action.targetWeight) parts.push(`${action.targetWeight}kg`);
      if (action.targetDeadline) parts.push(`d'ici le ${action.targetDeadline}`);
      return {
        tag: 'Objectif personnel',
        title: `Nouvelle cible : ${parts.join(' ')}`,
        subtitle: action.reason ?? 'Mis à jour dans ton profil.',
      };
    }
    case 'generate_shopping_list': {
      return {
        tag: 'Liste de courses',
        title: action.title,
        subtitle: `${action.items.length} articles. Tu pourras la cocher dans l'app.`,
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
