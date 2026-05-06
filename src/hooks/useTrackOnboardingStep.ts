// FORGA — Persist the user's current onboarding step so the app can resume
// at the same screen if they close mid-flow. Also fires the analytics
// event for funnel tracking.

import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { events } from '../services/analytics';

export function useTrackOnboardingStep(step: number) {
  useEffect(() => {
    useUserStore.getState().setOnboardingStep(step);
    events.onboardingStep(step);
  }, [step]);
}
