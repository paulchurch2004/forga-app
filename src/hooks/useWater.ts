import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useWaterStore } from '../store/waterStore';
import { useUserStore } from '../store/userStore';
import { syncWater } from '../services/userSync';

const WATER_ML_PER_KG = 33;

function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useWater() {
  const profile = useUserStore((s) => s.profile);
  const history = useWaterStore((s) => s.history);
  const dailyTargetMl = useWaterStore((s) => s.dailyTargetMl);
  const addWater = useWaterStore((s) => s.addWater);
  const removeWater = useWaterStore((s) => s.removeWater);
  const setDailyTarget = useWaterStore((s) => s.setDailyTarget);
  const getTodayTotal = useWaterStore((s) => s.getTodayTotal);
  const getWeekHistory = useWaterStore((s) => s.getWeekHistory);

  // Reactive date: updates on app foreground + midnight timer
  const [today, setToday] = useState(getToday);

  useEffect(() => {
    // Update date when app comes back to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setToday(getToday());
      }
    });

    // Timer to update at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timer = setTimeout(() => setToday(getToday()), msUntilMidnight + 500);

    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]); // re-schedule when today changes

  // Recalculate target from weight
  const computedTarget = useMemo(() => {
    if (!profile) return 2500;
    return Math.round((profile.currentWeight * WATER_ML_PER_KG) / 50) * 50;
  }, [profile?.currentWeight]);

  useEffect(() => {
    if (computedTarget !== dailyTargetMl) {
      setDailyTarget(computedTarget);
    }
  }, [computedTarget, dailyTargetMl, setDailyTarget]);

  const todayTotal = useMemo(() => getTodayTotal(today), [history, today, getTodayTotal]);
  const progress = useMemo(
    () => Math.min(1, dailyTargetMl > 0 ? todayTotal / dailyTargetMl : 0),
    [todayTotal, dailyTargetMl]
  );
  const todayEntries = useMemo(() => history[today] ?? [], [history, today]);
  const weekHistory = useMemo(() => getWeekHistory(today), [history, today, getWeekHistory]);

  const daysTargetMet = useMemo(() => {
    return weekHistory.filter((d) => d.total >= dailyTargetMl).length;
  }, [weekHistory, dailyTargetMl]);

  const add = useCallback(
    (amount: number) => {
      addWater(today, amount);
      // Sync to Supabase (deferred, errors ignored)
      setTimeout(() => {
        try {
          const userId = useUserStore.getState().profile?.id;
          const entries = useWaterStore.getState().history[today];
          const lastEntry = entries?.[entries.length - 1];
          if (userId && lastEntry) syncWater(lastEntry, today, userId);
        } catch { /* noop */ }
      }, 0);
    },
    [today, addWater]
  );

  const remove = useCallback(
    (entryId: string) => removeWater(today, entryId),
    [today, removeWater]
  );

  return {
    todayTotal,
    dailyTarget: dailyTargetMl,
    progress,
    todayEntries,
    weekHistory,
    daysTargetMet,
    add,
    remove,
  };
}
