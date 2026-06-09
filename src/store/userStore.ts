import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, OnboardingData, Badge, WeightEntry, WeeklyCheckIn, BodyMeasurement, ProgressPhoto } from '../types/user';
import type { StrengthTestResult } from '../types/strength';

interface UserState {
  profile: UserProfile | null;
  onboardingData: OnboardingData;
  /** Last completed onboarding step (0..7). Used to resume where the user left off
   *  if they close the app mid-flow. Cleared on completion. */
  onboardingStep: number;
  badges: Badge[];
  weightLog: WeightEntry[];
  checkIns: WeeklyCheckIn[];
  measurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  strengthTest: StrengthTestResult | null;
  /** Date ISO d'acceptation du disclaimer santé (Apple Guideline 1.4.1).
   *  null = pas encore accepté → on affiche le modal après l'onboarding,
   *  avant le 1er accès au coach IA / aux plans. Sync vers Supabase pour
   *  ne pas re-prompter sur un autre device. */
  healthDisclaimerAcceptedAt: string | null;
  /** Flags d'activation — fire les events `first_*` une seule fois.
   *  Une fois true, l'event ne se re-déclenche plus. Local-only (pas
   *  besoin de sync : si l'user change de device, on considère qu'il
   *  fait sa "première fois" sur ce device, c'est OK pour la métrique
   *  d'activation par device). */
  hasLoggedFirstMeal: boolean;
  hasLoggedFirstWorkout: boolean;
  hasSentFirstCoachMessage: boolean;

  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  setOnboardingStep: (step: number) => void;
  resetOnboarding: () => void;
  setBadges: (badges: Badge[]) => void;
  addBadge: (badge: Badge) => void;
  setWeightLog: (entries: WeightEntry[]) => void;
  addWeightEntry: (entry: WeightEntry) => void;
  setCheckIns: (checkIns: WeeklyCheckIn[]) => void;
  addCheckIn: (checkIn: WeeklyCheckIn) => void;
  setMeasurements: (measurements: BodyMeasurement[]) => void;
  addMeasurement: (measurement: BodyMeasurement) => void;
  addProgressPhoto: (photo: ProgressPhoto) => void;
  removeProgressPhoto: (id: string) => void;
  setStrengthTest: (result: StrengthTestResult | null) => void;
  acceptHealthDisclaimer: () => void;
  markFirstMealLogged: () => void;
  markFirstWorkoutLogged: () => void;
  markFirstCoachMessageSent: () => void;
  reset: () => void;
}

const initialOnboarding: OnboardingData = {};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      onboardingData: initialOnboarding,
      onboardingStep: 0,
      badges: [],
      weightLog: [],
      checkIns: [],
      measurements: [],
      progressPhotos: [],
      strengthTest: null,
      healthDisclaimerAcceptedAt: null,
      hasLoggedFirstMeal: false,
      hasLoggedFirstWorkout: false,
      hasSentFirstCoachMessage: false,

      setProfile: (profile) => set({ profile }),
      setStrengthTest: (result) => set({ strengthTest: result }),
      acceptHealthDisclaimer: () => set({ healthDisclaimerAcceptedAt: new Date().toISOString() }),
      markFirstMealLogged: () => set({ hasLoggedFirstMeal: true }),
      markFirstWorkoutLogged: () => set({ hasLoggedFirstWorkout: true }),
      markFirstCoachMessageSent: () => set({ hasSentFirstCoachMessage: true }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
      setOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      resetOnboarding: () => set({ onboardingData: initialOnboarding, onboardingStep: 0 }),
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
      addProgressPhoto: (photo) =>
        set((state) => ({ progressPhotos: [...state.progressPhotos, photo] })),
      removeProgressPhoto: (id) =>
        set((state) => ({ progressPhotos: state.progressPhotos.filter((p) => p.id !== id) })),
      reset: () =>
        set({
          profile: null,
          onboardingData: initialOnboarding,
          badges: [],
          weightLog: [],
          checkIns: [],
          measurements: [],
          progressPhotos: [],
          strengthTest: null,
          healthDisclaimerAcceptedAt: null,
          hasLoggedFirstMeal: false,
          hasLoggedFirstWorkout: false,
          hasSentFirstCoachMessage: false,
        }),
    }),
    {
      name: 'forga-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Versioning IMPORTANT : sans ça, un store v1 ré-hydraté avec un
      // shape v2 (nouveaux champs cycling, menopauseStatus, avatarUri…)
      // peut crasher silencieusement quand le code lit un champ nested
      // qui n'existe pas. À bumper à chaque changement de structure +
      // ajouter une fonction migrate ci-dessous.
      version: 1,
      migrate: (persistedState: any, fromVersion) => {
        // Future migrations (v2, v3…) ici. Pour l'instant on accepte
        // tout shape ≥ v0 et le default merge de zustand-persist
        // remplit les champs manquants avec les valeurs initiales.
        if (!persistedState) return persistedState;
        // Garde-fou : si profile.name a été corrompu en undefined,
        // remplace par '' (sinon crash sur les .split).
        if (persistedState.profile && persistedState.profile.name == null) {
          persistedState.profile.name = '';
        }
        return persistedState;
      },
      partialize: (state) => ({
        profile: state.profile,
        onboardingData: state.onboardingData,
        onboardingStep: state.onboardingStep,
        badges: state.badges,
        weightLog: state.weightLog,
        checkIns: state.checkIns,
        measurements: state.measurements,
        progressPhotos: state.progressPhotos,
        strengthTest: state.strengthTest,
        healthDisclaimerAcceptedAt: state.healthDisclaimerAcceptedAt,
        hasLoggedFirstMeal: state.hasLoggedFirstMeal,
        hasLoggedFirstWorkout: state.hasLoggedFirstWorkout,
        hasSentFirstCoachMessage: state.hasSentFirstCoachMessage,
      }),
    }
  )
);
