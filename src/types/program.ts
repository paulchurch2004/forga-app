import type { MuscleGroup, Intensity } from './training';
import type { Objective } from './user';

// ── Program Template (static data) ──

/**
 * Program identifiers — 22 programs in the v3 library.
 * String type instead of strict union: dynamic IDs from persisted state
 * always need runtime PROGRAMS[id] lookup anyway.
 */
export type ProgramId = string;

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
  /** ISO date until which the program is paused (set by the coach
   *  `pause_program` action when the user is on vacation/injured). UI
   *  surfaces a "Programme en pause" banner and the streak engine treats
   *  paused days as neutral. Cleared by `resume_program`. */
  pausedUntil?: string;
}
