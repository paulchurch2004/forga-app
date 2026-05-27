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
  /** Multiplicateur appliqué au poids suggéré pour CETTE entrée précise.
   *  Utilisé quand le même exercice apparaît 2× dans la même séance
   *  avec des intensités différentes (5/3/1 BBB : top set lourd à 85%
   *  puis BBB léger à 50-60%). Sans ce facteur, les deux entrées
   *  héritaient de la MÊME charge → l'user voyait 62.5 kg pour 5 reps
   *  ET pour 10 reps, ce qui est cassé physiologiquement.
   *  - undefined : pas de modif (comportement par défaut, top set / unique entry)
   *  - 0.6 : BBB après top set 5/3/1
   *  - 0.5 : back-off très léger
   *  - 1.1+ : top set encore plus lourd qu'un seed standard (rare) */
  weightFactor?: number;
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
  /** Lieu d'entraînement requis. 'gym' = barres + racks + machines.
   *  'home' = haltères + élastiques + poids du corps. Pilote le choix
   *  entre versions Salle et Maison du même split. */
  location?: 'gym' | 'home';
  /** Objectif primaire — utilisé par programAssignment pour filtrer.
   *  Permet aussi de mutualiser les ProgramDays entre les 4 objectifs
   *  hypertrophie (mêmes exos, seul le volume × multiplier d'objectif
   *  s'applique côté moteur). */
  objective?: 'bulk' | 'cut' | 'maintain' | 'recomp' | 'force';
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
