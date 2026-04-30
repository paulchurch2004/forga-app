import type { TrainingProgram, ProgramDay, ProgramExercise } from '../types/program';

// ============================================================================
// FORGA — 16 PROGRAMS LIBRARY (v3)
// Built from 16programmes.md spec.
//
// Each program is fully calibrated (sets / reps / rest) for its intended
// objective and level — no runtime modifier needed. ProgramDay.nameKey holds
// the FR display label directly (i18n fallback returns the key as-is).
// ============================================================================

const ex = (
  exerciseId: string,
  targetSets: number,
  targetReps: number,
  restSeconds: number,
): ProgramExercise => ({ exerciseId, targetSets, targetReps, restSeconds });

// ── Cardio days (kept for plan generator) ────────────────────────────────────
const CARDIO_LISS: ProgramDay = {
  id: 'cardio_liss',
  nameKey: 'programDayCardioLiss',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'cycling', durationMinutes: 30, intensity: 'low' },
};
const CARDIO_HIIT: ProgramDay = {
  id: 'cardio_hiit',
  nameKey: 'programDayCardioHiit',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'hiit', durationMinutes: 20, intensity: 'high' },
};

// =============================================================================
// 01. BULK_DEB_3D_FB — Bulk Débutant 3j Full Body
// =============================================================================
const D01_A: ProgramDay = {
  id: 'bulk_deb_3d_fb_a', nameKey: 'Full Body A', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'arms', 'core'],
  exercises: [
    ex('squat', 3, 7, 150),
    ex('bench_press', 3, 7, 150),
    ex('barbell_rows', 3, 8, 120),
    ex('overhead_press', 2, 10, 90),
    ex('barbell_curl', 2, 11, 60),
    ex('plank', 2, 40, 60),
  ],
};
const D01_B: ProgramDay = {
  id: 'bulk_deb_3d_fb_b', nameKey: 'Full Body B', type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'arms', 'core'],
  exercises: [
    ex('deadlift', 3, 5, 180),
    ex('incline_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 8, 120),
    ex('lunges', 2, 10, 90),
    ex('tricep_pushdown', 2, 11, 60),
    ex('hanging_leg_raise', 2, 10, 60),
  ],
};
const D01_C: ProgramDay = {
  id: 'bulk_deb_3d_fb_c', nameKey: 'Full Body C', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'arms', 'core'],
  exercises: [
    ex('front_squat', 3, 7, 150),
    ex('bench_press', 3, 9, 120),
    ex('seated_cable_row', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('hammer_curls', 2, 11, 60),
    ex('russian_twist', 2, 30, 60),
  ],
};

// =============================================================================
// 02. BULK_DEB_4D_UL — Bulk Débutant 4j Upper/Lower
// =============================================================================
const D02_UA: ProgramDay = {
  id: 'bulk_deb_4d_ul_upper_a', nameKey: 'Upper A — Push', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'back', 'arms'],
  exercises: [
    ex('bench_press', 4, 6, 150),
    ex('overhead_press', 3, 7, 120),
    ex('barbell_rows', 3, 7, 120),
    ex('lat_pulldown', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('tricep_pushdown', 2, 11, 60),
  ],
};
const D02_LA: ProgramDay = {
  id: 'bulk_deb_4d_ul_lower_a', nameKey: 'Lower A — Squat', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 4, 6, 180),
    ex('romanian_deadlift', 3, 8, 120),
    ex('leg_press', 3, 11, 120),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
    ex('plank', 3, 45, 45),
  ],
};
const D02_UB: ProgramDay = {
  id: 'bulk_deb_4d_ul_upper_b', nameKey: 'Upper B — Pull', type: 'muscu',
  muscleGroups: ['back', 'chest', 'shoulders', 'arms'],
  exercises: [
    ex('pull_ups', 4, 7, 120),
    ex('incline_db_press', 4, 9, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('seated_db_press', 3, 9, 90),
    ex('barbell_curl', 3, 11, 60),
    ex('face_pulls', 3, 13, 45),
  ],
};
const D02_LB: ProgramDay = {
  id: 'bulk_deb_4d_ul_lower_b', nameKey: 'Lower B — Posterior', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('deadlift', 3, 5, 180),
    ex('front_squat', 3, 8, 120),
    ex('hip_thrust', 4, 10, 90),
    ex('walking_lunges', 3, 10, 90),
    ex('seated_calf_raise', 3, 13, 60),
    ex('cable_crunch', 3, 13, 60),
  ],
};

// =============================================================================
// 03. BULK_INT_4D_PHUL — Bulk Intermédiaire 4j PHUL
// =============================================================================
const D03_UP: ProgramDay = {
  id: 'bulk_int_4d_phul_upper_power', nameKey: 'Upper Power', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 4, 240),
    ex('incline_db_press', 3, 8, 120),
    ex('barbell_rows', 4, 4, 240),
    ex('pull_ups', 3, 8, 120),
    ex('seated_db_press', 3, 8, 120),
    ex('barbell_curl', 3, 8, 90),
    ex('skull_crushers', 3, 8, 90),
  ],
};
const D03_LP: ProgramDay = {
  id: 'bulk_int_4d_phul_lower_power', nameKey: 'Lower Power', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 4, 240),
    ex('deadlift', 3, 4, 240),
    ex('leg_press', 5, 12, 120),
    ex('romanian_deadlift', 3, 8, 120),
    ex('calf_raises', 4, 8, 90),
  ],
};
const D03_UH: ProgramDay = {
  id: 'bulk_int_4d_phul_upper_hyper', nameKey: 'Upper Hypertrophy', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_press', 4, 10, 90),
    ex('cable_fly', 3, 13, 60),
    ex('lat_pulldown', 4, 10, 90),
    ex('seated_cable_row', 4, 13, 90),
    ex('lateral_raises', 4, 13, 60),
    ex('cable_curls', 3, 10, 60),
    ex('overhead_tricep_extension', 3, 10, 60),
  ],
};
const D03_LH_M: ProgramDay = {
  id: 'bulk_int_4d_phul_lower_hyper_m', nameKey: 'Lower Hypertrophy (H — quads)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 10, 120),
    ex('hack_squat', 4, 13, 120),
    ex('leg_extension', 3, 13, 60),
    ex('romanian_deadlift', 3, 10, 90),
    ex('leg_curl', 3, 13, 60),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};
