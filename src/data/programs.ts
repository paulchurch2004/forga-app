import type { TrainingProgram, ProgramDay } from '../types/program';

// ============================================================================
// PROGRAMS V2 — sex-aware program library (TRAINING_PROGRAMS_SPEC §3)
//
// Reps and sets values below are the *base* template values. They are
// later overridden by applyObjectiveModifiers() in programEngine to
// match the user's objective (bulk / cut / maintain / recomp).
// ============================================================================

// ─── 3.1 FULL BODY HOMME (FB-H) — 3j/sem ───────────────────────────────────

const FB_H_A: ProgramDay = {
  id: 'fb_h_a',
  nameKey: 'programDayFullBodyA',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 8, restSeconds: 150 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 8, restSeconds: 150 },
    { exerciseId: 'squat', targetSets: 4, targetReps: 8, restSeconds: 150 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 9, restSeconds: 105 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 11, restSeconds: 60 },
    { exerciseId: 'plank', targetSets: 3, targetReps: 50, restSeconds: 60 },
  ],
};

const FB_H_B: ProgramDay = {
  id: 'fb_h_b',
  nameKey: 'programDayFullBodyB',
  type: 'muscu',
  muscleGroups: ['shoulders', 'back', 'legs', 'arms', 'core'],
  exercises: [
    { exerciseId: 'overhead_press', targetSets: 4, targetReps: 8, restSeconds: 150 },
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'tricep_extensions', targetSets: 3, targetReps: 11, restSeconds: 60 },
    { exerciseId: 'crunches', targetSets: 3, targetReps: 17, restSeconds: 60 },
  ],
};

const FB_H_C: ProgramDay = {
  id: 'fb_h_c',
  nameKey: 'programDayFullBodyC',
  type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'shoulders', 'arms', 'core'],
  exercises: [
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'incline_press', targetSets: 3, targetReps: 9, restSeconds: 105 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 11, restSeconds: 60 },
    { exerciseId: 'russian_twist', targetSets: 3, targetReps: 20, restSeconds: 60 },
  ],
};

// ─── 3.2 FULL BODY FEMME (FB-F) — 3j/sem, focus fessiers ──────────────────

const FB_F_A: ProgramDay = {
  id: 'fb_f_a',
  nameKey: 'programDayFullBodyFA',
  type: 'muscu',
  muscleGroups: ['legs', 'back', 'chest', 'core'],
  exercises: [
    { exerciseId: 'hip_thrust', targetSets: 4, targetReps: 10, restSeconds: 120 },
    { exerciseId: 'squat', targetSets: 4, targetReps: 9, restSeconds: 120 },
    { exerciseId: 'barbell_rows', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'bench_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'glute_bridge', targetSets: 3, targetReps: 17, restSeconds: 60 },
    { exerciseId: 'plank', targetSets: 3, targetReps: 50, restSeconds: 60 },
  ],
};

const FB_F_B: ProgramDay = {
  id: 'fb_f_b',
  nameKey: 'programDayFullBodyFB',
  type: 'muscu',
  muscleGroups: ['legs', 'back', 'shoulders', 'core'],
  exercises: [
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 9, restSeconds: 120 },
    { exerciseId: 'bulgarian_split_squat', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 4, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'crunches', targetSets: 3, targetReps: 17, restSeconds: 60 },
  ],
};

