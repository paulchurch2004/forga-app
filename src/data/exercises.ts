import type { Exercise, MuscleGroup } from '../types/training';

// Démos animées : GIFs courts depuis fitnessprogramer.com (boucle 3-5s).
// Vidéos tuto : YouTube searches stables vers des chaînes de référence
// (Athlean-X, Jeff Nippard, Jeremy Ethier, Squat University, Jeff Cavaliere).
// On utilise le format "youtube.com/results?search_query=..." plutôt que des
// liens directs vers vidéos précises pour éviter les liens morts si une
// vidéo est supprimée. Le top résultat YouTube reste pertinent dans le temps.

const yt = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const EXERCISES: Record<string, Exercise> = {
  // ── Chest ──
  bench_press: {
    id: 'bench_press', nameKey: 'exBenchPress', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    videoUrl: yt('barbell bench press tutorial form'),
  },
  incline_press: {
    id: 'incline_press', nameKey: 'exInclinePress', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif',
    videoUrl: yt('incline barbell bench press tutorial form'),
  },
  dips: {
    id: 'dips', nameKey: 'exDips', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif',
    videoUrl: yt('chest dips tutorial form'),
  },
  chest_fly: {
    id: 'chest_fly', nameKey: 'exChestFly', muscleGroup: 'chest', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
    videoUrl: yt('dumbbell chest fly tutorial form'),
  },

  // ── Back ──
  pull_ups: {
    id: 'pull_ups', nameKey: 'exPullUps', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
    videoUrl: yt('pull ups tutorial proper form'),
  },
  barbell_rows: {
    id: 'barbell_rows', nameKey: 'exBarbellRows', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    videoUrl: yt('barbell bent over row tutorial form'),
  },
  lat_pulldown: {
    id: 'lat_pulldown', nameKey: 'exLatPulldown', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
    videoUrl: yt('lat pulldown tutorial form'),
  },
  deadlift: {
    id: 'deadlift', nameKey: 'exDeadlift', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
    videoUrl: yt('barbell deadlift tutorial proper form'),
  },

  // ── Shoulders ──
  overhead_press: {
    id: 'overhead_press', nameKey: 'exOverheadPress', muscleGroup: 'shoulders', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
    videoUrl: yt('overhead press tutorial form'),
  },
  lateral_raises: {
    id: 'lateral_raises', nameKey: 'exLateralRaises', muscleGroup: 'shoulders', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
    videoUrl: yt('dumbbell lateral raise tutorial form'),
  },
  face_pulls: {
    id: 'face_pulls', nameKey: 'exFacePulls', muscleGroup: 'shoulders', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',
    videoUrl: yt('cable face pulls tutorial form'),
  },
  shrugs: {
    id: 'shrugs', nameKey: 'exShrugs', muscleGroup: 'shoulders', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shrug.gif',
    videoUrl: yt('barbell shrug tutorial form'),
  },

  // ── Arms ──
  bicep_curls: {
    id: 'bicep_curls', nameKey: 'exBicepCurls', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif',
    videoUrl: yt('dumbbell bicep curl tutorial form'),
  },
  tricep_extensions: {
    id: 'tricep_extensions', nameKey: 'exTricepExtensions', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif',
    videoUrl: yt('dumbbell tricep extension tutorial form'),
  },
  hammer_curls: {
    id: 'hammer_curls', nameKey: 'exHammerCurls', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
    videoUrl: yt('hammer curls tutorial form'),
  },
  skull_crushers: {
    id: 'skull_crushers', nameKey: 'exSkullCrushers', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Skull-Crusher.gif',
    videoUrl: yt('skull crushers tricep tutorial form'),
  },

  // ── Legs ──
  squat: {
    id: 'squat', nameKey: 'exSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
    videoUrl: yt('barbell back squat tutorial proper form'),
  },
  leg_press: {
    id: 'leg_press', nameKey: 'exLegPress', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/10/leg-press.gif',
    videoUrl: yt('leg press machine tutorial form'),
  },
  lunges: {
    id: 'lunges', nameKey: 'exLunges', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
    videoUrl: yt('dumbbell lunge tutorial form'),
  },
  leg_curl: {
    id: 'leg_curl', nameKey: 'exLegCurl', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif',
    videoUrl: yt('lying leg curl machine tutorial'),
  },
  leg_extension: {
    id: 'leg_extension', nameKey: 'exLegExtension', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
    videoUrl: yt('leg extension machine tutorial form'),
  },
  calf_raises: {
    id: 'calf_raises', nameKey: 'exCalfRaises', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif',
    videoUrl: yt('standing calf raises tutorial form'),
  },
  romanian_deadlift: {
    id: 'romanian_deadlift', nameKey: 'exRomanianDeadlift', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif',
    videoUrl: yt('romanian deadlift tutorial proper form'),
  },

  // ── Core ──
  plank: {
    id: 'plank', nameKey: 'exPlank', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif',
    videoUrl: yt('plank tutorial proper form'),
  },
  crunches: {
    id: 'crunches', nameKey: 'exCrunches', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif',
    videoUrl: yt('crunches abs tutorial form'),
  },
  leg_raises: {
    id: 'leg_raises', nameKey: 'exLegRaises', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Raise.gif',
    videoUrl: yt('lying leg raises tutorial form'),
  },
  russian_twist: {
    id: 'russian_twist', nameKey: 'exRussianTwist', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif',
    videoUrl: yt('russian twist tutorial form'),
  },

  // ── Cardio (sans GIFs — animations 3D peu pertinentes ; vidéos tuto OK) ──
  running:    { id: 'running',    nameKey: 'exRunning',    muscleGroup: 'cardio', isCompound: false, videoUrl: yt('running technique tutorial beginners') },
  cycling:    { id: 'cycling',    nameKey: 'exCycling',    muscleGroup: 'cardio', isCompound: false, videoUrl: yt('cycling training beginners tutorial') },
  swimming:   { id: 'swimming',   nameKey: 'exSwimming',   muscleGroup: 'cardio', isCompound: false, videoUrl: yt('swimming freestyle technique tutorial') },
  hiit:       { id: 'hiit',       nameKey: 'exHiit',       muscleGroup: 'cardio', isCompound: false, videoUrl: yt('hiit workout 20 minutes beginner') },
  jump_rope:  { id: 'jump_rope',  nameKey: 'exJumpRope',   muscleGroup: 'cardio', isCompound: false, videoUrl: yt('jump rope tutorial beginners form') },
  rowing:     { id: 'rowing',     nameKey: 'exRowing',     muscleGroup: 'cardio', isCompound: false, videoUrl: yt('rowing machine technique tutorial') },
  elliptical: { id: 'elliptical', nameKey: 'exElliptical', muscleGroup: 'cardio', isCompound: false, videoUrl: yt('elliptical machine tutorial beginners') },

  // ── Legs add-ons ──
  hip_thrust: {
    id: 'hip_thrust', nameKey: 'exHipThrust', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Thrust.gif',
    videoUrl: yt('barbell hip thrust tutorial form glute'),
  },
  glute_bridge: {
    id: 'glute_bridge', nameKey: 'exGluteBridge', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge.gif',
    videoUrl: yt('glute bridge tutorial form'),
  },
  bulgarian_split_squat: {
    id: 'bulgarian_split_squat', nameKey: 'exBulgarianSplitSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif',
    videoUrl: yt('bulgarian split squat tutorial form'),
  },
  cable_kickbacks: {
    id: 'cable_kickbacks', nameKey: 'exCableKickbacks', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Kickback.gif',
    videoUrl: yt('cable glute kickback tutorial'),
  },
  sumo_deadlift: {
    id: 'sumo_deadlift', nameKey: 'exSumoDeadlift', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sumo-Deadlift.gif',
    videoUrl: yt('sumo deadlift tutorial proper form'),
  },
  good_morning: {
    id: 'good_morning', nameKey: 'exGoodMorning', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Good-Morning.gif',
    videoUrl: yt('good morning exercise tutorial form'),
  },
  walking_lunges: {
    id: 'walking_lunges', nameKey: 'exWalkingLunges', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Walking-Lunge.gif',
    videoUrl: yt('walking lunges dumbbell tutorial'),
  },
  single_leg_hip_thrust: {
    id: 'single_leg_hip_thrust', nameKey: 'exSingleLegHipThrust', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Single-Leg-Hip-Thrust.gif',
    videoUrl: yt('single leg hip thrust tutorial form'),
  },
  pause_hip_thrust: {
    id: 'pause_hip_thrust', nameKey: 'exPauseHipThrust', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Thrust.gif',
    videoUrl: yt('pause hip thrust tutorial form glute'),
  },
  abductor_machine: {
    id: 'abductor_machine', nameKey: 'exAbductorMachine', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hip-Abduction-Machine.gif',
    videoUrl: yt('hip abduction machine tutorial'),
  },
  banded_side_walk: {
    id: 'banded_side_walk', nameKey: 'exBandedSideWalk', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Banded-Side-Step.gif',
    videoUrl: yt('banded lateral walk monster walk tutorial'),
  },
  step_ups: {
    id: 'step_ups', nameKey: 'exStepUps', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Step-Up.gif',
    videoUrl: yt('dumbbell step ups tutorial form'),
  },
  front_squat: {
    id: 'front_squat', nameKey: 'exFrontSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Front-Squat.gif',
    videoUrl: yt('barbell front squat tutorial form'),
  },
  goblet_squat: {
    id: 'goblet_squat', nameKey: 'exGobletSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif',
    videoUrl: yt('goblet squat tutorial form'),
  },
  pause_squat: {
    id: 'pause_squat', nameKey: 'exPauseSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
    videoUrl: yt('pause squat technique tutorial'),
  },
  pistol_squat: {
    id: 'pistol_squat', nameKey: 'exPistolSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pistol-Squat.gif',
    videoUrl: yt('pistol squat progression tutorial'),
  },

  // ── Back add-ons ──
  seated_cable_row: {
    id: 'seated_cable_row', nameKey: 'exSeatedCableRow', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
    videoUrl: yt('seated cable row tutorial form'),
  },
  t_bar_row: {
    id: 't_bar_row', nameKey: 'exTBarRow', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/T-Bar-Row.gif',
    videoUrl: yt('t bar row tutorial form'),
  },
  pendlay_row: {
    id: 'pendlay_row', nameKey: 'exPendlayRow', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
    videoUrl: yt('pendlay row tutorial proper form'),
  },
  rack_pull: {
    id: 'rack_pull', nameKey: 'exRackPull', muscleGroup: 'back', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rack-Pull.gif',
    videoUrl: yt('rack pull tutorial form deadlift'),
  },
  reverse_pec_deck: {
    id: 'reverse_pec_deck', nameKey: 'exReversePecDeck', muscleGroup: 'back', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Fly.gif',
    videoUrl: yt('reverse pec deck rear delt tutorial'),
  },

  // ── Chest add-ons ──
  incline_db_press: {
    id: 'incline_db_press', nameKey: 'exInclineDbPress', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Bench-Press.gif',
    videoUrl: yt('incline dumbbell press tutorial form'),
  },
  close_grip_bench: {
    id: 'close_grip_bench', nameKey: 'exCloseGripBench', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif',
    videoUrl: yt('close grip bench press tricep tutorial'),
  },
  pause_bench: {
    id: 'pause_bench', nameKey: 'exPauseBench', muscleGroup: 'chest', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
    videoUrl: yt('pause bench press technique tutorial'),
  },
  cable_fly: {
    id: 'cable_fly', nameKey: 'exCableFly', muscleGroup: 'chest', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif',
    videoUrl: yt('cable chest fly crossover tutorial'),
  },
  pec_deck: {
    id: 'pec_deck', nameKey: 'exPecDeck', muscleGroup: 'chest', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Machine-Chest-Fly.gif',
    videoUrl: yt('pec deck machine tutorial form'),
  },
  incline_fly: {
    id: 'incline_fly', nameKey: 'exInclineFly', muscleGroup: 'chest', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Fly.gif',
    videoUrl: yt('incline dumbbell fly tutorial form'),
  },

  // ── Shoulders / Arms add-ons ──
  seated_db_press: {
    id: 'seated_db_press', nameKey: 'exSeatedDbPress', muscleGroup: 'shoulders', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
    videoUrl: yt('seated dumbbell shoulder press tutorial'),
  },
  upright_row: {
    id: 'upright_row', nameKey: 'exUprightRow', muscleGroup: 'shoulders', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Upright-Row.gif',
    videoUrl: yt('barbell upright row tutorial form'),
  },
  cable_lateral: {
    id: 'cable_lateral', nameKey: 'exCableLateral', muscleGroup: 'shoulders', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Lateral-Raise.gif',
    videoUrl: yt('cable lateral raise tutorial form'),
  },
  preacher_curl: {
    id: 'preacher_curl', nameKey: 'exPreacherCurl', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Preacher-Curl.gif',
    videoUrl: yt('preacher curl bicep tutorial'),
  },
  concentration_curl: {
    id: 'concentration_curl', nameKey: 'exConcentrationCurl', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif',
    videoUrl: yt('concentration curl bicep tutorial'),
  },
  cable_curls: {
    id: 'cable_curls', nameKey: 'exCableCurls', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Bicep-Curl.gif',
    videoUrl: yt('cable bicep curl tutorial'),
  },
  barbell_curl: {
    id: 'barbell_curl', nameKey: 'exBarbellCurl', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
    videoUrl: yt('barbell curl bicep tutorial form'),
  },
  incline_db_curl: {
    id: 'incline_db_curl', nameKey: 'exInclineDbCurl', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Curl.gif',
    videoUrl: yt('incline dumbbell curl tutorial'),
  },
  tricep_pushdown: {
    id: 'tricep_pushdown', nameKey: 'exTricepPushdown', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Pushdown.gif',
    videoUrl: yt('cable tricep pushdown tutorial'),
  },
  overhead_tricep_extension: {
    id: 'overhead_tricep_extension', nameKey: 'exOverheadTricepExtension', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Overhead-Triceps-Extension.gif',
    videoUrl: yt('overhead tricep extension tutorial'),
  },
  jm_press: {
    id: 'jm_press', nameKey: 'exJmPress', muscleGroup: 'arms', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif',
    videoUrl: yt('jm press tutorial tricep form'),
  },

  // ── Core add-ons ──
  hanging_leg_raise: {
    id: 'hanging_leg_raise', nameKey: 'exHangingLegRaise', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Leg-Raise.gif',
    videoUrl: yt('hanging leg raises tutorial form'),
  },
  ab_wheel: {
    id: 'ab_wheel', nameKey: 'exAbWheel', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Ab-Wheel-Rollout.gif',
    videoUrl: yt('ab wheel rollout tutorial form'),
  },
  cable_crunch: {
    id: 'cable_crunch', nameKey: 'exCableCrunch', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif',
    videoUrl: yt('cable crunch tutorial form'),
  },
  weighted_crunch: {
    id: 'weighted_crunch', nameKey: 'exWeightedCrunch', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Weighted-Crunch.gif',
    videoUrl: yt('weighted crunch tutorial form'),
  },
  side_plank: {
    id: 'side_plank', nameKey: 'exSidePlank', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Side-Plank.gif',
    videoUrl: yt('side plank tutorial form'),
  },
  oblique_crunch: {
    id: 'oblique_crunch', nameKey: 'exObliqueCrunch', muscleGroup: 'core', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif',
    videoUrl: yt('oblique crunch tutorial form'),
  },

  // ── Programs V3 additions ──
  hack_squat: {
    id: 'hack_squat', nameKey: 'exHackSquat', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hack-Squat.gif',
    videoUrl: yt('hack squat machine tutorial form'),
  },
  cable_pull_through: {
    id: 'cable_pull_through', nameKey: 'exCablePullThrough', muscleGroup: 'legs', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Pull-Through.gif',
    videoUrl: yt('cable pull through tutorial glute hamstring'),
  },
  push_press: {
    id: 'push_press', nameKey: 'exPushPress', muscleGroup: 'shoulders', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Press.gif',
    videoUrl: yt('push press tutorial proper form'),
  },
  spider_curl: {
    id: 'spider_curl', nameKey: 'exSpiderCurl', muscleGroup: 'arms', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Spider-Curl.gif',
    videoUrl: yt('spider curl bicep tutorial'),
  },
  arnold_press: {
    id: 'arnold_press', nameKey: 'exArnoldPress', muscleGroup: 'shoulders', isCompound: true,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif',
    videoUrl: yt('arnold press shoulder tutorial'),
  },
  front_raise: {
    id: 'front_raise', nameKey: 'exFrontRaise', muscleGroup: 'shoulders', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Front-Raise.gif',
    videoUrl: yt('dumbbell front raise tutorial form'),
  },
  seated_leg_curl: {
    id: 'seated_leg_curl', nameKey: 'exSeatedLegCurl', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Leg-Curl.gif',
    videoUrl: yt('seated leg curl machine tutorial'),
  },
  seated_calf_raise: {
    id: 'seated_calf_raise', nameKey: 'exSeatedCalfRaise', muscleGroup: 'legs', isCompound: false,
    gifUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Calf-Raise.gif',
    videoUrl: yt('seated calf raise machine tutorial'),
  },
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
