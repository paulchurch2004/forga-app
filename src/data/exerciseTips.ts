export interface ExerciseTutorial {
  /** YouTube video URL for the exercise tutorial */
  videoUrl: string;
  /** i18n keys for the 3-5 form tips */
  tipKeys: string[];
}

/**
 * Tutorial data for muscu exercises only.
 * Tips text lives in fr.ts/en.ts under keys tipBenchPress1, tipSquat2, etc.
 */
export const EXERCISE_TUTORIALS: Record<string, ExerciseTutorial> = {
  // ── Chest ──
  bench_press: {
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    tipKeys: ['tipBenchPress1', 'tipBenchPress2', 'tipBenchPress3', 'tipBenchPress4'],
  },
  incline_press: {
    videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrYU',
    tipKeys: ['tipInclinePress1', 'tipInclinePress2', 'tipInclinePress3'],
  },
  dips: {
    videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    tipKeys: ['tipDips1', 'tipDips2', 'tipDips3', 'tipDips4'],
  },
  chest_fly: {
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    tipKeys: ['tipChestFly1', 'tipChestFly2', 'tipChestFly3'],
  },

  // ── Back ──
  pull_ups: {
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    tipKeys: ['tipPullUps1', 'tipPullUps2', 'tipPullUps3', 'tipPullUps4'],
  },
  barbell_rows: {
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
    tipKeys: ['tipBarbellRows1', 'tipBarbellRows2', 'tipBarbellRows3', 'tipBarbellRows4'],
  },
  lat_pulldown: {
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    tipKeys: ['tipLatPulldown1', 'tipLatPulldown2', 'tipLatPulldown3'],
  },
  deadlift: {
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    tipKeys: ['tipDeadlift1', 'tipDeadlift2', 'tipDeadlift3', 'tipDeadlift4', 'tipDeadlift5'],
  },

  // ── Shoulders ──
  overhead_press: {
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    tipKeys: ['tipOverheadPress1', 'tipOverheadPress2', 'tipOverheadPress3', 'tipOverheadPress4'],
  },
  lateral_raises: {
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    tipKeys: ['tipLateralRaises1', 'tipLateralRaises2', 'tipLateralRaises3'],
  },
  face_pulls: {
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    tipKeys: ['tipFacePulls1', 'tipFacePulls2', 'tipFacePulls3'],
  },
  shrugs: {
    videoUrl: 'https://www.youtube.com/watch?v=cJRVVxmytaM',
    tipKeys: ['tipShrugs1', 'tipShrugs2', 'tipShrugs3'],
  },

  // ── Arms ──
  bicep_curls: {
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    tipKeys: ['tipBicepCurls1', 'tipBicepCurls2', 'tipBicepCurls3'],
  },
  tricep_extensions: {
    videoUrl: 'https://www.youtube.com/watch?v=nRiJVZDpdL0',
    tipKeys: ['tipTricepExtensions1', 'tipTricepExtensions2', 'tipTricepExtensions3'],
  },
  hammer_curls: {
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    tipKeys: ['tipHammerCurls1', 'tipHammerCurls2', 'tipHammerCurls3'],
  },
  skull_crushers: {
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    tipKeys: ['tipSkullCrushers1', 'tipSkullCrushers2', 'tipSkullCrushers3'],
  },

  // ── Legs ──
  squat: {
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    tipKeys: ['tipSquat1', 'tipSquat2', 'tipSquat3', 'tipSquat4', 'tipSquat5'],
  },
  leg_press: {
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    tipKeys: ['tipLegPress1', 'tipLegPress2', 'tipLegPress3'],
  },
  lunges: {
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    tipKeys: ['tipLunges1', 'tipLunges2', 'tipLunges3', 'tipLunges4'],
  },
  leg_curl: {
    videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
    tipKeys: ['tipLegCurl1', 'tipLegCurl2', 'tipLegCurl3'],
  },
  leg_extension: {
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    tipKeys: ['tipLegExtension1', 'tipLegExtension2', 'tipLegExtension3'],
  },
  calf_raises: {
    videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI',
    tipKeys: ['tipCalfRaises1', 'tipCalfRaises2', 'tipCalfRaises3'],
  },
  romanian_deadlift: {
    videoUrl: 'https://www.youtube.com/watch?v=jEy_czb3RKA',
    tipKeys: ['tipRomanianDeadlift1', 'tipRomanianDeadlift2', 'tipRomanianDeadlift3', 'tipRomanianDeadlift4'],
  },

  // ── Core ──
  plank: {
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    tipKeys: ['tipPlank1', 'tipPlank2', 'tipPlank3'],
  },
  crunches: {
    videoUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    tipKeys: ['tipCrunches1', 'tipCrunches2', 'tipCrunches3'],
  },
  leg_raises: {
    videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI',
    tipKeys: ['tipLegRaises1', 'tipLegRaises2', 'tipLegRaises3'],
  },
  russian_twist: {
    videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
    tipKeys: ['tipRussianTwist1', 'tipRussianTwist2', 'tipRussianTwist3'],
  },
};

/** Check if an exercise has tutorial data available */
export function hasTutorial(exerciseId: string): boolean {
  return exerciseId in EXERCISE_TUTORIALS;
}
