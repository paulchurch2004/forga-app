import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ProgramId,
  GeneratedPlan,
  PlannedDay,
  ProgramDay,
} from '../types/program';
import type { Objective, Sex } from '../types/user';
import { generatePlan, toLocalDateStr } from '../engine/programEngine';
import { getProgramDayById } from '../data/programs';

function syncProgramLazy() {
  setTimeout(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { useUserStore } = require('./userStore');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { syncProgramProgress } = require('../services/userSync');
      const userId = useUserStore.getState().profile?.id;
      if (userId) syncProgramProgress(userId);
    } catch {
      /* noop */
    }
  }, 0);
}

interface ProgramState {
  activePlan: GeneratedPlan | null;
  completedDays: Record<string, string>; // date → workoutId
  /** ProgramId du dernier plan wipé par la migration `onRehydrateStorage`.
   *  Permet à la page Training d'afficher un message clair à l'user
   *  ("Ton ancien programme X n'est plus disponible, choisis-en un
   *  nouveau") plutôt qu'un wipe silencieux. Reset à null après la
   *  première lecture (cf clearLastWipedProgram). */
  lastWipedProgramId: string | null;

  selectProgram: (programId: ProgramId, objective: Objective, sex?: Sex) => void;
  markDayCompleted: (date: string, workoutId: string) => void;
  /** Reverse markDayCompleted — used when the user deletes a workout and we want
   * the day card to revert to its actionable state ("today" / "upcoming"). */
  unmarkDayCompleted: (date: string) => void;
  markDaySkipped: (date: string) => void;
  changeProgram: () => void;
  getTodayPlan: () => PlannedDay | null;
  getWeekDays: (weekNumber: number) => PlannedDay[];
  getCurrentWeek: () => number;
  /** Swap the programDayId + status between two days (used by "Avancer"). */
  swapPlannedDays: (fromDate: string, toDate: string) => void;
  /** Persistently replace one exercise in a planned day (used by ReplaceExerciseSheet). */
  replaceExerciseInDay: (date: string, originalExerciseId: string, newExerciseId: string) => void;
  /** Resolve the ProgramDay for a date, applying any user overrides. */
  getProgramDayForDate: (date: string) => ProgramDay | null;
  /** Reset `lastWipedProgramId` à null après que l'UI ait notifié l'user. */
  clearLastWipedProgram: () => void;
  reset: () => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      completedDays: {},
      lastWipedProgramId: null,

      clearLastWipedProgram: () => set({ lastWipedProgramId: null }),

      selectProgram: (programId, objective, sex) => {
        // sex-aware plan generation (v2). Falls back to male for legacy callers.
        const plan = generatePlan(programId, sex ?? 'male', objective);
        set({ activePlan: plan, completedDays: {} });
        syncProgramLazy();
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
        syncProgramLazy();
      },

