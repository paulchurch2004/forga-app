import { useCallback } from 'react';
import { calculateForgaScore } from '../engine/scoreEngine';
import { useScoreStore } from '../store/scoreStore';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useWaterStore } from '../store/waterStore';
import { useTrainingStore } from '../store/trainingStore';
import type { ScoreInput } from '../types/score';

export function useScore() {
  const { currentScore, weeklyChange, scoreHistory, setCurrentScore, setWeeklyChange, saveDailyScore } = useScoreStore();
  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const todayMeals = useMealStore((s) => s.todayMeals);

  const recalculate = useCallback(() => {
    if (!profile) return;

    // Build score input from current user state
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count check-ins in last 4 weeks
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const recentCheckIns = checkIns.filter(
      (c) => new Date(c.createdAt) >= fourWeeksAgo
    );

    // Check if check-in was done this week
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekCheckIn = checkIns.some(
      (c) => new Date(c.createdAt) >= weekStart
    );

    // Calculate weight trend (simplified — uses last 2 weight entries)
    const weightLog = useUserStore.getState().weightLog;
    let weightTrend = 0;
    if (weightLog.length >= 2) {
      const sorted = [...weightLog].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latest = sorted[0];
      const previous = sorted[1];
      const daysDiff =
        (new Date(latest.date).getTime() - new Date(previous.date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff > 0) {
        weightTrend = ((latest.weight - previous.weight) / daysDiff) * 7;
      }
    }

    // Goal progress
    const totalToLose = Math.abs(profile.currentWeight - profile.targetWeight);
    const currentProgress =
      totalToLose > 0
        ? Math.abs(
            profile.currentWeight -
              (weightLog.length > 0
                ? weightLog[weightLog.length - 1].weight
                : profile.currentWeight)
          )
        : 0;
    const goalProgressPercent =
      totalToLose > 0
        ? Math.min(100, (currentProgress / totalToLose) * 100)
        : profile.objective === 'maintain'
        ? 100
        : 0;

    // Water tracking bonus
    const waterStore = useWaterStore.getState();
    const todayDate = now.toISOString().split('T')[0];
    const waterWeek = waterStore.getWeekHistory(todayDate);
    const waterDaysMet = waterWeek.filter((d) => d.total >= waterStore.dailyTargetMl).length;

    const input: ScoreInput = {
      mealsValidated: todayMeals.length,
      mealsExpected: profile.mealsPerDay,
      proteinTargetDays: Math.min(7, todayMeals.length), // simplified
      uniqueMealsChosen: new Set(todayMeals.map((m) => m.mealId)).size,
      currentStreak: profile.currentStreak,
      checkInsCompleted: recentCheckIns.length,
      weightTrendPerWeek: weightTrend,
      objective: profile.objective,
      goalProgressPercent,
      hasWeightData: weightLog.length >= 2,
      activeDaysLast7: useTrainingStore.getState().getActiveDaysLast7(todayDate),
      thisWeekCheckIn,
      waterTargetDaysMet: waterDaysMet,
    };

    const newScore = calculateForgaScore(input);
    const change = newScore.total - currentScore.total;
    setCurrentScore(newScore);
    setWeeklyChange(weeklyChange + change);

    // Auto-save today's score to history if not already persisted
    if (!scoreHistory[todayDate]) {
      saveDailyScore(todayDate, newScore);
    }
  }, [
    profile,
    checkIns,
    todayMeals,
    currentScore.total,
    weeklyChange,
    scoreHistory,
    setCurrentScore,
    setWeeklyChange,
    saveDailyScore,
  ]);

  return {
    score: currentScore,
    weeklyChange,
    scoreHistory,
    recalculate,
  };
}
