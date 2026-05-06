// FORGA — Compare a freshly-completed workout to the previous one of the same type.
// Used by the post-workout celebration to surface "+X kg volume vs ta dernière séance".

import type { Workout } from '../types/training';

export interface WorkoutComparison {
  /** Volume diff in kg (positive = more, negative = less). null when no previous workout. */
  volumeDiffKg: number | null;
  /** Duration diff in minutes. null when no previous workout. */
  durationDiffMin: number | null;
  /** Number of exercises shared between the two workouts. */
  sharedExerciseCount: number;
  /** True when this workout has a higher total volume than the previous one. */
  isVolumeUp: boolean;
  /** Human-readable French sentence summarising the comparison. */
  summary: string;
}

function totalVolume(w: Workout): number {
  if (!Array.isArray(w.exercises)) return 0;
  let total = 0;
  for (const ex of w.exercises) {
    if (!Array.isArray(ex?.sets)) continue;
    for (const s of ex.sets) {
      total += (s?.weight ?? 0) * (s?.reps ?? 0);
    }
  }
  return Math.round(total);
}

/** Find the most recent workout BEFORE `current` of the same type. */
export function findPreviousWorkoutOfSameType(
  current: Workout,
  allWorkouts: Record<string, Workout[]>,
): Workout | null {
  const dates = Object.keys(allWorkouts).sort().reverse(); // most recent first
  for (const date of dates) {
    const list = allWorkouts[date] ?? [];
    for (const w of list) {
      if (w.id === current.id) continue;
      if (w.type !== current.type) continue;
      if (w.date > current.date) continue;
      if (w.date === current.date && w.timestamp >= current.timestamp) continue;
      return w;
    }
  }
  return null;
}

export function compareWorkouts(current: Workout, previous: Workout | null): WorkoutComparison {
  if (!previous) {
    return {
      volumeDiffKg: null,
      durationDiffMin: null,
      sharedExerciseCount: 0,
      isVolumeUp: false,
      summary: 'Première séance de ce type — référence enregistrée.',
    };
  }

  const currentVol = totalVolume(current);
  const prevVol = totalVolume(previous);
  const volumeDiff = currentVol - prevVol;
  const durationDiff = (current.durationMinutes ?? 0) - (previous.durationMinutes ?? 0);

  const currentExoIds = new Set(current.exercises?.map((e) => e.exerciseId) ?? []);
  const sharedExerciseCount = (previous.exercises ?? []).filter((e) =>
    currentExoIds.has(e.exerciseId),
  ).length;

  let summary: string;
  if (volumeDiff > 100) {
    summary = `+${volumeDiff} kg de volume vs ta dernière séance — tu progresses bien.`;
  } else if (volumeDiff > 0) {
    summary = `+${volumeDiff} kg de volume vs la dernière fois.`;
  } else if (volumeDiff === 0) {
    summary = 'Même volume que la dernière fois — tu maintiens.';
  } else if (volumeDiff > -100) {
    summary = `${volumeDiff} kg vs la dernière fois — léger creux, ça arrive.`;
  } else {
    summary = `${volumeDiff} kg vs la dernière fois. Vérifie ton sommeil et ta nutrition.`;
  }

  return {
    volumeDiffKg: volumeDiff,
    durationDiffMin: durationDiff,
    sharedExerciseCount,
    isVolumeUp: volumeDiff > 0,
    summary,
  };
}

/**
 * Generate a contextual post-workout message from the coach, based on the actual
 * session data. Pure function, no LLM call — fast, deterministic, free.
 */
export function generatePostWorkoutCoachMessage(args: {
  firstName?: string;
  workout: Workout;
  comparison: WorkoutComparison;
  prCount: number;
  trainingStreak: number;
  totalWorkouts: number;
}): string {
  const { firstName, workout, comparison, prCount, trainingStreak, totalWorkouts } = args;
  const name = firstName?.trim() || 'Champion';

  // PR celebration takes priority
  if (prCount > 0) {
    return `${name}, ${prCount} record${prCount > 1 ? 's' : ''} battu${prCount > 1 ? 's' : ''} aujourd'hui. C'est ça la progression — tu transformes l'effort en chiffres concrets. Continue.`;
  }

  // Streak milestone
  if (trainingStreak === 7) {
    return `${name}, 7 jours d'entraînement consécutifs. Une vraie semaine d'acier. La constance, c'est ça qui fait la différence sur 6 mois.`;
  }
  if (trainingStreak === 30) {
    return `${name}, 30 jours de suite. Un mois d'acier. Tu es entré dans le club des sérieux. Garde ce rythme.`;
  }

  // Volume up
  if (comparison.volumeDiffKg !== null && comparison.volumeDiffKg > 200) {
    return `${name}, ${comparison.volumeDiffKg} kg de volume en plus que la dernière fois. C'est exactement comme ça qu'on construit du muscle. Récup bien et garde le cap.`;
  }
  if (comparison.volumeDiffKg !== null && comparison.volumeDiffKg > 0) {
    return `${name}, +${comparison.volumeDiffKg} kg de volume vs la dernière. Petit progrès = gros résultats sur 12 semaines.`;
  }

  // First workout
  if (totalWorkouts === 1) {
    return `${name}, ta première séance est dans le sac. Le plus dur c'était de venir — tu l'as fait. À demain.`;
  }

  // Volume down
  if (comparison.volumeDiffKg !== null && comparison.volumeDiffKg < -200) {
    return `${name}, séance en retrait par rapport à la dernière. Vérifie ton sommeil et ce que tu as mangé. Pas grave, on remonte la prochaine fois.`;
  }

  // Long session
  if (workout.durationMinutes >= 75) {
    return `${name}, ${workout.durationMinutes} min de séance, du sérieux. Pense à bien manger dans les 2h pour la récup.`;
  }

  // Short but done
  if (workout.durationMinutes < 30) {
    return `${name}, séance courte mais faite. Mieux vaut 25 min que rien — la régularité bat l'intensité ponctuelle.`;
  }

  // Default
  return `${name}, séance bouclée. Bien hydraté ? Pense aux 30g de protéines dans l'heure qui suit.`;
}

