import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ForgaScore, ScoreHistory } from '../types/score';

interface ScoreState {
  currentScore: ForgaScore;
  history: ScoreHistory[];
  scoreHistory: Record<string, ForgaScore>; // keyed by YYYY-MM-DD
  weeklyChange: number; // points gained/lost this week

  setCurrentScore: (score: ForgaScore) => void;
  setHistory: (history: ScoreHistory[]) => void;
  setWeeklyChange: (change: number) => void;
  saveDailyScore: (date: string, score: ForgaScore) => void;
  getDailyScore: (date: string) => ForgaScore | undefined;
  reset: () => void;
}

const defaultScore: ForgaScore = {
  total: 0,
  nutrition: 0,
  consistency: 0,
  progression: 0,
  discipline: 0,
};

export const useScoreStore = create<ScoreState>()(
  persist(
    (set, get) => ({
      currentScore: defaultScore,
      history: [],
      scoreHistory: {},
      weeklyChange: 0,

      setCurrentScore: (currentScore) => set({ currentScore }),
      setHistory: (history) => set({ history }),
      setWeeklyChange: (weeklyChange) => set({ weeklyChange }),
      saveDailyScore: (date, score) =>
        set((state) => ({
          scoreHistory: { ...state.scoreHistory, [date]: score },
        })),
      getDailyScore: (date) => get().scoreHistory[date],
      reset: () => set({ currentScore: defaultScore, history: [], scoreHistory: {}, weeklyChange: 0 }),
    }),
    {
      name: 'forga-score-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentScore: state.currentScore,
        history: state.history,
        scoreHistory: state.scoreHistory,
        weeklyChange: state.weeklyChange,
      }),
    }
  )
);
