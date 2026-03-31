import { useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';

export function useStreak() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const todayMeals = useMealStore((s) => s.todayMeals);

  const currentStreak = profile?.currentStreak ?? 0;
  const bestStreak = profile?.bestStreak ?? 0;
  const streakFreezeUsedThisWeek = profile?.streakFreezeUsedThisWeek ?? false;

  // Check if today is validated (at least 1 meal)
  const isTodayValidated = todayMeals.length > 0;

  // Increment streak
  const incrementStreak = useCallback(() => {
    if (!profile) return;
    const newStreak = profile.currentStreak + 1;
    updateProfile({
      currentStreak: newStreak,
      bestStreak: Math.max(profile.bestStreak, newStreak),
    });
  }, [profile, updateProfile]);

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
  };
}
