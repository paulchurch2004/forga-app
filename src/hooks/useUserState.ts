import { useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { useTrainingStore } from '../store/trainingStore';
import { useMealStore } from '../store/mealStore';
import { useProgramStore } from '../store/programStore';
import {
  computeUserState,
  computeUserDecision,
  type UserState,
  type UserDecision,
} from '../engine/userStateEngine';

function todayLocalIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useUserState(): UserState {
  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const weightLog = useUserStore((s) => s.weightLog);
  const workoutsByDate = useTrainingStore((s) => s.workouts);
  const mealsByDate = useMealStore((s) => s.mealHistory);
  const activePlan = useProgramStore((s) => s.activePlan);

  return useMemo(
    () =>
      computeUserState({
        profile,
        checkIns,
        weightLog,
        workoutsByDate,
        mealsByDate,
        plannedDays: activePlan?.days ?? [],
        todayIso: todayLocalIso(),
      }),
    [profile, checkIns, weightLog, workoutsByDate, mealsByDate, activePlan]
  );
}

/**
 * Recommendation derived from the current UserState.
 * v1: returned for display only (debug card / future explanation layer).
 * Nothing is mutated, no plan is modified.
 */
export function useUserDecision(): UserDecision {
  const state = useUserState();
  return useMemo(() => computeUserDecision(state), [state]);
}
