import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ProgramId,
  GeneratedPlan,
  PlannedDay,
} from '../types/program';
import type { Objective } from '../types/user';
import { generatePlan, toLocalDateStr } from '../engine/programEngine';

interface ProgramState {
  activePlan: GeneratedPlan | null;
  completedDays: Record<string, string>; // date → workoutId

  selectProgram: (programId: ProgramId, objective: Objective) => void;
  markDayCompleted: (date: string, workoutId: string) => void;
  markDaySkipped: (date: string) => void;
  changeProgram: () => void;
  getTodayPlan: () => PlannedDay | null;
  getWeekDays: (weekNumber: number) => PlannedDay[];
  getCurrentWeek: () => number;
  reset: () => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      completedDays: {},

      selectProgram: (programId, objective) => {
        const plan = generatePlan(programId, objective);
        set({ activePlan: plan, completedDays: {} });
        // Sync to Supabase
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProgramProgress }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProgramProgress(userId);
          });
        });
      },

      markDayCompleted: (date, workoutId) => {
        const { activePlan, completedDays } = get();
        if (!activePlan) return;

        const updatedDays = activePlan.days.map((d) =>
          d.date === date ? { ...d, status: 'completed' as const, workoutId } : d
        );

        set({
          activePlan: { ...activePlan, days: updatedDays },
          completedDays: { ...completedDays, [date]: workoutId },
        });
        // Sync to Supabase
        import('./userStore').then(({ useUserStore }) => {
          import('../services/userSync').then(({ syncProgramProgress }) => {
            const userId = useUserStore.getState().profile?.id;
            if (userId) syncProgramProgress(userId);
          });
        });
      },

      markDaySkipped: (date) => {
        const { activePlan } = get();
        if (!activePlan) return;

        const updatedDays = activePlan.days.map((d) =>
          d.date === date ? { ...d, status: 'skipped' as const } : d
        );

        set({ activePlan: { ...activePlan, days: updatedDays } });
      },

      changeProgram: () => {
        set({ activePlan: null, completedDays: {} });
      },

      getTodayPlan: () => {
        const { activePlan, completedDays } = get();
        if (!activePlan) return null;

        const today = toLocalDateStr();
        const day = activePlan.days.find((d) => d.date === today);
        if (!day) return null;

        // Update status based on completion
        if (completedDays[today]) {
          return { ...day, status: 'completed', workoutId: completedDays[today] };
        }

        // If it's in the future or past, keep status; if it's today, mark as today
        if (day.status === 'rest') return day;
        if (day.date === today && day.status === 'upcoming') {
          return { ...day, status: 'today' };
        }
        return day;
      },

      getWeekDays: (weekNumber) => {
        const { activePlan, completedDays } = get();
        if (!activePlan) return [];

        const today = toLocalDateStr();
        const startIdx = (weekNumber - 1) * 7;
        const weekDays = activePlan.days.slice(startIdx, startIdx + 7);

        return weekDays.map((d) => {
          if (completedDays[d.date]) {
            return { ...d, status: 'completed' as const, workoutId: completedDays[d.date] };
          }
          if (d.date === today && d.status !== 'rest') {
            return { ...d, status: 'today' as const };
          }
          // Mark past unfinished training days as skipped
          if (d.date < today && d.status === 'upcoming') {
            return { ...d, status: 'skipped' as const };
          }
          return d;
        });
      },

      getCurrentWeek: () => {
        const { activePlan } = get();
        if (!activePlan) return 1;

        const today = toLocalDateStr();
        const start = new Date(activePlan.startDate + 'T00:00:00');
        const now = new Date(today + 'T00:00:00');
        const diffDays = Math.floor(
          (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays < 0) return 1;
        const week = Math.floor(diffDays / 7) + 1;
        return Math.min(week, 4);
      },

      reset: () => {
        set({ activePlan: null, completedDays: {} });
      },
    }),
    {
      name: 'forga-program-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activePlan: state.activePlan,
        completedDays: state.completedDays,
      }),
    }
  )
);
