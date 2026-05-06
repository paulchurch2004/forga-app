import { useMemo, useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { useTrainingStore } from '../store/trainingStore';
import { todayLocalIso, localIso } from '../utils/date';
import type { Badge, BadgeType } from '../types/user';
import { BADGE_INFO } from '../types/user';
import { Platform } from 'react-native';

function makeBadge(type: BadgeType): Badge {
  return { id: `${type}_${Date.now()}`, type, unlockedAt: new Date().toISOString() };
}

/**
 * Compute the current consecutive-day training streak from the workouts store.
 * A "training day" = at least one workout logged on that calendar day.
 */
function computeTrainingStreak(workouts: Record<string, unknown[]>): number {
  const datesWithWorkouts = new Set(
    Object.keys(workouts).filter((d) => (workouts[d]?.length ?? 0) > 0),
  );
  if (datesWithWorkouts.size === 0) return 0;

  const today = todayLocalIso();
  const yesterday = (() => {
    const d = new Date(today + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return localIso(d);
  })();

  // Streak only counts if today OR yesterday has a workout (else it's broken).
  let cursor = datesWithWorkouts.has(today) ? today : datesWithWorkouts.has(yesterday) ? yesterday : null;
  if (!cursor) return 0;

  let count = 0;
  while (datesWithWorkouts.has(cursor)) {
    count++;
    const d = new Date(cursor + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    cursor = localIso(d);
  }
  return count;
}

export function useTrainingStreak() {
  const workouts = useTrainingStore((s) => s.workouts);
  const badges = useUserStore((s) => s.badges);
  const addBadge = useUserStore((s) => s.addBadge);

  const currentStreak = useMemo(() => computeTrainingStreak(workouts), [workouts]);

  const totalWorkouts = useMemo(() => {
    return Object.values(workouts).reduce((sum, list) => sum + (list?.length ?? 0), 0);
  }, [workouts]);

  const hasBadge = useCallback(
    (type: BadgeType) => badges.some((b) => b.type === type),
    [badges],
  );

  /**
   * Check workout-related badges. Call after a workout is added.
   * Returns the list of newly-unlocked badge types (for celebration UI).
   */
  const checkWorkoutBadges = useCallback((): BadgeType[] => {
    const unlocked: BadgeType[] = [];
    const total = totalWorkouts;
    const streak = currentStreak;

    const earn = (type: BadgeType) => {
      if (hasBadge(type)) return;
      addBadge(makeBadge(type));
      unlocked.push(type);
    };

    if (total >= 1) earn('first_workout');
    if (total >= 10) earn('ten_workouts');
    if (total >= 30) earn('thirty_workouts');
    if (total >= 100) earn('hundred_workouts');
    if (streak >= 7) earn('training_week_streak');
    if (streak >= 30) earn('training_month_streak');

    return unlocked;
  }, [totalWorkouts, currentStreak, hasBadge, addBadge]);

  return {
    currentTrainingStreak: currentStreak,
    totalWorkouts,
    checkWorkoutBadges,
    hasBadge,
  };
}

void Platform; // (keep import for parity with useStreak; reserved for future notif hooks)
