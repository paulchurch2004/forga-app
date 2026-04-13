import type { MuscleGroup, Intensity } from './training';
import type { Objective } from './user';

// ── Program Template (static data) ──

export type ProgramId = 'full_body' | 'upper_lower' | 'ppl' | 'stronglifts_5x5';

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
}
