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
  /** Exercice TENU dans le temps plutôt que comptabilisé en reps
   *  (plank, side_plank, hollow hold, etc.). Quand true : le champ
   *  `targetReps` du ProgramExercise est interprété comme des SECONDES
   *  de tenue. L'UI doit afficher "X s" au lieu de "X reps", et la
   *  progression se valide quand l'user a tenu la durée complète. */
  isTimed?: boolean;
  /** Démo animée — GIF court (3-5s) qui boucle. Affiché sur la card
   *  d'exercice et dans le picker. Source principale : fitnessprogramer.com */
  gifUrl?: string;
  /** Vidéo tuto longue (1-3 min) sur YouTube — exécution technique
   *  détaillée + erreurs communes. Cliquable depuis la card "Voir le
   *  tuto vidéo" qui ouvre l'app YouTube ou le navigateur. Optionnel
   *  car certains exos très simples (plank, side_plank) n'en ont pas
   *  besoin. */
  videoUrl?: string;
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
  /** Self-rated overall session quality (1-5 stars). */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Self-rated effort (RPE 1-10). 1=very easy, 10=max effort. */
  rpe?: number;
  /** Optional: count of new PRs detected during this session. */
  prCount?: number;
}