const FB_F_C: ProgramDay = {
  id: 'fb_f_c',
  nameKey: 'programDayFullBodyFC',
  type: 'muscu',
  muscleGroups: ['legs', 'back', 'chest', 'core'],
  exercises: [
    { exerciseId: 'hip_thrust', targetSets: 4, targetReps: 11, restSeconds: 120 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'pull_ups', targetSets: 3, targetReps: 9, restSeconds: 90 },
    { exerciseId: 'incline_db_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'cable_kickbacks', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'russian_twist', targetSets: 3, targetReps: 20, restSeconds: 60 },
  ],
};

// ─── 3.3 STRONGLIFTS 5×5 (homme bulk débutant uniquement) ──────────────────

const SL_A: ProgramDay = {
  id: 'sl_a',
  nameKey: 'programDay5x5A',
  type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back'],
  exercises: [
    { exerciseId: 'squat', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'bench_press', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'barbell_rows', targetSets: 5, targetReps: 5, restSeconds: 180 },
  ],
};

const SL_B: ProgramDay = {
  id: 'sl_b',
  nameKey: 'programDay5x5B',
  type: 'muscu',
  muscleGroups: ['legs', 'shoulders', 'back'],
  exercises: [
    { exerciseId: 'squat', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'overhead_press', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'deadlift', targetSets: 1, targetReps: 5, restSeconds: 180 },
  ],
};

// ─── 3.4 UPPER/LOWER HOMME (UL-H) — 4j/sem ─────────────────────────────────

const UL_H_UPPER_A: ProgramDay = {
  id: 'ul_h_upper_a',
  nameKey: 'programDayUpperA',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 7, restSeconds: 150 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 7, restSeconds: 150 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 9, restSeconds: 105 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 11, restSeconds: 60 },
    { exerciseId: 'tricep_extensions', targetSets: 3, targetReps: 11, restSeconds: 60 },
  ],
};

const UL_H_LOWER_A: ProgramDay = {
  id: 'ul_h_lower_a',
  nameKey: 'programDayLowerA',
  type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    { exerciseId: 'squat', targetSets: 4, targetReps: 7, restSeconds: 165 },
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 9, restSeconds: 120 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'plank', targetSets: 3, targetReps: 50, restSeconds: 60 },
  ],
};

const UL_H_UPPER_B: ProgramDay = {
  id: 'ul_h_upper_b',
  nameKey: 'programDayUpperB',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'incline_press', targetSets: 4, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 9, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'skull_crushers', targetSets: 3, targetReps: 12, restSeconds: 60 },
  ],
};

const UL_H_LOWER_B: ProgramDay = {
  id: 'ul_h_lower_b',
  nameKey: 'programDayLowerB',
  type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'leg_extension', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 17, restSeconds: 60 },
    { exerciseId: 'leg_raises', targetSets: 3, targetReps: 15, restSeconds: 60 },
  ],
};

// ─── 3.5 UPPER/LOWER FEMME (UL-F) — 4j/sem, focus fessiers ─────────────────

const UL_F_UPPER_A: ProgramDay = {
  id: 'ul_f_upper_a',
  nameKey: 'programDayUpperA',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 3, targetReps: 10, restSeconds: 105 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 10, restSeconds: 105 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 13, restSeconds: 75 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'bicep_curls', targetSets: 2, targetReps: 13, restSeconds: 60 },
  ],
};

const UL_F_LOWER_A: ProgramDay = {
  id: 'ul_f_lower_a',
  nameKey: 'programDayLowerAQuad',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'squat', targetSets: 4, targetReps: 9, restSeconds: 135 },
    { exerciseId: 'hip_thrust', targetSets: 4, targetReps: 11, restSeconds: 120 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 13, restSeconds: 90 },
    { exerciseId: 'bulgarian_split_squat', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'leg_extension', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 17, restSeconds: 60 },
  ],
};

const UL_F_UPPER_B: ProgramDay = {
  id: 'ul_f_upper_b',
  nameKey: 'programDayUpperB',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'incline_db_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'pull_ups', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'seated_db_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 2, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'tricep_extensions', targetSets: 2, targetReps: 13, restSeconds: 60 },
  ],
};

const UL_F_LOWER_B: ProgramDay = {
  id: 'ul_f_lower_b',
  nameKey: 'programDayLowerBGlute',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'hip_thrust', targetSets: 5, targetReps: 10, restSeconds: 120 },
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 11, restSeconds: 120 },
    { exerciseId: 'walking_lunges', targetSets: 3, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'cable_kickbacks', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'glute_bridge', targetSets: 3, targetReps: 17, restSeconds: 60 },
  ],
};

