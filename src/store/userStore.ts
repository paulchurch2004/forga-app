import { create } from 'zustand';
import type { UserProfile, OnboardingData, Badge, WeightEntry, WeeklyCheckIn } from '../types/user';

interface UserState {
  profile: UserProfile | null;
  onboardingData: OnboardingData;
  badges: Badge[];
  weightLog: WeightEntry[];
  checkIns: WeeklyCheckIn[];

  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;
  setWeightLog: (entries: WeightEntry[]) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  setCheckIns: (checkIns: WeeklyCheckIn[]) => void;
  addCheckIn: (checkIn: WeeklyCheckIn) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingData = {};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  onboardingData: initialOnboarding,
  badges: [],
  weightLog: [],
  checkIns: [],

  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  setOnboardingData: (data) =>
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    })),
  resetOnboarding: () => set({ onboardingData: initialOnboarding }),
  setBadges: (badges) => set({ badges }),
  addBadge: (badge) =>
    set((state) => ({ badges: [...state.badges, badge] })),
  setWeightLog: (weightLog) => set({ weightLog }),
  addWeightEntry: (entry) =>
    set((state) => ({ weightLog: [...state.weightLog, entry] })),
  setCheckIns: (checkIns) => set({ checkIns }),
  addCheckIn: (checkIn) =>
    set((state) => ({ checkIns: [...state.checkIns, checkIn] })),
  reset: () =>
    set({
      profile: null,
      onboardingData: initialOnboarding,
      badges: [],
      weightLog: [],
      checkIns: [],
    }),
}));
