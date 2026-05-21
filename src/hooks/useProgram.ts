import { useMemo, useCallback } from 'react';
import { useProgramStore } from '../store/programStore';
import { useUserStore } from '../store/userStore';
import { recommendProgram, toLocalDateStr } from '../engine/programEngine';
import { getProgramDayById, PROGRAMS } from '../data/programs';
import type { ProgramId, PlannedDay, ProgramDay } from '../types/program';
import type { Objective } from '../types/user';

export function useProgram() {
  const activePlan = useProgramStore((s) => s.activePlan);
  const completedDays = useProgramStore((s) => s.completedDays);
  const selectProgramRaw = useProgramStore((s) => s.selectProgram);
  const changeProgram = useProgramStore((s) => s.changeProgram);
  const markDayCompleted = useProgramStore((s) => s.markDayCompleted);
  const getCurrentWeek = useProgramStore((s) => s.getCurrentWeek);
  const getWeekDays = useProgramStore((s) => s.getWeekDays);
  const getTodayPlan = useProgramStore((s) => s.getTodayPlan);
  const profile = useUserStore((s) => s.profile);

  // Wrapper that automatically injects the user's sex from the profile.
  // MUST be declared AFTER profile (TDZ: accessing profile in the deps
  // array before its `const` binding throws ReferenceError, which the
  // RN runtime surfaces as a confusing "Property 'useT' doesn't exist"
  // crash on every screen that consumed this hook).
  const selectProgram = useCallback(
    (programId: ProgramId, objective: Objective) => {
      selectProgramRaw(programId, objective, profile?.sex ?? 'male');
    },
    [selectProgramRaw, profile?.sex]
  );

  const hasActivePlan = !!activePlan;

  const recommendedProgramId: ProgramId = useMemo(() => {
    if (!profile) return 'BULK_DEB_3D_FB';
    const sex = profile.sex ?? 'male';
    return recommendProgram(
      sex,
      profile.activityLevel,
      profile.objective,
      profile.menopauseStatus,
    );
  }, [profile?.sex, profile?.activityLevel, profile?.objective, profile?.menopauseStatus]);

  const currentWeek = useMemo(() => {
    return getCurrentWeek();
  }, [activePlan, getCurrentWeek]);

  const todayPlan: PlannedDay | null = useMemo(() => {
    return getTodayPlan();
  }, [activePlan, completedDays, getTodayPlan]);

  const getProgramDayForDate = useProgramStore((s) => s.getProgramDayForDate);

  const todayProgramDay: ProgramDay | null = useMemo(() => {
    if (!todayPlan?.programDayId || !activePlan) return null;
    // Apply per-day overrides (replaceExerciseInDay).
    return getProgramDayForDate(todayPlan.date) ?? getProgramDayById(activePlan.programId, todayPlan.programDayId);
  }, [todayPlan, activePlan, getProgramDayForDate]);

  const weekDays: PlannedDay[] = useMemo(() => {
    return getWeekDays(currentWeek);
  }, [currentWeek, activePlan, completedDays, getWeekDays]);

  const activeProgram = activePlan ? PROGRAMS[activePlan.programId] : null;

  const isPlanExpired = useMemo(() => {
    if (!activePlan) return false;
    const today = toLocalDateStr();
    return today > activePlan.endDate;
  }, [activePlan]);

  return {
    hasActivePlan,
    activePlan,
    activeProgram,
    recommendedProgramId,
    currentWeek,
    todayPlan,
    todayProgramDay,
    weekDays,
    isPlanExpired,
    selectProgram,
    changeProgram,
    markDayCompleted,
  };
}
