import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

interface TrialState {
  isInTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  trialEndsAt: Date | null;
  trialState: 'active' | 'expired' | 'converted' | 'extended' | 'never_started';
  showExpirationModal: boolean;
  loading: boolean;
}

interface TrialStats {
  messages_used: number;
  scans_used: number;
  workouts_logged: number;
  meals_logged: number;
}

export function useTrial() {
  const [state, setState] = useState<TrialState>({
    isInTrial: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    trialEndsAt: null,
    trialState: 'never_started',
    showExpirationModal: false,
    loading: true,
  });

  const fetchTrial = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('trial_ends_at, trial_state, is_premium, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (!data) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const now = new Date();
    const endsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
    const isInTrial = data.trial_state === 'active' || data.trial_state === 'extended';

    let daysRemaining = 0;
    let hoursRemaining = 0;
    let showModal = false;

    if (endsAt) {
      const diffMs = endsAt.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

      // Trial expired and not yet converted
      if (diffMs <= 0 && isInTrial && !data.stripe_subscription_id) {
        showModal = true;
      }
    }

    setState({
      isInTrial,
      daysRemaining,
      hoursRemaining,
      trialEndsAt: endsAt,
      trialState: data.trial_state,
      showExpirationModal: showModal,
      loading: false,
    });
  }, []);

  const fetchStats = useCallback(async (): Promise<TrialStats | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.rpc('get_trial_stats', {
      p_user_id: user.id,
    });

    if (error || !data) return null;
    return data as TrialStats;
  }, []);

  const expireTrial = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc('expire_trial', { p_user_id: user.id });
    await fetchTrial();
  }, [fetchTrial]);

  const extendTrial = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.rpc('extend_trial', {
      p_user_id: user.id,
    });

    if (!error && data?.success) {
      await fetchTrial();
    }

    return data;
  }, [fetchTrial]);

  useEffect(() => {
    fetchTrial();
    const interval = setInterval(fetchTrial, 60000);
    return () => clearInterval(interval);
  }, [fetchTrial]);

  return {
    ...state,
    refresh: fetchTrial,
    fetchStats,
    expireTrial,
    extendTrial,
  };
}
