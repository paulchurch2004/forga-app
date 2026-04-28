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
    };

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
