import type { TrainingProgram, ProgramDay, ProgramExercise } from '../types/program';

// =============================================================================
// FORGA — BIBLIOTHÈQUE V4 (60 programmes)
//
// Source : FORGA_Programmes.md (spec autoritaire à la racine).
//
// Structure : 5 objectifs × 2 sexes × 3 niveaux × 2 lieux = 60 programmes.
//   - Famille HYPERTROPHIE (bulk/cut/recomp/maintain) : 4 obj × 2 sexes ×
//     3 niveaux × 2 lieux = 48. MÊMES exercices/reps pour un (niveau, lieu,
//     sexe) donné, seul le volume × multiplier d'objectif change côté moteur.
//   - Famille FORCE (powerlifter) : 1 obj × 2 sexes × 3 niveaux × 2 lieux = 12.
//     Structure dédiée : reps basses, %1RM, RPE, repos long. Maison =
//     variante d'entretien.
//
// Pour économiser les lignes, on factorise les ProgramDays en TEMPLATES
// par (niveau, lieu, sexe), puis on génère les 60 programmes via builder.
// =============================================================================

const ex = (
  exerciseId: string,
  targetSets: number,
  targetReps: number,
  restSeconds: number,
  weightFactor?: number,
): ProgramExercise => ({ exerciseId, targetSets, targetReps, restSeconds, weightFactor });

// ── Cardio days (réutilisés par le plan generator) ────────────────────────────
const CARDIO_LISS: ProgramDay = {
  id: 'cardio_liss',
  nameKey: 'programDayCardioLiss',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'cycling', durationMinutes: 25, intensity: 'modere' },
};

const CARDIO_HIIT: ProgramDay = {
  id: 'cardio_hiit',
  nameKey: 'programDayCardioHiit',
  type: 'cardio',
  muscleGroups: ['cardio'],
  exercises: [],
  cardio: { exerciseId: 'hiit', durationMinutes: 20, intensity: 'intense' },
};

// =============================================================================
// HYPERTROPHIE — Templates par (niveau, lieu, sexe)
// 12 combinaisons. La rotation est partagée entre les 4 objectifs hyp ; seul
// le volume est modulé par le multiplicateur d'objectif côté moteur (×1.1
// bulk · ×0.75 cut · ×0.9 recomp · ×0.6 maintain).
// =============================================================================

// ── DÉBUTANT · SALLE · HOMME (Full Body A/B) ──
const HYP_BEG_GYM_M_A: ProgramDay = {
  id: 'hyp_beg_gym_m_a', nameKey: 'Full Body A — Force fondamentale', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('squat', 3, 5, 180),
    ex('bench_press', 3, 5, 180),
    ex('barbell_rows', 3, 8, 90),
    ex('plank', 3, 30, 60),
  ],
};
const HYP_BEG_GYM_M_B: ProgramDay = {
  id: 'hyp_beg_gym_m_b', nameKey: 'Full Body B — Tirage & jambes', type: 'muscu',
  muscleGroups: ['back', 'shoulders', 'legs', 'core'],
  exercises: [
    ex('deadlift', 1, 5, 180),
    ex('romanian_deadlift', 2, 5, 120),
    ex('overhead_press', 3, 5, 120),
    ex('lat_pulldown', 3, 8, 90),
    ex('hip_thrust', 3, 10, 90),
    ex('hanging_leg_raise', 3, 10, 60),
  ],
};

// ── DÉBUTANT · SALLE · FEMME (priorité fessiers) ──
const HYP_BEG_GYM_F_A: ProgramDay = {
  id: 'hyp_beg_gym_f_a', nameKey: 'Full Body A — Fessiers prioritaires', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('hip_thrust', 4, 10, 90),
    ex('squat', 3, 8, 120),
    ex('bench_press', 3, 8, 120),
    ex('barbell_rows', 3, 10, 90),
    ex('abductor_machine', 3, 15, 45),
    ex('plank', 3, 30, 60),
  ],
};
const HYP_BEG_GYM_F_B: ProgramDay = {
  id: 'hyp_beg_gym_f_b', nameKey: 'Full Body B — Chaîne postérieure', type: 'muscu',
  muscleGroups: ['legs', 'back', 'shoulders', 'core'],
  exercises: [
    ex('romanian_deadlift', 3, 8, 150),
    ex('hip_thrust', 3, 10, 90),
    ex('overhead_press', 3, 8, 120),
    ex('lat_pulldown', 3, 10, 90),
    ex('walking_lunges', 3, 10, 90),
    ex('hanging_leg_raise', 3, 12, 60),
  ],
};

// ── DÉBUTANT · MAISON · HOMME (haltères + PdC) ──
const HYP_BEG_HOME_M_A: ProgramDay = {
  id: 'hyp_beg_home_m_a', nameKey: 'Full Body A maison — Haltères', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('goblet_squat', 3, 10, 90),
    ex('bench_press_dumbbells', 3, 10, 90),
    ex('one_arm_dumbbell_row', 3, 10, 90),
    ex('rdl_dumbbells', 3, 10, 90),
    ex('plank', 3, 30, 60),
  ],
};
const HYP_BEG_HOME_M_B: ProgramDay = {
  id: 'hyp_beg_home_m_b', nameKey: 'Full Body B maison — Unilatéral', type: 'muscu',
  muscleGroups: ['legs', 'shoulders', 'back', 'core'],
  exercises: [
    ex('bulgarian_split_squat', 3, 8, 90),
    ex('db_overhead_press', 3, 8, 90),
    ex('inverted_row', 3, 10, 90),
    ex('hip_thrust_dumbbell', 3, 12, 90),
    ex('leg_raises', 3, 12, 60),
  ],
};

