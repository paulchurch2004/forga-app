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
      /**
       * Décomposition optionnelle en ingrédients identifiés. Quand
       * présente, l'app re-calcule les macros en interrogeant
       * `resolveIngredient()` (DB locale → Open Food Facts) et
       * remplace les valeurs estimées par les valeurs réelles.
       *
       * Si la résolution échoue, les `calories`/`protein`/`carbs`/`fat`
       * du niveau supérieur sont utilisés en fallback et la carte
       * affiche un badge ⚠ "Estimation IA".
       */
      items?: Array<{ name: string; quantityG: number }>;
      /**
       * Origine des macros une fois la carte affichée :
       *   - 'resolved'  → tous les ingrédients matchés en DB (fiable)
       *   - 'mixed'     → certains ingrédients résolus, d'autres estimés
       *   - 'estimated' → estimation IA pure (afficher le ⚠)
       * Champ rempli par le frontend après résolution, pas par le LLM.
       */
      macroSource?: 'resolved' | 'mixed' | 'estimated';
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
    }
  | {
      // "J'ai pesé 78.2 ce matin"
      type: 'log_weight';
      weightKg: number;
      note?: string;
    }
  | {
      // "Mon tour de taille est passé à 82"
      type: 'log_measurement';
      field: 'waist' | 'hips' | 'chest' | 'arms' | 'thighs' | 'bodyFatPercent';
      value: number;
    }
  | {
      // "Rappelle-moi de boire à 16h"
      type: 'set_reminder';
      message: string;
      /** Local time as HH:MM (24h). */
      atTimeLocal: string;
      /** When true, schedules the reminder every day; otherwise one-shot. */
      repeatDaily?: boolean;
    }
  | {
      // "Je pars en vacances 10 jours" → pause program, suspends streak danger
      type: 'pause_program';
      daysCount: number;
      reason?: string;
    }
  | {
      // "Je suis rentré, on reprend"
      type: 'resume_program';
    };

/** Actions whose UI card should require an extra confirmation step. */
export const DESTRUCTIVE_ACTIONS: ActionType[] = [
  'adjust_calories',
  'move_workout_day',
  'set_water_goal',
  'change_objective',
  'update_target',
  'pause_program',
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
 * Parse tolérant : tente JSON.parse strict, puis avec corrections
 * cosmétiques courantes (trailing commas, smart quotes, NaN/Infinity).
 *
 * Avant on droppait silencieusement toute action mal formée, ce qui
 * laissait l'user avec "C'est noté !" en texte mais AUCUNE carte
 * → confusion totale. Maintenant on récupère 95% des cas que les LLM
 * produisent quand ils dérivent du JSON strict.
 */
function parseTolerantJson(raw: string): any | null {
  const trimmed = raw.trim();
  // 1) Strict
  try {
    return JSON.parse(trimmed);
  } catch {}
  // 2) Tolérant : remove trailing commas avant } ou ]
  try {
    const fixed = trimmed
      .replace(/,(\s*[}\]])/g, '$1') // trailing commas
      .replace(/[“”]/g, '"') // smart double quotes
      .replace(/[‘’]/g, "'") // smart single quotes
      .replace(/\bNaN\b/g, 'null')
      .replace(/\b(-?)Infinity\b/g, 'null');
    return JSON.parse(fixed);
  } catch {}
  // 3) Vraiment cassé → null (sera drop côté caller, telemetry logged).
  if (typeof console !== 'undefined') {
    console.warn('[coach] action JSON parse failed:', trimmed.slice(0, 200));
  }
  return null;
}

/**
 * Like parseCoachActions but also extracts [[MEMORY]] blocks. Strips both
 * action and memory blocks from the visible text.
 */