// ─── 3.6 PPL HOMME (PPL-H) — 6j/sem, rotation A/B ──────────────────────────

const PPL_H_PUSH_A: ProgramDay = {
  id: 'ppl_h_push_a',
  nameKey: 'programDayPushA',
  type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'overhead_press', targetSets: 4, targetReps: 6, restSeconds: 120 },
    { exerciseId: 'incline_press', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'dips', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'close_grip_bench', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 12, restSeconds: 60 },
  ],
};

const PPL_H_PULL_A: ProgramDay = {
  id: 'ppl_h_pull_a',
  nameKey: 'programDayPullA',
  type: 'muscu',
  muscleGroups: ['back', 'arms', 'shoulders'],
  exercises: [
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 6, restSeconds: 120 },
    { exerciseId: 'pull_ups', targetSets: 3, targetReps: 7, restSeconds: 120 },
    { exerciseId: 't_bar_row', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 8, restSeconds: 90 },
  ],
};

const PPL_H_LEGS_A: ProgramDay = {
  id: 'ppl_h_legs_a',
  nameKey: 'programDayLegsA',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'squat', targetSets: 5, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 6, restSeconds: 120 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'walking_lunges', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 10, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 8, restSeconds: 60 },
  ],
};

const PPL_H_PUSH_B: ProgramDay = {
  id: 'ppl_h_push_b',
  nameKey: 'programDayPushB',
  type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'incline_db_press', targetSets: 4, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'seated_db_press', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'cable_fly', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'lateral_raises', targetSets: 4, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'tricep_pushdown', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'overhead_tricep_extension', targetSets: 3, targetReps: 12, restSeconds: 60 },
  ],
};

const PPL_H_PULL_B: ProgramDay = {
  id: 'ppl_h_pull_b',
  nameKey: 'programDayPullB',
  type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 9, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 4, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'seated_cable_row', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'reverse_pec_deck', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'cable_curls', targetSets: 3, targetReps: 15, restSeconds: 60 },
  ],
};

const PPL_H_LEGS_B: ProgramDay = {
  id: 'ppl_h_legs_b',
  nameKey: 'programDayLegsB',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'leg_press', targetSets: 4, targetReps: 13, restSeconds: 90 },
    { exerciseId: 'bulgarian_split_squat', targetSets: 3, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'leg_extension', targetSets: 4, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'leg_curl', targetSets: 4, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 20, restSeconds: 60 },
  ],
};

// ─── 3.7 PPL FEMME (PPL-F) — 6j/sem, rotation + 2 Legs différenciés ────────

const PPL_F_PUSH_A: ProgramDay = {
  id: 'ppl_f_push_a',
  nameKey: 'programDayPushA',
  type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 7, restSeconds: 120 },
    { exerciseId: 'overhead_press', targetSets: 4, targetReps: 8, restSeconds: 105 },
    { exerciseId: 'incline_db_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'close_grip_bench', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 12, restSeconds: 60 },
  ],
};

const PPL_F_PULL_A: ProgramDay = {
  id: 'ppl_f_pull_a',
  nameKey: 'programDayPullA',
  type: 'muscu',
  muscleGroups: ['back', 'arms', 'shoulders'],
  exercises: [
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 7, restSeconds: 90 },
    { exerciseId: 't_bar_row', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 10, restSeconds: 60 },
  ],
};

const PPL_F_LEGS_QUAD: ProgramDay = {
  id: 'ppl_f_legs_quad',
  nameKey: 'programDayLegsQuad',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'squat', targetSets: 4, targetReps: 9, restSeconds: 135 },
    { exerciseId: 'leg_press', targetSets: 4, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'bulgarian_split_squat', targetSets: 3, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'walking_lunges', targetSets: 3, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'leg_extension', targetSets: 4, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 17, restSeconds: 60 },
  ],
};

