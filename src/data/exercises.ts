import type { Exercise, MuscleGroup } from '../types/training';

// GIFs from fitnessprogramer.com — animated 3D exercise demonstrations

export const EXERCISES: Record<string, Exercise> = {
  // ── Chest (4) ──
  bench_press:   { id: 'bench_press',   nameKey: 'exBenchPress',   muscleGroup: 'chest',     isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
  incline_press: { id: 'incline_press', nameKey: 'exInclinePress', muscleGroup: 'chest',     isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif' },
  dips:          { id: 'dips',          nameKey: 'exDips',          muscleGroup: 'chest',     isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif' },
  chest_fly:     { id: 'chest_fly',     nameKey: 'exChestFly',     muscleGroup: 'chest',     isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif' },

  // ── Back (4) ──
  pull_ups:      { id: 'pull_ups',      nameKey: 'exPullUps',      muscleGroup: 'back',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif' },
  barbell_rows:  { id: 'barbell_rows',  nameKey: 'exBarbellRows',  muscleGroup: 'back',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif' },
  lat_pulldown:  { id: 'lat_pulldown',  nameKey: 'exLatPulldown',  muscleGroup: 'back',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif' },
  deadlift:      { id: 'deadlift',      nameKey: 'exDeadlift',     muscleGroup: 'back',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif' },

  // ── Shoulders (4) ──
  overhead_press:  { id: 'overhead_press',  nameKey: 'exOverheadPress',  muscleGroup: 'shoulders', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
  lateral_raises:  { id: 'lateral_raises',  nameKey: 'exLateralRaises',  muscleGroup: 'shoulders', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif' },
  face_pulls:      { id: 'face_pulls',      nameKey: 'exFacePulls',      muscleGroup: 'shoulders', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif' },
  shrugs:          { id: 'shrugs',          nameKey: 'exShrugs',          muscleGroup: 'shoulders', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shrug.gif' },

  // ── Arms (4) ──
  bicep_curls:       { id: 'bicep_curls',       nameKey: 'exBicepCurls',       muscleGroup: 'arms', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif' },
  tricep_extensions: { id: 'tricep_extensions', nameKey: 'exTricepExtensions', muscleGroup: 'arms', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif' },
  hammer_curls:      { id: 'hammer_curls',      nameKey: 'exHammerCurls',      muscleGroup: 'arms', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif' },
  skull_crushers:    { id: 'skull_crushers',    nameKey: 'exSkullCrushers',    muscleGroup: 'arms', isCompound: false },

  // ── Legs (7) ──
  squat:              { id: 'squat',              nameKey: 'exSquat',             muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif' },
  leg_press:          { id: 'leg_press',          nameKey: 'exLegPress',          muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/10/leg-press.gif' },
  lunges:             { id: 'lunges',             nameKey: 'exLunges',            muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif' },
  leg_curl:           { id: 'leg_curl',           nameKey: 'exLegCurl',           muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif' },
  leg_extension:      { id: 'leg_extension',      nameKey: 'exLegExtension',      muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif' },
  calf_raises:        { id: 'calf_raises',        nameKey: 'exCalfRaises',        muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif' },
  romanian_deadlift:  { id: 'romanian_deadlift',  nameKey: 'exRomanianDeadlift',  muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif' },

  // ── Core (4) ──
  plank:          { id: 'plank',          nameKey: 'exPlank',         muscleGroup: 'core', isCompound: false },
  crunches:       { id: 'crunches',       nameKey: 'exCrunches',      muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif' },
  leg_raises:     { id: 'leg_raises',     nameKey: 'exLegRaises',     muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif' },
  russian_twist:  { id: 'russian_twist',  nameKey: 'exRussianTwist',  muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif' },

  // ── Cardio (7) — no GIFs needed ──
  running:    { id: 'running',    nameKey: 'exRunning',    muscleGroup: 'cardio', isCompound: false },
  cycling:    { id: 'cycling',    nameKey: 'exCycling',    muscleGroup: 'cardio', isCompound: false },
  swimming:   { id: 'swimming',   nameKey: 'exSwimming',   muscleGroup: 'cardio', isCompound: false },
  hiit:       { id: 'hiit',       nameKey: 'exHiit',       muscleGroup: 'cardio', isCompound: false },
  jump_rope:  { id: 'jump_rope',  nameKey: 'exJumpRope',   muscleGroup: 'cardio', isCompound: false },
  rowing:     { id: 'rowing',     nameKey: 'exRowing',     muscleGroup: 'cardio', isCompound: false },
  elliptical: { id: 'elliptical', nameKey: 'exElliptical', muscleGroup: 'cardio', isCompound: false },

  // ── Legs add-ons (PROGRAMS_V2) ──
  hip_thrust:             { id: 'hip_thrust',             nameKey: 'exHipThrust',             muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Thrust.gif' },
  glute_bridge:           { id: 'glute_bridge',           nameKey: 'exGluteBridge',           muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge.gif' },
  bulgarian_split_squat:  { id: 'bulgarian_split_squat',  nameKey: 'exBulgarianSplitSquat',  muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif' },
  cable_kickbacks:        { id: 'cable_kickbacks',        nameKey: 'exCableKickbacks',        muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Kickback.gif' },
  sumo_deadlift:          { id: 'sumo_deadlift',          nameKey: 'exSumoDeadlift',          muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sumo-Deadlift.gif' },
  good_morning:           { id: 'good_morning',           nameKey: 'exGoodMorning',           muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Good-Morning.gif' },
  walking_lunges:         { id: 'walking_lunges',         nameKey: 'exWalkingLunges',         muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Walking-Lunge.gif' },
  single_leg_hip_thrust:  { id: 'single_leg_hip_thrust',  nameKey: 'exSingleLegHipThrust',  muscleGroup: 'legs', isCompound: true },
  pause_hip_thrust:       { id: 'pause_hip_thrust',       nameKey: 'exPauseHipThrust',       muscleGroup: 'legs', isCompound: true },
  abductor_machine:       { id: 'abductor_machine',       nameKey: 'exAbductorMachine',       muscleGroup: 'legs', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Abduction-Machine.gif' },
  banded_side_walk:       { id: 'banded_side_walk',       nameKey: 'exBandedSideWalk',       muscleGroup: 'legs', isCompound: false },
  step_ups:               { id: 'step_ups',               nameKey: 'exStepUps',               muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Step-Up.gif' },
  front_squat:            { id: 'front_squat',            nameKey: 'exFrontSquat',            muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Front-Squat.gif' },
  goblet_squat:           { id: 'goblet_squat',           nameKey: 'exGobletSquat',           muscleGroup: 'legs', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif' },
  pause_squat:            { id: 'pause_squat',            nameKey: 'exPauseSquat',            muscleGroup: 'legs', isCompound: true },
  pistol_squat:           { id: 'pistol_squat',           nameKey: 'exPistolSquat',           muscleGroup: 'legs', isCompound: true },

  // ── Back add-ons ──
  seated_cable_row:  { id: 'seated_cable_row',  nameKey: 'exSeatedCableRow',  muscleGroup: 'back', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif' },
  t_bar_row:         { id: 't_bar_row',         nameKey: 'exTBarRow',         muscleGroup: 'back', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/T-Bar-Row.gif' },
  pendlay_row:       { id: 'pendlay_row',       nameKey: 'exPendlayRow',       muscleGroup: 'back', isCompound: true },
  rack_pull:         { id: 'rack_pull',         nameKey: 'exRackPull',         muscleGroup: 'back', isCompound: true },
  reverse_pec_deck:  { id: 'reverse_pec_deck',  nameKey: 'exReversePecDeck',  muscleGroup: 'back', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Fly.gif' },

  // ── Chest add-ons ──
  incline_db_press:  { id: 'incline_db_press',  nameKey: 'exInclineDbPress',  muscleGroup: 'chest', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Bench-Press.gif' },
  close_grip_bench:  { id: 'close_grip_bench',  nameKey: 'exCloseGripBench',  muscleGroup: 'chest', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif' },
  pause_bench:       { id: 'pause_bench',       nameKey: 'exPauseBench',       muscleGroup: 'chest', isCompound: true },
  cable_fly:         { id: 'cable_fly',         nameKey: 'exCableFly',         muscleGroup: 'chest', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif' },
  pec_deck:          { id: 'pec_deck',          nameKey: 'exPecDeck',          muscleGroup: 'chest', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Machine-Chest-Fly.gif' },
  incline_fly:       { id: 'incline_fly',       nameKey: 'exInclineFly',       muscleGroup: 'chest', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Fly.gif' },

  // ── Shoulders / Arms add-ons ──
  seated_db_press:           { id: 'seated_db_press',           nameKey: 'exSeatedDbPress',           muscleGroup: 'shoulders', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
  upright_row:               { id: 'upright_row',               nameKey: 'exUprightRow',               muscleGroup: 'shoulders', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif' },
  cable_lateral:             { id: 'cable_lateral',             nameKey: 'exCableLateral',             muscleGroup: 'shoulders', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif' },
  preacher_curl:             { id: 'preacher_curl',             nameKey: 'exPreacherCurl',             muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Preacher-Curl.gif' },
  concentration_curl:        { id: 'concentration_curl',        nameKey: 'exConcentrationCurl',        muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif' },
  cable_curls:               { id: 'cable_curls',               nameKey: 'exCableCurls',               muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Bicep-Curl.gif' },
  barbell_curl:              { id: 'barbell_curl',              nameKey: 'exBarbellCurl',              muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif' },
  incline_db_curl:           { id: 'incline_db_curl',           nameKey: 'exInclineDbCurl',           muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Curl.gif' },
  tricep_pushdown:           { id: 'tricep_pushdown',           nameKey: 'exTricepPushdown',           muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif' },
  overhead_tricep_extension: { id: 'overhead_tricep_extension', nameKey: 'exOverheadTricepExtension', muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Overhead-Triceps-Extension.gif' },
  jm_press:                  { id: 'jm_press',                  nameKey: 'exJmPress',                  muscleGroup: 'arms',      isCompound: true },

  // ── Core add-ons ──
  hanging_leg_raise: { id: 'hanging_leg_raise', nameKey: 'exHangingLegRaise', muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Leg-Raise.gif' },
  ab_wheel:          { id: 'ab_wheel',          nameKey: 'exAbWheel',          muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Ab-Wheel-Rollout.gif' },
  cable_crunch:      { id: 'cable_crunch',      nameKey: 'exCableCrunch',      muscleGroup: 'core', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif' },
  weighted_crunch:   { id: 'weighted_crunch',   nameKey: 'exWeightedCrunch',   muscleGroup: 'core', isCompound: false },
  side_plank:        { id: 'side_plank',        nameKey: 'exSidePlank',        muscleGroup: 'core', isCompound: false },
  oblique_crunch:    { id: 'oblique_crunch',    nameKey: 'exObliqueCrunch',    muscleGroup: 'core', isCompound: false },

  // ── Programs V3 — additions for the 16-program library ──
  hack_squat:          { id: 'hack_squat',          nameKey: 'exHackSquat',          muscleGroup: 'legs',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hack-Squat.gif' },
  cable_pull_through:  { id: 'cable_pull_through',  nameKey: 'exCablePullThrough',  muscleGroup: 'legs',      isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Pull-Through.gif' },
  push_press:          { id: 'push_press',          nameKey: 'exPushPress',          muscleGroup: 'shoulders', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Press.gif' },
  spider_curl:         { id: 'spider_curl',         nameKey: 'exSpiderCurl',         muscleGroup: 'arms',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Spider-Curl.gif' },
  arnold_press:        { id: 'arnold_press',        nameKey: 'exArnoldPress',        muscleGroup: 'shoulders', isCompound: true,  gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif' },
  front_raise:         { id: 'front_raise',         nameKey: 'exFrontRaise',         muscleGroup: 'shoulders', isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif' },
  seated_leg_curl:     { id: 'seated_leg_curl',     nameKey: 'exSeatedLegCurl',     muscleGroup: 'legs',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Leg-Curl.gif' },
  seated_calf_raise:   { id: 'seated_calf_raise',   nameKey: 'exSeatedCalfRaise',   muscleGroup: 'legs',      isCompound: false, gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Calf-Raise.gif' },
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
