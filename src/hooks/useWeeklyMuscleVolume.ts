import { useMemo } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { EXERCISES } from '../data/exercises';
import { todayLocalIso, localIso } from '../utils/date';
import type { MuscleGroup } from '../types/training';

export interface MuscleVolume {
  muscle: MuscleGroup;
  /** Total volume (kg × reps) on this muscle this week. */
  volumeKg: number;
  /** Total set count on this muscle this week. */
  sets: number;
  /** Pct of weekly total volume. */
  pctOfTotal: number;
}

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  arms: 'Bras',
  legs: 'Jambes',
  core: 'Abdos',
  cardio: 'Cardio',
};

export function getMuscleLabel(m: MuscleGroup): string {
  return MUSCLE_LABELS[m] ?? m;
}

/**
 * Compute volume + sets per muscle group across the past 7 days.
 * Returns sorted descending by volume.
 */
export function useWeeklyMuscleVolume(): MuscleVolume[] {
  const workouts = useTrainingStore((s) => s.workouts);

  return useMemo(() => {
    const today = todayLocalIso();
    const weekAgo = (() => {
      const d = new Date(today + 'T00:00:00');
      d.setDate(d.getDate() - 6);
      return localIso(d);
    })();

    const totals: Record<string, { volumeKg: number; sets: number }> = {};

    for (const date of Object.keys(workouts)) {
      if (date < weekAgo || date > today) continue;
      const dayList = workouts[date] ?? [];
      for (const w of dayList) {
        const exList = Array.isArray(w?.exercises) ? w.exercises : [];
        for (const ex of exList) {
          const def = EXERCISES[ex.exerciseId];
          if (!def) continue;
          const muscle = def.muscleGroup;
          const sets = Array.isArray(ex.sets) ? ex.sets : [];
          let exVolume = 0;
          let exSetCount = 0;
          for (const s of sets) {
            if (!s) continue;
            const v = (s.weight ?? 0) * (s.reps ?? 0);
            if (v > 0) {
              exVolume += v;
              exSetCount += 1;
            }
          }
          if (!totals[muscle]) totals[muscle] = { volumeKg: 0, sets: 0 };
          totals[muscle].volumeKg += exVolume;
          totals[muscle].sets += exSetCount;
        }
      }
    }

    const grand = Object.values(totals).reduce((a, b) => a + b.volumeKg, 0);

    return Object.entries(totals)
      .map(([muscle, v]) => ({
        muscle: muscle as MuscleGroup,
        volumeKg: Math.round(v.volumeKg),
        sets: v.sets,
        pctOfTotal: grand > 0 ? Math.round((v.volumeKg / grand) * 100) : 0,
      }))
      .sort((a, b) => b.volumeKg - a.volumeKg);
  }, [workouts]);
}
