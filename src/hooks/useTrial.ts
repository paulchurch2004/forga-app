import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

interface TrialState {
  isInTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  trialEndsAt: Date | null;
  trialState: 'active' | 'expired' | 'converted' | 'extended' | 'never_started';
  /** Modal HARD à l'expiration (J0 ou plus tard) — bloque toutes les
   *  features premium tant que l'user n'a pas converti ou choisi free. */
  showExpirationModal: boolean;
  /** Modal SOFT à J-2 ou J-1 — réveil "il te reste X jours". Dismissable.
   *  Affiché une seule fois par jour-de-warning (persisté en
   *  AsyncStorage avec clé dérivée du trial_ends_at, donc reset si
   *  l'user étend son trial). */
  showWarningModal: boolean;
  loading: boolean;
}

/** Clé AsyncStorage pour suivre quels warnings ont déjà été affichés.
 *  Format: `trial-warning:{trialEndIso}:{daysRemaining}` — change si le
 *  trial est étendu (nouvelle endsAt) → warnings réaffichés au bon moment. */
function warningKey(trialEndIso: string, daysRemaining: number): string {
  return `forga-trial-warning:${trialEndIso}:d${daysRemaining}`;
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
    showWarningModal: false,
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
    let showWarning = false;

    if (endsAt) {
      const diffMs = endsAt.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

      // Trial expired and not yet converted
      if (diffMs <= 0 && isInTrial && !data.stripe_subscription_id) {
        showModal = true;
      }

      // Warning soft à J-2 ou J-1 (uniquement si trial encore actif,
      // pas converti, et warning pas encore vu pour ce jour-restant).
      if (isInTrial && diffMs > 0 && daysRemaining <= 2 && !data.stripe_subscription_id) {
        const key = warningKey(endsAt.toISOString(), daysRemaining);
        const seen = await AsyncStorage.getItem(key).catch(() => null);
        if (!seen) showWarning = true;
      }
    }

    setState({
      isInTrial,
      daysRemaining,
      hoursRemaining,
      trialEndsAt: endsAt,
      trialState: data.trial_state,
      showExpirationModal: showModal,
      showWarningModal: showWarning,
      loading: false,
    });
  }, []);

  /** Marque le warning courant comme vu — appelé par le UI quand l'user
   *  dismiss le modal (ou tape "Voir l'offre"). Évite de re-spammer
   *  à chaque ouverture d'app le même jour. */
  const dismissWarning = useCallback(async () => {
    const endsAt = state.trialEndsAt;
    if (!endsAt) return;
    const key = warningKey(endsAt.toISOString(), state.daysRemaining);
    try {
      await AsyncStorage.setItem(key, new Date().toISOString());
    } catch {
      // Silent fail — au pire l'user revoit le modal, pas critique
    }
    setState((s) => ({ ...s, showWarningModal: false }));
  }, [state.trialEndsAt, state.daysRemaining]);

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
    dismissWarning,
  };
}
