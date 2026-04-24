import type { Objective, ActivityLevel, Sex } from '../types/user';
import type {
  ProgramId,
  ProgramDay,
  ProgramExercise,
  GeneratedPlan,
  PlannedDay,
  CardioRecommendation,
  Level,
} from '../types/program';
import { PROGRAMS, resolveLegacyProgramId } from '../data/programs';
import { EXERCISES } from '../data/exercises';

/** Local-timezone YYYY-MM-DD (avoids UTC shift from toISOString) */
export function toLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// V2 — sex × activity × objective program selection (TRAINING_PROGRAMS_SPEC §1)
// ============================================================================

export function mapActivityToLevel(a: ActivityLevel): Level {
  if (a === 'sedentary' || a === 'light') return 'beginner';
  if (a === 'moderate') return 'intermediate';
  return 'advanced';
}

/**
 * Recommend a program based on sex, activity level and objective.
 *
 * Backwards-compat: if the legacy 2-arg form is used (no `sex`), defaults
 * to male (the previous implicit behaviour).
 */
export function recommendProgram(
  sexOrActivity: Sex | ActivityLevel,
  activityOrObjective: ActivityLevel | Objective,
  objective?: Objective
): ProgramId {
  // Detect legacy 2-arg call: first arg is an ActivityLevel
  const isLegacy = !objective;
  const sex: Sex = isLegacy ? 'male' : (sexOrActivity as Sex);
  const activityLevel: ActivityLevel = isLegacy
    ? (sexOrActivity as ActivityLevel)
    : (activityOrObjective as ActivityLevel);
  const obj: Objective = isLegacy
    ? (activityOrObjective as Objective)
    : (objective as Objective);

  const level = mapActivityToLevel(activityLevel);

  if (level === 'beginner') {
    if (sex === 'male' && obj === 'bulk') return 'stronglifts_5x5';
    return sex === 'female' ? 'full_body_f' : 'full_body_h';
  }

  if (level === 'intermediate') {
    return sex === 'female' ? 'upper_lower_f' : 'upper_lower_h';
  }

  // advanced
  if (obj === 'cut') {
    return sex === 'female' ? 'upper_lower_f' : 'upper_lower_h';
  }
  return sex === 'female' ? 'ppl_f' : 'ppl_h';
}

// ============================================================================
// applyObjectiveModifiers — TRAINING_PROGRAMS_SPEC §2 + §8.2
// ============================================================================

interface ObjectiveModifiers {
  setsMultiplier: number;
  repsCompound: [number, number];
  repsIsolation: [number, number];
  restCompound: number;
  restIsolation: number;
}

const MODIFIERS_MALE: Record<Objective, ObjectiveModifiers> = {
  bulk:     { setsMultiplier: 1.25, repsCompound: [6, 8],  repsIsolation: [10, 12], restCompound: 150, restIsolation: 90 },
  cut:      { setsMultiplier: 1.00, repsCompound: [6, 10], repsIsolation: [10, 15], restCompound: 105, restIsolation: 60 },
  maintain: { setsMultiplier: 1.00, repsCompound: [8, 10], repsIsolation: [10, 12], restCompound: 105, restIsolation: 75 },
  recomp:   { setsMultiplier: 1.15, repsCompound: [6, 8],  repsIsolation: [12, 15], restCompound: 120, restIsolation: 75 },
};

const MODIFIERS_FEMALE: Record<Objective, ObjectiveModifiers> = {
  bulk:     { setsMultiplier: 1.25, repsCompound: [8, 10],  repsIsolation: [12, 15], restCompound: 120, restIsolation: 60 },
  cut:      { setsMultiplier: 1.00, repsCompound: [8, 12],  repsIsolation: [12, 20], restCompound: 90,  restIsolation: 60 },
  maintain: { setsMultiplier: 1.00, repsCompound: [10, 12], repsIsolation: [12, 15], restCompound: 90,  restIsolation: 60 },
  recomp:   { setsMultiplier: 1.15, repsCompound: [8, 10],  repsIsolation: [15, 20], restCompound: 105, restIsolation: 60 },
};

function isCompoundExercise(exerciseId: string): boolean {
  return EXERCISES[exerciseId]?.isCompound ?? false;
}

/**
 * Apply objective-based modifiers to a program day:
 *  - sets multiplied by setsMultiplier (rounded, min 1)
 *  - reps replaced by mean of the [min, max] range (compound vs isolation)
 *  - restSeconds replaced by the modifier's rest value
 */
