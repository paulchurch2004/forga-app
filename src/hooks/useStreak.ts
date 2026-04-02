import { useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useScoreStore } from '../store/scoreStore';
import type { Badge, BadgeType } from '../types/user';

function makeBadge(type: BadgeType): Badge {
  return { id: `${type}_${Date.now()}`, type, unlockedAt: new Date().toISOString() };
}

export function useStreak() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const badges = useUserStore((s) => s.badges);
  const addBadge = useUserStore((s) => s.addBadge);
  const weightLog = useUserStore((s) => s.weightLog);
  const todayMeals = useMealStore((s) => s.todayMeals);
  const currentScore = useScoreStore((s) => s.currentScore);

  const currentStreak = profile?.currentStreak ?? 0;
  const bestStreak = profile?.bestStreak ?? 0;
  const streakFreezeUsedThisWeek = profile?.streakFreezeUsedThisWeek ?? false;

  // Check if today is validated (at least 1 meal)
  const isTodayValidated = todayMeals.length > 0;

  const hasBadge = useCallback(
    (type: BadgeType) => badges.some((b) => b.type === type),
    [badges]
  );

  const checkAndUnlockBadges = useCallback(
    (newStreak: number) => {
      // first_meal
      if (todayMeals.length > 0 && !hasBadge('first_meal')) {
        addBadge(makeBadge('first_meal'));
      }

      // first_week
      if (newStreak >= 7 && !hasBadge('first_week')) {
        addBadge(makeBadge('first_week'));
      }

      // month_of_forge
      if (newStreak >= 30 && !hasBadge('month_of_forge')) {
        addBadge(makeBadge('month_of_forge'));
      }

      // forgeron: score > 70
      if (currentScore.total > 70 && !hasBadge('forgeron')) {
        addBadge(makeBadge('forgeron'));
      }

      // first_kilo: 1kg+ progress toward goal
      if (profile && weightLog.length >= 1 && !hasBadge('first_kilo')) {
        const startWeight = profile.currentWeight;
        const latestWeight = [...weightLog].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0].weight;
        const delta = Math.abs(startWeight - latestWeight);
        if (delta >= 1) {
          addBadge(makeBadge('first_kilo'));
        }
      }
    },
    [todayMeals.length, hasBadge, addBadge, currentScore.total, profile, weightLog]
  );

  // Increment streak
  const incrementStreak = useCallback(() => {
    if (!profile) return;
    const newStreak = profile.currentStreak + 1;
    updateProfile({
      currentStreak: newStreak,
      bestStreak: Math.max(profile.bestStreak, newStreak),
    });
    checkAndUnlockBadges(newStreak);
  }, [profile, updateProfile, checkAndUnlockBadges]);

  // Break streak
  const breakStreak = useCallback(() => {
    if (!profile) return;
    updateProfile({ currentStreak: 0 });
  }, [profile, updateProfile]);

  // Use streak freeze
  const useStreakFreeze = useCallback((): boolean => {
    if (!profile) return false;
    if (streakFreezeUsedThisWeek) return false;
    if (!profile.isPremium) return false;

    updateProfile({ streakFreezeUsedThisWeek: true });
    return true;
  }, [profile, streakFreezeUsedThisWeek, updateProfile]);

  // Check if streak is in danger (no meals validated today after 20h)
  const isStreakInDanger = useCallback((): boolean => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 20 && !isTodayValidated;
  }, [isTodayValidated]);

  return {
    currentStreak,
    bestStreak,
    isTodayValidated,
    streakFreezeUsedThisWeek,
    isStreakInDanger,
    incrementStreak,
    breakStreak,
    useStreakFreeze,
    checkAndUnlockBadges,
  };
}
