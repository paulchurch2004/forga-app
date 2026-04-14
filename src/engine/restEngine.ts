// Rest Time Engine — Calculates optimal rest periods based on objective, exercise type & rep range
import type { Objective } from '../types/user';
import { EXERCISES } from '../data/exercises';

export interface RestConfig {
  /** Rest between sets in seconds */
  restSeconds: number;
  /** Rest between exercises in seconds */
  transitionSeconds: number;
  /** i18n key for the explanation */
  reasonKey: string;
}

/**
 * Calculate optimal rest time based on:
 * - Exercise type (compound vs isolation)
 * - Rep range (strength vs hypertrophy vs endurance)
 * - User's objective (bulk/cut/maintain/recomp)
 */
export function getRestConfig(
  exerciseId: string,
  targetReps: number,
  objective: Objective,
): RestConfig {
  const exercise = EXERCISES[exerciseId];
  const isCompound = exercise?.isCompound ?? false;

  // Base rest time by rep range + exercise type
  let baseRest: number;
  let reasonKey: string;

  if (targetReps <= 5) {
    // Strength range (1-5 reps)
    baseRest = isCompound ? 180 : 120;
    reasonKey = 'restReasonStrength';
  } else if (targetReps <= 8) {
    // Heavy hypertrophy (6-8 reps)
    baseRest = isCompound ? 120 : 90;
    reasonKey = 'restReasonHeavyHypertrophy';
  } else if (targetReps <= 12) {
    // Moderate hypertrophy (9-12 reps)
    baseRest = isCompound ? 90 : 75;
    reasonKey = 'restReasonHypertrophy';
  } else {
    // Endurance / metabolic (13+ reps)
    baseRest = 60;
    reasonKey = 'restReasonEndurance';
  }

  // Objective modifier
  let objectiveModifier = 0;
  switch (objective) {
    case 'bulk':
      // Longer rest = more strength recovery = heavier loads
      objectiveModifier = 15;
      reasonKey = reasonKey + 'Bulk';
      break;
    case 'cut':
      // Shorter rest = more metabolic stress = more calories burned
      objectiveModifier = -15;
      reasonKey = reasonKey + 'Cut';
      break;
    case 'recomp':
      // Slightly shorter for metabolic effect
      objectiveModifier = -10;
      reasonKey = reasonKey + 'Recomp';
      break;
    // maintain: no modifier
  }

  const restSeconds = Math.max(45, baseRest + objectiveModifier);

  // Transition rest between exercises (slightly longer than set rest)
  const transitionSeconds = Math.min(restSeconds + 30, 180);

  return { restSeconds, transitionSeconds, reasonKey };
}

/**
 * Format seconds as M:SS or just seconds
 */
export function formatRestTime(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m${s.toString().padStart(2, '0')}` : `${m}min`;
  }
  return `${seconds}s`;
}
