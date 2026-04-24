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
  // Wrapper that automatically injects the user's sex from the profile.
  const selectProgram = useCallback(
    (programId: ProgramId, objective: Objective) => {
      selectProgramRaw(programId, objective, profile?.sex ?? 'male');
    },
    [selectProgramRaw, profile?.sex]
  );
  const changeProgram = useProgramStore((s) => s.changeProgram);
  const markDayCompleted = useProgramStore((s) => s.markDayCompleted);
  const getCurrentWeek = useProgramStore((s) => s.getCurrentWeek);
  const getWeekDays = useProgramStore((s) => s.getWeekDays);
  const getTodayPlan = useProgramStore((s) => s.getTodayPlan);
  const profile = useUserStore((s) => s.profile);

  const hasActivePlan = !!activePlan;

  const recommendedProgramId: ProgramId = useMemo(() => {
    if (!profile) return 'full_body_h';
    // Use sex-aware v2 selection. Falls back to 'male' if sex is unset
    // (defensive: existing accounts without onboarding sex set).
    const sex = profile.sex ?? 'male';
    return recommendProgram(sex, profile.activityLevel, profile.objective);
  }, [profile?.sex, profile?.activityLevel, profile?.objective]);

  const currentWeek = useMemo(() => {
    return getCurrentWeek();
  }, [activePlan, getCurrentWeek]);

  const todayPlan: PlannedDay | null = useMemo(() => {
    return getTodayPlan();
  }, [activePlan, completedDays, getTodayPlan]);

  const todayProgramDay: ProgramDay | null = useMemo(() => {
    if (!todayPlan?.programDayId || !activePlan) return null;
    return getProgramDayById(activePlan.programId, todayPlan.programDayId);
  }, [todayPlan, activePlan]);

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
