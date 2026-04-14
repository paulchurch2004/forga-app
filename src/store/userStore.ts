import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, OnboardingData, Badge, WeightEntry, WeeklyCheckIn, BodyMeasurement } from '../types/user';

interface UserState {
  profile: UserProfile | null;
  onboardingData: OnboardingData;
  badges: Badge[];
  weightLog: WeightEntry[];
  checkIns: WeeklyCheckIn[];
  measurements: BodyMeasurement[];

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
  setMeasurements: (measurements: BodyMeasurement[]) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  reset: () => void;
}

const initialOnboarding: OnboardingData = {};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      onboardingData: initialOnboarding,
      badges: [],
      weightLog: [],
      checkIns: [],
      measurements: [],

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
      setMeasurements: (measurements) => set({ measurements }),
      addMeasurement: (measurement) =>
        set((state) => ({ measurements: [...state.measurements, measurement] })),
      reset: () =>
        set({
          profile: null,
          onboardingData: initialOnboarding,
          badges: [],
          weightLog: [],
          checkIns: [],
          measurements: [],
        }),
    }),
    {
      name: 'forga-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        badges: state.badges,
        weightLog: state.weightLog,
        checkIns: state.checkIns,
        measurements: state.measurements,
      }),
    }
  )
);