export function applyObjectiveModifiers(
  programDay: ProgramDay,
  sex: Sex,
  objective: Objective
): ProgramDay {
  const mods = sex === 'female' ? MODIFIERS_FEMALE[objective] : MODIFIERS_MALE[objective];

  return {
    ...programDay,
    exercises: programDay.exercises.map((ex) => {
      const compound = isCompoundExercise(ex.exerciseId);
      const [minReps, maxReps] = compound ? mods.repsCompound : mods.repsIsolation;
      const targetReps = Math.round((minReps + maxReps) / 2);

      return {
        ...ex,
        targetSets: Math.max(1, Math.round(ex.targetSets * mods.setsMultiplier)),
        targetReps,
        restSeconds: compound ? mods.restCompound : mods.restIsolation,
      };
    }),
  };
}

// ============================================================================
// applyBlockRotation — TRAINING_PROGRAMS_SPEC §4 + §8.3
// 12-week cycle: blocs 1–4, 5–8, deload (week 9), 10–12
// ============================================================================

interface BlockSwap {
  exerciseId: string;
  variants: [string, string, string]; // [bloc1, bloc2, bloc3]
}

type ProgramSwaps = Record<string /* programDayId */, BlockSwap[]>;

const BLOCK_SWAPS: Partial<Record<ProgramId, ProgramSwaps>> = {
  full_body_h: {
    fb_h_a: [
      { exerciseId: 'bicep_curls', variants: ['bicep_curls', 'preacher_curl', 'barbell_curl'] },
      { exerciseId: 'plank', variants: ['plank', 'hanging_leg_raise', 'ab_wheel'] },
    ],
    fb_h_b: [
      { exerciseId: 'tricep_extensions', variants: ['tricep_extensions', 'skull_crushers', 'close_grip_bench'] },
      { exerciseId: 'crunches', variants: ['crunches', 'cable_crunch', 'weighted_crunch'] },
    ],
    fb_h_c: [
      { exerciseId: 'lateral_raises', variants: ['lateral_raises', 'upright_row', 'cable_lateral'] },
      { exerciseId: 'russian_twist', variants: ['russian_twist', 'side_plank', 'oblique_crunch'] },
    ],
  },
  full_body_f: {
    fb_f_a: [
      { exerciseId: 'squat', variants: ['squat', 'goblet_squat', 'front_squat'] },
      { exerciseId: 'hip_thrust', variants: ['hip_thrust', 'single_leg_hip_thrust', 'pause_hip_thrust'] },
    ],
    fb_f_b: [
      { exerciseId: 'romanian_deadlift', variants: ['romanian_deadlift', 'sumo_deadlift', 'good_morning'] },
    ],
    fb_f_c: [
      { exerciseId: 'cable_kickbacks', variants: ['cable_kickbacks', 'abductor_machine', 'banded_side_walk'] },
    ],
  },
  upper_lower_h: {
    ul_h_upper_a: [
      { exerciseId: 'bench_press', variants: ['bench_press', 'incline_press', 'close_grip_bench'] },
      { exerciseId: 'barbell_rows', variants: ['barbell_rows', 't_bar_row', 'pendlay_row'] },
      { exerciseId: 'bicep_curls', variants: ['bicep_curls', 'preacher_curl', 'cable_curls'] },
      { exerciseId: 'tricep_extensions', variants: ['tricep_extensions', 'dips', 'jm_press'] },
    ],
    ul_h_lower_a: [
      { exerciseId: 'squat', variants: ['squat', 'front_squat', 'pause_squat'] },
    ],
  },
  upper_lower_f: {
    ul_f_lower_a: [
      { exerciseId: 'squat', variants: ['squat', 'goblet_squat', 'front_squat'] },
      { exerciseId: 'hip_thrust', variants: ['hip_thrust', 'single_leg_hip_thrust', 'pause_hip_thrust'] },
    ],
    ul_f_lower_b: [
      { exerciseId: 'romanian_deadlift', variants: ['romanian_deadlift', 'sumo_deadlift', 'good_morning'] },
      { exerciseId: 'cable_kickbacks', variants: ['cable_kickbacks', 'abductor_machine', 'banded_side_walk'] },
    ],
    ul_f_upper_a: [
      { exerciseId: 'bench_press', variants: ['bench_press', 'incline_db_press', 'close_grip_bench'] },
    ],
  },
  ppl_h: {
    ppl_h_push_a: [
      { exerciseId: 'bench_press', variants: ['bench_press', 'incline_press', 'pause_bench'] },
    ],
    ppl_h_pull_a: [
      { exerciseId: 'deadlift', variants: ['deadlift', 'sumo_deadlift', 'rack_pull'] },
    ],
    ppl_h_legs_a: [
      { exerciseId: 'squat', variants: ['squat', 'front_squat', 'pause_squat'] },
    ],
    ppl_h_push_b: [
      { exerciseId: 'cable_fly', variants: ['cable_fly', 'pec_deck', 'incline_fly'] },
    ],
    ppl_h_pull_b: [
      { exerciseId: 'hammer_curls', variants: ['hammer_curls', 'preacher_curl', 'incline_db_curl'] },
    ],
    ppl_h_legs_b: [
      { exerciseId: 'bulgarian_split_squat', variants: ['bulgarian_split_squat', 'step_ups', 'pistol_squat'] },
    ],
  },
  ppl_f: {
    ppl_f_push_a: [
      { exerciseId: 'bench_press', variants: ['bench_press', 'incline_press', 'pause_bench'] },
    ],
    ppl_f_pull_a: [
      { exerciseId: 'barbell_rows', variants: ['barbell_rows', 'rack_pull', 'pendlay_row'] },
    ],
    ppl_f_legs_quad: [
      { exerciseId: 'squat', variants: ['squat', 'front_squat', 'goblet_squat'] },
    ],
    ppl_f_push_b: [
      { exerciseId: 'cable_fly', variants: ['cable_fly', 'pec_deck', 'incline_fly'] },
    ],
    ppl_f_pull_b: [
      { exerciseId: 'hammer_curls', variants: ['hammer_curls', 'preacher_curl', 'concentration_curl'] },
    ],
    ppl_f_legs_glute: [
      { exerciseId: 'hip_thrust', variants: ['hip_thrust', 'single_leg_hip_thrust', 'pause_hip_thrust'] },
      { exerciseId: 'cable_kickbacks', variants: ['cable_kickbacks', 'abductor_machine', 'banded_side_walk'] },
    ],
  },
};