const PPL_F_PUSH_B: ProgramDay = {
  id: 'ppl_f_push_b',
  nameKey: 'programDayPushB',
  type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'incline_db_press', targetSets: 4, targetReps: 11, restSeconds: 90 },
    { exerciseId: 'seated_db_press', targetSets: 3, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'cable_fly', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'lateral_raises', targetSets: 4, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'tricep_pushdown', targetSets: 3, targetReps: 15, restSeconds: 60 },
  ],
};

const PPL_F_PULL_B: ProgramDay = {
  id: 'ppl_f_pull_b',
  nameKey: 'programDayPullB',
  type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 9, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 4, targetReps: 12, restSeconds: 90 },
    { exerciseId: 'seated_cable_row', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'reverse_pec_deck', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 13, restSeconds: 60 },
  ],
};

const PPL_F_LEGS_GLUTE: ProgramDay = {
  id: 'ppl_f_legs_glute',
  nameKey: 'programDayLegsGlute',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'hip_thrust', targetSets: 5, targetReps: 10, restSeconds: 135 },
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 11, restSeconds: 120 },
    { exerciseId: 'sumo_deadlift', targetSets: 3, targetReps: 11, restSeconds: 120 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 13, restSeconds: 90 },
    { exerciseId: 'cable_kickbacks', targetSets: 4, targetReps: 13, restSeconds: 60 },
    { exerciseId: 'glute_bridge', targetSets: 3, targetReps: 17, restSeconds: 60 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 13, restSeconds: 60 },
  ],
};

// ─── Cardio templates ──────────────────────────────────────────────────────

const CARDIO_LISS: ProgramDay = {
  id: 'cardio_liss',
  nameKey: 'programDayCardioLiss',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'cycling', durationMinutes: 30, intensity: 'easy' },
};

const CARDIO_HIIT: ProgramDay = {
  id: 'cardio_hiit',
  nameKey: 'programDayCardioHiit',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'hiit', durationMinutes: 20, intensity: 'intense' },
};

// ─── PROGRAM DEFINITIONS ──────────────────────────────────────────────────