export function parseCoachActionsAndMemories(reply: string): ParsedReplyFull {
  const memories: ParsedMemory[] = [];
  let text = reply.replace(MEMORY_RE, (_match, rawJson: string) => {
    const json = parseTolerantJson(rawJson);
    if (json) {
      const valid = validateMemory(json);
      if (valid) memories.push(valid);
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
    const json = parseTolerantJson(rawJson);
    if (json) {
      const action = validateAction(rawType, json);
      if (action) actions.push(action);
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
        // Décomposition optionnelle en ingrédients : on valide qu'elle
        // est bien un tableau d'objets `{ name, quantityG }`. Toute
        // entrée invalide est silencieusement rejetée — la card retombe
        // sur les macros niveau supérieur (estimation LLM).
        let items: Array<{ name: string; quantityG: number }> | undefined;
        if (Array.isArray(payload.items)) {
          const parsed = payload.items
            .map((it: any) => {
              if (
                typeof it?.name === 'string' &&
                it.name.trim().length > 0 &&
                isFiniteNum(it.quantityG ?? it.quantity_g)
              ) {
                return {
                  name: it.name.trim(),
                  quantityG: Math.max(0, Math.round(it.quantityG ?? it.quantity_g)),
                };
              }
              return null;
            })
            .filter(
              (x: { name: string; quantityG: number } | null):
                x is { name: string; quantityG: number } => x !== null,
            );
          if (parsed.length > 0) items = parsed;
        }

        return {
          type: 'log_meal',
          slot: payload.slot as MealSlot,
          name: payload.name.trim(),
          calories: Math.max(0, Math.round(payload.calories)),
          protein: Math.max(0, Math.round(payload.protein)),
          carbs: Math.max(0, Math.round(payload.carbs)),
          fat: Math.max(0, Math.round(payload.fat)),
          ...(items ? { items } : {}),
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
    case 'log_weight': {
      if (isFiniteNum(payload?.weightKg) && payload.weightKg > 25 && payload.weightKg < 300) {
        return {
          type: 'log_weight',
          weightKg: Math.round(payload.weightKg * 10) / 10,
          note: typeof payload.note === 'string' ? payload.note.trim().slice(0, 200) : undefined,
        };
      }
      return null;
    }
    case 'log_measurement': {
      const allowed = ['waist', 'hips', 'chest', 'arms', 'thighs', 'bodyFatPercent'] as const;
      if (
        typeof payload?.field === 'string' &&
        (allowed as readonly string[]).includes(payload.field) &&
        isFiniteNum(payload?.value) &&
        payload.value > 0 &&
        payload.value < 300
      ) {
        return {
          type: 'log_measurement',
          field: payload.field as typeof allowed[number],
          value: Math.round(payload.value * 10) / 10,
        };
      }
      return null;
    }
    case 'set_reminder': {
      // Validate HH:MM format strictly — bad time formats would silently
      // fail when scheduling.
      const timeMatch = typeof payload?.atTimeLocal === 'string'
        ? /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(payload.atTimeLocal.trim())
        : null;
      if (
        typeof payload?.message === 'string' &&
        payload.message.trim().length > 0 &&
        timeMatch
      ) {
        return {
          type: 'set_reminder',
          message: payload.message.trim().slice(0, 140),
          atTimeLocal: `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`,
          repeatDaily: payload.repeatDaily === true,
        };
      }
      return null;
    }
    case 'pause_program': {
      if (isFiniteNum(payload?.daysCount) && payload.daysCount > 0 && payload.daysCount <= 60) {
        return {
          type: 'pause_program',
          daysCount: Math.round(payload.daysCount),
          reason: typeof payload.reason === 'string' ? payload.reason.trim().slice(0, 200) : undefined,
        };
      }
      return null;
    }
    case 'resume_program': {
      // No fields to validate; payload may be empty object.
      return { type: 'resume_program' };
    }
    default:
      return null;
  }
}

function isFiniteNum(v: any): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

// ─── Macro resolution from structured items ────────────────────

/**
 * Si l'action log_meal a un tableau `items`, on résout chaque ingrédient
 * via la DB locale + Open Food Facts, on recalcule les macros à partir
 * des quantités déclarées, et on retourne une action mise à jour avec :
 *   - macros recalculées (réelles si tous les items matchent)
 *   - `macroSource` flag pour l'UI
 *
 * Si aucun item ne matche, l'action est retournée inchangée avec
 * `macroSource = 'estimated'` — la carte affichera un ⚠.
 *
 * Cette fonction est sûre à appeler plusieurs fois ; elle n'a pas
 * d'effet de bord (pas de sync, pas de mutation de store).
 */
export async function resolveLogMealMacros(
  action: Extract<CoachAction, { type: 'log_meal' }>,
): Promise<Extract<CoachAction, { type: 'log_meal' }>> {
  if (!action.items || action.items.length === 0) {
    return { ...action, macroSource: 'estimated' };
  }

  const { resolveIngredient } = await import('./ingredientResolver');
  const resolved = await Promise.all(
    action.items.map((it) => resolveIngredient(it.name)),
  );

  let kcal = 0;
  let p = 0;
  let c = 0;
  let f = 0;
  let resolvedCount = 0;

  resolved.forEach((res, idx) => {
    const qty = action.items![idx].quantityG;
    if (res && (res.source === 'local' || res.source === 'open_food_facts')) {
      const ratio = qty / 100;
      kcal += res.ingredient.caloriesPer100g * ratio;
      p += res.ingredient.proteinPer100g * ratio;
      c += res.ingredient.carbsPer100g * ratio;
      f += res.ingredient.fatPer100g * ratio;
      resolvedCount++;
    }
  });

  // Tous les items résolus → on remplace les valeurs estimées.
  if (resolvedCount === action.items.length) {
    return {
      ...action,
      calories: Math.round(kcal),
      protein: Math.round(p * 10) / 10,
      carbs: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10,
      macroSource: 'resolved',
    };
  }

  // Résolution partielle : on garde les macros LLM (plus prudent que
  // de mixer un sous-total réel et des absences) et on flag 'mixed'.
  if (resolvedCount > 0) {
    return { ...action, macroSource: 'mixed' };
  }

  // Rien résolu : carte affichée avec ⚠ Estimation.
  return { ...action, macroSource: 'estimated' };
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
    case 'log_weight':
      return executeLogWeight(action);
    case 'log_measurement':
      return executeLogMeasurement(action);
    case 'set_reminder':
      return executeSetReminder(action);
    case 'pause_program':
      return executePauseProgram(action);
    case 'resume_program':
      return executeResumeProgram();
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
  const list = {
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
  };
  useShoppingListStore.getState().setCurrent(list);
  // Sync vers Supabase (sans ça, list perdue au logout/réinstall).
  const uid = useAuthStore.getState().session?.user?.id;
  if (uid) {
    const { syncShoppingList } = await import('./userSync');
    syncShoppingList(list, false, uid);
  }
}

async function executeLogWeight(a: Extract<CoachAction, { type: 'log_weight' }>) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  const today = todayLocalIso();
  const entry = {
    id: `coach-w-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: profile.id,
    date: today,
    weight: a.weightKg,
    createdAt: new Date().toISOString(),
  };
  useUserStore.getState().addWeightEntry(entry);
  // Best-effort backend sync; failures fall back to the offline queue.
  try {
    const { syncWeight } = await import('./userSync');
    await syncWeight(entry, profile.id);
  } catch {
    /* offline queue will handle */
  }
}

async function executeLogMeasurement(a: Extract<CoachAction, { type: 'log_measurement' }>) {
  const profile = useUserStore.getState().profile;
  if (!profile) return;
  const today = todayLocalIso();
  const measurement: import('../types/user').BodyMeasurement = {
    id: `coach-m-${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId: profile.id,
    date: today,
    createdAt: new Date().toISOString(),
    // We only persist the single field the coach reported — the rest stay
    // unset (the type allows partial entries).
    ...(a.field === 'waist' ? { waistCm: a.value } : {}),
    ...(a.field === 'hips' ? { hipsCm: a.value } : {}),
    ...(a.field === 'chest' ? { chestCm: a.value } : {}),
    ...(a.field === 'arms' ? { armsCm: a.value } : {}),
    ...(a.field === 'thighs' ? { thighsCm: a.value } : {}),
    ...(a.field === 'bodyFatPercent' ? { bodyFatPercent: a.value } : {}),
  };
  useUserStore.getState().addMeasurement(measurement);
  // Push vers Supabase, sinon la mesure reste locale et disparaît
  // au logout / changement d'appareil. La queue offline gère les
  // échecs réseau via backoff exponentiel.
  try {
    const { syncMeasurement } = await import('./userSync');
    syncMeasurement(measurement);
  } catch {
    /* offline queue handles retry */
  }
}

async function executeSetReminder(a: Extract<CoachAction, { type: 'set_reminder' }>) {
  // We schedule a one-shot or daily local notification via expo-notifications.
  // The reminder is tracked with `data.type = 'coach_reminder'` so the
  // scheduling helpers (cf. services/notifications.ts) recognise it on
  // app foreground.
  try {
    const Notifications = await import('expo-notifications');

    // ⚠ BUG corrigé : on planifiait SANS demander la permission de
    // notification. Si l'user avait tapé "Plus tard" à l'inscription,
    // scheduleNotificationAsync ne déclenchait JAMAIS la notif (échec
    // silencieux avalé par le catch) → "le coach ne m'a rien envoyé".
    // On demande maintenant la permission au moment où l'user confirme
    // un rappel. Si refusée, on remonte une alerte plutôt que d'échouer
    // en douce.
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') {
        const { Alert } = await import('react-native');
        Alert.alert(
          'Notifications désactivées',
          'Pour recevoir tes rappels, active les notifications dans Réglages > FORGA > Notifications.',
        );
        return;
      }
    }

    const [hh, mm] = a.atTimeLocal.split(':').map(Number);
    if (a.repeatDaily) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FORGA',
          body: a.message,
          data: { type: 'coach_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hh,
          minute: mm,
        },
      });
    } else {
      // One-shot: schedule for the *next* occurrence of HH:MM (today if
      // still in the future, otherwise tomorrow).
      const now = new Date();
      const at = new Date(now);
      at.setHours(hh, mm, 0, 0);
      if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FORGA',
          body: a.message,
          data: { type: 'coach_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
        },
      });
    }
  } catch {
    /* notifications unavailable (web, denied) — silent */
  }
}