const D03_LH_F: ProgramDay = {
  id: 'bulk_int_4d_phul_lower_hyper_f', nameKey: 'Lower Hypertrophy (F — fessiers)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 9, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('romanian_deadlift', 4, 9, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('abductor_machine', 3, 17, 45),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 04. BULK_INT_5D_UL_PPL — Bulk Intermédiaire 5j UL+PPL hybride
// =============================================================================
const D04_U: ProgramDay = {
  id: 'bulk_int_5d_upper', nameKey: 'Upper', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 7, 150),
    ex('barbell_rows', 4, 7, 150),
    ex('seated_db_press', 3, 9, 90),
    ex('pull_ups', 3, 10, 120),
    ex('lateral_raises', 3, 13, 60),
    ex('barbell_curl', 3, 10, 60),
    ex('tricep_pushdown', 3, 11, 60),
  ],
};
const D04_L: ProgramDay = {
  id: 'bulk_int_5d_lower', nameKey: 'Lower', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 4, 8, 120),
    ex('leg_press', 3, 11, 120),
    ex('hip_thrust', 3, 11, 90),
    ex('leg_curl', 3, 11, 60),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D04_PUSH: ProgramDay = {
  id: 'bulk_int_5d_push', nameKey: 'Push (volume)', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 10, 90),
    ex('seated_db_press', 3, 10, 90),
    ex('cable_fly', 3, 13, 60),
    ex('cable_lateral', 4, 13, 60),
    ex('skull_crushers', 3, 10, 60),
    ex('overhead_tricep_extension', 3, 11, 60),
  ],
};
const D04_PULL: ProgramDay = {
  id: 'bulk_int_5d_pull', nameKey: 'Pull (volume)', type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    ex('t_bar_row', 4, 8, 120),
    ex('lat_pulldown', 4, 10, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('face_pulls', 3, 13, 45),
    ex('hammer_curls', 3, 11, 60),
    ex('incline_db_curl', 3, 11, 60),
  ],
};
const D04_LEGS_M: ProgramDay = {
  id: 'bulk_int_5d_legs_m', nameKey: 'Legs (H — volume)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('front_squat', 4, 7, 150),
    ex('hack_squat', 4, 11, 120),
    ex('leg_extension', 3, 13, 60),
    ex('seated_leg_curl', 4, 11, 90),
    ex('seated_calf_raise', 4, 13, 60),
    ex('hanging_leg_raise', 3, 10, 60),
  ],
};
const D04_LEGS_F: ProgramDay = {
  id: 'bulk_int_5d_legs_f', nameKey: 'Legs (F — fessiers)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 9, 90),
    ex('sumo_deadlift', 3, 9, 120),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('abductor_machine', 3, 13, 45),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 05. BULK_INT_6D_PPL — Bulk Intermédiaire 6j PPL ×2
// =============================================================================
const D05_PUSH_A: ProgramDay = {
  id: 'bulk_int_6d_push_a', nameKey: 'Push A', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 7, 150),
    ex('incline_db_press', 3, 10, 90),
    ex('overhead_press', 3, 8, 120),
    ex('lateral_raises', 4, 13, 60),
    ex('tricep_pushdown', 3, 11, 60),
    ex('overhead_tricep_extension', 3, 11, 60),
  ],
};
const D05_PULL_A: ProgramDay = {
  id: 'bulk_int_6d_pull_a', nameKey: 'Pull A', type: 'muscu',
  muscleGroups: ['back', 'arms', 'shoulders'],
  exercises: [
    ex('pull_ups', 4, 8, 120),
    ex('barbell_rows', 4, 7, 120),
    ex('lat_pulldown', 3, 11, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('face_pulls', 3, 13, 45),
    ex('barbell_curl', 3, 9, 60),
    ex('hammer_curls', 3, 11, 60),
  ],
};
const D05_LEGS_A_M: ProgramDay = {
  id: 'bulk_int_6d_legs_a_m', nameKey: 'Legs A (H)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 3, 9, 120),
    ex('leg_press', 3, 11, 120),
    ex('walking_lunges', 3, 10, 90),
    ex('leg_curl', 4, 11, 90),
    ex('calf_raises', 5, 10, 60),
  ],
};
const D05_LEGS_A_F: ProgramDay = {
  id: 'bulk_int_6d_legs_a_f', nameKey: 'Legs A (F — fessiers)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 7, 120),
    ex('romanian_deadlift', 4, 9, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('leg_curl', 3, 11, 60),
    ex('abductor_machine', 3, 17, 45),
  ],
};
const D05_PUSH_B: ProgramDay = {
  id: 'bulk_int_6d_push_b', nameKey: 'Push B', type: 'muscu',
  muscleGroups: ['shoulders', 'chest', 'arms'],
  exercises: [
    ex('seated_db_press', 4, 8, 120),
    ex('incline_press', 4, 10, 90),
    ex('cable_fly', 3, 13, 60),
    ex('front_raise', 3, 11, 60),
    ex('cable_lateral', 3, 13, 60),
    ex('skull_crushers', 3, 10, 60),
    ex('dips', 3, 9, 90),
  ],
};
const D05_PULL_B: ProgramDay = {
  id: 'bulk_int_6d_pull_b', nameKey: 'Pull B', type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    ex('deadlift', 3, 5, 180),
    ex('t_bar_row', 4, 9, 90),
    ex('pull_ups', 3, 10, 90),
    ex('seated_cable_row', 3, 11, 60),
    ex('incline_db_curl', 3, 11, 60),
    ex('spider_curl', 3, 11, 60),
    ex('shrugs', 3, 13, 45),
  ],
};
const D05_LEGS_B_M: ProgramDay = {
  id: 'bulk_int_6d_legs_b_m', nameKey: 'Legs B (H — ischios)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('front_squat', 4, 7, 150),
    ex('romanian_deadlift', 4, 9, 90),
    ex('hack_squat', 3, 11, 120),
    ex('leg_extension', 3, 13, 60),
    ex('seated_leg_curl', 4, 11, 90),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};