// ── DÉBUTANT · MAISON · FEMME (priorité fessiers) ──
const HYP_BEG_HOME_F_A: ProgramDay = {
  id: 'hyp_beg_home_f_a', nameKey: 'Full Body A maison — Fessiers', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('hip_thrust_band', 4, 15, 75),
    ex('goblet_squat', 3, 12, 90),
    ex('bench_press_dumbbells', 3, 10, 90),
    ex('one_arm_dumbbell_row', 3, 10, 90),
    ex('band_kickback', 3, 15, 45),
    ex('plank', 3, 30, 60),
  ],
};
const HYP_BEG_HOME_F_B: ProgramDay = {
  id: 'hyp_beg_home_f_b', nameKey: 'Full Body B maison — Chaîne postérieure', type: 'muscu',
  muscleGroups: ['legs', 'shoulders', 'back', 'core'],
  exercises: [
    ex('rdl_dumbbells', 3, 10, 90),
    ex('single_leg_glute_bridge', 3, 12, 45),
    ex('db_overhead_press', 3, 10, 90),
    ex('inverted_row', 3, 10, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('leg_raises', 3, 12, 60),
  ],
};

// ── INTERMÉDIAIRE · SALLE · HOMME (Haut/Bas) ──
const HYP_INT_GYM_M_UPPER: ProgramDay = {
  id: 'hyp_int_gym_m_upper', nameKey: 'Haut du corps — Volume', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 7, 150),
    ex('barbell_rows', 4, 8, 120),
    ex('overhead_press', 3, 9, 120),
    ex('lat_pulldown', 3, 9, 120),
    ex('barbell_curl', 3, 11, 75),
    ex('tricep_pushdown', 3, 11, 75),
  ],
};
const HYP_INT_GYM_M_LOWER: ProgramDay = {
  id: 'hyp_int_gym_m_lower', nameKey: 'Bas du corps — Force & volume', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 4, 7, 180),
    ex('romanian_deadlift', 3, 9, 120),
    ex('hip_thrust', 3, 11, 90),
    ex('leg_press', 3, 11, 90),
    ex('leg_curl', 3, 11, 75),
    ex('calf_raises', 4, 13, 60),
  ],
};

// ── INTERMÉDIAIRE · SALLE · FEMME (priorité fessiers, 2 lower) ──
const HYP_INT_GYM_F_UPPER: ProgramDay = {
  id: 'hyp_int_gym_f_upper', nameKey: 'Haut du corps — Volume', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 9, 120),
    ex('barbell_rows', 4, 9, 90),
    ex('overhead_press', 3, 10, 90),
    ex('lat_pulldown', 3, 10, 90),
    ex('barbell_curl', 3, 12, 60),
    ex('tricep_pushdown', 3, 12, 60),
  ],
};
const HYP_INT_GYM_F_LOWER: ProgramDay = {
  id: 'hyp_int_gym_f_lower', nameKey: 'Bas du corps — Fessiers prioritaires', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('hip_thrust', 4, 9, 120),
    ex('squat', 4, 7, 150),
    ex('romanian_deadlift', 3, 9, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('abductor_machine', 3, 15, 45),
    ex('cable_kickbacks', 3, 15, 45),
    ex('calf_raises', 4, 15, 45),
  ],
};

// ── INTERMÉDIAIRE · MAISON · HOMME ──
const HYP_INT_HOME_M_UPPER: ProgramDay = {
  id: 'hyp_int_home_m_upper', nameKey: 'Haut du corps maison — Haltères', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 9, 120),
    ex('one_arm_dumbbell_row', 4, 9, 90),
    ex('db_overhead_press', 3, 9, 90),
    ex('pull_ups', 3, 9, 90),
    ex('db_curl', 3, 11, 75),
    ex('db_tricep_extension', 3, 11, 75),
  ],
};
const HYP_INT_HOME_M_LOWER: ProgramDay = {
  id: 'hyp_int_home_m_lower', nameKey: 'Bas du corps maison — Unilatéral', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('goblet_squat', 4, 9, 120),
    ex('rdl_dumbbells', 4, 9, 90),
    ex('hip_thrust_dumbbell', 3, 12, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('nordic_curl', 3, 10, 75),
    ex('calf_raises', 4, 13, 45),
  ],
};

