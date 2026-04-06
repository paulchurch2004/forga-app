import type { Exercise, MuscleGroup } from '../types/training';

export const EXERCISES: Record<string, Exercise> = {
  // ── Chest (4) ──
  bench_press:   { id: 'bench_press',   nameKey: 'exBenchPress',   muscleGroup: 'chest',     isCompound: true },
  incline_press: { id: 'incline_press', nameKey: 'exInclinePress', muscleGroup: 'chest',     isCompound: true },
  dips:          { id: 'dips',          nameKey: 'exDips',          muscleGroup: 'chest',     isCompound: true },
  chest_fly:     { id: 'chest_fly',     nameKey: 'exChestFly',     muscleGroup: 'chest',     isCompound: false },

  // ── Back (4) ──
  pull_ups:      { id: 'pull_ups',      nameKey: 'exPullUps',      muscleGroup: 'back',      isCompound: true },
  barbell_rows:  { id: 'barbell_rows',  nameKey: 'exBarbellRows',  muscleGroup: 'back',      isCompound: true },
  lat_pulldown:  { id: 'lat_pulldown',  nameKey: 'exLatPulldown',  muscleGroup: 'back',      isCompound: true },
  deadlift:      { id: 'deadlift',      nameKey: 'exDeadlift',     muscleGroup: 'back',      isCompound: true },

  // ── Shoulders (4) ──
  overhead_press:  { id: 'overhead_press',  nameKey: 'exOverheadPress',  muscleGroup: 'shoulders', isCompound: true },
  lateral_raises:  { id: 'lateral_raises',  nameKey: 'exLateralRaises',  muscleGroup: 'shoulders', isCompound: false },
  face_pulls:      { id: 'face_pulls',      nameKey: 'exFacePulls',      muscleGroup: 'shoulders', isCompound: false },
  shrugs:          { id: 'shrugs',          nameKey: 'exShrugs',          muscleGroup: 'shoulders', isCompound: false },

  // ── Arms (4) ──
  bicep_curls:       { id: 'bicep_curls',       nameKey: 'exBicepCurls',       muscleGroup: 'arms', isCompound: false },
  tricep_extensions: { id: 'tricep_extensions', nameKey: 'exTricepExtensions', muscleGroup: 'arms', isCompound: false },
  hammer_curls:      { id: 'hammer_curls',      nameKey: 'exHammerCurls',      muscleGroup: 'arms', isCompound: false },
  skull_crushers:    { id: 'skull_crushers',    nameKey: 'exSkullCrushers',    muscleGroup: 'arms', isCompound: false },

  // ── Legs (7) ──
  squat:              { id: 'squat',              nameKey: 'exSquat',             muscleGroup: 'legs', isCompound: true },
  leg_press:          { id: 'leg_press',          nameKey: 'exLegPress',          muscleGroup: 'legs', isCompound: true },
  lunges:             { id: 'lunges',             nameKey: 'exLunges',            muscleGroup: 'legs', isCompound: true },
  leg_curl:           { id: 'leg_curl',           nameKey: 'exLegCurl',           muscleGroup: 'legs', isCompound: false },
  leg_extension:      { id: 'leg_extension',      nameKey: 'exLegExtension',      muscleGroup: 'legs', isCompound: false },
  calf_raises:        { id: 'calf_raises',        nameKey: 'exCalfRaises',        muscleGroup: 'legs', isCompound: false },
  romanian_deadlift:  { id: 'romanian_deadlift',  nameKey: 'exRomanianDeadlift',  muscleGroup: 'legs', isCompound: true },

  // ── Core (4) ──
  plank:          { id: 'plank',          nameKey: 'exPlank',         muscleGroup: 'core', isCompound: false },
  crunches:       { id: 'crunches',       nameKey: 'exCrunches',      muscleGroup: 'core', isCompound: false },
  leg_raises:     { id: 'leg_raises',     nameKey: 'exLegRaises',     muscleGroup: 'core', isCompound: false },
  russian_twist:  { id: 'russian_twist',  nameKey: 'exRussianTwist',  muscleGroup: 'core', isCompound: false },

  // ── Cardio (7) ──
  running:    { id: 'running',    nameKey: 'exRunning',    muscleGroup: 'cardio', isCompound: false },
  cycling:    { id: 'cycling',    nameKey: 'exCycling',    muscleGroup: 'cardio', isCompound: false },
  swimming:   { id: 'swimming',   nameKey: 'exSwimming',   muscleGroup: 'cardio', isCompound: false },
  hiit:       { id: 'hiit',       nameKey: 'exHiit',       muscleGroup: 'cardio', isCompound: false },
  jump_rope:  { id: 'jump_rope',  nameKey: 'exJumpRope',   muscleGroup: 'cardio', isCompound: false },
  rowing:     { id: 'rowing',     nameKey: 'exRowing',     muscleGroup: 'cardio', isCompound: false },
  elliptical: { id: 'elliptical', nameKey: 'exElliptical', muscleGroup: 'cardio', isCompound: false },
};

export function getExercisesByGroup(): Record<MuscleGroup, Exercise[]> {
  const groups: Record<MuscleGroup, Exercise[]> = {
    chest: [], back: [], shoulders: [], arms: [], legs: [], core: [], cardio: [],
  };
  for (const ex of Object.values(EXERCISES)) {
    groups[ex.muscleGroup].push(ex);
  }
  return groups;
}

export function searchExercises(
  query: string,
  getName: (key: string) => string,
): Exercise[] {
  if (!query.trim()) return Object.values(EXERCISES);
  const lower = query.toLowerCase();
  return Object.values(EXERCISES).filter((ex) =>
    getName(ex.nameKey).toLowerCase().includes(lower)
  );
}