export type LiveCoachKindLite = 'form' | 'rest' | 'push' | 'swap';

/**
 * Pick the most relevant LiveCoach intervention based on what actually happened
 * on the live exercise. Pure function — no LLM, deterministic, instant.
 *
 * Heuristics:
 * - Big undershoot of target reps → form (technique broke / fatigue piling up)
 * - Reps at-or-above target with same weight as last session → push (try heavier)
 * - Reps significantly below last session at same weight → rest (under-recovered)
 * - No previous session data → form (default to safety)
 * - Stalled vs last 2 sessions (same weight, same reps) → swap
 */
export function pickLiveCoachKind(args: {
  weight: number;
  reps: number;
  targetReps: number;
  lastSessionSets: { weight: number; reps: number }[] | null;
}): LiveCoachKindLite {
  const { weight, reps, targetReps, lastSessionSets } = args;

  // No history → form is the safest default
  if (!lastSessionSets || lastSessionSets.length === 0) {
    return reps < targetReps - 2 ? 'form' : 'push';
  }

  const last = lastSessionSets;
  const lastTopWeight = Math.max(...last.map((s) => s.weight));
  const lastSameWeightSet = last.find((s) => Math.abs(s.weight - weight) < 0.5);

  // Hit or beat target with same weight as previous best → push for next time
  if (reps >= targetReps && weight >= lastTopWeight) {
    return 'push';
  }

  // Significantly under target at this weight → form (likely technique fading)
  if (reps < targetReps - 3) {
    return 'form';
  }

  // Same weight as last session but fewer reps → under-recovered, suggest rest
  if (lastSameWeightSet && reps < lastSameWeightSet.reps - 1) {
    return 'rest';
  }

  // Stalled — same weight, same reps as last session at the working set
  if (lastSameWeightSet && reps === lastSameWeightSet.reps) {
    return 'swap';
  }

  // Beat last session reps at same weight → push
  if (lastSameWeightSet && reps > lastSameWeightSet.reps) {
    return 'push';
  }

  return 'form';
}

/**
 * Suggest the next-set weight target based on the just-completed set.
 * Simple, deterministic progression rules:
 * - Hit reps target ≥ 2 above target → +5% (or +2.5kg minimum)
 * - Hit reps target exactly → +2.5kg
 * - Below target by 1-2 → keep same weight, push for more reps
 * - Below target by 3+ → drop 5% (or -2.5kg minimum)
 */
export function suggestNextWeight(args: {
  weight: number;
  reps: number;
  targetReps: number;
}): { weight: number; rationale: string } {
  const { weight, reps, targetReps } = args;
  const minStep = 2.5;

  if (reps >= targetReps + 2) {
    const next = Math.round((weight * 1.05) / minStep) * minStep;
    const stepped = Math.max(next, weight + minStep);
    return {
      weight: stepped,
      rationale: `${reps} reps c'est solide — tente ${stepped} kg la prochaine.`,
    };
  }
  if (reps >= targetReps) {
    const next = weight + minStep;
    return {
      weight: next,
      rationale: `Objectif touché — passe à ${next} kg la prochaine séance.`,
    };
  }
  if (reps >= targetReps - 2) {
    return {
      weight,
      rationale: `Garde ${weight} kg, vise ${targetReps} reps la prochaine.`,
    };
  }
  const next = Math.max(minStep, Math.round((weight * 0.95) / minStep) * minStep);
  return {
    weight: next,
    rationale: `Trop lourd aujourd'hui — redescends à ${next} kg pour bien tenir la forme.`,
  };
}