// ── INTERMÉDIAIRE · MAISON · FEMME (priorité fessiers) ──
const HYP_INT_HOME_F_UPPER: ProgramDay = {
  id: 'hyp_int_home_f_upper', nameKey: 'Haut du corps maison — Haltères', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 3, 9, 90),
    ex('one_arm_dumbbell_row', 4, 9, 90),
    ex('db_overhead_press', 3, 10, 90),
    ex('pull_ups', 3, 10, 90),
    ex('db_curl', 3, 12, 60),
    ex('db_tricep_extension', 3, 12, 60),
  ],
};
const HYP_INT_HOME_F_LOWER: ProgramDay = {
  id: 'hyp_int_home_f_lower', nameKey: 'Bas du corps maison — Fessiers', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('hip_thrust_band', 4, 13, 75),
    ex('goblet_squat', 4, 9, 120),
    ex('rdl_dumbbells', 4, 9, 90),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('glute_bridge', 3, 15, 45),
    ex('calf_raises', 4, 15, 45),
  ],
};

// ── AVANCÉ · SALLE · HOMME (Push/Pull/Legs ×2) ──
const HYP_ADV_GYM_M_PUSH_A: ProgramDay = {
  id: 'hyp_adv_gym_m_push_a', nameKey: 'Push A — Pectoraux', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 5, 180),
    ex('incline_db_press', 3, 9, 120),
    ex('chest_fly', 3, 12, 75),
    ex('lateral_raises', 3, 13, 60),
    ex('overhead_tricep_extension', 3, 10, 75),
    ex('tricep_pushdown', 3, 12, 60),
  ],
};
const HYP_ADV_GYM_M_PULL_A: ProgramDay = {
  id: 'hyp_adv_gym_m_pull_a', nameKey: 'Pull A — Dos épaisseur', type: 'muscu',
  muscleGroups: ['back', 'shoulders', 'arms'],
  exercises: [
    ex('deadlift', 3, 5, 240),
    ex('pendlay_row', 3, 7, 120),
    ex('pull_ups', 3, 8, 120),
    ex('seated_cable_row', 3, 10, 90),
    ex('rear_delt_fly', 3, 15, 60),
    ex('barbell_curl', 3, 9, 75),
  ],
};
const HYP_ADV_GYM_M_LEGS_A: ProgramDay = {
  id: 'hyp_adv_gym_m_legs_a', nameKey: 'Legs A — Quadriceps', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 4, 5, 180),
    ex('leg_press', 3, 10, 120),
    ex('walking_lunges', 3, 10, 90),
    ex('leg_extension', 3, 12, 60),
    ex('calf_raises', 4, 11, 60),
    ex('hanging_leg_raise', 3, 12, 60),
  ],
};
const HYP_ADV_GYM_M_PUSH_B: ProgramDay = {
  id: 'hyp_adv_gym_m_push_b', nameKey: 'Push B — Épaules', type: 'muscu',
  muscleGroups: ['shoulders', 'chest', 'arms'],
  exercises: [
    ex('overhead_press', 4, 7, 150),
    ex('incline_db_press', 3, 9, 120),
    ex('lateral_raises', 4, 13, 45),
    ex('chest_fly', 3, 12, 75),
    ex('dips', 3, 10, 120),
    ex('tricep_pushdown', 3, 12, 60),
  ],
};
const HYP_ADV_GYM_M_PULL_B: ProgramDay = {
  id: 'hyp_adv_gym_m_pull_b', nameKey: 'Pull B — Dos largeur', type: 'muscu',
  muscleGroups: ['back', 'shoulders', 'arms'],
  exercises: [
    ex('pull_ups', 4, 7, 150),
    ex('chest_supported_row', 3, 9, 90),
    ex('lat_pulldown', 3, 10, 90),
    ex('rear_delt_fly', 3, 15, 60),
    ex('db_curl', 3, 10, 60),
    ex('barbell_curl', 3, 12, 60),
  ],
};
const HYP_ADV_GYM_M_LEGS_B: ProgramDay = {
  id: 'hyp_adv_gym_m_legs_b', nameKey: 'Legs B — Chaîne postérieure', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('romanian_deadlift', 4, 7, 150),
    ex('hip_thrust', 3, 8, 120),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('leg_curl', 3, 11, 75),
    ex('calf_raises', 4, 12, 45),
    ex('plank', 3, 13, 60),
  ],
};

// ── AVANCÉ · SALLE · FEMME (PPL avec Legs ×3, fessiers focus) ──
const HYP_ADV_GYM_F_PUSH_A: ProgramDay = HYP_ADV_GYM_M_PUSH_A;
const HYP_ADV_GYM_F_PULL_A: ProgramDay = HYP_ADV_GYM_M_PULL_A;
const HYP_ADV_GYM_F_LEGS_A_GLUTE: ProgramDay = {
  id: 'hyp_adv_gym_f_legs_a_glute', nameKey: 'Legs A — Fessiers lourds', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('hip_thrust', 4, 8, 180),
    ex('romanian_deadlift', 4, 7, 120),
    ex('squat', 4, 7, 150),
    ex('bulgarian_split_squat', 3, 10, 90),
    ex('abductor_machine', 3, 15, 45),
    ex('cable_kickbacks', 3, 15, 45),
    ex('calf_raises', 4, 15, 45),
  ],
};
const HYP_ADV_GYM_F_PUSH_B: ProgramDay = HYP_ADV_GYM_M_PUSH_B;
const HYP_ADV_GYM_F_PULL_B: ProgramDay = HYP_ADV_GYM_M_PULL_B;
const HYP_ADV_GYM_F_LEGS_B_GLUTE: ProgramDay = {
  id: 'hyp_adv_gym_f_legs_b_glute', nameKey: 'Legs B — Hip-dominant', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('pause_hip_thrust', 4, 10, 150),
    ex('romanian_deadlift', 3, 9, 120),
    ex('walking_lunges', 3, 11, 90),
    ex('glute_bridge', 3, 15, 45),
    ex('single_leg_rdl', 3, 10, 60),
    ex('seated_calf_raise', 4, 13, 45),
  ],
};