/**
 * Apply 12-week block rotation to a program day.
 * - Weeks 1-4 → bloc 1 (base exercises)
 * - Weeks 5-8 → bloc 2 (variants)
 * - Week 9   → deload (-30% volume, same exercises)
 * - Weeks 10-12 → bloc 3 (advanced variants)
 */
export function applyBlockRotation(
  programDay: ProgramDay,
  programId: ProgramId,
  weekNumber: number // 1-based
): ProgramDay {
  // Deload week: keep exercises, cut sets by 30%
  if (weekNumber === 9) {
    return {
      ...programDay,
      exercises: programDay.exercises.map((ex) => ({
        ...ex,
        targetSets: Math.max(1, Math.round(ex.targetSets * 0.7)),
      })),
    };
  }

  const blockIdx = weekNumber <= 4 ? 0 : weekNumber <= 8 ? 1 : 2;
  const swaps = BLOCK_SWAPS[programId]?.[programDay.id] ?? [];
  if (swaps.length === 0) return programDay;

  return {
    ...programDay,
    exercises: programDay.exercises.map<ProgramExercise>((ex) => {
      const swap = swaps.find((s) => s.exerciseId === ex.exerciseId);
      if (!swap) return ex;
      return { ...ex, exerciseId: swap.variants[blockIdx] };
    }),
  };
}

// ============================================================================
// Cardio + plan generation
// ============================================================================

