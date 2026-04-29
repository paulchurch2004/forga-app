import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

interface TokensState {
  coach_messages_bonus: number;
  food_scans_bonus: number;
  total_videos_watched: number;
  videos_today: number;
  videos_remaining: number;
}

export function useTokens() {
  const [tokens, setTokens] = useState<TokensState>({
    coach_messages_bonus: 0,
    food_scans_bonus: 0,
    total_videos_watched: 0,
    videos_today: 0,
    videos_remaining: 3,
  });

  const fetchTokens = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const [tokensRes, videosRes] = await Promise.all([
      supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('usage_log')
        .select('count')
        .eq('user_id', user.id)
        .eq('feature', 'rewarded_video')
        .eq('date', today)
        .maybeSingle(),
    ]);

    const videosToday = videosRes.data?.count || 0;

    setTokens({
      coach_messages_bonus: tokensRes.data?.coach_messages_bonus || 0,
      food_scans_bonus: tokensRes.data?.food_scans_bonus || 0,
      total_videos_watched: tokensRes.data?.total_videos_watched || 0,
      videos_today: videosToday,
      videos_remaining: Math.max(0, 3 - videosToday),
    });
  }, []);

  const awardTokens = useCallback(async (
    rewardType: 'coach_messages' | 'food_scan',
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    const { data, error } = await supabase.rpc('award_video_tokens', {
      p_user_id: user.id,
      p_reward_type: rewardType,
    });

    if (!error && data?.success) {
      await fetchTokens();
    }

    return data;
  }, [fetchTokens]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { ...tokens, refresh: fetchTokens, awardTokens };
}
