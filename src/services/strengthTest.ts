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
      return weights.squat;
    case 'pause_squat':
      return roundToPlate(weights.squat * 0.85);
    case 'front_squat':
      // Front squat plus dur que back squat (chargement antérieur)
      return roundToPlate(weights.squat * 0.80);
    case 'hack_squat':
      // Machine, généralement on peut charger un peu plus
      return roundToPlate(weights.squat * 1.10);
    case 'leg_press':
      // Leg press = machine guidée, charge typiquement 1.5-2× back squat.
      // On reste conservateur à 1.5× pour pas pousser quelqu'un à un poids
      // qu'il ne maîtrise pas.
      return roundToPlate(weights.squat * 1.50);
    case 'goblet_squat':
      // Goblet squat = 1 haltère tenu devant la poitrine, limité par les bras
      return roundToDumbbell(weights.squat * 0.35);
    case 'bench_press':
      return weights.bench;
    // Variantes de bench → poids réduit (incline, close-grip, pause = plus dur
    // que le flat, donc on baisse). Les variantes haltères sont gérées via
    // SECONDARY_RATIO car la charge est PAR bras, pas totale.
    case 'incline_press':
    case 'pause_bench':
      return roundToPlate(weights.bench * 0.85);
    case 'close_grip_bench':
      return roundToPlate(weights.bench * 0.80);
    case 'deadlift':
      return weights.deadlift;
    case 'romanian_deadlift':
    case 'sumo_deadlift':
    case 'rack_pull':
      return roundToPlate(weights.deadlift * 0.90);
    case 'good_morning':
      return roundToPlate(weights.deadlift * 0.55);
    case 'overhead_press':
      return weights.overheadPress;
    case 'push_press':
      return roundToPlate(weights.overheadPress * 1.10); // push = plus de jambe = plus lourd
    case 'arnold_press':
      // Arnold press se fait toujours aux haltères, donc PAR bras
      return roundToDumbbell(weights.overheadPress * 0.50);
    case 'barbell_rows':
      return weights.row;
    case 't_bar_row':
    case 'pendlay_row':
      // Variantes barre, légèrement différentes mais charge proche
      return roundToPlate(weights.row * 0.95);
    case 'seated_cable_row':
      // Câble = assistance machine, on peut charger un peu plus
      return roundToPlate(weights.row * 1.10);
    case 'pull_ups':
      // Bodyweight movement — 0 means "use your own bodyweight", the UI
      // shows that as an assisted/normal pull-up rather than a load value.
      return 0;
    case 'lat_pulldown':
      return roundToPlate(weights.row * 0.85);
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
  // Chest secondary — TOUS les exercices haltères sont PAR bras donc ratio
  // beaucoup plus bas que la barre équivalente (ex: bench 60kg ≈ DB 22kg
  // chaque côté, pas 60kg).
  dumbbell_press: { base: 'bench', ratio: 0.45 },        // flat DB press, par bras
  incline_db_press: { base: 'bench', ratio: 0.40 },      // incliné DB, par bras (~85% du flat × 0.5)
  incline_dumbbell_press: { base: 'bench', ratio: 0.40 }, // alias
  decline_db_press: { base: 'bench', ratio: 0.45 },
  db_bench_press: { base: 'bench', ratio: 0.45 },         // alias commun
  dumbbell_fly: { base: 'bench', ratio: 0.18 },          // PAR bras
  chest_fly: { base: 'bench', ratio: 0.20 },
  cable_fly: { base: 'bench', ratio: 0.20 },
  incline_fly: { base: 'bench', ratio: 0.16 },           // incliné = plus dur
  pec_deck: { base: 'bench', ratio: 0.50 },              // machine, total
  push_up: { base: 'bench', ratio: 0 }, // bodyweight
  dips: { base: 'bench', ratio: 0 }, // bodyweight

  // Back secondary
  dumbbell_row: { base: 'row', ratio: 0.50 },            // PAR bras unilatéral
  one_arm_db_row: { base: 'row', ratio: 0.55 },          // unilatéral, on peut charger un peu plus
  meadows_row: { base: 'row', ratio: 0.50 },
  chest_supported_row: { base: 'row', ratio: 0.80 },     // machine ou T-bar avec support
  face_pulls: { base: 'row', ratio: 0.40 },
  cable_row: { base: 'row', ratio: 0.85 },
  straight_arm_pulldown: { base: 'row', ratio: 0.40 },
  shrugs: { base: 'deadlift', ratio: 0.35 },
  db_shrugs: { base: 'deadlift', ratio: 0.20 },          // PAR bras

  // Shoulders — variantes haltères PAR bras
  seated_db_press: { base: 'overheadPress', ratio: 0.50 },     // assis DB, par bras
  standing_db_press: { base: 'overheadPress', ratio: 0.45 },   // debout, plus dur
  db_shoulder_press: { base: 'overheadPress', ratio: 0.50 },   // alias

  // Shoulders secondary — couvre singulier + pluriel pour matcher
  // le catalog d'exercises (front_raise vs front_raises, etc.)
  lateral_raises: { base: 'overheadPress', ratio: 0.15 },      // PAR bras
  lateral_raise: { base: 'overheadPress', ratio: 0.15 },       // singulier
  db_lateral_raise: { base: 'overheadPress', ratio: 0.15 },    // alias
  cable_lateral: { base: 'overheadPress', ratio: 0.12 },
  front_raises: { base: 'overheadPress', ratio: 0.18 },
  front_raise: { base: 'overheadPress', ratio: 0.18 }, // singulier (catalog)
  rear_delt_fly: { base: 'overheadPress', ratio: 0.15 },
  rear_delt_raise: { base: 'overheadPress', ratio: 0.15 },
  reverse_pec_deck: { base: 'overheadPress', ratio: 0.50 }, // machine
  upright_rows: { base: 'overheadPress', ratio: 0.50 },
  upright_row: { base: 'overheadPress', ratio: 0.50 }, // singulier (catalog)

  // Arms — biceps (singulier + pluriel + variantes)
  bicep_curls: { base: 'bench', ratio: 0.13 },
  barbell_curl: { base: 'bench', ratio: 0.20 }, // catalog uses singular
  hammer_curls: { base: 'bench', ratio: 0.15 },
  preacher_curls: { base: 'bench', ratio: 0.13 },
  preacher_curl: { base: 'bench', ratio: 0.13 }, // singulier (catalog)
  concentration_curl: { base: 'bench', ratio: 0.10 }, // single arm, plus léger
  spider_curl: { base: 'bench', ratio: 0.12 },
  incline_db_curl: { base: 'bench', ratio: 0.12 },
  cable_curls: { base: 'bench', ratio: 0.20 },

  // Arms — triceps
  tricep_extensions: { base: 'bench', ratio: 0.14 },
  overhead_tricep_extension: { base: 'bench', ratio: 0.14 },
  skull_crushers: { base: 'bench', ratio: 0.30 },
  jm_press: { base: 'bench', ratio: 0.50 },
  tricep_pushdown: { base: 'bench', ratio: 0.40 },
  tricep_kickback: { base: 'bench', ratio: 0.10 },
  cable_kickbacks: { base: 'bench', ratio: 0.10 },

  // Legs secondary — couvre les variants pluriels du catalog
  lunges: { base: 'squat', ratio: 0.30 },
  walking_lunges: { base: 'squat', ratio: 0.25 }, // catalog
  bulgarian_split_squat: { base: 'squat', ratio: 0.25 },
  step_up: { base: 'squat', ratio: 0.20 },
  step_ups: { base: 'squat', ratio: 0.20 }, // catalog (pluriel)
  leg_curl: { base: 'squat', ratio: 0.40 },
  seated_leg_curl: { base: 'squat', ratio: 0.40 },
  leg_extension: { base: 'squat', ratio: 0.50 },
  calf_raises: { base: 'squat', ratio: 0.50 },
  seated_calf_raises: { base: 'squat', ratio: 0.40 },
  seated_calf_raise: { base: 'squat', ratio: 0.40 }, // singulier (catalog)
  hip_thrust: { base: 'deadlift', ratio: 0.70 },
  single_leg_hip_thrust: { base: 'deadlift', ratio: 0.30 }, // unilatéral
  pause_hip_thrust: { base: 'deadlift', ratio: 0.60 },
  cable_pull_through: { base: 'deadlift', ratio: 0.30 },
  glute_bridge: { base: 'deadlift', ratio: 0.40 },
  pistol_squat: { base: 'squat', ratio: 0 }, // bodyweight uniquement

  // Hips abductors
  abductor_machine: { base: 'squat', ratio: 0.40 },

  // Core (poids additionnel sur certains)
  cable_crunch: { base: 'row', ratio: 0.50 },
  weighted_decline_situp: { base: 'bench', ratio: 0.20 },
  weighted_crunch: { base: 'bench', ratio: 0.15 },
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
  // levelFactor ajusté : avant 1.0 / 1.4 / 1.8 → résultait à un
  // intermédiaire 70 kg avec bench=34 kg, ce qui est sous-évalué
  // (un inter type bench 60-70 kg). Nouveaux ratios calibrés sur les
  // standards strength training (Symmetric Strength, ExRx) pour les
  // charges de travail (working weight, pas 1RM) à 8-12 reps :
  //   - beginner : 1.0 (inchangé, pour qui n'a jamais soulevé)
  //   - intermediate : 1.8 (au lieu de 1.4)
  //   - advanced/expert : 2.5 (au lieu de 1.8)
  const levelFactor = profile.trainingLevel === 'intermediate'
    ? 1.8
    : profile.trainingLevel === 'advanced' || profile.trainingLevel === 'expert'
      ? 2.5
      : 1; // beginner / undefined

  // Multiplicateurs base lift calibrés sur les standards strength
  // training pour des working weights à 8-12 reps (≈ 70% du 1RM
  // estimé). Avant : bench 0.35 et OHP 0.25 → trop léger pour un
  // débutant homme moyen (0.35×70 = 24 kg = quasi barre vide).
  const baseSeeds = {
    squat: bw * 0.50 * sexFactor * levelFactor,
    bench: bw * 0.40 * sexFactor * levelFactor,
    deadlift: bw * 0.75 * sexFactor * levelFactor,
    overheadPress: bw * 0.28 * sexFactor * levelFactor,
    row: bw * 0.40 * sexFactor * levelFactor,
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

/**
 * Estime le 1RM d'un user pour un exercice, par ordre de fiabilité :
 *   1. 1RM Epley vivant (`oneRepMaxByExercise[id]`) — calculé à partir
 *      des vrais sets de l'user dans l'app. Le + à jour.
 *   2. 1RM connu déclaré au test de calibration (`strengthTest.answers.knownXKg`).
 *      Mapping : bench_press → knownBenchKg, squat → knownSquatKg,
 *      deadlift → knownDeadliftKg. Le user a tapé son vrai max.
 *   3. Working weight du test ÷ 0.65 = 1RM estimé. La formule du test
 *      pose `working = 1RM × 0.65`, on inverse pour récupérer le 1RM.
 *   4. 0 si rien — caller doit fall back au seed bodyweight.
 *
 * Utilisé par les programmes qui ont besoin d'un 1RM précis (5/3/1 où
 * top set = 85% TM = 76.5% 1RM, et BBB = 60% TM = 54% 1RM).
 */
export function estimateOneRMForExercise(
  exerciseId: string,
  strengthTest: StrengthTestResult | null | undefined,
  oneRepMaxByExercise: Record<string, { value: number }> | null | undefined,
): number {
  // 1) Live 1RM via Epley sur les vrais sets passés
  const live = oneRepMaxByExercise?.[exerciseId]?.value ?? 0;
  if (live > 0) return live;

  if (!strengthTest) return 0;

  // 2) 1RM déclaré au test de calibration
  const a = strengthTest.answers ?? {};
  if (exerciseId === 'bench_press' || exerciseId === 'pause_bench_press' || exerciseId === 'close_grip_bench') {
    if (a.knownBenchKg && a.knownBenchKg > 0) return a.knownBenchKg;
  }
  if (exerciseId === 'squat' || exerciseId === 'pause_squat' || exerciseId === 'front_squat' || exerciseId === 'high_bar_squat') {
    if (a.knownSquatKg && a.knownSquatKg > 0) return a.knownSquatKg;
  }
  if (exerciseId === 'deadlift' || exerciseId === 'romanian_deadlift' || exerciseId === 'sumo_deadlift' || exerciseId === 'rdl') {
    if (a.knownDeadliftKg && a.knownDeadliftKg > 0) return a.knownDeadliftKg;
  }

  // 3) Dérivation depuis le working weight du test (1RM ≈ working / 0.65)
  const sw = strengthTest.startingWeights;
  if (sw) {
    if (exerciseId === 'bench_press' && sw.bench > 0) return Math.round(sw.bench / 0.65);
    if (exerciseId === 'squat' && sw.squat > 0) return Math.round(sw.squat / 0.65);
    if (exerciseId === 'deadlift' && sw.deadlift > 0) return Math.round(sw.deadlift / 0.65);
    if (exerciseId === 'overhead_press' && sw.overheadPress > 0) return Math.round(sw.overheadPress / 0.65);
  }

  return 0;
}

/**
 * Renvoie le working weight pour N reps via la formule Epley inversée :
 *   working = 1RM × (1 - reps/30)
 *
 * Concrètement :
 *   - 5 reps  → 83% 1RM
 *   - 8 reps  → 73% 1RM
 *   - 10 reps → 67% 1RM
 *   - 12 reps → 60% 1RM
 *
 * Sans cette dérivation, on prenait le `working` du test (calibré à 5 reps)
 * tel quel pour des sets à 10 reps → poids trop lourd, l'user n'atteint
 * jamais la cible et stagne. Avec : on ajuste automatiquement selon les
 * reps prescrites du programme.
 */
export function workingWeightForReps(oneRM: number, reps: number): number {
  // Guard NaN/Infinity : si oneRM vient d'un calcul amont (ex: epley sur
  // un poids/reps user-entered corrompus), il peut être NaN. Math.round(NaN)
  // = NaN qui contamine ensuite tout l'UI (poids affiché "NaN kg").
  if (!Number.isFinite(oneRM) || !Number.isFinite(reps) || oneRM <= 0 || reps <= 0) return 0;
  // On laisse une marge de sécurité 2-3 RIR : 1RM × (1 - (reps+2)/30)
  // 5 reps cible → on charge comme si on devait faire 7 reps (= 77% 1RM)
  // 10 reps cible → on charge comme si 12 reps (= 60% 1RM)
  // Ça laisse le user à RIR 2 sur le dernier set, conforme à la spec
  // TRAINING_PROGRAMS_SPEC.md §A.3 (RIR 1-3 sur compounds).
  const adjustedReps = reps + 2;
  const pct = Math.max(0.4, 1 - adjustedReps / 30);
  return Math.round(oneRM * pct * 2) / 2;
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
    if (sec) {
      const baseVal = weights[sec.base];
      // Avant : on retournait directement le résultat même si baseVal=0
      // (cas edge où une charge calibrée serait à 0) → poids 0 affiché.
      // Maintenant on fall-through au bodyweight fallback si baseVal
      // n'est pas exploitable.
      if (typeof baseVal === 'number' && baseVal > 0) {
        const seed = roundToDumbbell(baseVal * sec.ratio);
        if (seed > 0) return seed;
      }
    }
  }

  // 3) Profile-only fallback (no strength test exists OU strength test
  //    avec des charges = 0). On essaie toujours ce path en plus du
  //    weights path → robustesse.
  if (profile?.bodyweightKg) {
    const bwResult = getBodyweightFallback(exerciseId, profile);
    if (bwResult > 0) return bwResult;
  }

  // 4) Heuristique de dernier recours pour les exercices qui ne sont
  //    dans aucun mapping. Avant ce filet de sécurité on retournait 0
  //    → champ poids vide en début de séance → l'user n'avait aucune
  //    indication. Maintenant on propose un poids conservateur basé
  //    sur le pattern de l'ID (curl/extension/press/raise/etc.).
  //    Marche aussi sans strengthTest grâce au profile bodyweight.
  if (profile?.bodyweightKg) {
    const bw = profile.bodyweightKg;
    const sexFactor = profile.sex === 'female' ? 0.6 : 1;
    const levelFactor = profile.trainingLevel === 'intermediate'
      ? 1.4
      : profile.trainingLevel === 'advanced' || profile.trainingLevel === 'expert'
        ? 1.8
        : 1;

    const id = exerciseId.toLowerCase();

    // Détection haltères : si l'exo contient db/dumbbell, la charge est
    // PAR bras donc ~50% du total barbell. Sans ce facteur on suggérait
    // 62.5 kg par haltère pour quelqu'un qui benchait 62.5 kg à la barre.
    const isDumbbell = /\b(db|dumbbell|alt[eè]re|haltere)\b/.test(id) || id.includes('_db_') || id.startsWith('db_');
    const dbFactor = isDumbbell ? 0.5 : 1;

    // Patterns de noms d'exercices → estimation conservatrice
    // (% du poids du corps × facteur sexe × facteur niveau × facteur haltères).
    if (id.includes('curl')) return roundToDumbbell(bw * 0.08 * sexFactor * levelFactor * dbFactor);
    if (id.includes('extension') || id.includes('kickback')) {
      return roundToDumbbell(bw * 0.10 * sexFactor * levelFactor * dbFactor);
    }
    if (id.includes('raise') || id.includes('fly')) {
      return roundToDumbbell(bw * 0.08 * sexFactor * levelFactor * dbFactor);
    }
    if (id.includes('press')) return roundToDumbbell(bw * 0.30 * sexFactor * levelFactor * dbFactor);
    if (id.includes('row') || id.includes('pulldown')) {
      return roundToDumbbell(bw * 0.30 * sexFactor * levelFactor * dbFactor);
    }
    if (id.includes('squat') || id.includes('lunge') || id.includes('hip')) {
      return roundToDumbbell(bw * 0.40 * sexFactor * levelFactor * dbFactor);
    }
    if (id.includes('calf')) return roundToDumbbell(bw * 0.30 * sexFactor * levelFactor * dbFactor);
    if (id.includes('crunch') || id.includes('sit')) {
      return roundToDumbbell(bw * 0.10 * sexFactor * levelFactor);
    }
  }

  // 5) Vraiment rien (cardio, bodyweight pur, pas de profile) — 0
  //    laissera la séance afficher une indication "à toi de jouer".
  return 0;
}
