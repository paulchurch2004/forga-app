import { useMemo } from 'react';
import { useTrainingStore } from '../store/trainingStore';
import { useT } from '../i18n';
import type { WorkoutType } from '../types/training';

export function useTraining() {
  const store = useTrainingStore();
  const { t } = useT();
  const today = new Date().toISOString().split('T')[0];

  const weekBarData = useMemo(() => {
    const dayKeys: string[] = ['calMonday', 'calTuesday', 'calWednesday', 'calThursday', 'calFriday', 'calSaturday', 'calSunday'];
    const todayDate = new Date();
    const todayDay = todayDate.getDay(); // 0=Sun
    // Start from Monday of current week
    const monday = new Date(todayDate);
    monday.setDate(monday.getDate() - ((todayDay + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      const dayWorkouts = store.getWorkoutsForDate(dateKey);
      return {
        date: dateKey,
        dayLabel: t(dayKeys[i] as any),
        hasWorkout: dayWorkouts.length > 0,
        workoutTypes: dayWorkouts.map((w) => w.type),
      };
    });
  }, [store.workouts, t, today]);

  return {
    activeDaysLast7: store.getActiveDaysLast7(today),
    weeklyCount: store.getWeeklyCount(today),
    monthlyCount: store.getMonthlyCount(today),
    favoriteType: store.getFavoriteType(),
    recentWorkouts: store.getRecentWorkouts(7),
    todayWorkouts: store.getWorkoutsForDate(today),
    weekBarData,

    addWorkout: store.addWorkout,
    removeWorkout: store.removeWorkout,
    getExerciseHistory: store.getExerciseHistory,
    getLastSessionForExercise: store.getLastSessionForExercise,
  };
}

export function getWorkoutTypeIcon(type: WorkoutType): string {
  const icons: Record<WorkoutType, string> = {
    musculation: '\uD83C\uDFCB\uFE0F',
    running: '\uD83C\uDFC3',
    cycling: '\uD83D\uDEB4',
    swimming: '\uD83C\uDFCA',
    hiit: '\u26A1',
    sport_collectif: '\u26BD',
    yoga_stretching: '\uD83E\uDDD8',
    marche: '\uD83D\uDEB6',
    autre: '\u2B50',
  };
  return icons[type];
}

export function getWorkoutTypeKey(type: WorkoutType): string {
  const keys: Record<WorkoutType, string> = {
    musculation: 'typeMusculation',
    running: 'typeRunning',
    cycling: 'typeCycling',
    swimming: 'typeSwimming',
    hiit: 'typeHiit',
    sport_collectif: 'typeSportCollectif',
    yoga_stretching: 'typeYogaStretching',
    marche: 'typeMarche',
    autre: 'typeAutre',
  };
  return keys[type];
}

export function getIntensityKey(intensity: string): string {
  const keys: Record<string, string> = {
    easy: 'intensityEasy',
    moderate: 'intensityModerate',
    intense: 'intensityIntense',
  };
  return keys[intensity] ?? intensity;
}