// ── AVANCÉ · MAISON · HOMME (Haut/Bas 5-6j adapté haltères) ──
const HYP_ADV_HOME_M_UPPER: ProgramDay = {
  id: 'hyp_adv_home_m_upper', nameKey: 'Haut du corps avancé maison', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 10, 120),
    ex('weighted_pushup', 4, 12, 90),
    ex('one_arm_dumbbell_row', 4, 10, 90),
    ex('pull_ups', 4, 8, 120),
    ex('db_lateral_raise', 4, 15, 45),
    ex('db_curl', 3, 13, 60),
    ex('db_tricep_extension', 3, 13, 60),
  ],
};
const HYP_ADV_HOME_M_LOWER: ProgramDay = {
  id: 'hyp_adv_home_m_lower', nameKey: 'Bas du corps avancé maison', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('bulgarian_split_squat', 4, 11, 120),
    ex('rdl_dumbbells', 4, 10, 90),
    ex('hip_thrust_dumbbell', 4, 13, 90),
    ex('sissy_squat', 3, 13, 60),
    ex('nordic_curl', 3, 8, 75),
    ex('calf_raises', 4, 17, 45),
  ],
};

// ── AVANCÉ · MAISON · FEMME ──
const HYP_ADV_HOME_F_UPPER: ProgramDay = HYP_ADV_HOME_M_UPPER;
const HYP_ADV_HOME_F_LOWER: ProgramDay = {
  id: 'hyp_adv_home_f_lower', nameKey: 'Bas du corps avancé maison — Fessiers', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('hip_thrust_band', 5, 13, 75),
    ex('bulgarian_split_squat', 4, 11, 120),
    ex('rdl_dumbbells', 4, 11, 90),
    ex('single_leg_glute_bridge', 3, 12, 45),
    ex('glute_bridge', 3, 20, 45),
    ex('calf_raises', 4, 17, 45),
  ],
};

// =============================================================================
// FORCE — Templates par (niveau, lieu, sexe)
// =============================================================================

// ── DÉBUTANT · SALLE · UNISEX (Starting Strength 3j) ──
const FORCE_BEG_GYM_A: ProgramDay = {
  id: 'force_beg_gym_a', nameKey: 'Force A — Squat + Bench', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('squat', 3, 5, 240),
    ex('bench_press', 3, 5, 240),
    ex('barbell_rows', 3, 6, 150),
    ex('plank', 3, 30, 60),
  ],
};
const FORCE_BEG_GYM_B: ProgramDay = {
  id: 'force_beg_gym_b', nameKey: 'Force B — Squat + OHP + Deadlift', type: 'muscu',
  muscleGroups: ['legs', 'shoulders', 'back', 'core'],
  exercises: [
    ex('squat', 3, 5, 240),
    ex('overhead_press', 3, 5, 240),
    ex('deadlift', 1, 5, 300),
    ex('pull_ups', 3, 8, 120),
  ],
};

// ── DÉBUTANT · MAISON · UNISEX (variante d'entretien haltères) ──
const FORCE_BEG_HOME_A: ProgramDay = {
  id: 'force_beg_home_a', nameKey: 'Force A maison (entretien)', type: 'muscu',
  muscleGroups: ['legs', 'chest', 'back', 'core'],
  exercises: [
    ex('goblet_squat', 4, 6, 180),
    ex('bench_press_dumbbells', 4, 6, 180),
    ex('one_arm_dumbbell_row', 3, 8, 120),
    ex('plank', 3, 30, 60),
  ],
};
const FORCE_BEG_HOME_B: ProgramDay = {
  id: 'force_beg_home_b', nameKey: 'Force B maison (entretien)', type: 'muscu',
  muscleGroups: ['legs', 'shoulders', 'back', 'core'],
  exercises: [
    ex('bulgarian_split_squat', 4, 6, 180),
    ex('db_overhead_press', 4, 6, 180),
    ex('rdl_dumbbells', 3, 6, 150),
    ex('pull_ups', 3, 8, 120),
  ],
};