const D05_LEGS_B_F: ProgramDay = {
  id: 'bulk_int_6d_legs_b_f', nameKey: 'Legs B (F — volume fessiers)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('sumo_deadlift', 4, 7, 120),
    ex('single_leg_hip_thrust', 3, 10, 90),
    ex('walking_lunges', 3, 12, 90),
    ex('cable_pull_through', 3, 13, 60),
    ex('abductor_machine', 3, 18, 45),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 06. BULK_AVA_4D_531 — Bulk Avancé 4j 5/3/1 BBB (Week 1 baseline displayed)
// =============================================================================
const D06_BENCH: ProgramDay = {
  id: 'bulk_ava_4d_531_bench', nameKey: 'Bench Day (5/3/1)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 5, 180),
    ex('bench_press', 5, 10, 90),
    ex('t_bar_row', 5, 10, 90),
    ex('lateral_raises', 4, 13, 60),
    ex('tricep_pushdown', 3, 11, 60),
  ],
};
const D06_SQUAT: ProgramDay = {
  id: 'bulk_ava_4d_531_squat', nameKey: 'Squat Day (5/3/1)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 3, 5, 240),
    ex('squat', 5, 10, 120),
    ex('leg_curl', 5, 10, 90),
    ex('calf_raises', 4, 12, 60),
    ex('hanging_leg_raise', 3, 10, 60),
  ],
};
const D06_OHP: ProgramDay = {
  id: 'bulk_ava_4d_531_ohp', nameKey: 'OHP Day (5/3/1)', type: 'muscu',
  muscleGroups: ['shoulders', 'back', 'arms'],
  exercises: [
    ex('overhead_press', 3, 5, 180),
    ex('overhead_press', 5, 10, 90),
    ex('pull_ups', 5, 9, 90),
    ex('barbell_curl', 4, 11, 60),
    ex('face_pulls', 3, 13, 45),
  ],
};
const D06_DEAD: ProgramDay = {
  id: 'bulk_ava_4d_531_deadlift', nameKey: 'Deadlift Day (5/3/1)', type: 'muscu',
  muscleGroups: ['back', 'legs'],
  exercises: [
    ex('deadlift', 3, 5, 240),
    ex('deadlift', 5, 10, 150),
    ex('front_squat', 3, 8, 120),
    ex('hip_thrust', 4, 10, 90),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};

// =============================================================================
// 07. CUT_DEB_3D_FB — Cut Débutant 3j Full Body
// =============================================================================
const D07_A: ProgramDay = {
  id: 'cut_deb_3d_fb_a', nameKey: 'Full Body A', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'arms', 'core'],
  exercises: [
    ex('squat', 3, 7, 150),
    ex('bench_press', 3, 7, 150),
    ex('barbell_rows', 3, 8, 120),
    ex('seated_db_press', 2, 10, 90),
    ex('barbell_curl', 2, 11, 60),
    ex('plank', 2, 40, 45),
  ],
};
const D07_B: ProgramDay = {
  id: 'cut_deb_3d_fb_b', nameKey: 'Full Body B', type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'shoulders', 'core'],
  exercises: [
    ex('romanian_deadlift', 3, 7, 150),
    ex('incline_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 10, 120),
    ex('lunges', 2, 10, 90),
    ex('lateral_raises', 2, 13, 60),
    ex('weighted_crunch', 2, 13, 45),
  ],
};
const D07_C: ProgramDay = {
  id: 'cut_deb_3d_fb_c', nameKey: 'Full Body C', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'arms', 'core'],
  exercises: [
    ex('front_squat', 3, 8, 120),
    ex('bench_press', 3, 9, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('hip_thrust', 3, 11, 90),
    ex('hammer_curls', 2, 11, 60),
    ex('russian_twist', 2, 30, 45),
  ],
};

// =============================================================================
// 08. CUT_DEB_4D_UL — Cut Débutant 4j Upper/Lower
// =============================================================================
const D08_UA: ProgramDay = {
  id: 'cut_deb_4d_ul_upper_a', nameKey: 'Upper A', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 7, 150),
    ex('barbell_rows', 3, 7, 120),
    ex('seated_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 11, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('tricep_pushdown', 3, 11, 60),
  ],
};
const D08_LA: ProgramDay = {
  id: 'cut_deb_4d_ul_lower_a', nameKey: 'Lower A', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 3, 7, 150),
    ex('romanian_deadlift', 3, 9, 120),
    ex('leg_press', 3, 11, 90),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
    ex('plank', 3, 40, 45),
  ],
};
const D08_UB: ProgramDay = {
  id: 'cut_deb_4d_ul_upper_b', nameKey: 'Upper B', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 3, 9, 90),
    ex('pull_ups', 3, 10, 120),
    ex('seated_cable_row', 3, 11, 90),
    ex('seated_db_press', 3, 11, 90),
    ex('barbell_curl', 2, 11, 60),
    ex('tricep_pushdown', 2, 11, 60),
  ],
};
const D08_LB: ProgramDay = {
  id: 'cut_deb_4d_ul_lower_b', nameKey: 'Lower B', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('front_squat', 3, 8, 120),
    ex('hip_thrust', 3, 11, 90),
    ex('walking_lunges', 3, 10, 90),
    ex('leg_extension', 3, 13, 60),
    ex('seated_calf_raise', 3, 13, 60),
    ex('cable_crunch', 3, 13, 60),
  ],
};