      unmarkDayCompleted: (date) => {
        const { activePlan, completedDays } = get();
        if (!activePlan) return;

        const today = toLocalDateStr();
        const restoredStatus =
          date === today ? 'today' : date < today ? 'skipped' : 'upcoming';

        const updatedDays = activePlan.days.map((d) =>
          d.date === date
            ? { ...d, status: restoredStatus as PlannedDay['status'], workoutId: undefined }
            : d
        );

        const { [date]: _removed, ...rest } = completedDays;

        set({
          activePlan: { ...activePlan, days: updatedDays },
          completedDays: rest,
        });
        syncProgramLazy();
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

      swapPlannedDays: (fromDate, toDate) => {
        const { activePlan } = get();
        if (!activePlan || fromDate === toDate) return;

        const fromDay = activePlan.days.find((d) => d.date === fromDate);
        const toDay = activePlan.days.find((d) => d.date === toDate);
        if (!fromDay || !toDay) return;

        // Don't disrupt completed days.
        if (fromDay.status === 'completed' || toDay.status === 'completed') return;

        const updatedDays = activePlan.days.map((d) => {
          if (d.date === fromDate) {
            return {
              ...d,
              programDayId: toDay.programDayId,
              status: toDay.status === 'today' ? 'upcoming' : toDay.status,
            };
          }
          if (d.date === toDate) {
            return {
              ...d,
              programDayId: fromDay.programDayId,
              status: toDay.status,
            };
          }
          return d;
        });

        set({ activePlan: { ...activePlan, days: updatedDays } });
      },

      replaceExerciseInDay: (date, displayedExerciseId, newExerciseId) => {
        const { activePlan } = get();
        if (!activePlan) return;

        const dayOverrides = { ...(activePlan.exerciseOverrides?.[date] ?? {}) };

        // ⚠ BUG corrigé : les overrides sont indexés sur l'ID ORIGINAL du
        // programme (la clé), pas sur ce qui est affiché. Au 2e
        // remplacement (A→B puis B→C), `displayedExerciseId` vaut B, mais
        // la clé à mettre à jour est A (l'original). Sans résoudre la clé
        // originale, on créait override[B]=C qui n'était JAMAIS consulté
        // (getProgramDayForDate itère les exos originaux) → "on ne peut
        // plus changer". On retrouve donc la clé d'origine.
        let originalKey = displayedExerciseId;
        for (const [orig, mapped] of Object.entries(dayOverrides)) {
          if (mapped === displayedExerciseId) {
            originalKey = orig;
            break;
          }
        }

        // Si le nouvel exo == l'original → on retire l'override (retour à
        // l'exo de base). Sinon on (re)mappe original → nouveau.
        if (originalKey === newExerciseId) {
          delete dayOverrides[originalKey];
        } else {
          dayOverrides[originalKey] = newExerciseId;
        }

        const nextOverrides = { ...(activePlan.exerciseOverrides ?? {}) };
        if (Object.keys(dayOverrides).length === 0) {
          delete nextOverrides[date];
        } else {
          nextOverrides[date] = dayOverrides;
        }

        set({
          activePlan: {
            ...activePlan,
            exerciseOverrides: nextOverrides,
          },
        });
      },

      getProgramDayForDate: (date) => {
        const { activePlan } = get();
        if (!activePlan) return null;

        const day = activePlan.days.find((d) => d.date === date);
        if (!day?.programDayId) return null;

        const programDay = getProgramDayById(activePlan.programId, day.programDayId);
        if (!programDay) return null;

        const overrides = activePlan.exerciseOverrides?.[date];
        if (!overrides) return programDay;

        return {
          ...programDay,
          exercises: programDay.exercises.map((ex) =>
            overrides[ex.exerciseId]
              ? { ...ex, exerciseId: overrides[ex.exerciseId] }
              : ex
          ),
        };
      },

      reset: () => {
        set({ activePlan: null, completedDays: {} });
      },
    }),
    {
      name: 'forga-program-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activePlan: state.activePlan, // includes exerciseOverrides
        completedDays: state.completedDays,
        lastWipedProgramId: state.lastWipedProgramId,
      }),
      onRehydrateStorage: () => (state) => {
        // Detect stale plans created against the old (pre-v3) program library.
        // If the plan's programDayIds don't resolve in the current PROGRAMS,
        // clear it so the user lands on the ProgramSelector instead of seeing
        // an empty week.
        if (!state?.activePlan) return;
        const trainingDay = state.activePlan.days.find(
          (d) => d.programDayId && !d.programDayId.startsWith('cardio_'),
        );
        if (!trainingDay?.programDayId) return;
        const resolved = getProgramDayById(state.activePlan.programId, trainingDay.programDayId);
        if (!resolved) {
          if (__DEV__) {
            console.warn(
              '[ProgramStore] Stale plan detected (programDayId not resolvable). Clearing.',
              { programId: state.activePlan.programId, dayId: trainingDay.programDayId },
            );
          }
          // Mémorise le programId wipé pour que la page Training puisse
          // afficher un message ("Ton ancien programme X n'est plus
          // disponible") au lieu d'un écran vide non-expliqué.
          state.lastWipedProgramId = state.activePlan.programId;
          state.activePlan = null;
          state.completedDays = {};
        }
      },
    }
  )
);
