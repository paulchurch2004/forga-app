import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export type Feature = 'coach_message' | 'food_scan';

interface QuotaState {
  used: number;
  cap: number;
  bonus: number;
  remaining: number;
  loading: boolean;
}

export function useQuota(feature: Feature) {
  const [quota, setQuota] = useState<QuotaState>({
    used: 0,
    cap: feature === 'coach_message' ? 5 : 3,
    bonus: 0,
    remaining: 0,
    loading: true,
  });

  const fetchQuota = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setQuota((q) => ({ ...q, loading: false }));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const cap = feature === 'coach_message' ? 5 : 3;

    const [usageRes, tokensRes] = await Promise.all([
      supabase
        .from('usage_log')
        .select('count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('user_tokens')
        .select('coach_messages_bonus, food_scans_bonus')
        .eq('user_id', user.id)
        .single(),
    ]);

    const used = usageRes.data?.count || 0;
    const bonus = feature === 'coach_message'
      ? (tokensRes.data?.coach_messages_bonus || 0)
      : (tokensRes.data?.food_scans_bonus || 0);

    setQuota({
      used,
      cap,
      bonus,
      remaining: Math.max(0, cap - used) + bonus,
      loading: false,
    });
  }, [feature]);

  useEffect(() => {
    fetchQuota();
    const interval = setInterval(fetchQuota, 60000);
    return () => clearInterval(interval);
  }, [fetchQuota]);

  return { ...quota, refresh: fetchQuota };
}