// =============================================================================
// 09. CUT_INT_4D_UL — Cut Intermédiaire 4j Upper/Lower volume modéré
// =============================================================================
const D09_UP: ProgramDay = {
  id: 'cut_int_4d_ul_upper_power', nameKey: 'Upper Power', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 5, 180),
    ex('barbell_rows', 4, 7, 150),
    ex('overhead_press', 3, 7, 120),
    ex('pull_ups', 3, 8, 120),
    ex('lateral_raises', 3, 13, 60),
    ex('barbell_curl', 3, 9, 60),
  ],
};
const D09_LP_M: ProgramDay = {
  id: 'cut_int_4d_ul_lower_power_m', nameKey: 'Lower Power (H)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 4, 5, 210),
    ex('romanian_deadlift', 4, 7, 120),
    ex('leg_press', 3, 10, 120),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 10, 60),
    ex('hanging_leg_raise', 3, 10, 60),
  ],
};
const D09_LP_F: ProgramDay = {
  id: 'cut_int_4d_ul_lower_power_f', nameKey: 'Lower Power (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 7, 150),
    ex('romanian_deadlift', 4, 7, 120),
    ex('bulgarian_split_squat', 3, 9, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D09_UH: ProgramDay = {
  id: 'cut_int_4d_ul_upper_hyper', nameKey: 'Upper Hypertrophy', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders'],
  exercises: [
    ex('incline_db_press', 3, 10, 90),
    ex('lat_pulldown', 3, 11, 90),
    ex('cable_fly', 3, 13, 60),
    ex('seated_cable_row', 3, 11, 60),
    ex('seated_db_press', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
  ],
};
const D09_LH_M: ProgramDay = {
  id: 'cut_int_4d_ul_lower_hyper_m', nameKey: 'Lower Hypertrophy (H)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('front_squat', 3, 9, 120),
    ex('hack_squat', 3, 11, 120),
    ex('leg_extension', 3, 13, 60),
    ex('seated_leg_curl', 3, 11, 90),
    ex('hip_thrust', 3, 11, 90),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};
const D09_LH_F: ProgramDay = {
  id: 'cut_int_4d_ul_lower_hyper_f', nameKey: 'Lower Hypertrophy (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('sumo_deadlift', 3, 9, 120),
    ex('single_leg_hip_thrust', 3, 10, 90),
    ex('walking_lunges', 3, 12, 90),
    ex('cable_pull_through', 3, 13, 60),
    ex('abductor_machine', 3, 18, 60),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 10. CUT_INT_5D_PPL_UL — Cut Intermédiaire 5j PPL/UL hybride
// =============================================================================
const D10_U: ProgramDay = {
  id: 'cut_int_5d_upper', nameKey: 'Upper', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders'],
  exercises: [
    ex('bench_press', 4, 7, 150),
    ex('t_bar_row', 4, 7, 120),
    ex('seated_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 11, 90),
    ex('lateral_raises', 3, 13, 60),
  ],
};
const D10_L: ProgramDay = {
  id: 'cut_int_5d_lower', nameKey: 'Lower', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 3, 7, 120),
    ex('leg_press', 3, 11, 120),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D10_PUSH: ProgramDay = {
  id: 'cut_int_5d_push', nameKey: 'Push (volume)', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 10, 90),
    ex('cable_fly', 3, 13, 60),
    ex('seated_db_press', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('tricep_pushdown', 3, 11, 60),
    ex('skull_crushers', 2, 11, 60),
  ],
};
const D10_PULL: ProgramDay = {
  id: 'cut_int_5d_pull', nameKey: 'Pull (volume)', type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    ex('pull_ups', 4, 8, 120),
    ex('seated_cable_row', 3, 11, 90),
    ex('barbell_rows', 3, 11, 60),
    ex('face_pulls', 3, 13, 45),
    ex('barbell_curl', 3, 9, 60),
    ex('hammer_curls', 2, 11, 60),
  ],
};
const D10_LEGS_M: ProgramDay = {
  id: 'cut_int_5d_legs_m', nameKey: 'Legs (H — volume modéré)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('front_squat', 3, 8, 120),
    ex('hack_squat', 3, 11, 120),
    ex('leg_extension', 3, 13, 60),
    ex('leg_curl', 3, 11, 90),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};
const D10_LEGS_F: ProgramDay = {
  id: 'cut_int_5d_legs_f', nameKey: 'Legs (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 9, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('seated_leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 11. RECOMP_DEB_3D_FB — Recomp Débutant 3j Full Body
// =============================================================================
const D11_A: ProgramDay = {
  id: 'recomp_deb_3d_fb_a', nameKey: 'Full Body A', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'arms', 'core'],
  exercises: [
    ex('squat', 3, 7, 150),
    ex('bench_press', 3, 7, 150),
    ex('barbell_rows', 3, 8, 120),
    ex('seated_db_press', 2, 10, 90),
    ex('barbell_curl', 2, 11, 60),
    ex('plank', 2, 40, 60),
  ],
};
const D11_B: ProgramDay = {
  id: 'recomp_deb_3d_fb_b', nameKey: 'Full Body B', type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'arms', 'core'],
  exercises: [
    ex('romanian_deadlift', 3, 7, 150),
    ex('incline_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 10, 120),
    ex('lunges', 2, 10, 90),
    ex('tricep_pushdown', 2, 11, 60),
    ex('hanging_leg_raise', 2, 10, 60),
  ],
};
const D11_C: ProgramDay = {
  id: 'recomp_deb_3d_fb_c', nameKey: 'Full Body C', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'core'],
  exercises: [
    ex('front_squat', 3, 7, 120),
    ex('bench_press', 3, 9, 90),
    ex('seated_cable_row', 3, 10, 90),
    ex('hip_thrust', 3, 11, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('cable_crunch', 2, 13, 60),
  ],
};

// =============================================================================
// 12. RECOMP_INT_4D_UL — Recomp Intermédiaire 4j Upper/Lower
// =============================================================================
const D12_UA: ProgramDay = {
  id: 'recomp_int_4d_ul_upper_a', nameKey: 'Upper A — Force', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 7, 150),
    ex('barbell_rows', 4, 7, 150),
    ex('overhead_press', 3, 8, 120),
    ex('lat_pulldown', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('barbell_curl', 3, 11, 60),
  ],
};
const D12_LA_M: ProgramDay = {
  id: 'recomp_int_4d_ul_lower_a_m', nameKey: 'Lower A (H)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 3, 9, 120),
    ex('leg_press', 3, 11, 120),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
    ex('hanging_leg_raise', 3, 10, 60),
  ],
};
const D12_LA_F: ProgramDay = {
  id: 'recomp_int_4d_ul_lower_a_f', nameKey: 'Lower A (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 7, 150),
    ex('romanian_deadlift', 4, 9, 120),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D12_UB: ProgramDay = {
  id: 'recomp_int_4d_ul_upper_b', nameKey: 'Upper B — Volume', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 10, 90),
    ex('pull_ups', 4, 8, 120),
    ex('cable_fly', 3, 13, 60),
    ex('seated_cable_row', 3, 11, 60),
    ex('seated_db_press', 3, 10, 90),
    ex('hammer_curls', 3, 11, 60),
    ex('overhead_tricep_extension', 3, 11, 60),
  ],
};
const D12_LB_M: ProgramDay = {
  id: 'recomp_int_4d_ul_lower_b_m', nameKey: 'Lower B (H)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('front_squat', 3, 8, 150),
    ex('hack_squat', 3, 11, 120),
    ex('hip_thrust', 3, 11, 90),
    ex('leg_extension', 3, 13, 60),
    ex('seated_leg_curl', 3, 11, 90),
    ex('seated_calf_raise', 4, 13, 60),
  ],
};
const D12_LB_F: ProgramDay = {
  id: 'recomp_int_4d_ul_lower_b_f', nameKey: 'Lower B (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('sumo_deadlift', 3, 7, 120),
    ex('single_leg_hip_thrust', 3, 10, 90),
    ex('walking_lunges', 3, 12, 90),
    ex('cable_pull_through', 3, 13, 60),
    ex('abductor_machine', 3, 18, 60),
    ex('calf_raises', 4, 13, 60),
  ],
};

