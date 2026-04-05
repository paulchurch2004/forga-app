import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useScoreStore } from '../store/scoreStore';
import type { Badge, BadgeType } from '../types/user';
import { BADGE_INFO } from '../types/user';
import { sendBadgeNotification, scheduleStreakDanger } from '../services/notifications';

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

  // Break streak
  const breakStreak = useCallback(() => {
    if (!profile) return;
    updateProfile({ currentStreak: 0 });
  }, [profile, updateProfile]);

  const streakCheckedRef = useRef(false);

  // Auto-check streak on mount and app foreground
  useEffect(() => {
    const checkStreakReset = () => {
      if (!profile || profile.currentStreak === 0) return;
      if (isTodayValidated) return; // Today has meals, streak is safe

      // Find last date with validated meals
      const mealHistory = useMealStore.getState().mealHistory;
      const dates = Object.keys(mealHistory).filter(d => mealHistory[d].length > 0).sort();
      if (dates.length === 0) {
        // No meal history at all but has streak? Reset it
        breakStreak();
        return;
      }

      const lastDate = dates[dates.length - 1];
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      if (lastDate === todayStr) return; // Today has meals in history

      // Check if yesterday had meals
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (lastDate < yesterdayStr) {
        // Last meal was before yesterday -> streak is broken
        breakStreak();
      }
    };

    // Check on mount (only once)
    if (!streakCheckedRef.current) {
      streakCheckedRef.current = true;
      checkStreakReset();
    }

    // Check on app foreground
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkStreakReset();
      }
    });
    return () => sub.remove();
  }, [profile?.currentStreak, isTodayValidated, breakStreak]);

  const hasBadge = useCallback(
    (type: BadgeType) => badges.some((b) => b.type === type),
    [badges]
  );

  const checkAndUnlockBadges = useCallback(
    (newStreak: number) => {
      const notifyBadge = (type: BadgeType) => {
        if (Platform.OS !== 'web') {
          sendBadgeNotification(BADGE_INFO[type].name).catch(() => {});
        }
      };

      // first_meal
      if (todayMeals.length > 0 && !hasBadge('first_meal')) {
        addBadge(makeBadge('first_meal'));
        notifyBadge('first_meal');
      }

      // first_week
      if (newStreak >= 7 && !hasBadge('first_week')) {
        addBadge(makeBadge('first_week'));
        notifyBadge('first_week');
      }

      // month_of_forge
      if (newStreak >= 30 && !hasBadge('month_of_forge')) {
        addBadge(makeBadge('month_of_forge'));
        notifyBadge('month_of_forge');
      }

      // forgeron: score > 70
      if (currentScore.total > 70 && !hasBadge('forgeron')) {
        addBadge(makeBadge('forgeron'));
        notifyBadge('forgeron');
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
          notifyBadge('first_kilo');
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
    // Re-schedule streak danger notification with updated count
    if (Platform.OS !== 'web') {
      scheduleStreakDanger(newStreak).catch(() => {});
    }
  }, [profile, updateProfile, checkAndUnlockBadges]);

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