async function executePauseProgram(a: Extract<CoachAction, { type: 'pause_program' }>) {
  // We mark a `pausedUntil` field on the active plan. UI surfaces a
  // "Programme en pause" banner instead of showing the day's session, and
  // the streak engine treats paused days as neutral (no penalty).
  const programStore = await import('../store/programStore');
  const plan = programStore.useProgramStore.getState().activePlan;
  if (!plan) return;
  const pausedUntil = new Date();
  pausedUntil.setDate(pausedUntil.getDate() + a.daysCount);
  programStore.useProgramStore.getState().setActivePlan({
    ...plan,
    pausedUntil: pausedUntil.toISOString().slice(0, 10),
  } as typeof plan);
}

async function executeResumeProgram() {
  const programStore = await import('../store/programStore');
  const plan = programStore.useProgramStore.getState().activePlan;
  if (!plan) return;
  // Strip the pausedUntil field (set to undefined) — the UI shows
  // sessions normally again.
  const { pausedUntil: _ignored, ...rest } = plan as typeof plan & { pausedUntil?: string };
  programStore.useProgramStore.getState().setActivePlan(rest as typeof plan);
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
    case 'log_weight': {
      return {
        tag: 'Pesée',
        title: `${action.weightKg.toFixed(1)} kg`,
        subtitle: action.note ?? 'Ajouté à ton historique de poids',
      };
    }
    case 'log_measurement': {
      const labels: Record<typeof action.field, string> = {
        waist: 'Tour de taille',
        hips: 'Tour de hanches',
        chest: 'Tour de poitrine',
        arms: 'Tour de bras',
        thighs: 'Tour de cuisses',
        bodyFatPercent: '% de gras',
      };
      const suffix = action.field === 'bodyFatPercent' ? '%' : 'cm';
      return {
        tag: 'Mensurations',
        title: `${labels[action.field]} : ${action.value} ${suffix}`,
        subtitle: "Ajouté à ton suivi corporel",
      };
    }
    case 'set_reminder': {
      // Formate "15:00" → "15h00" et préfixe "À" pour lever toute ambiguïté
      // (l'utilisateur lisait "15:00" comme "15 minutes"). Le format
      // français HHhMM est sans équivoque = une heure de la journée.
      const [hh, mm] = action.atTimeLocal.split(':');
      const prettyTime = `${parseInt(hh, 10)}h${mm}`;
      return {
        tag: action.repeatDaily ? 'Rappel quotidien' : 'Rappel ponctuel',
        title: `🔔 À ${prettyTime} — ${action.message}`,
        subtitle: action.repeatDaily
          ? `Notification tous les jours à ${prettyTime}`
          : `Notification au prochain ${prettyTime}`,
      };
    }
    case 'pause_program': {
      return {
        tag: 'Programme · pause',
        title: `Mettre en pause ${action.daysCount} jour${action.daysCount > 1 ? 's' : ''}`,
        subtitle: action.reason
          ? `${action.reason}. Streak protégé pendant la pause.`
          : 'Aucune séance suggérée, streak protégé pendant la pause.',
      };
    }
    case 'resume_program': {
      return {
        tag: 'Programme · reprise',
        title: 'Reprendre le programme',
        subtitle: 'Les séances reprennent à partir d\'aujourd\'hui',
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