// =============================================================================
// 13. RECOMP_INT_5D_HYB — Recomp Intermédiaire 5j hybride
// =============================================================================
const D13_UP: ProgramDay = {
  id: 'recomp_int_5d_upper_power', nameKey: 'Upper Power', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 5, 150),
    ex('barbell_rows', 4, 7, 150),
    ex('overhead_press', 3, 8, 120),
    ex('pull_ups', 3, 8, 120),
    ex('barbell_curl', 3, 8, 60),
    ex('tricep_pushdown', 3, 11, 60),
  ],
};
const D13_LP_M: ProgramDay = {
  id: 'recomp_int_5d_lower_power_m', nameKey: 'Lower Power (H)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 3, 9, 120),
    ex('leg_press', 3, 11, 120),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D13_LP_F: ProgramDay = {
  id: 'recomp_int_5d_lower_power_f', nameKey: 'Lower Power (F)', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 7, 150),
    ex('romanian_deadlift', 4, 9, 120),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('leg_curl', 3, 11, 90),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D13_PUSH: ProgramDay = {
  id: 'recomp_int_5d_push_hyper', nameKey: 'Push Hypertrophy', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 10, 90),
    ex('cable_fly', 3, 13, 60),
    ex('seated_db_press', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
    ex('skull_crushers', 3, 10, 60),
    ex('overhead_tricep_extension', 3, 11, 60),
  ],
};
const D13_PULL: ProgramDay = {
  id: 'recomp_int_5d_pull_hyper', nameKey: 'Pull Hypertrophy', type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    ex('lat_pulldown', 4, 10, 90),
    ex('t_bar_row', 3, 9, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('face_pulls', 3, 13, 45),
    ex('incline_db_curl', 3, 11, 60),
    ex('hammer_curls', 3, 11, 60),
  ],
};

// =============================================================================
// 14. MAINTAIN_3D_FB — Maintien 3j Full Body minimal
// =============================================================================
const D14_A: ProgramDay = {
  id: 'maintain_3d_fb_a', nameKey: 'Full Body A', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('squat', 3, 8, 120),
    ex('bench_press', 3, 8, 120),
    ex('barbell_rows', 3, 8, 90),
    ex('seated_db_press', 2, 10, 60),
    ex('barbell_curl', 2, 11, 45),
  ],
};
const D14_B: ProgramDay = {
  id: 'maintain_3d_fb_b', nameKey: 'Full Body B', type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'shoulders'],
  exercises: [
    ex('romanian_deadlift', 3, 7, 120),
    ex('incline_db_press', 3, 9, 90),
    ex('lat_pulldown', 3, 10, 90),
    ex('hip_thrust', 2, 11, 90),
    ex('lateral_raises', 2, 13, 45),
  ],
};
const D14_C: ProgramDay = {
  id: 'maintain_3d_fb_c', nameKey: 'Full Body C', type: 'muscu',
  muscleGroups: ['legs', 'back', 'chest', 'core'],
  exercises: [
    ex('front_squat', 3, 8, 120),
    ex('pull_ups', 3, 10, 90),
    ex('bench_press', 3, 9, 90),
    ex('lunges', 2, 10, 60),
    ex('plank', 2, 40, 45),
  ],
};