function getCardioRecommendation(objective: Objective): CardioRecommendation {
  switch (objective) {
    case 'bulk':
      return { sessionsPerWeek: 1, type: 'liss', durationMinutes: 30, descriptionKey: 'cardioRecBulk' };
    case 'cut':
      return { sessionsPerWeek: 3, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecCut' };
    case 'maintain':
      return { sessionsPerWeek: 2, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecMaintain' };
    case 'recomp':
      return { sessionsPerWeek: 2, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecRecomp' };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const isoDay = day === 0 ? 6 : day - 1;
  if (isoDay === 0) return toLocalDateStr(now);
  const daysUntilMonday = 7 - isoDay;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + daysUntilMonday);
  return toLocalDateStr(monday);
}

function pickCardioDays(trainingSlots: number[], sessionsPerWeek: number): number[] {
  const restDays = [0, 1, 2, 3, 4, 5].filter((d) => !trainingSlots.includes(d));
  if (restDays.length === 0 || sessionsPerWeek === 0) return [];
  const step = Math.max(1, Math.floor(restDays.length / sessionsPerWeek));
  const picked: number[] = [];
  for (let i = 0; i < sessionsPerWeek && i * step < restDays.length; i++) {
    picked.push(restDays[i * step]);
  }
  return picked;
}

/**
 * Generate a 4-week plan. Backwards-compat: legacy 2-arg form
 * (programId, objective) defaults sex='male'.
 */
export function generatePlan(
  programId: ProgramId,
  sexOrObjective: Sex | Objective,
  objective?: Objective
): GeneratedPlan {
  const isLegacy = !objective;
  const sex: Sex = isLegacy ? 'male' : (sexOrObjective as Sex);
  const obj: Objective = isLegacy ? (sexOrObjective as Objective) : (objective as Objective);

  // Resolve legacy program ids on the fly
  const resolvedId = resolveLegacyProgramId(programId, sex) as ProgramId;
  const program = PROGRAMS[resolvedId] ?? PROGRAMS[programId];
  if (!program) throw new Error(`Unknown program: ${programId}`);

  void sex;
  void obj;

  const startDate = getNextMonday();
  const endDate = addDays(startDate, 27);
  const cardioRec = getCardioRecommendation(obj);
  const cardioDays = pickCardioDays(program.trainingSlots, cardioRec.sessionsPerWeek);

  const days: PlannedDay[] = [];
  let rotationIdx = 0;

  for (let i = 0; i < 28; i++) {
    const date = addDays(startDate, i);
    const dow = i % 7;

    if (program.trainingSlots.includes(dow)) {
      let dayIdx: number;
      if (resolvedId === 'stronglifts_5x5') {
        const weekNum = Math.floor(i / 7);
        const slotInWeek = program.trainingSlots.indexOf(dow);
        const isEvenWeek = weekNum % 2 === 0;
        const pattern = isEvenWeek ? [0, 1, 0] : [1, 0, 1];
        dayIdx = pattern[slotInWeek] ?? 0;
      } else {
        dayIdx = rotationIdx % program.rotation.length;
        rotationIdx++;
      }

      days.push({
        date,
        dayOfWeek: dow,
        programDayId: program.rotation[dayIdx].id,
        status: 'upcoming',
      });
    } else if (cardioDays.includes(dow)) {
      const cardioCount = days.filter((d) => d.programDayId?.startsWith('cardio_')).length;
      const cardioId =
        cardioRec.type === 'liss'
          ? 'cardio_liss'
          : cardioRec.type === 'hiit'
            ? 'cardio_hiit'
            : cardioCount % 2 === 0
              ? 'cardio_hiit'
              : 'cardio_liss';

      days.push({
        date,
        dayOfWeek: dow,
        programDayId: cardioId,
        status: 'upcoming',
      });
    } else {
      days.push({
        date,
        dayOfWeek: dow,
        programDayId: null,
        status: 'rest',
      });
    }
  }

  const today = toLocalDateStr();
  const todayDay = days.find((d) => d.date === today);
  if (todayDay && todayDay.status !== 'rest') {
    todayDay.status = 'today';
  }

  return {
    programId: resolvedId,
    startDate,
    endDate,
    days,
    cardioRecommendation: cardioRec,
  };
}

/**
 * Build the final ProgramDay used at workout time:
 * raw template → applyBlockRotation(week) → applyObjectiveModifiers(sex, obj)
 *
 * The week number is computed from the plan's startDate (1-based).
 */
export function resolveProgramDayForWorkout(
  rawDay: ProgramDay,
  programId: ProgramId,
  sex: Sex,
  objective: Objective,
  weekNumber: number
): ProgramDay {
  const rotated = applyBlockRotation(rawDay, programId, weekNumber);
  return applyObjectiveModifiers(rotated, sex, objective);
}

export function estimateWorkoutDuration(
  exercises: { targetSets: number; targetReps: number; restSeconds: number }[]
): number {
  let totalSeconds = 0;
  for (const ex of exercises) {
    const setTime = 30;
    totalSeconds += ex.targetSets * (setTime + ex.restSeconds);
  }
  return Math.ceil(totalSeconds / 60);
}
