import { useCallback } from 'react';
import { calculateForgaScore } from '../engine/scoreEngine';
import { useScoreStore } from '../store/scoreStore';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useWaterStore } from '../store/waterStore';
import { useTrainingStore } from '../store/trainingStore';
import type { ScoreInput } from '../types/score';
import { syncScore } from '../services/userSync';
import { todayLocalIso, localIso } from '../utils/date';

/** "Active days" proxy used in nutrition_only mode: counts how many of the
 *  last 7 days had at least one validated meal. */
function countDaysWithMealsLast7(todayDate: string): number {
  const today = new Date(todayDate);
  const history = useMealStore.getState().mealHistory;
  const todayMeals = useMealStore.getState().todayMeals;
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = localIso(d);
    const meals = i === 0 ? todayMeals : (history[key] ?? []);
    if (meals.length > 0) count++;
  }
  return count;
}

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
    const sortedWeights = [...weightLog].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let weightTrend = 0;
    if (sortedWeights.length >= 2) {
      const latest = sortedWeights[0];
      const previous = sortedWeights[1];
      const daysDiff =
        (new Date(latest.date).getTime() - new Date(previous.date).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff > 0) {
        weightTrend = ((latest.weight - previous.weight) / daysDiff) * 7;
      }
    }

    // Goal progress — use sorted weight log for latest weight
    const totalToLose = Math.abs(profile.currentWeight - profile.targetWeight);
    const latestWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : profile.currentWeight;
    const currentProgress = totalToLose > 0
      ? Math.abs(profile.currentWeight - latestWeight)
      : 0;
    const goalProgressPercent =
      totalToLose > 0
        ? Math.min(100, (currentProgress / totalToLose) * 100)
        : profile.objective === 'maintain'
        ? 100
        : 0;

    // Protein target days (last 7 days): count days where total protein is within ±10% of target
    const mealHistory = useMealStore.getState().mealHistory;
    let proteinDaysHit = 0;
    if (profile.dailyProtein > 0) {
      for (let i = 0; i < 7; i++) {
        const date = localIso(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
        const mealsForDay = i === 0 ? todayMeals : (mealHistory[date] ?? []);
        if (mealsForDay.length === 0) continue;
        const totalProtein = mealsForDay.reduce((sum, m) => sum + m.actualMacros.protein, 0);
        if (Math.abs(totalProtein - profile.dailyProtein) / profile.dailyProtein <= 0.10) {
          proteinDaysHit++;
        }
      }
    }

    // Water tracking bonus
    const waterStore = useWaterStore.getState();
    const todayDate = todayLocalIso();
    const waterWeek = waterStore.getWeekHistory(todayDate);
    const waterDaysMet = waterWeek.filter((d) => d.total >= waterStore.dailyTargetMl).length;

    // In 'nutrition_only' mode the user has chosen not to track training
    // inside FORGA, so penalising them on `activeDaysLast7` (which only
    // counts logged workouts) would be unfair. We substitute the metric
    // with "days last 7 with ≥1 validated meal" — same spirit (active
    // engagement) but computed from data they actually provide.
    const trackingMode = profile.trackingMode ?? 'both';
    const activeDaysLast7 = trackingMode === 'nutrition_only'
      ? countDaysWithMealsLast7(todayDate)
      : useTrainingStore.getState().getActiveDaysLast7(todayDate);

    const input: ScoreInput = {
      mealsValidated: todayMeals.length,
      mealsExpected: profile.mealsPerDay,
      proteinTargetDays: proteinDaysHit,
      uniqueMealsChosen: new Set(todayMeals.map((m) => m.mealId)).size,
      currentStreak: profile.currentStreak,
      checkInsCompleted: recentCheckIns.length,
      weightTrendPerWeek: weightTrend,
      objective: profile.objective,
      goalProgressPercent,
      hasWeightData: weightLog.length >= 2,
      activeDaysLast7,
      thisWeekCheckIn,
      waterTargetDaysMet: waterDaysMet,
      trackingMode,
    };

    const newScore = calculateForgaScore(input);
    setCurrentScore(newScore);

    // Calculate weekly change from score history (today vs 7 days ago)
    const weekAgoDate = localIso(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const weekAgoScore = scoreHistory[weekAgoDate];
    setWeeklyChange(weekAgoScore ? newScore.total - weekAgoScore.total : 0);

    // Save today's score to history
    saveDailyScore(todayDate, newScore);
    if (profile.id) syncScore(todayDate, newScore, profile.id);
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