// ── INTERMÉDIAIRE · SALLE · UNISEX (5/3/1 BBB) ──
// weightFactor=0.7 sur les BBB → 60% du top set (Wendler 60% TM).
const FORCE_INT_GYM_SQUAT: ProgramDay = {
  id: 'force_int_gym_squat', nameKey: 'Force — Squat Day (5/3/1)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 3, 5, 240),
    ex('squat', 5, 10, 150, 0.7),
    ex('leg_curl', 3, 13, 90),
    ex('plank', 3, 38, 60),
  ],
};
const FORCE_INT_GYM_BENCH: ProgramDay = {
  id: 'force_int_gym_bench', nameKey: 'Force — Bench Day (5/3/1)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 3, 5, 240),
    ex('bench_press', 5, 10, 150, 0.7),
    ex('pull_ups', 3, 10, 120),
    ex('barbell_curl', 3, 13, 75),
  ],
};
const FORCE_INT_GYM_DEAD: ProgramDay = {
  id: 'force_int_gym_dead', nameKey: 'Force — Deadlift Day (5/3/1)', type: 'muscu',
  muscleGroups: ['back', 'legs', 'core'],
  exercises: [
    ex('deadlift', 3, 5, 300),
    ex('deadlift', 5, 5, 180, 1.0), // First Set Last : même poids que sem 1
    ex('hyperextension', 3, 11, 90),
    ex('pallof_press', 3, 12, 60),
  ],
};
const FORCE_INT_GYM_OHP: ProgramDay = {
  id: 'force_int_gym_ohp', nameKey: 'Force — OHP Day (5/3/1)', type: 'muscu',
  muscleGroups: ['shoulders', 'back', 'arms'],
  exercises: [
    ex('overhead_press', 3, 5, 240),
    ex('overhead_press', 5, 10, 150, 0.7),
    ex('barbell_rows', 3, 10, 120),
    ex('lateral_raises', 3, 13, 60),
  ],
};

// ── INTERMÉDIAIRE · MAISON · UNISEX (variante entretien 4j haltères) ──
const FORCE_INT_HOME_UPPER_A: ProgramDay = {
  id: 'force_int_home_upper_a', nameKey: 'Force A maison Haut (entretien)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press_dumbbells', 4, 6, 180),
    ex('one_arm_dumbbell_row', 4, 6, 150),
    ex('db_overhead_press', 3, 8, 120),
    ex('pull_ups', 3, 8, 120),
  ],
};
const FORCE_INT_HOME_LOWER_A: ProgramDay = {
  id: 'force_int_home_lower_a', nameKey: 'Force A maison Bas (entretien)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('goblet_squat', 4, 6, 180),
    ex('rdl_dumbbells', 4, 6, 150),
    ex('bulgarian_split_squat', 3, 8, 120),
    ex('hip_thrust_dumbbell', 3, 10, 90),
  ],
};
const FORCE_INT_HOME_UPPER_B: ProgramDay = {
  id: 'force_int_home_upper_b', nameKey: 'Force B maison Haut (entretien)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('incline_db_press', 4, 6, 180),
    ex('inverted_row', 4, 8, 120),
    ex('db_overhead_press', 3, 8, 120),
    ex('db_curl', 3, 10, 75),
  ],
};
const FORCE_INT_HOME_LOWER_B: ProgramDay = {
  id: 'force_int_home_lower_b', nameKey: 'Force B maison Bas (entretien)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('rdl_dumbbells', 4, 6, 180),
    ex('bulgarian_split_squat', 4, 8, 120),
    ex('hip_thrust_dumbbell', 4, 10, 90),
    ex('calf_raises', 4, 13, 45),
  ],
};

// ── AVANCÉ · SALLE · UNISEX (SBD 4j, blocs intensification) ──
const FORCE_ADV_GYM_SQUAT: ProgramDay = {
  id: 'force_adv_gym_squat', nameKey: 'Force Avancé — Squat (intensification)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('squat', 5, 3, 300),
    ex('pause_squat', 3, 3, 180),
    ex('hip_thrust', 3, 7, 120),
    ex('pallof_press', 3, 12, 90),
  ],
};
const FORCE_ADV_GYM_BENCH: ProgramDay = {
  id: 'force_adv_gym_bench', nameKey: 'Force Avancé — Bench (intensification)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 5, 3, 300),
    ex('pause_bench_press', 3, 4, 180),
    ex('close_grip_bench', 3, 6, 150),
    ex('pull_ups', 3, 10, 90),
  ],
};
const FORCE_ADV_GYM_DEAD: ProgramDay = {
  id: 'force_adv_gym_dead', nameKey: 'Force Avancé — Deadlift (intensification)', type: 'muscu',
  muscleGroups: ['back', 'legs', 'core'],
  exercises: [
    ex('deadlift', 4, 3, 360),
    ex('deficit_deadlift', 3, 3, 180),
    ex('block_pull', 3, 4, 180),
    ex('romanian_deadlift', 3, 8, 120),
  ],
};
const FORCE_ADV_GYM_BENCH_VOL: ProgramDay = {
  id: 'force_adv_gym_bench_vol', nameKey: 'Force Avancé — Bench Volume', type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press', 4, 6, 240, 0.85),
    ex('overhead_press', 3, 6, 180),
    ex('chest_supported_row', 3, 10, 90),
    ex('lateral_raises', 3, 13, 60),
  ],
};

// ── AVANCÉ · MAISON · UNISEX (entretien — barre+rack absent → warning) ──
const FORCE_ADV_HOME_UPPER: ProgramDay = {
  id: 'force_adv_home_upper', nameKey: 'Force Avancé maison Haut (entretien)', type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    ex('bench_press_dumbbells', 4, 6, 240),
    ex('pull_ups', 4, 7, 180),
    ex('db_overhead_press', 4, 7, 150),
    ex('weighted_pushup', 3, 8, 120),
  ],
};
const FORCE_ADV_HOME_LOWER: ProgramDay = {
  id: 'force_adv_home_lower', nameKey: 'Force Avancé maison Bas (entretien)', type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    ex('goblet_squat', 4, 6, 240),
    ex('rdl_dumbbells', 4, 7, 180),
    ex('bulgarian_split_squat', 4, 8, 150),
    ex('nordic_curl', 3, 8, 90),
  ],
};