// =============================================================================
// 15. MAINTAIN_4D_UL — Maintien 4j Upper/Lower léger
// =============================================================================
const D15_UA: ProgramDay = {
  id: 'maintain_4d_ul_upper_a', nameKey: 'Upper A', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 8, 120),
    ex('barbell_rows', 3, 8, 90),
    ex('seated_db_press', 2, 10, 90),
    ex('lat_pulldown', 2, 11, 90),
    ex('barbell_curl', 2, 11, 60),
    ex('tricep_pushdown', 2, 11, 60),
  ],
};
const D15_LA: ProgramDay = {
  id: 'maintain_4d_ul_lower_a', nameKey: 'Lower A', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('squat', 3, 8, 150),
    ex('romanian_deadlift', 3, 9, 120),
    ex('leg_press', 3, 11, 90),
    ex('leg_curl', 2, 11, 90),
    ex('calf_raises', 3, 13, 60),
  ],
};
const D15_UB: ProgramDay = {
  id: 'maintain_4d_ul_upper_b', nameKey: 'Upper B', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 3, 10, 90),
    ex('pull_ups', 3, 10, 90),
    ex('seated_cable_row', 3, 11, 90),
    ex('lateral_raises', 2, 13, 45),
    ex('hammer_curls', 2, 11, 60),
    ex('skull_crushers', 2, 11, 60),
  ],
};
const D15_LB: ProgramDay = {
  id: 'maintain_4d_ul_lower_b', nameKey: 'Lower B', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('front_squat', 3, 8, 120),
    ex('hip_thrust', 3, 11, 90),
    ex('walking_lunges', 2, 10, 90),
    ex('leg_extension', 2, 13, 60),
    ex('seated_calf_raise', 3, 13, 60),
  ],
};

// =============================================================================
// 16. BULK_INT_4D_UL_GLUTE — Femme — Focus Fessiers
// =============================================================================
const D16_LG1: ProgramDay = {
  id: 'glute_4d_lower_focus_1', nameKey: 'Lower Glute Focus 1', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('hip_thrust', 4, 7, 150),
    ex('romanian_deadlift', 4, 9, 120),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('cable_kickbacks', 3, 13, 60),
    ex('cable_pull_through', 3, 13, 60),
    ex('calf_raises', 4, 13, 60),
  ],
};
const D16_U1: ProgramDay = {
  id: 'glute_4d_upper_1', nameKey: 'Upper', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 9, 120),
    ex('barbell_rows', 3, 9, 120),
    ex('seated_db_press', 3, 10, 90),
    ex('lat_pulldown', 3, 11, 90),
    ex('lateral_raises', 4, 13, 60),
    ex('barbell_curl', 3, 11, 60),
  ],
};
const D16_LG2: ProgramDay = {
  id: 'glute_4d_lower_focus_2', nameKey: 'Lower Glute Focus 2', type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    ex('sumo_deadlift', 4, 7, 150),
    ex('single_leg_hip_thrust', 3, 10, 90),
    ex('walking_lunges', 3, 12, 90),
    ex('glute_bridge', 3, 13, 60),
    ex('seated_leg_curl', 4, 11, 90),
    ex('abductor_machine', 3, 17, 45),
  ],
};
const D16_U2: ProgramDay = {
  id: 'glute_4d_upper_2', nameKey: 'Upper (volume + bras)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 11, 90),
    ex('pull_ups', 3, 10, 90),
    ex('seated_cable_row', 3, 13, 60),
    ex('cable_fly', 3, 13, 60),
    ex('cable_lateral', 4, 13, 60),
    ex('hammer_curls', 3, 11, 60),
    ex('overhead_tricep_extension', 3, 13, 60),
  ],
};

// ============================================================================
// PROGRAMS REGISTRY (16)
// ============================================================================