export const PROGRAMS: Record<string, TrainingProgram> = {
  // v2 — sex-aware
  full_body_h: {
    id: 'full_body_h',
    nameKey: 'programFullBody',
    descriptionKey: 'programFullBodyDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [FB_H_A, FB_H_B, FB_H_C],
    trainingSlots: [0, 2, 4],
    sexVariant: 'male',
    level: 'beginner',
  },
  full_body_f: {
    id: 'full_body_f',
    nameKey: 'programFullBody',
    descriptionKey: 'programFullBodyDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [FB_F_A, FB_F_B, FB_F_C],
    trainingSlots: [0, 2, 4],
    sexVariant: 'female',
    level: 'beginner',
  },
  upper_lower_h: {
    id: 'upper_lower_h',
    nameKey: 'programUpperLower',
    descriptionKey: 'programUpperLowerDesc',
    daysPerWeek: 4,
    levelKey: 'levelIntermediate',
    rotation: [UL_H_UPPER_A, UL_H_LOWER_A, UL_H_UPPER_B, UL_H_LOWER_B],
    trainingSlots: [0, 1, 3, 4],
    sexVariant: 'male',
    level: 'intermediate',
  },
  upper_lower_f: {
    id: 'upper_lower_f',
    nameKey: 'programUpperLower',
    descriptionKey: 'programUpperLowerDesc',
    daysPerWeek: 4,
    levelKey: 'levelIntermediate',
    rotation: [UL_F_UPPER_A, UL_F_LOWER_A, UL_F_UPPER_B, UL_F_LOWER_B],
    trainingSlots: [0, 1, 3, 4],
    sexVariant: 'female',
    level: 'intermediate',
  },
  ppl_h: {
    id: 'ppl_h',
    nameKey: 'programPPL',
    descriptionKey: 'programPPLDesc',
    daysPerWeek: 6,
    levelKey: 'levelAdvanced',
    rotation: [PPL_H_PUSH_A, PPL_H_PULL_A, PPL_H_LEGS_A, PPL_H_PUSH_B, PPL_H_PULL_B, PPL_H_LEGS_B],
    trainingSlots: [0, 1, 2, 3, 4, 5],
    sexVariant: 'male',
    level: 'advanced',
  },
  ppl_f: {
    id: 'ppl_f',
    nameKey: 'programPPL',
    descriptionKey: 'programPPLDesc',
    daysPerWeek: 6,
    levelKey: 'levelAdvanced',
    rotation: [PPL_F_PUSH_A, PPL_F_PULL_A, PPL_F_LEGS_QUAD, PPL_F_PUSH_B, PPL_F_PULL_B, PPL_F_LEGS_GLUTE],
    trainingSlots: [0, 1, 2, 3, 4, 5],
    sexVariant: 'female',
    level: 'advanced',
  },
  stronglifts_5x5: {
    id: 'stronglifts_5x5',
    nameKey: 'programStronglifts',
    descriptionKey: 'programStrongliftsDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [SL_A, SL_B],
    trainingSlots: [0, 2, 4],
    sexVariant: 'male',
    level: 'beginner',
  },

  // v1 legacy — same rotation as the male v2 variant for retro-compat
  full_body: {
    id: 'full_body',
    nameKey: 'programFullBody',
    descriptionKey: 'programFullBodyDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [FB_H_A, FB_H_B, FB_H_C],
    trainingSlots: [0, 2, 4],
    sexVariant: 'unisex',
    level: 'beginner',
  },
  upper_lower: {
    id: 'upper_lower',
    nameKey: 'programUpperLower',
    descriptionKey: 'programUpperLowerDesc',
    daysPerWeek: 4,
    levelKey: 'levelIntermediate',
    rotation: [UL_H_UPPER_A, UL_H_LOWER_A, UL_H_UPPER_B, UL_H_LOWER_B],
    trainingSlots: [0, 1, 3, 4],
    sexVariant: 'unisex',
    level: 'intermediate',
  },
  ppl: {
    id: 'ppl',
    nameKey: 'programPPL',
    descriptionKey: 'programPPLDesc',
    daysPerWeek: 6,
    levelKey: 'levelAdvanced',
    rotation: [PPL_H_PUSH_A, PPL_H_PULL_A, PPL_H_LEGS_A, PPL_H_PUSH_B, PPL_H_PULL_B, PPL_H_LEGS_B],
    trainingSlots: [0, 1, 2, 3, 4, 5],
    sexVariant: 'unisex',
    level: 'advanced',
  },
};

export const PROGRAM_IDS = [
  'full_body_h',
  'full_body_f',
  'upper_lower_h',
  'upper_lower_f',
  'ppl_h',
  'ppl_f',
  'stronglifts_5x5',
] as const;

export const CARDIO_DAYS = { liss: CARDIO_LISS, hiit: CARDIO_HIIT };

/** Resolve a v1 legacy id to its v2 equivalent for a given sex. */
export function resolveLegacyProgramId(id: string, sex: 'male' | 'female' = 'male'): string {
  const map: Record<string, [string, string]> = {
    full_body: ['full_body_h', 'full_body_f'],
    upper_lower: ['upper_lower_h', 'upper_lower_f'],
    ppl: ['ppl_h', 'ppl_f'],
  };
  const variants = map[id];
  if (!variants) return id;
  return sex === 'female' ? variants[1] : variants[0];
}

export function getProgramDayById(programId: string, dayId: string): ProgramDay | null {
  if (dayId === 'cardio_liss') return CARDIO_LISS;
  if (dayId === 'cardio_hiit') return CARDIO_HIIT;

  const program = PROGRAMS[programId];
  if (!program) return null;
  return program.rotation.find((d) => d.id === dayId) ?? null;
}