// =============================================================================
// Builder — génère un TrainingProgram depuis ses 4 dimensions
// =============================================================================

type ObjId = 'bulk' | 'cut' | 'recomp' | 'maintain' | 'force';
type LevelId = 'beginner' | 'intermediate' | 'advanced';
type LocId = 'gym' | 'home';
type SexId = 'male' | 'female';

interface TemplateSpec {
  rotation: ProgramDay[];
  daysPerWeek: number;
  trainingSlots: number[];
  splitNameKey: string;
}

/** Retourne le template (séances + structure) pour une combinaison
 *  (famille, niveau, lieu, sexe). Force partage des templates unisex en
 *  débutant/intermédiaire, et alimente une variante femme distincte si
 *  besoin (le doc spec dit : +1 séance DC pour femme).
 */
function getTemplate(
  family: 'hyp' | 'force',
  level: LevelId,
  location: LocId,
  sex: SexId,
): TemplateSpec {
  if (family === 'hyp') {
    if (level === 'beginner') {
      const A = location === 'gym'
        ? (sex === 'male' ? HYP_BEG_GYM_M_A : HYP_BEG_GYM_F_A)
        : (sex === 'male' ? HYP_BEG_HOME_M_A : HYP_BEG_HOME_F_A);
      const B = location === 'gym'
        ? (sex === 'male' ? HYP_BEG_GYM_M_B : HYP_BEG_GYM_F_B)
        : (sex === 'male' ? HYP_BEG_HOME_M_B : HYP_BEG_HOME_F_B);
      return {
        rotation: [A, B, A],
        daysPerWeek: 3,
        trainingSlots: [0, 2, 4],
        splitNameKey: 'splitFullBody',
      };
    }
    if (level === 'intermediate') {
      const U = location === 'gym'
        ? (sex === 'male' ? HYP_INT_GYM_M_UPPER : HYP_INT_GYM_F_UPPER)
        : (sex === 'male' ? HYP_INT_HOME_M_UPPER : HYP_INT_HOME_F_UPPER);
      const L = location === 'gym'
        ? (sex === 'male' ? HYP_INT_GYM_M_LOWER : HYP_INT_GYM_F_LOWER)
        : (sex === 'male' ? HYP_INT_HOME_M_LOWER : HYP_INT_HOME_F_LOWER);
      return {
        rotation: [U, L, U, L],
        daysPerWeek: 4,
        trainingSlots: [0, 1, 3, 4],
        splitNameKey: 'splitUpperLower',
      };
    }
    // Avancé/Pro
    if (location === 'gym') {
      if (sex === 'male') {
        return {
          rotation: [
            HYP_ADV_GYM_M_PUSH_A, HYP_ADV_GYM_M_PULL_A, HYP_ADV_GYM_M_LEGS_A,
            HYP_ADV_GYM_M_PUSH_B, HYP_ADV_GYM_M_PULL_B, HYP_ADV_GYM_M_LEGS_B,
          ],
          daysPerWeek: 6,
          trainingSlots: [0, 1, 2, 3, 4, 5],
          splitNameKey: 'splitPPL',
        };
      }
      // Female advanced : PPL avec legs day fessiers focus
      return {
        rotation: [
          HYP_ADV_GYM_F_PUSH_A, HYP_ADV_GYM_F_PULL_A, HYP_ADV_GYM_F_LEGS_A_GLUTE,
          HYP_ADV_GYM_F_PUSH_B, HYP_ADV_GYM_F_PULL_B, HYP_ADV_GYM_F_LEGS_B_GLUTE,
        ],
        daysPerWeek: 6,
        trainingSlots: [0, 1, 2, 3, 4, 5],
        splitNameKey: 'splitPPL',
      };
    }
    // Avancé maison : Haut/Bas alternés 6j
    const HU = sex === 'male' ? HYP_ADV_HOME_M_UPPER : HYP_ADV_HOME_F_UPPER;
    const HL = sex === 'male' ? HYP_ADV_HOME_M_LOWER : HYP_ADV_HOME_F_LOWER;
    return {
      rotation: [HU, HL, HU, HL, HU, HL],
      daysPerWeek: 6,
      trainingSlots: [0, 1, 2, 3, 4, 5],
      splitNameKey: 'splitUpperLowerAdv',
    };
  }

  // ── FORCE ──
  if (level === 'beginner') {
    const A = location === 'gym' ? FORCE_BEG_GYM_A : FORCE_BEG_HOME_A;
    const B = location === 'gym' ? FORCE_BEG_GYM_B : FORCE_BEG_HOME_B;
    return {
      rotation: [A, B, A],
      daysPerWeek: 3,
      trainingSlots: [0, 2, 4],
      splitNameKey: 'splitFullBodyForce',
    };
  }
  if (level === 'intermediate') {
    if (location === 'gym') {
      // Femme : +1 séance DC dans la semaine selon spec
      if (sex === 'female') {
        return {
          rotation: [FORCE_INT_GYM_SQUAT, FORCE_INT_GYM_BENCH, FORCE_INT_GYM_DEAD, FORCE_INT_GYM_OHP, FORCE_INT_GYM_BENCH],
          daysPerWeek: 5,
          trainingSlots: [0, 1, 3, 4, 5],
          splitNameKey: 'split531Female',
        };
      }
      return {
        rotation: [FORCE_INT_GYM_SQUAT, FORCE_INT_GYM_BENCH, FORCE_INT_GYM_DEAD, FORCE_INT_GYM_OHP],
        daysPerWeek: 4,
        trainingSlots: [0, 1, 3, 4],
        splitNameKey: 'split531',
      };
    }
    // Force intermédiaire maison (entretien)
    return {
      rotation: [FORCE_INT_HOME_UPPER_A, FORCE_INT_HOME_LOWER_A, FORCE_INT_HOME_UPPER_B, FORCE_INT_HOME_LOWER_B],
      daysPerWeek: 4,
      trainingSlots: [0, 1, 3, 4],
      splitNameKey: 'splitUpperLowerForceHome',
    };
  }
  // Avancé
  if (location === 'gym') {
    return {
      rotation: [FORCE_ADV_GYM_SQUAT, FORCE_ADV_GYM_BENCH, FORCE_ADV_GYM_DEAD, FORCE_ADV_GYM_BENCH_VOL],
      daysPerWeek: 4,
      trainingSlots: [0, 1, 3, 4],
      splitNameKey: 'splitSBDBlocks',
    };
  }
  // Avancé maison (entretien — barre+rack absent)
  return {
    rotation: [FORCE_ADV_HOME_UPPER, FORCE_ADV_HOME_LOWER, FORCE_ADV_HOME_UPPER, FORCE_ADV_HOME_LOWER],
    daysPerWeek: 4,
    trainingSlots: [0, 1, 3, 4],
    splitNameKey: 'splitForceHomeMaintenance',
  };
}

