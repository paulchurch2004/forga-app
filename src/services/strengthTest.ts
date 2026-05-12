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

/** Rounding for **isolation** exercises (curls, lateral raises, leg curl…)
 *  where the empty-barbell floor would be absurd. Snaps to 1 kg increments
 *  below 10 kg, then 2.5 kg above. Minimum 1 kg. */
function roundToDumbbell(weight: number): number {
  if (weight < 1) return 1;
  if (weight < 10) return Math.max(1, Math.round(weight));
  const snapped = Math.round(weight / 2.5) * 2.5;
  return snapped;
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

/** Profile inputs used by the bodyweight-fallback path of
 *  `getStartingWeightForExercise`. All optional — when missing we fall
 *  back to conservative defaults (sedentary 70 kg male). */
export interface StartingWeightProfile {
  sex?: 'male' | 'female';
  /** Bodyweight in kg — typically `profile.currentWeight`. */
  bodyweightKg?: number;
  /** Self-reported training level; missing = treat as beginner. */
  trainingLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/** Direct id → main-lift mapping. Same as before — we just promote it to
 *  its own helper so the public function below stays readable. */
function getDirectMappedWeight(exerciseId: string, weights: StartingWeights): number {
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
      // Bodyweight movement — 0 means "use your own bodyweight", the UI
      // shows that as an assisted/normal pull-up rather than a load value.
      return 0;
    case 'lat_pulldown':
      return weights.row * 0.8;
    default:
      return 0;
  }
}

/** Per-exercise multiplier applied to one of the 5 main-lift seed weights.
 *  Numbers are empirical "what a beginner can do" ratios:
 *    - bicep curl ~ 12-15% of bench (single dumbbell)
 *    - lateral raise ~ 12-18% of OHP
 *    - leg curl ~ 35-45% of squat
 *  We deliberately err on the **conservative** side. */
const SECONDARY_RATIO: Record<string, { base: 'squat' | 'bench' | 'deadlift' | 'overheadPress' | 'row'; ratio: number }> = {
  // Chest secondary
  dumbbell_press: { base: 'bench', ratio: 0.45 },
  dumbbell_fly: { base: 'bench', ratio: 0.20 },
  chest_fly: { base: 'bench', ratio: 0.20 },
  cable_fly: { base: 'bench', ratio: 0.20 },
  pec_deck: { base: 'bench', ratio: 0.50 },
  push_up: { base: 'bench', ratio: 0 }, // bodyweight
  dips: { base: 'bench', ratio: 0 }, // bodyweight
  // Back secondary
  dumbbell_row: { base: 'row', ratio: 0.50 },
  face_pulls: { base: 'row', ratio: 0.40 },
  cable_row: { base: 'row', ratio: 0.85 },
  shrugs: { base: 'deadlift', ratio: 0.35 },
  // Shoulders secondary
  lateral_raises: { base: 'overheadPress', ratio: 0.15 },
  front_raises: { base: 'overheadPress', ratio: 0.18 },
  rear_delt_fly: { base: 'overheadPress', ratio: 0.15 },
  upright_rows: { base: 'overheadPress', ratio: 0.50 },
  // Arms
  bicep_curls: { base: 'bench', ratio: 0.13 },
  hammer_curls: { base: 'bench', ratio: 0.15 },
  preacher_curls: { base: 'bench', ratio: 0.13 },
  cable_curls: { base: 'bench', ratio: 0.20 },
  tricep_extensions: { base: 'bench', ratio: 0.14 },
  skull_crushers: { base: 'bench', ratio: 0.30 },
  tricep_pushdown: { base: 'bench', ratio: 0.40 },
  tricep_kickback: { base: 'bench', ratio: 0.10 },
  // Legs secondary
  lunges: { base: 'squat', ratio: 0.30 },
  bulgarian_split_squat: { base: 'squat', ratio: 0.25 },
  step_up: { base: 'squat', ratio: 0.20 },
  leg_curl: { base: 'squat', ratio: 0.40 },
  leg_extension: { base: 'squat', ratio: 0.50 },
  calf_raises: { base: 'squat', ratio: 0.50 },
  seated_calf_raises: { base: 'squat', ratio: 0.40 },
  hip_thrust: { base: 'deadlift', ratio: 0.70 },
  glute_bridge: { base: 'deadlift', ratio: 0.40 },
  // Core (mostly bodyweight)
  cable_crunch: { base: 'row', ratio: 0.50 },
  weighted_decline_situp: { base: 'bench', ratio: 0.20 },
};

/** Beginner starting weights when **no strength test** has been taken yet.
 *  Anchored on bodyweight × level coefficient, then scaled by sex (female
 *  factor ~0.6 vs male). Caller can still override with their own input. */
function getBodyweightFallback(
  exerciseId: string,
  profile: StartingWeightProfile,
): number {
  const bw = profile.bodyweightKg ?? 70;
  const sexFactor = profile.sex === 'female' ? 0.6 : 1;
  const levelFactor = profile.trainingLevel === 'intermediate'
    ? 1.4
    : profile.trainingLevel === 'advanced' || profile.trainingLevel === 'expert'
      ? 1.8
      : 1; // beginner / undefined

  // Use the same multipliers as `SEED_MULTIPLIERS_M` for the 5 base lifts,
  // then apply the SECONDARY_RATIO table for derived exercises.
  const baseSeeds = {
    squat: bw * 0.45 * sexFactor * levelFactor,
    bench: bw * 0.35 * sexFactor * levelFactor,
    deadlift: bw * 0.70 * sexFactor * levelFactor,
    overheadPress: bw * 0.25 * sexFactor * levelFactor,
    row: bw * 0.35 * sexFactor * levelFactor,
  };

  // Try direct mapping first.
  const direct = getDirectMappedWeight(exerciseId, {
    ...baseSeeds,
    canPullUp: false,
  });
  if (direct > 0) return roundToPlate(direct);

  // Then secondary ratio — isolations get the dumbbell-friendly rounding
  // (1 kg increments below 10 kg) so we don't pre-fill 20 kg on lateral raises.
  const sec = SECONDARY_RATIO[exerciseId];
  if (sec) return roundToDumbbell(baseSeeds[sec.base] * sec.ratio);

  // Unknown exercise — keep 0 so the UI shows an empty input rather than a
  // wild guess.
  return 0;
}

/** Estimate the starting weight for a given exercise.
 *
 * Priority chain:
 *   1. Direct id → main-lift mapping (squat → weights.squat).
 *   2. Secondary ratio → e.g. bicep_curl = bench × 0.13.
 *   3. Bodyweight fallback when no strength test exists.
 *   4. 0 → user enters their own.
 *
 * The previous version returned 0 for ~60 of the 86 catalogued exercises;
 * with the secondary ratio table and bodyweight fallback we now cover the
 * vast majority of the catalogue (curl, leg curl, lateral raises, etc.).  */
export function getStartingWeightForExercise(
  exerciseId: string,
  weights?: StartingWeights,
  profile?: StartingWeightProfile,
): number {
  // 1) Strength-test-aware direct mapping
  if (weights) {
    const direct = getDirectMappedWeight(exerciseId, weights);
    if (direct > 0) return direct;

    // 2) Strength-test-aware secondary ratio (use dumbbell rounding —
    //    isolations shouldn't snap to a 20 kg floor).
    const sec = SECONDARY_RATIO[exerciseId];
    if (sec) return roundToDumbbell(weights[sec.base] * sec.ratio);
  }

  // 3) Profile-only fallback (no strength test taken yet)
  if (profile?.bodyweightKg) {
    return getBodyweightFallback(exerciseId, profile);
  }

  // 4) Nothing to base on
  return 0;
}
