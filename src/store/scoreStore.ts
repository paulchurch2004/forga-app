import { create } from 'zustand';
import type { ForgaScore, ScoreHistory } from '../types/score';

interface ScoreState {
  currentScore: ForgaScore;
  history: ScoreHistory[];
  weeklyChange: number; // points gained/lost this week

  setCurrentScore: (score: ForgaScore) => void;
  setHistory: (history: ScoreHistory[]) => void;
  setWeeklyChange: (change: number) => void;
  reset: () => void;
}

const defaultScore: ForgaScore = {
  total: 0,
  nutrition: 0,
  consistency: 0,
  progression: 0,
  discipline: 0,
};

export const useScoreStore = create<ScoreState>((set) => ({
  currentScore: defaultScore,
  history: [],
  weeklyChange: 0,

  setCurrentScore: (currentScore) => set({ currentScore }),
  setHistory: (history) => set({ history }),
  setWeeklyChange: (weeklyChange) => set({ weeklyChange }),
  reset: () => set({ currentScore: defaultScore, history: [], weeklyChange: 0 }),
}));
