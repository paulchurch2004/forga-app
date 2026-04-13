import { useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';

export function useWeightPrompt() {
  const weightLog = useUserStore((s) => s.weightLog);
  const dismissedDate = useSettingsStore((s) => s.weightPromptDismissedDate);

  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // Find most recent weight entry
    const sorted = [...weightLog].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const lastEntry = sorted[0];

    if (!lastEntry) {
      return { shouldPrompt: dismissedDate !== today, daysSinceLastWeighIn: -1 };
    }

    const lastDate = new Date(lastEntry.date);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return {
      shouldPrompt: daysSince >= 10 && dismissedDate !== today,
      daysSinceLastWeighIn: daysSince,
    };
  }, [weightLog, dismissedDate]);
}
