// FORGA — Strength self-assessment types.
// The user answers 3 bodyweight questions; we derive a starting strength
// level and seed weights for the main compound lifts.

export type StrengthLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced';

export interface StrengthTestAnswers {
  /** Has the user already trained seriously? */
  hasTrained: boolean;
  /** If yes, what's their best known 1RM (optional, kg). */
  knownBenchKg?: number;
  knownSquatKg?: number;
  knownDeadliftKg?: number;
  /** Bodyweight indicators (used when hasTrained === false). */
  pushupsMax?: number;
  squatsMax?: number;
  pullupsMax?: number;
}

export interface StartingWeights {
  squat: number;
  bench: number;
  deadlift: number;
  overheadPress: number;
  row: number;
  /** True if the user can do strict pull-ups (otherwise we suggest assisted). */
  canPullUp: boolean;
}

export interface StrengthTestResult {
  level: StrengthLevel;
  startingWeights: StartingWeights;
  /** ISO timestamp when the test was taken. */
  takenAt: string;
  /** Optional: the answers, kept for re-derivation if scoring changes. */
  answers: StrengthTestAnswers;
}
