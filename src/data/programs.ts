import type { TrainingProgram, ProgramDay } from '../types/program';

// ── Program Day Templates ──

// Full Body (3 days/week)
const FB_DAY_A: ProgramDay = {
  id: 'fb_a',
  nameKey: 'programDayFullBodyA',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'squat', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'bicep_curls', targetSets: 2, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'plank', targetSets: 3, targetReps: 45, restSeconds: 60 },
  ],
};

const FB_DAY_B: ProgramDay = {
  id: 'fb_b',
  nameKey: 'programDayFullBodyB',
  type: 'muscu',
  muscleGroups: ['shoulders', 'back', 'legs', 'arms', 'core'],
  exercises: [
    { exerciseId: 'overhead_press', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 6, restSeconds: 150 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'tricep_extensions', targetSets: 2, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'crunches', targetSets: 3, targetReps: 15, restSeconds: 60 },
  ],
};

const FB_DAY_C: ProgramDay = {
  id: 'fb_c',
  nameKey: 'programDayFullBodyC',
  type: 'muscu',
  muscleGroups: ['back', 'chest', 'legs', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'incline_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 2, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'russian_twist', targetSets: 3, targetReps: 20, restSeconds: 60 },
  ],
};

// Upper/Lower (4 days/week)
const UL_UPPER_A: ProgramDay = {
  id: 'ul_upper_a',
  nameKey: 'programDayUpperA',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 6, restSeconds: 120 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 6, restSeconds: 120 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 10, restSeconds: 60 },
    { exerciseId: 'tricep_extensions', targetSets: 3, targetReps: 10, restSeconds: 60 },
  ],
};

const UL_LOWER_A: ProgramDay = {
  id: 'ul_lower_a',
  nameKey: 'programDayLowerA',
  type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    { exerciseId: 'squat', targetSets: 4, targetReps: 6, restSeconds: 150 },
    { exerciseId: 'romanian_deadlift', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'leg_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'plank', targetSets: 3, targetReps: 45, restSeconds: 60 },
  ],
};

const UL_UPPER_B: ProgramDay = {
  id: 'ul_upper_b',
  nameKey: 'programDayUpperB',
  type: 'muscu',
  muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'incline_press', targetSets: 4, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'pull_ups', targetSets: 4, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'skull_crushers', targetSets: 3, targetReps: 12, restSeconds: 60 },
  ],
};

const UL_LOWER_B: ProgramDay = {
  id: 'ul_lower_b',
  nameKey: 'programDayLowerB',
  type: 'muscu',
  muscleGroups: ['legs', 'core'],
  exercises: [
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'leg_extension', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'leg_raises', targetSets: 3, targetReps: 15, restSeconds: 60 },
  ],
};

// PPL (6 days/week)
const PPL_PUSH: ProgramDay = {
  id: 'ppl_push',
  nameKey: 'programDayPush',
  type: 'muscu',
  muscleGroups: ['chest', 'shoulders', 'arms'],
  exercises: [
    { exerciseId: 'bench_press', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'incline_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'overhead_press', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'chest_fly', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'lateral_raises', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'tricep_extensions', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'dips', targetSets: 3, targetReps: 10, restSeconds: 90 },
  ],
};

const PPL_PULL: ProgramDay = {
  id: 'ppl_pull',
  nameKey: 'programDayPull',
  type: 'muscu',
  muscleGroups: ['back', 'arms'],
  exercises: [
    { exerciseId: 'deadlift', targetSets: 4, targetReps: 5, restSeconds: 180 },
    { exerciseId: 'barbell_rows', targetSets: 4, targetReps: 8, restSeconds: 120 },
    { exerciseId: 'pull_ups', targetSets: 3, targetReps: 8, restSeconds: 90 },
    { exerciseId: 'lat_pulldown', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'face_pulls', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'bicep_curls', targetSets: 3, targetReps: 10, restSeconds: 60 },
    { exerciseId: 'hammer_curls', targetSets: 3, targetReps: 10, restSeconds: 60 },
  ],
};

const PPL_LEGS: ProgramDay = {
  id: 'ppl_legs',
  nameKey: 'programDayLegs',
  type: 'muscu',
  muscleGroups: ['legs'],
  exercises: [
    { exerciseId: 'squat', targetSets: 4, targetReps: 6, restSeconds: 150 },
    { exerciseId: 'leg_press', targetSets: 4, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'romanian_deadlift', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'lunges', targetSets: 3, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'leg_curl', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'leg_extension', targetSets: 3, targetReps: 12, restSeconds: 60 },
    { exerciseId: 'calf_raises', targetSets: 4, targetReps: 15, restSeconds: 60 },
  ],
};

// StrongLifts 5x5 (3 days/week)
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

// Cardio program days
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

// ── Program Definitions ──

export const PROGRAMS: Record<string, TrainingProgram> = {
  full_body: {
    id: 'full_body',
    nameKey: 'programFullBody',
    descriptionKey: 'programFullBodyDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [FB_DAY_A, FB_DAY_B, FB_DAY_C],
    trainingSlots: [0, 2, 4], // Mon, Wed, Fri
  },
  upper_lower: {
    id: 'upper_lower',
    nameKey: 'programUpperLower',
    descriptionKey: 'programUpperLowerDesc',
    daysPerWeek: 4,
    levelKey: 'levelIntermediate',
    rotation: [UL_UPPER_A, UL_LOWER_A, UL_UPPER_B, UL_LOWER_B],
    trainingSlots: [0, 1, 3, 4], // Mon, Tue, Thu, Fri
  },
  ppl: {
    id: 'ppl',
    nameKey: 'programPPL',
    descriptionKey: 'programPPLDesc',
    daysPerWeek: 6,
    levelKey: 'levelAdvanced',
    rotation: [PPL_PUSH, PPL_PULL, PPL_LEGS],
    trainingSlots: [0, 1, 2, 3, 4, 5], // Mon-Sat
  },
  stronglifts_5x5: {
    id: 'stronglifts_5x5',
    nameKey: 'programStronglifts',
    descriptionKey: 'programStrongliftsDesc',
    daysPerWeek: 3,
    levelKey: 'levelBeginner',
    rotation: [SL_A, SL_B],
    trainingSlots: [0, 2, 4], // Mon, Wed, Fri
  },
};

export const PROGRAM_IDS = ['full_body', 'upper_lower', 'ppl', 'stronglifts_5x5'] as const;

export const CARDIO_DAYS = { liss: CARDIO_LISS, hiit: CARDIO_HIIT };

export function getProgramDayById(programId: string, dayId: string): ProgramDay | null {
  // Check cardio days
  if (dayId === 'cardio_liss') return CARDIO_LISS;
  if (dayId === 'cardio_hiit') return CARDIO_HIIT;

  const program = PROGRAMS[programId];
  if (!program) return null;
  return program.rotation.find((d) => d.id === dayId) ?? null;
}