export const PROGRAMS: Record<string, TrainingProgram> = {
  // ─── BULK ─────────────────────────────────────────────────────────────────
  BULK_DEB_3D_FB: {
    id: 'BULK_DEB_3D_FB',
    nameKey: 'Bulk Débutant — Full Body 3j',
    descriptionKey: 'Tout le corps 3×/sem. Idéal pour débuter en prise de masse. 12-16 semaines.',
    daysPerWeek: 3, levelKey: 'levelBeginner',
    rotation: [D01_A, D01_B, D01_C], trainingSlots: [0, 2, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  BULK_DEB_4D_UL: {
    id: 'BULK_DEB_4D_UL',
    nameKey: 'Bulk Débutant — Upper/Lower 4j',
    descriptionKey: 'Haut/bas alterné. 4 séances de 60-75 min. 12-16 semaines.',
    daysPerWeek: 4, levelKey: 'levelBeginner',
    rotation: [D02_UA, D02_LA, D02_UB, D02_LB], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  BULK_INT_4D_PHUL_M: {
    id: 'BULK_INT_4D_PHUL_M',
    nameKey: 'Bulk Intermédiaire — PHUL 4j (H)',
    descriptionKey: 'Power+Hypertrophie Upper/Lower. 12 sem + deload. Pour intermédiaires.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D03_UP, D03_LP, D03_UH, D03_LH_M], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'male', level: 'intermediate',
  },
  BULK_INT_4D_PHUL_F: {
    id: 'BULK_INT_4D_PHUL_F',
    nameKey: 'Bulk Intermédiaire — PHUL 4j (F)',
    descriptionKey: 'PHUL avec Lower Hypertrophy axé fessiers. 12 sem + deload.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D03_UP, D03_LP, D03_UH, D03_LH_F], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'female', level: 'intermediate',
  },
  BULK_INT_5D_UL_PPL_M: {
    id: 'BULK_INT_5D_UL_PPL_M',
    nameKey: 'Bulk Intermédiaire — UL+PPL 5j (H)',
    descriptionKey: 'Hybride Upper/Lower + Push/Pull/Legs. Volume élevé. 8-12 sem.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D04_U, D04_L, D04_PUSH, D04_PULL, D04_LEGS_M],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'male', level: 'intermediate',
  },
  BULK_INT_5D_UL_PPL_F: {
    id: 'BULK_INT_5D_UL_PPL_F',
    nameKey: 'Bulk Intermédiaire — UL+PPL 5j (F)',
    descriptionKey: 'Hybride avec Legs day axé fessiers. Volume élevé. 8-12 sem.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D04_U, D04_L, D04_PUSH, D04_PULL, D04_LEGS_F],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'female', level: 'intermediate',
  },
  BULK_INT_6D_PPL_M: {
    id: 'BULK_INT_6D_PPL_M',
    nameKey: 'Bulk Intermédiaire — PPL ×2 6j (H)',
    descriptionKey: 'Push/Pull/Legs deux fois par semaine. Volume max. 8-12 sem.',
    daysPerWeek: 6, levelKey: 'levelIntermediate',
    rotation: [D05_PUSH_A, D05_PULL_A, D05_LEGS_A_M, D05_PUSH_B, D05_PULL_B, D05_LEGS_B_M],
    trainingSlots: [0, 1, 2, 4, 5, 6],
    sexVariant: 'male', level: 'intermediate',
  },
  BULK_INT_6D_PPL_F: {
    id: 'BULK_INT_6D_PPL_F',
    nameKey: 'Bulk Intermédiaire — PPL ×2 6j (F)',
    descriptionKey: 'PPL ×2 avec Legs day axés fessiers. Volume max.',
    daysPerWeek: 6, levelKey: 'levelIntermediate',
    rotation: [D05_PUSH_A, D05_PULL_A, D05_LEGS_A_F, D05_PUSH_B, D05_PULL_B, D05_LEGS_B_F],
    trainingSlots: [0, 1, 2, 4, 5, 6],
    sexVariant: 'female', level: 'intermediate',
  },
  BULK_AVA_4D_531: {
    id: 'BULK_AVA_4D_531',
    nameKey: 'Bulk Avancé — 5/3/1 BBB 4j',
    descriptionKey: 'Wendler 5/3/1 + Boring But Big. Force + masse. Cycles de 4 sem.',
    daysPerWeek: 4, levelKey: 'levelAdvanced',
    rotation: [D06_BENCH, D06_SQUAT, D06_OHP, D06_DEAD], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'unisex', level: 'advanced',
  },

  // ─── CUT ──────────────────────────────────────────────────────────────────
  CUT_DEB_3D_FB: {
    id: 'CUT_DEB_3D_FB',
    nameKey: 'Cut Débutant — Full Body 3j',
    descriptionKey: 'Sèche douce avec full body. 3 séances + 3 cardio. 8-12 sem.',
    daysPerWeek: 3, levelKey: 'levelBeginner',
    rotation: [D07_A, D07_B, D07_C], trainingSlots: [0, 2, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  CUT_DEB_4D_UL: {
    id: 'CUT_DEB_4D_UL',
    nameKey: 'Cut Débutant — Upper/Lower 4j',
    descriptionKey: 'Sèche avec UL. 4 séances + 2-3 cardio. 8-12 sem.',
    daysPerWeek: 4, levelKey: 'levelBeginner',
    rotation: [D08_UA, D08_LA, D08_UB, D08_LB], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  CUT_INT_4D_UL_M: {
    id: 'CUT_INT_4D_UL_M',
    nameKey: 'Cut Intermédiaire — UL 4j (H)',
    descriptionKey: 'UL volume modéré. Préserve la force et le muscle. 12-16 sem.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D09_UP, D09_LP_M, D09_UH, D09_LH_M], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'male', level: 'intermediate',
  },
  CUT_INT_4D_UL_F: {
    id: 'CUT_INT_4D_UL_F',
    nameKey: 'Cut Intermédiaire — UL 4j (F)',
    descriptionKey: 'UL volume modéré, Lower axé fessiers. 12-16 sem.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D09_UP, D09_LP_F, D09_UH, D09_LH_F], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'female', level: 'intermediate',
  },
  CUT_INT_5D_PPL_UL_M: {
    id: 'CUT_INT_5D_PPL_UL_M',
    nameKey: 'Cut Intermédiaire — PPL/UL 5j (H)',
    descriptionKey: 'Hybride 5j + 3-4 cardio. Préserve volume tout en sèchant.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D10_U, D10_L, D10_PUSH, D10_PULL, D10_LEGS_M],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'male', level: 'intermediate',
  },
  CUT_INT_5D_PPL_UL_F: {
    id: 'CUT_INT_5D_PPL_UL_F',
    nameKey: 'Cut Intermédiaire — PPL/UL 5j (F)',
    descriptionKey: 'Hybride 5j + 3-4 cardio. Lower axé fessiers.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D10_U, D10_L, D10_PUSH, D10_PULL, D10_LEGS_F],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'female', level: 'intermediate',
  },

  // ─── RECOMP ───────────────────────────────────────────────────────────────
  RECOMP_DEB_3D_FB: {
    id: 'RECOMP_DEB_3D_FB',
    nameKey: 'Recomp Débutant — Full Body 3j',
    descriptionKey: 'Recomposition douce. Idéal débutant ou retour de pause. 12-16 sem.',
    daysPerWeek: 3, levelKey: 'levelBeginner',
    rotation: [D11_A, D11_B, D11_C], trainingSlots: [0, 2, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  RECOMP_INT_4D_UL_M: {
    id: 'RECOMP_INT_4D_UL_M',
    nameKey: 'Recomp Intermédiaire — UL 4j (H)',
    descriptionKey: 'UL avec rep ranges variés (force + volume). 16-20 sem.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D12_UA, D12_LA_M, D12_UB, D12_LB_M], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'male', level: 'intermediate',
  },
  RECOMP_INT_4D_UL_F: {
    id: 'RECOMP_INT_4D_UL_F',
    nameKey: 'Recomp Intermédiaire — UL 4j (F)',
    descriptionKey: 'UL Lower axé fessiers. 16-20 sem.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D12_UA, D12_LA_F, D12_UB, D12_LB_F], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'female', level: 'intermediate',
  },
  RECOMP_INT_5D_HYB_M: {
    id: 'RECOMP_INT_5D_HYB_M',
    nameKey: 'Recomp Intermédiaire — Hybride 5j (H)',
    descriptionKey: 'UL+PPL 5j optimisé recomp. 16-20 sem.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D13_UP, D13_LP_M, D13_PUSH, D13_PULL, D04_LEGS_M],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'male', level: 'intermediate',
  },
  RECOMP_INT_5D_HYB_F: {
    id: 'RECOMP_INT_5D_HYB_F',
    nameKey: 'Recomp Intermédiaire — Hybride 5j (F)',
    descriptionKey: 'UL+PPL 5j optimisé recomp avec Legs fessiers.',
    daysPerWeek: 5, levelKey: 'levelIntermediate',
    rotation: [D13_UP, D13_LP_F, D13_PUSH, D13_PULL, D04_LEGS_F],
    trainingSlots: [0, 1, 2, 4, 5],
    sexVariant: 'female', level: 'intermediate',
  },

  // ─── MAINTAIN ─────────────────────────────────────────────────────────────
  MAINTAIN_3D_FB: {
    id: 'MAINTAIN_3D_FB',
    nameKey: 'Maintien — Full Body 3j',
    descriptionKey: 'Maintien minimal. 45-55 min. Phases chargées, voyages, transitions.',
    daysPerWeek: 3, levelKey: 'levelAll',
    rotation: [D14_A, D14_B, D14_C], trainingSlots: [0, 2, 4],
    sexVariant: 'unisex', level: 'beginner',
  },
  MAINTAIN_4D_UL: {
    id: 'MAINTAIN_4D_UL',
    nameKey: 'Maintien — Upper/Lower 4j',
    descriptionKey: 'Maintien léger. 50-60 min. RIR 2-3, jamais à l\'échec.',
    daysPerWeek: 4, levelKey: 'levelAll',
    rotation: [D15_UA, D15_LA, D15_UB, D15_LB], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'unisex', level: 'beginner',
  },

  // ─── SPÉCIAL FEMME ────────────────────────────────────────────────────────
  BULK_INT_4D_UL_GLUTE: {
    id: 'BULK_INT_4D_UL_GLUTE',
    nameKey: 'Femme — Bulk 4j Focus Fessiers',
    descriptionKey: 'Programme dédié femme avec hip thrust principal. Volume fessiers ~20 sets/sem.',
    daysPerWeek: 4, levelKey: 'levelIntermediate',
    rotation: [D16_LG1, D16_U1, D16_LG2, D16_U2], trainingSlots: [0, 1, 3, 4],
    sexVariant: 'female', level: 'intermediate',
  },
};

export const PROGRAM_IDS = Object.keys(PROGRAMS) as Array<keyof typeof PROGRAMS>;

export const CARDIO_DAYS = { liss: CARDIO_LISS, hiit: CARDIO_HIIT };

// ── Legacy program ID migration ──────────────────────────────────────────────
// Old users may have a v1/v2 program ID persisted in their activePlan.
// Map them to a sensible v3 default so the app doesn't show "no program".
const LEGACY_ID_MAP: Record<string, string> = {
  full_body: 'BULK_DEB_3D_FB',
  full_body_h: 'BULK_DEB_3D_FB',
  full_body_f: 'BULK_DEB_3D_FB',
  upper_lower: 'BULK_DEB_4D_UL',
  upper_lower_h: 'BULK_DEB_4D_UL',
  upper_lower_f: 'BULK_DEB_4D_UL',
  ppl: 'BULK_INT_6D_PPL_M',
  ppl_h: 'BULK_INT_6D_PPL_M',
  ppl_f: 'BULK_INT_6D_PPL_F',
  stronglifts_5x5: 'BULK_DEB_3D_FB',
};

/**
 * Resolve any legacy or v2 program id to a v3 program id.
 * Sex-aware fallback: if the legacy mapping isn't sex-specific, picks
 * the variant matching the user's sex when applicable.
 */
export function resolveLegacyProgramId(id: string, sex: 'male' | 'female' = 'male'): string {
  if (PROGRAMS[id]) return id;
  const mapped = LEGACY_ID_MAP[id];
  if (!mapped) return id;
  // Some defaults vary per sex; rewrite if needed
  if (sex === 'female' && mapped === 'BULK_INT_6D_PPL_M') return 'BULK_INT_6D_PPL_F';
  return mapped;
}

export function getProgramDayById(programId: string, dayId: string): ProgramDay | null {
  if (dayId === 'cardio_liss') return CARDIO_LISS;
  if (dayId === 'cardio_hiit') return CARDIO_HIIT;

  let program = PROGRAMS[programId];
  if (!program) {
    const v3 = resolveLegacyProgramId(programId, 'male');
    if (v3 !== programId) program = PROGRAMS[v3];
  }
  if (!program) {
    const v3 = resolveLegacyProgramId(programId, 'female');
    if (v3 !== programId) program = PROGRAMS[v3];
  }
  if (!program) return null;
  return program.rotation.find((d) => d.id === dayId) ?? null;
}
