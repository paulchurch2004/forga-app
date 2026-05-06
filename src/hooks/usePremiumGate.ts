// FORGA — Unified premium gate hook.
// Wraps `usePremium` and the FREE_LIMITS config to give callers a single
// source of truth for "can this user do X?" + "open the paywall if not".

import { useCallback } from 'react';
import { router } from 'expo-router';
import { usePremium } from './usePremium';
import { FREE_LIMITS } from '../config/freeTierLimits';

export function usePremiumGate() {
  const { isPremium } = usePremium();

  const openPaywall = useCallback(() => {
    router.push('/paywall');
  }, []);

  /** True if the user can add another meal today. */
  const canAddMeal = useCallback(
    (mealsTodayCount: number) => isPremium || mealsTodayCount < FREE_LIMITS.mealsPerDay,
    [isPremium],
  );

  /** True if the user can add another progress photo. */
  const canAddPhoto = useCallback(
    (currentCount: number) => isPremium || currentCount < FREE_LIMITS.photosTotal,
    [isPremium],
  );

  /** True if the user can add another body measurement. */
  const canAddMeasurement = useCallback(
    (currentCount: number) => isPremium || currentCount < FREE_LIMITS.measurementsTotal,
    [isPremium],
  );

  /** True if the user can pick another active program. */
  const canSelectProgram = useCallback(
    (activeProgramsCount: number) => isPremium || activeProgramsCount < FREE_LIMITS.programsActive,
    [isPremium],
  );

  /** Boolean unconditional gates — feature available only to premium. */
  const canUseLiveSwap = isPremium;
  const canSeeMuscleVolume = isPremium;
  const canRetakeStrengthTest = isPremium;
  const canUseAppleHealthSync = isPremium;

  /** Cap the meal history view to N days for free users. Returns null = no cap. */
  const mealHistoryDayCap = isPremium ? null : FREE_LIMITS.mealHistoryDays;

  /** How many charts to show on the exercise progress screen. */
  const exerciseProgressChartCount = isPremium ? 3 : FREE_LIMITS.exerciseProgressCharts;

  /**
   * Run `action` if the user is premium. Otherwise open the paywall.
   * Returns true if the action ran.
   */
  const requirePremium = useCallback(
    (action?: () => void): boolean => {
      if (isPremium) {
        action?.();
        return true;
      }
      openPaywall();
      return false;
    },
    [isPremium, openPaywall],
  );

  return {
    isPremium,
    openPaywall,
    requirePremium,
    canAddMeal,
    canAddPhoto,
    canAddMeasurement,
    canSelectProgram,
    canUseLiveSwap,
    canSeeMuscleVolume,
    canRetakeStrengthTest,
    canUseAppleHealthSync,
    mealHistoryDayCap,
    exerciseProgressChartCount,
    limits: FREE_LIMITS,
  };
}
