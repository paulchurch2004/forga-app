import type { MuscleGroup, Intensity } from './training';
import type { Objective } from './user';

// ── Program Template (static data) ──

/**
 * Program identifiers.
 * v1 ids ('full_body', 'upper_lower', 'ppl') are kept for backwards compat
 * with users who already have an activePlan in AsyncStorage. New users get
 * the v2 sex-aware variants below.
 */
export type ProgramId =
  // v2 — sex-aware
  | 'full_body_h'
  | 'full_body_f'
  | 'upper_lower_h'
  | 'upper_lower_f'
  | 'ppl_h'
  | 'ppl_f'
  | 'stronglifts_5x5'
  // v1 legacy — alias-resolved at runtime in programEngine
  | 'full_body'
  | 'upper_lower'
  | 'ppl';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export type ProgramDayType = 'muscu' | 'cardio' | 'rest';

export interface ProgramExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

export interface CardioSpec {
  exerciseId: string;
  durationMinutes: number;
  intensity: Intensity;
}

export interface ProgramDay {
  id: string;
  nameKey: string;
  type: ProgramDayType;
  muscleGroups: MuscleGroup[];
  exercises: ProgramExercise[];
  cardio?: CardioSpec;
}

export interface TrainingProgram {
  id: ProgramId;
  nameKey: string;
  descriptionKey: string;
  daysPerWeek: number;
  levelKey: string;
  rotation: ProgramDay[];
  trainingSlots: number[]; // 0=Mon..6=Sun
  /** Which sex this program is calibrated for. 'unisex' = both. */
  sexVariant?: 'male' | 'female' | 'unisex';
  /** Recommended level (used by recommendProgram + program selector UI). */
  level?: Level;
}

// ── Generated Plan (user's active instance) ──

export type PlannedDayStatus = 'upcoming' | 'today' | 'completed' | 'skipped' | 'rest';

export interface PlannedDay {
  date: string;
  dayOfWeek: number; // 0=Mon..6=Sun
  programDayId: string | null;
  status: PlannedDayStatus;
  workoutId?: string;
}

export interface CardioRecommendation {
  sessionsPerWeek: number;
  type: 'liss' | 'hiit' | 'mixed';
  durationMinutes: number;
  descriptionKey: string;
}

export interface GeneratedPlan {
  programId: ProgramId;
  startDate: string;
  endDate: string;
  days: PlannedDay[];
  cardioRecommendation: CardioRecommendation;
  /** Per-day exercise swaps. date → originalExerciseId → newExerciseId. */
  exerciseOverrides?: Record<string, Record<string, string>>;
}
