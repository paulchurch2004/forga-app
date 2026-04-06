import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ForgaScore, ScoreHistory } from '../types/score';

interface ScoreState {
  currentScore: ForgaScore;
  lastScoreDate: string; // 'YYYY-MM-DD' — tracks which day currentScore belongs to
  history: ScoreHistory[];
  scoreHistory: Record<string, ForgaScore>; // keyed by YYYY-MM-DD
  weeklyChange: number; // points gained/lost this week

  setCurrentScore: (score: ForgaScore) => void;
  setHistory: (history: ScoreHistory[]) => void;
  setWeeklyChange: (change: number) => void;
  saveDailyScore: (date: string, score: ForgaScore) => void;
  getDailyScore: (date: string) => ForgaScore | undefined;
  checkDayReset: () => void;
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
      lastScoreDate: new Date().toISOString().split('T')[0],
      history: [],
      scoreHistory: {},
      weeklyChange: 0,

      setCurrentScore: (currentScore) => set({ currentScore, lastScoreDate: new Date().toISOString().split('T')[0] }),
      setHistory: (history) => set({ history }),
      setWeeklyChange: (weeklyChange) => set({ weeklyChange }),
      saveDailyScore: (date, score) =>
        set((state) => ({
          scoreHistory: { ...state.scoreHistory, [date]: score },
        })),
      getDailyScore: (date) => get().scoreHistory[date],
      checkDayReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastScoreDate, currentScore, scoreHistory } = get();
        if (lastScoreDate && lastScoreDate !== today) {
          // Save yesterday's score to history before resetting
          if (currentScore.total > 0 && !(lastScoreDate in scoreHistory)) {
            set({
              scoreHistory: { ...scoreHistory, [lastScoreDate]: currentScore },
              currentScore: defaultScore,
              lastScoreDate: today,
              weeklyChange: 0,
            });
          } else {
            set({ currentScore: defaultScore, lastScoreDate: today, weeklyChange: 0 });
          }
        } else if (!lastScoreDate) {
          set({ lastScoreDate: today });
        }
      },
      reset: () => set({ currentScore: defaultScore, lastScoreDate: new Date().toISOString().split('T')[0], history: [], scoreHistory: {}, weeklyChange: 0 }),
    }),
    {
      name: 'forga-score-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentScore: state.currentScore,
        lastScoreDate: state.lastScoreDate,
        history: state.history,
        scoreHistory: state.scoreHistory,
        weeklyChange: state.weeklyChange,
      }),
    }
  )
);
