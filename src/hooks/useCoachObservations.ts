import { useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { useTrainingStore } from '../store/trainingStore';
import { useMealStore } from '../store/mealStore';
import { useWaterStore } from '../store/waterStore';
import { useT } from '../i18n';
import { todayLocalIso } from '../utils/date';
import {
  computeObservations,
  formatTimeAgo,
  type CoachObservation,
} from '../engine/observationFeed';
import type { PresenceObservation } from '../components/coach/PresenceView';

/**
 * Real coach observations derived from the user's actual activity.
 * Replaces the hardcoded sample data that used to live in coach.tsx.
 *
 * Returns observations already shaped for PresenceView (timeLabel ready).
 */
export function useCoachObservations(): PresenceObservation[] {
  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const workoutsByDate = useTrainingStore((s) => s.workouts);
  const mealsByDate = useMealStore((s) => s.mealHistory);
  const waterByDate = useWaterStore((s) => s.history);
  const { t } = useT();

  return useMemo<PresenceObservation[]>(() => {
    const raw = computeObservations({
      profile,
      checkIns,
      workoutsByDate,
      mealsByDate,
      waterByDate,
      todayIso: todayLocalIso(),
      tExercise: (key) => t(key as any),
    });

    return raw.map(toPresence);
  }, [profile, checkIns, workoutsByDate, mealsByDate, waterByDate, t]);
}

function toPresence(o: CoachObservation): PresenceObservation {
  return {
    id: o.id,
    timeLabel: formatTimeAgo(o.timestamp),
    tag: o.tag,
    color: o.color,
    title: o.title,
    body: o.body,
  };
}
