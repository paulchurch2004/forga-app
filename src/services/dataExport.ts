// FORGA — RGPD Article 20 user data export.
// Aggregates all locally-known user data into a single JSON document and
// shares it via the OS share sheet (or a fallback download URL on web).

import { Share, Platform } from 'react-native';
import { useUserStore } from '../store/userStore';
import { useTrainingStore } from '../store/trainingStore';
import { useMealStore } from '../store/mealStore';
import { useScoreStore } from '../store/scoreStore';
import { useWaterStore } from '../store/waterStore';
import { useChatStore } from '../store/chatStore';
import { useProgramStore } from '../store/programStore';

export async function exportUserDataAsJson(): Promise<string> {
  const userState = useUserStore.getState();
  const training = useTrainingStore.getState();
  const meals = useMealStore.getState();
  const score = useScoreStore.getState();
  const water = useWaterStore.getState();
  const chat = useChatStore.getState();
  const program = useProgramStore.getState();

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    profile: userState.profile,
    onboarding: userState.onboardingData,
    badges: userState.badges,
    weightLog: userState.weightLog,
    checkIns: userState.checkIns,
    measurements: userState.measurements,
    progressPhotos: userState.progressPhotos?.map((p) => ({
      id: p.id,
      date: p.date,
      // Local file URIs aren't portable; we omit them but keep metadata.
      hasImage: !!p.uri,
    })),
    strengthTest: userState.strengthTest,
    training: {
      workouts: training.workouts,
      oneRepMaxByExercise: training.oneRepMaxByExercise,
    },
    program: {
      activePlan: program.activePlan,
      completedDays: program.completedDays,
    },
    meals: {
      todayMeals: meals.todayMeals,
      mealHistory: meals.mealHistory,
      favorites: meals.favorites,
    },
    score: {
      currentScore: score.currentScore,
      history: score.history,
    },
    water: {
      history: water.history,
      dailyTargetMl: water.dailyTargetMl,
    },
    chat: {
      messages: chat.messages,
      memories: chat.memories,
    },
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Trigger the OS share sheet with the data export. On native, the user can
 * AirDrop / save to Files / send via mail. On web, falls back to a download.
 */
export async function shareUserDataExport(): Promise<void> {
  const json = await exportUserDataAsJson();

  if (Platform.OS === 'web') {
    // Browser: trigger a download via Blob URL
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forga-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    return;
  }

  // Native: use the system share sheet
  await Share.share({
    title: 'Mes données FORGA',
    message: json,
  });
}
