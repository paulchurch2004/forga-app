import { useMemo } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { EXERCISES } from '../data/exercises';
import type { PrItem } from '../components/profile/PrCard';

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function dateLabel(dateStr: string): string {
  const days = daysAgo(dateStr);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)}sem`;
  return `Il y a ${Math.floor(days / 30)}mois`;
}

interface ExerciseBest {
  exerciseId: string;
  weight: number;
  date: string;
  previousWeight?: number;
}

/**
 * Returns the top `limit` exercises with the heaviest current PR,
 * including the previous-best so we can show a delta. Uses real data
 * from useTrainingStore.workouts.
 */
export function useTopPRs(limit = 3): PrItem[] {
  const workouts = useTrainingStore((s) => s.workouts);

  return useMemo(() => {
    // Collect all weights per exercise across all workouts, oldest first
    const perExercise: Record<
      string,
      { weight: number; date: string }[]
    > = {};

    const dates = Object.keys(workouts).sort(); // ascending
    for (const date of dates) {
      for (const w of workouts[date]) {
        for (const ex of w.exercises) {
          if (!perExercise[ex.exerciseId]) perExercise[ex.exerciseId] = [];
          for (const s of ex.sets) {
            if (s.weight > 0) {
              perExercise[ex.exerciseId].push({ weight: s.weight, date });
            }
          }
        }
      }
    }

    // For each exercise, find current PR + previous-best (next-highest weight ever lifted)
    const bests: ExerciseBest[] = Object.entries(perExercise).map(([exerciseId, lifts]) => {
      const sorted = [...lifts].sort((a, b) => b.weight - a.weight);
      const current = sorted[0]!;
      const previous = sorted.find((l) => l.weight < current.weight);
      return {
        exerciseId,
        weight: current.weight,
        date: current.date,
        previousWeight: previous?.weight,
      };
    });

    // Sort by date desc (most recent PRs first), then take top N
    bests.sort((a, b) => (a.date < b.date ? 1 : -1));

    return bests.slice(0, limit).map<PrItem>((b, i) => {
      const exo = EXERCISES[b.exerciseId];
      const delta = b.previousWeight !== undefined ? b.weight - b.previousWeight : undefined;
      return {
        id: `${b.exerciseId}-${b.date}-${i}`,
        exercise: exo?.nameFr ?? b.exerciseId,
        value: b.weight,
        unit: 'kg',
        previous: b.previousWeight,
        delta: delta && delta > 0 ? Math.round(delta * 10) / 10 : undefined,
        dateLabel: dateLabel(b.date),
      };
    });
  }, [workouts, limit]);
}