const OBJECTIVE_NAMES: Record<ObjId, string> = {
  bulk: 'Prise de masse',
  cut: 'Sèche',
  recomp: 'Recomposition',
  maintain: 'Maintien',
  force: 'Force',
};

const LEVEL_NAMES: Record<LevelId, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const LEVEL_KEYS: Record<LevelId, string> = {
  beginner: 'levelBeginner',
  intermediate: 'levelIntermediate',
  advanced: 'levelAdvanced',
};

const LOCATION_NAMES: Record<LocId, string> = {
  gym: 'Salle',
  home: 'Maison',
};

const OBJECTIVE_DESCRIPTIONS: Record<ObjId, string> = {
  bulk: "Volume élevé, surplus calorique +10–20 %, protéines 1,6–2,2 g/kg. Mêmes exercices que les autres objectifs hypertrophie : seul le nombre de séries change.",
  cut: "Volume réduit de 25 % (récupération en déficit), MÊMES charges (préserve le muscle), cardio Z2 ajouté. Protéines 2,3–3,1 g/kg masse maigre.",
  recomp: "Volume modéré (×0,9), maintien à −300 kcal, protéines 1,8–2,4 g/kg. Pour perdre du gras et gagner du muscle en parallèle.",
  maintain: "Volume MEV (×0,6), calories de maintien. Pour préserver les acquis pendant une période chargée ou entre 2 cycles.",
  force: "Programme powerlifting (squat/bench/deadlift), reps basses 3–5, charges 75–95 % du 1RM, RPE 7–9, repos long. Cardio minimal.",
};

function buildProgram(
  objective: ObjId,
  sex: SexId,
  level: LevelId,
  location: LocId,
): TrainingProgram {
  const family = objective === 'force' ? 'force' : 'hyp';
  const tpl = getTemplate(family, level, location, sex);
  const id = `${objective.toUpperCase()}_${level.toUpperCase()}_${location.toUpperCase()}_${sex === 'male' ? 'M' : 'F'}`;
  const sexLabel = sex === 'male' ? 'Homme' : 'Femme';
  return {
    id,
    nameKey: `${OBJECTIVE_NAMES[objective]} — ${LEVEL_NAMES[level]} · ${LOCATION_NAMES[location]} (${sexLabel})`,
    descriptionKey: OBJECTIVE_DESCRIPTIONS[objective],
    daysPerWeek: tpl.daysPerWeek,
    levelKey: LEVEL_KEYS[level],
    rotation: tpl.rotation,
    trainingSlots: tpl.trainingSlots,
    sexVariant: sex,
    level,
    location,
    objective,
  };
}

// =============================================================================
// Génération des 60 programmes
// =============================================================================

const OBJECTIVES: ObjId[] = ['bulk', 'cut', 'recomp', 'maintain', 'force'];
const SEXES: SexId[] = ['male', 'female'];
const LEVELS: LevelId[] = ['beginner', 'intermediate', 'advanced'];
const LOCATIONS: LocId[] = ['gym', 'home'];

