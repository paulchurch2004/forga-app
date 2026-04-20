export type WorkoutType =
  | 'musculation'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'hiit'
  | 'sport_collectif'
  | 'yoga_stretching'
  | 'marche'
  | 'autre';

export type Intensity = 'easy' | 'moderate' | 'intense';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio';

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number; // kg
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string; // denormalized for display
  sets: ExerciseSet[];
  restSeconds?: number;
}

export interface Exercise {
  id: string;
  nameKey: string; // i18n key
  muscleGroup: MuscleGroup;
  isCompound: boolean;
  gifUrl?: string; // animated demo GIF URL
}

export interface Workout {
  id: string;
  date: string; // 'YYYY-MM-DD'
  timestamp: string; // ISO string
  type: WorkoutType;
  durationMinutes: number;
  intensity: Intensity;
  exercises: WorkoutExercise[]; // populated for musculation
  note?: string;
}
