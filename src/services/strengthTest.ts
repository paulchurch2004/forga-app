// FORGA — Strength self-assessment scoring + starting weight derivation.
// Pure functions, no I/O.

import type {
  StrengthLevel,
  StrengthTestAnswers,
  StrengthTestResult,
  StartingWeights,
} from '../types/strength';
import type { Sex } from '../types/user';

/** Map raw bodyweight answers → strength level. */
function classifyFromBodyweight(a: StrengthTestAnswers): StrengthLevel {
  const pushups = a.pushupsMax ?? 0;
  const squats = a.squatsMax ?? 0;
  const pullups = a.pullupsMax ?? 0;

  // Rough scoring (sum of normalized indicators)
  const pushScore = pushups <= 5 ? 0 : pushups <= 15 ? 1 : pushups <= 30 ? 2 : 3;
  const squatScore = squats <= 10 ? 0 : squats <= 25 ? 1 : squats <= 50 ? 2 : 3;
  const pullScore = pullups === 0 ? 0 : pullups <= 3 ? 1 : pullups <= 10 ? 2 : 3;
  const total = pushScore + squatScore + pullScore;

  if (total <= 1) return 'novice';
  if (total <= 4) return 'beginner';
  if (total <= 7) return 'intermediate';
  return 'advanced';
}

/** Bodyweight-relative seed multipliers per level (squat / bench / deadlift / OHP / row). */
const SEED_MULTIPLIERS_M: Record<StrengthLevel, [number, number, number, number, number]> = {
  novice:       [0.40, 0.40, 0.55, 0.25, 0.30],
  beginner:     [0.55, 0.55, 0.75, 0.35, 0.45],
  intermediate: [0.85, 0.75, 1.10, 0.50, 0.65],
  advanced:     [1.20, 1.00, 1.50, 0.65, 0.85],
};

const SEED_MULTIPLIERS_F: Record<StrengthLevel, [number, number, number, number, number]> = {
  novice:       [0.30, 0.20, 0.50, 0.15, 0.20],
  beginner:     [0.45, 0.35, 0.70, 0.25, 0.35],
  intermediate: [0.65, 0.50, 0.95, 0.35, 0.50],
  advanced:     [0.95, 0.70, 1.30, 0.50, 0.70],
};

function roundToPlate(weight: number): number {
  // Snap to nearest 2.5 kg, with a 20 kg minimum (empty olympic bar).
  const snapped = Math.round(weight / 2.5) * 2.5;
  return Math.max(20, snapped);
}

/**
 * Compute initial 5-rep working weights for the main compound lifts.
 * These are intentionally conservative — the first session in the app
 * will fine-tune them via per-set feedback.
 */
function computeStartingWeights(
  level: StrengthLevel,
  bodyweightKg: number,
  sex: Sex,
  pullupsMax: number,
): StartingWeights {
  const multipliers = sex === 'female' ? SEED_MULTIPLIERS_F[level] : SEED_MULTIPLIERS_M[level];
  return {
    squat: roundToPlate(bodyweightKg * multipliers[0]),
    bench: roundToPlate(bodyweightKg * multipliers[1]),
    deadlift: roundToPlate(bodyweightKg * multipliers[2]),
    overheadPress: roundToPlate(bodyweightKg * multipliers[3]),
    row: roundToPlate(bodyweightKg * multipliers[4]),
    canPullUp: pullupsMax >= 1,
  };
}

export interface StrengthTestInput {
  answers: StrengthTestAnswers;
  bodyweightKg: number;
  sex: Sex;
}

/**
 * Run the strength test and return level + seed weights.
 *
 * Priority order for level estimation:
 *   1. If user provided known 1RM values → use those directly to score.
 *   2. Else use bodyweight indicators (pushups / squats / pullups).
 */
export function runStrengthTest(input: StrengthTestInput): StrengthTestResult {
  const { answers, bodyweightKg, sex } = input;

  let level: StrengthLevel;

  // If user has known 1RMs, classify by squat:bodyweight ratio (most reliable single number).
  if (answers.hasTrained && answers.knownSquatKg && answers.knownSquatKg > 0 && bodyweightKg > 0) {
    const ratio = answers.knownSquatKg / bodyweightKg;
    if (sex === 'female') {
      if (ratio < 0.5) level = 'novice';
      else if (ratio < 0.85) level = 'beginner';
      else if (ratio < 1.25) level = 'intermediate';
      else level = 'advanced';
    } else {
      if (ratio < 0.75) level = 'novice';
      else if (ratio < 1.25) level = 'beginner';
      else if (ratio < 1.75) level = 'intermediate';
      else level = 'advanced';
    }
  } else {
    level = classifyFromBodyweight(answers);
  }

  const pullups = answers.pullupsMax ?? 0;
  const startingWeights = computeStartingWeights(level, bodyweightKg, sex, pullups);

  // Override with user-provided 1RMs if they're more conservative than our seed.
  // We always go LOWER than their stated max so the first session is safe.
  if (answers.knownBenchKg && answers.knownBenchKg > 0) {
    startingWeights.bench = roundToPlate(answers.knownBenchKg * 0.65);
  }
  if (answers.knownSquatKg && answers.knownSquatKg > 0) {
    startingWeights.squat = roundToPlate(answers.knownSquatKg * 0.65);
  }
  if (answers.knownDeadliftKg && answers.knownDeadliftKg > 0) {
    startingWeights.deadlift = roundToPlate(answers.knownDeadliftKg * 0.65);
  }

  return {
    level,
    startingWeights,
    takenAt: new Date().toISOString(),
    answers,
  };
}

/** Map an exercise id to the matching StartingWeights field, if any. */
export function getStartingWeightForExercise(
  exerciseId: string,
  weights: StartingWeights,
): number {
  switch (exerciseId) {
    case 'squat':
    case 'front_squat':
    case 'goblet_squat':
    case 'pause_squat':
    case 'hack_squat':
    case 'leg_press':
      return weights.squat;
    case 'bench_press':
    case 'incline_press':
    case 'incline_db_press':
    case 'close_grip_bench':
    case 'pause_bench':
      return weights.bench;
    case 'deadlift':
    case 'romanian_deadlift':
    case 'sumo_deadlift':
    case 'rack_pull':
    case 'good_morning':
      return weights.deadlift;
    case 'overhead_press':
    case 'seated_db_press':
    case 'arnold_press':
    case 'push_press':
      return weights.overheadPress;
    case 'barbell_rows':
    case 't_bar_row':
    case 'pendlay_row':
    case 'seated_cable_row':
      return weights.row;
    case 'pull_ups':
      // If user can't pull-up, return 0 → UI suggests assisted/lat pulldown
      return weights.canPullUp ? 0 : 0;
    case 'lat_pulldown':
      return weights.row * 0.8; // proxy
    default:
      return 0; // unknown exercise → user enters their own
  }
}
