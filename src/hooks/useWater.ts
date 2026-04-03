import { useMemo, useCallback, useEffect } from 'react';
import { useWaterStore } from '../store/waterStore';
import { useUserStore } from '../store/userStore';

const WATER_ML_PER_KG = 33;

export function useWater() {
  const profile = useUserStore((s) => s.profile);
  const history = useWaterStore((s) => s.history);
  const dailyTargetMl = useWaterStore((s) => s.dailyTargetMl);
  const addWater = useWaterStore((s) => s.addWater);
  const removeWater = useWaterStore((s) => s.removeWater);
  const setDailyTarget = useWaterStore((s) => s.setDailyTarget);
  const getTodayTotal = useWaterStore((s) => s.getTodayTotal);
  const getWeekHistory = useWaterStore((s) => s.getWeekHistory);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

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
    (amount: number) => addWater(today, amount),
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
