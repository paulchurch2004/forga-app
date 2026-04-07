import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout, WorkoutType } from '../types/training';

interface TrainingState {
  workouts: Record<string, Workout[]>; // key = 'YYYY-MM-DD'
  lastWorkoutDate: string;

  addWorkout: (workout: Workout) => void;
  removeWorkout: (date: string, workoutId: string) => void;
  getWorkoutsForDate: (date: string) => Workout[];
  getRecentWorkouts: (limit: number) => Workout[];
  getActiveDaysLast7: (todayDate: string) => number;
  getWeeklyCount: (todayDate: string) => number;
  getMonthlyCount: (todayDate: string) => number;
  getFavoriteType: () => WorkoutType | null;
  getExerciseHistory: (exerciseId: string) => { date: string; sets: { reps: number; weight: number }[] }[];
  getLastSessionForExercise: (exerciseId: string) => { reps: number; weight: number }[] | null;
  checkDayReset: () => void;
  reset: () => void;
}

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      workouts: {},
      lastWorkoutDate: new Date().toISOString().split('T')[0],

      addWorkout: (workout) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [workout.date]: [...(state.workouts[workout.date] ?? []), workout],
          },
          lastWorkoutDate: workout.date,
        })),

      removeWorkout: (date, workoutId) =>
        set((state) => ({
          workouts: {
            ...state.workouts,
            [date]: (state.workouts[date] ?? []).filter((w) => w.id !== workoutId),
          },
        })),

      getWorkoutsForDate: (date) => get().workouts[date] ?? [],

      getRecentWorkouts: (limit) => {
        const all: Workout[] = [];
        const dates = Object.keys(get().workouts).sort().reverse();
        for (const date of dates) {
          for (const w of get().workouts[date]) {
            all.push(w);
            if (all.length >= limit) return all;
          }
        }
        return all;
      },

      getActiveDaysLast7: (todayDate) => {
        const today = new Date(todayDate);
        let count = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          if ((get().workouts[key] ?? []).length > 0) count++;
        }
        return count;
      },

      getWeeklyCount: (todayDate) => {
        const today = new Date(todayDate);
        let count = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          count += (get().workouts[key] ?? []).length;
        }
        return count;
      },

      getMonthlyCount: (todayDate) => {
        const today = new Date(todayDate);
        let count = 0;
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          count += (get().workouts[key] ?? []).length;
        }
        return count;
      },

      getFavoriteType: () => {
        const counts: Record<string, number> = {};
        for (const dayWorkouts of Object.values(get().workouts)) {
          for (const w of dayWorkouts) {
            counts[w.type] = (counts[w.type] ?? 0) + 1;
          }
        }
        let best: WorkoutType | null = null;
        let bestCount = 0;
        for (const [type, count] of Object.entries(counts)) {
          if (count > bestCount) {
            best = type as WorkoutType;
            bestCount = count;
          }
        }
        return best;
      },

      getExerciseHistory: (exerciseId) => {
        const result: { date: string; sets: { reps: number; weight: number }[] }[] = [];
        const dates = Object.keys(get().workouts).sort();
        for (const date of dates) {
          for (const w of get().workouts[date]) {
            for (const ex of w.exercises) {
              if (ex.exerciseId === exerciseId) {
                result.push({
                  date,
                  sets: ex.sets.map((s) => ({ reps: s.reps, weight: s.weight })),
                });
              }
            }
          }
        }
        return result;
      },

      getLastSessionForExercise: (exerciseId) => {
        const dates = Object.keys(get().workouts).sort().reverse();
        for (const date of dates) {
          for (const w of get().workouts[date]) {
            for (const ex of w.exercises) {
              if (ex.exerciseId === exerciseId) {
                return ex.sets.map((s) => ({ reps: s.reps, weight: s.weight }));
              }
            }
          }
        }
        return null;
      },

      checkDayReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastWorkoutDate } = get();
        if (!lastWorkoutDate || lastWorkoutDate !== today) {
          set({ lastWorkoutDate: today });
        }
      },

      reset: () => set({ workouts: {}, lastWorkoutDate: new Date().toISOString().split('T')[0] }),
    }),
    {
      name: 'forga-training-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        workouts: state.workouts,
        lastWorkoutDate: state.lastWorkoutDate,
      }),
      onRehydrateStorage: () => (state) => {
        // Run AFTER persist has loaded data from AsyncStorage
        if (state) state.checkDayReset();
      },
    }
  )
);