const allPrograms: Record<string, TrainingProgram> = {};
for (const obj of OBJECTIVES) {
  for (const sex of SEXES) {
    for (const lvl of LEVELS) {
      for (const loc of LOCATIONS) {
        const p = buildProgram(obj, sex, lvl, loc);
        allPrograms[p.id] = p;
      }
    }
  }
}

export const PROGRAMS: Record<string, TrainingProgram> = allPrograms;
export const PROGRAM_IDS = Object.keys(PROGRAMS) as Array<keyof typeof PROGRAMS>;
export const CARDIO_DAYS = { liss: CARDIO_LISS, hiit: CARDIO_HIIT };

// =============================================================================
// Helpers — résolution ProgramDay + legacy ID migration
// =============================================================================

/** Retourne le ProgramDay correspondant à (programId, dayId).
 *  Cherche dans la rotation du programme. Renvoie null si l'un des
 *  deux n'existe pas (ID invalide, plan obsolète, etc.). */
export function getProgramDayById(programId: string, dayId: string): ProgramDay | null {
  const program = PROGRAMS[programId];
  if (!program) return null;
  return program.rotation.find((d) => d.id === dayId) ?? null;
}

/**
 * Migration legacy ID → V4 ID. Tente de retrouver un programme V4
 * équivalent quand le code (Supabase user.current_program_id, plans en
 * cache) référence encore un ancien ID (BULK_DEB_4D_UL, BULK_INT_4D_PHUL_M…).
 *
 * Si l'ID ressemble à un V4 valide, on le retourne tel quel. Sinon on
 * essaie un mapping best-effort. Si rien ne matche, on retombe sur un
 * programme générique sûr.
 */
const LEGACY_ID_MAP: Record<string, string> = {
  // Bulk débutants
  BULK_DEB_3D_FB: 'BULK_BEGINNER_GYM_M',
  BULK_DEB_4D_UL: 'BULK_BEGINNER_GYM_M',
  // Bulk intermédiaires
  BULK_INT_4D_PHUL_M: 'BULK_INTERMEDIATE_GYM_M',
  BULK_INT_4D_PHUL_F: 'BULK_INTERMEDIATE_GYM_F',
  BULK_INT_5D_UL_PPL_M: 'BULK_INTERMEDIATE_GYM_M',
  BULK_INT_5D_UL_PPL_F: 'BULK_INTERMEDIATE_GYM_F',
  BULK_INT_6D_PPL_M: 'BULK_ADVANCED_GYM_M',
  BULK_INT_6D_PPL_F: 'BULK_ADVANCED_GYM_F',
  BULK_AVA_4D_531: 'FORCE_INTERMEDIATE_GYM_M',
  BULK_INT_4D_UL_GLUTE: 'BULK_INTERMEDIATE_GYM_F',
  // Cut
  CUT_DEB_3D_FB: 'CUT_BEGINNER_GYM_M',
  CUT_DEB_4D_UL: 'CUT_BEGINNER_GYM_M',
  CUT_INT_4D_UL_M: 'CUT_INTERMEDIATE_GYM_M',
  CUT_INT_4D_UL_F: 'CUT_INTERMEDIATE_GYM_F',
  CUT_INT_5D_PPL_UL_M: 'CUT_INTERMEDIATE_GYM_M',
  CUT_INT_5D_PPL_UL_F: 'CUT_INTERMEDIATE_GYM_F',
  // Maintain
  MAINTAIN_3D_FB: 'MAINTAIN_BEGINNER_GYM_M',
  MAINTAIN_4D_UL: 'MAINTAIN_INTERMEDIATE_GYM_M',
  // Recomp
  RECOMP_DEB_3D_FB: 'RECOMP_BEGINNER_GYM_M',
  RECOMP_INT_4D_UL_M: 'RECOMP_INTERMEDIATE_GYM_M',
  RECOMP_INT_4D_UL_F: 'RECOMP_INTERMEDIATE_GYM_F',
  RECOMP_INT_5D_HYB_M: 'RECOMP_INTERMEDIATE_GYM_M',
  RECOMP_INT_5D_HYB_F: 'RECOMP_INTERMEDIATE_GYM_F',
  // Force (V3 names)
  FORCE_DEB_3D_FB: 'FORCE_BEGINNER_GYM_M',
  FORCE_INT_4D_531: 'FORCE_INTERMEDIATE_GYM_M',
};

export function resolveLegacyProgramId(programId: string, sex?: 'male' | 'female'): string {
  // Déjà un V4 valide → on le retourne tel quel
  if (PROGRAMS[programId]) return programId;
  // Mapping legacy
  let mapped = LEGACY_ID_MAP[programId];
  if (mapped) {
    // Adapter au sexe si fourni (les mappings par défaut sont en M)
    if (sex === 'female' && mapped.endsWith('_M')) {
      const candidate = mapped.slice(0, -2) + '_F';
      if (PROGRAMS[candidate]) return candidate;
    }
    if (PROGRAMS[mapped]) return mapped;
  }
  // Ultimate fallback : maintenance bénin selon le sexe
  return sex === 'female' ? 'MAINTAIN_BEGINNER_GYM_F' : 'MAINTAIN_BEGINNER_GYM_M';
}
