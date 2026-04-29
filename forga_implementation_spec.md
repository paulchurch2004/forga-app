# FORGA — Implémentation Trial 7j + Système de Quotas + Tokens Rewarded Video

## Contexte

On implémente un système complet de monétisation freemium avec :
1. **Auto-trial PRO de 7 jours** sans carte bancaire à l'inscription
2. **Système de quotas serveur** pour Coach IA et Food Scan
3. **Système de tokens FORGA** (rewarded videos = bonus messages/scans)
4. **Notifications J-2 et J-1** avant fin de trial
5. **Modal "fin de trial"** avec stats personnalisées
6. **Modal "downgrade"** avec last-chance offer

---

## Décisions produit validées

| Élément | Valeur |
|---|---|
| Durée trial PRO auto | 7 jours sans CB |
| Cap free Coach IA | 5 messages/jour |
| Cap free Food Scan | 3 scans/jour |
| Récompense rewarded video | +3 messages OU +1 scan (au choix user) |
| Limite vidéos/jour | 3 max |
| Cap absolu free | 14 messages/jour, 6 scans/jour |
| PRO | Illimité tout, sans pub |
| Notifs trial | J5 (douce) + J6 (urgente) + J7 (popup app) |
| Last chance offer | Trial 7j supplémentaires AVEC CB |

---

## Phase 1 — Migration SQL

### Fichier : `supabase/migrations/006_quotas_tokens_trial.sql`

```sql
-- =====================================================
-- 006_quotas_tokens_trial.sql
-- Quotas serveur + tokens FORGA + trial automation
-- =====================================================

-- ============= 1. ENRICHIR public.users =============
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_state TEXT 
    CHECK (trial_state IN ('active', 'expired', 'converted', 'extended', 'never_started'))
    DEFAULT 'never_started',
  ADD COLUMN IF NOT EXISTS trial_source TEXT 
    CHECK (trial_source IN ('auto_signup', 'voluntary_extended', 'paid_conversion'));

CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON public.users(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_users_trial_state ON public.users(trial_state);

-- ============= 2. TABLE usage_log =============
CREATE TABLE IF NOT EXISTS public.usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('coach_message', 'food_scan', 'rewarded_video')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature, date)
);

CREATE INDEX idx_usage_log_user_date ON public.usage_log(user_id, date);
CREATE INDEX idx_usage_log_feature ON public.usage_log(feature);

ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own usage"
  ON public.usage_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages usage"
  ON public.usage_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============= 3. TABLE user_tokens =============
CREATE TABLE IF NOT EXISTS public.user_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_messages_bonus INTEGER NOT NULL DEFAULT 0 CHECK (coach_messages_bonus >= 0),
  food_scans_bonus INTEGER NOT NULL DEFAULT 0 CHECK (food_scans_bonus >= 0),
  total_videos_watched INTEGER NOT NULL DEFAULT 0,
  last_video_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own tokens"
  ON public.user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages tokens"
  ON public.user_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- ============= 4. TRIGGER : init tokens + trial pour nouveau user =============
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER AS $$
BEGIN
  -- Init tokens
  INSERT INTO public.user_tokens (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Auto-start 7-day PRO trial
  UPDATE public.users
  SET 
    is_premium = TRUE,
    trial_started_at = NOW(),
    trial_ends_at = NOW() + INTERVAL '7 days',
    trial_state = 'active',
    trial_source = 'auto_signup',
    premium_until = NOW() + INTERVAL '7 days'
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_setup ON auth.users;
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();

-- ============= 5. RPC : check_and_increment_quota =============
CREATE OR REPLACE FUNCTION public.check_and_increment_quota(
  p_user_id UUID,
  p_feature TEXT,
  p_daily_cap INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_is_premium BOOLEAN;
  v_current_count INTEGER;
  v_bonus_count INTEGER;
BEGIN
  SELECT is_premium INTO v_is_premium
  FROM public.users WHERE id = p_user_id;
  
  -- PRO : illimité, on log juste
  IF v_is_premium THEN
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();
    
    RETURN jsonb_build_object(
      'allowed', true, 'reason', 'premium', 'remaining', -1
    );
  END IF;
  
  -- Free : check usage
  SELECT COALESCE(count, 0) INTO v_current_count
  FROM public.usage_log
  WHERE user_id = p_user_id AND feature = p_feature AND date = CURRENT_DATE;
  
  IF v_current_count IS NULL THEN v_current_count := 0; END IF;
  
  -- Check bonus tokens
  IF p_feature = 'coach_message' THEN
    SELECT COALESCE(coach_messages_bonus, 0) INTO v_bonus_count
    FROM public.user_tokens WHERE user_id = p_user_id;
  ELSIF p_feature = 'food_scan' THEN
    SELECT COALESCE(food_scans_bonus, 0) INTO v_bonus_count
    FROM public.user_tokens WHERE user_id = p_user_id;
  ELSE
    v_bonus_count := 0;
  END IF;
  
  v_bonus_count := COALESCE(v_bonus_count, 0);
  
  -- Decision
  IF v_current_count < p_daily_cap THEN
    -- Quota base disponible
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();
    
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'quota_ok',
      'used', v_current_count + 1,
      'cap', p_daily_cap,
      'bonus', v_bonus_count,
      'remaining', GREATEST(0, p_daily_cap - v_current_count - 1) + v_bonus_count
    );
  ELSIF v_bonus_count > 0 THEN
    -- Cap atteint mais bonus dispo
    IF p_feature = 'coach_message' THEN
      UPDATE public.user_tokens 
      SET coach_messages_bonus = coach_messages_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSIF p_feature = 'food_scan' THEN
      UPDATE public.user_tokens 
      SET food_scans_bonus = food_scans_bonus - 1, updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
    
    INSERT INTO public.usage_log (user_id, feature, date, count)
    VALUES (p_user_id, p_feature, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature, date)
    DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();
    
    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'bonus_consumed',
      'used', v_current_count + 1,
      'cap', p_daily_cap,
      'bonus', v_bonus_count - 1,
      'remaining', v_bonus_count - 1
    );
  ELSE
    -- Refus
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'quota_exceeded',
      'used', v_current_count,
      'cap', p_daily_cap,
      'bonus', v_bonus_count,
      'remaining', 0
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 6. RPC : award_video_tokens =============
CREATE OR REPLACE FUNCTION public.award_video_tokens(
  p_user_id UUID,
  p_reward_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_videos_today INTEGER;
  v_max_videos_per_day CONSTANT INTEGER := 3;
  v_coach_reward CONSTANT INTEGER := 3;
  v_scan_reward CONSTANT INTEGER := 1;
BEGIN
  SELECT COALESCE(count, 0) INTO v_videos_today
  FROM public.usage_log
  WHERE user_id = p_user_id 
    AND feature = 'rewarded_video' 
    AND date = CURRENT_DATE;
  
  IF v_videos_today >= v_max_videos_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'daily_video_limit_reached',
      'limit', v_max_videos_per_day,
      'videos_today', v_videos_today
    );
  END IF;
  
  IF p_reward_type = 'coach_messages' THEN
    UPDATE public.user_tokens
    SET coach_messages_bonus = coach_messages_bonus + v_coach_reward,
        total_videos_watched = total_videos_watched + 1,
        last_video_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_reward_type = 'food_scan' THEN
    UPDATE public.user_tokens
    SET food_scans_bonus = food_scans_bonus + v_scan_reward,
        total_videos_watched = total_videos_watched + 1,
        last_video_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'reason', 'invalid_reward_type');
  END IF;
  
  INSERT INTO public.usage_log (user_id, feature, date, count)
  VALUES (p_user_id, 'rewarded_video', CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature, date)
  DO UPDATE SET count = usage_log.count + 1, updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'reward_type', p_reward_type,
    'videos_today', v_videos_today + 1,
    'videos_remaining', v_max_videos_per_day - (v_videos_today + 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 7. RPC : get_trial_stats =============
-- Renvoie les stats d'usage pendant le trial (pour le popup J7)
CREATE OR REPLACE FUNCTION public.get_trial_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_trial_start TIMESTAMPTZ;
  v_messages_used INTEGER;
  v_scans_used INTEGER;
  v_workouts_logged INTEGER;
  v_meals_logged INTEGER;
BEGIN
  SELECT trial_started_at INTO v_trial_start
  FROM public.users WHERE id = p_user_id;
  
  IF v_trial_start IS NULL THEN
    RETURN jsonb_build_object('error', 'no_trial_found');
  END IF;
  
  SELECT COALESCE(SUM(count), 0) INTO v_messages_used
  FROM public.usage_log
  WHERE user_id = p_user_id 
    AND feature = 'coach_message'
    AND date >= v_trial_start::DATE;
  
  SELECT COALESCE(SUM(count), 0) INTO v_scans_used
  FROM public.usage_log
  WHERE user_id = p_user_id 
    AND feature = 'food_scan'
    AND date >= v_trial_start::DATE;
  
  SELECT COUNT(*) INTO v_workouts_logged
  FROM public.workouts
  WHERE user_id = p_user_id AND date >= v_trial_start::DATE;
  
  SELECT COUNT(*) INTO v_meals_logged
  FROM public.daily_meals
  WHERE user_id = p_user_id 
    AND date >= v_trial_start::DATE
    AND validated_at IS NOT NULL;
  
  RETURN jsonb_build_object(
    'messages_used', v_messages_used,
    'scans_used', v_scans_used,
    'workouts_logged', v_workouts_logged,
    'meals_logged', v_meals_logged,
    'trial_started_at', v_trial_start
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 8. RPC : expire_trial =============
-- Appelée quand l'user clique "rester en gratuit" ou auto par cron
CREATE OR REPLACE FUNCTION public.expire_trial(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.users
  SET 
    is_premium = FALSE,
    trial_state = 'expired',
    premium_until = NULL
  WHERE id = p_user_id 
    AND trial_state = 'active'
    AND stripe_subscription_id IS NULL;
  
  RETURN jsonb_build_object('success', true, 'state', 'expired');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 9. RPC : extend_trial (last chance) =============
-- Appelée quand l'user accepte le "trial 7j de plus" avec CB
CREATE OR REPLACE FUNCTION public.extend_trial(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_can_extend BOOLEAN;
BEGIN
  -- Empêcher les extensions multiples
  SELECT (trial_state = 'active' AND trial_source = 'auto_signup') INTO v_can_extend
  FROM public.users WHERE id = p_user_id;
  
  IF NOT v_can_extend THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_eligible');
  END IF;
  
  UPDATE public.users
  SET 
    trial_ends_at = NOW() + INTERVAL '7 days',
    trial_state = 'extended',
    trial_source = 'voluntary_extended',
    premium_until = NOW() + INTERVAL '7 days'
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'new_end_date', (NOW() + INTERVAL '7 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= 10. INITIALISER les users existants =============
-- Pour les users déjà créés avant cette migration
INSERT INTO public.user_tokens (user_id)
SELECT id FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.user_tokens)
ON CONFLICT (user_id) DO NOTHING;
```

---

## Phase 2 — Edge Functions

### Fichier : `supabase/functions/coach-chat/index.ts`

**Modifications** :

```typescript
// 1. Ajouter en haut, après création client Supabase :

// ✅ JWT Verification (passer de --no-verify-jwt à JWT requis)
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Authorization required' }),
    { status: 401, headers: corsHeaders }
  );
}

const token = authHeader.replace('Bearer ', '');
const { data: { user }, error: authError } = await supabase.auth.getUser(token);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid token' }),
    { status: 401, headers: corsHeaders }
  );
}

// ✅ Quota check AVANT appel Groq
const { data: quotaCheck, error: quotaError } = await supabase.rpc(
  'check_and_increment_quota',
  {
    p_user_id: user.id,
    p_feature: 'coach_message',
    p_daily_cap: 5
  }
);

if (quotaError) {
  console.error('Quota check error:', quotaError);
  return new Response(
    JSON.stringify({ error: 'Quota check failed' }),
    { status: 500, headers: corsHeaders }
  );
}

if (!quotaCheck.allowed) {
  return new Response(
    JSON.stringify({
      error: 'quota_exceeded',
      message: 'Tu as atteint ta limite de messages aujourd\'hui. Regarde une vidéo pour débloquer +3 messages.',
      quota: quotaCheck
    }),
    { status: 429, headers: corsHeaders }
  );
}

// 2. Modifier le return final pour inclure quota :
return new Response(
  JSON.stringify({
    response: aiResponse,
    actions: extractedActions,
    quota: {
      used: quotaCheck.used,
      cap: quotaCheck.cap,
      bonus: quotaCheck.bonus,
      remaining: quotaCheck.remaining
    }
  }),
  { headers: corsHeaders }
);
```

**Modifier aussi `supabase/config.toml`** :

```toml
[functions.coach-chat]
verify_jwt = true  # Passer de false à true
```

### Fichier : `supabase/functions/analyze-food/index.ts`

```typescript
// Après l'auth check existant (ligne ~61), AJOUTER :

const { data: quotaCheck, error: quotaError } = await supabase.rpc(
  'check_and_increment_quota',
  {
    p_user_id: user.id,
    p_feature: 'food_scan',
    p_daily_cap: 3
  }
);

if (quotaError || !quotaCheck.allowed) {
  return new Response(
    JSON.stringify({
      error: 'quota_exceeded',
      message: 'Limite de scans atteinte. Regarde une vidéo pour +1 scan bonus.',
      quota: quotaCheck
    }),
    { status: 429, headers: corsHeaders }
  );
}

// Modifier le return final :
return new Response(
  JSON.stringify({
    food: parsedFood,
    quota: quotaCheck
  })
);
```

---

## Phase 3 — Hooks React Native

### Fichier : `src/hooks/useQuota.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

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
      setQuota(q => ({ ...q, loading: false }));
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
```

### Fichier : `src/hooks/useTokens.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';

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
    rewardType: 'coach_messages' | 'food_scan'
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
```

### Fichier : `src/hooks/useTrial.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/store/userStore';

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
      setState(s => ({ ...s, loading: false }));
      return;
    }
    
    const { data } = await supabase
      .from('users')
      .select('trial_ends_at, trial_state, is_premium, stripe_subscription_id')
      .eq('id', user.id)
      .single();
    
    if (!data) {
      setState(s => ({ ...s, loading: false }));
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
```

---

## Phase 4 — Notifications J-2 / J-1

### Fichier : `src/services/trialNotifications.ts`

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleTrialNotifications(trialEndsAt: Date) {
  // Annuler les anciennes notifs trial
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'trial_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
  
  const now = new Date();
  
  // J-2 (douce, encouragement)
  const j2 = new Date(trialEndsAt.getTime() - 2 * 24 * 60 * 60 * 1000);
  if (j2 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Plus que 2 jours de PRO',
        body: 'Profite-en à fond — coach illimité, scans, programmes...',
        data: { type: 'trial_reminder', day: 'J-2' },
      },
      trigger: { date: j2, channelId: Platform.OS === 'android' ? 'default' : undefined },
    });
  }
  
  // J-1 (urgente)
  const j1 = new Date(trialEndsAt.getTime() - 24 * 60 * 60 * 1000);
  if (j1 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Ton trial PRO se termine demain',
        body: 'Continue ta progression sans interruption — voir les options',
        data: { type: 'trial_reminder', day: 'J-1' },
      },
      trigger: { date: j1, channelId: Platform.OS === 'android' ? 'default' : undefined },
    });
  }
  
  // J0 (le jour J, à 10h)
  const j0 = new Date(trialEndsAt);
  j0.setHours(10, 0, 0, 0);
  if (j0 > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Ton trial PRO se termine aujourd\'hui',
        body: 'Ouvre l\'app pour finaliser ton choix',
        data: { type: 'trial_reminder', day: 'J0' },
      },
      trigger: { date: j0, channelId: Platform.OS === 'android' ? 'default' : undefined },
    });
  }
}

export async function cancelAllTrialNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'trial_reminder') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
```

**À appeler dans `_layout.tsx` ou onboarding completion** :

```typescript
import { scheduleTrialNotifications } from '@/services/trialNotifications';

// Après que l'user a accepté les notifs (à la fin de l'onboarding)
const { trialEndsAt } = useTrial();
if (trialEndsAt) {
  await scheduleTrialNotifications(trialEndsAt);
}
```

---

## Phase 5 — Modales UI

### Fichier : `src/components/TrialExpirationModal.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTrial } from '@/hooks/useTrial';
import { router } from 'expo-router';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TrialExpirationModal({ visible, onClose }: Props) {
  const { fetchStats, extendTrial } = useTrial();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    if (visible) {
      fetchStats().then(setStats);
    }
  }, [visible, fetchStats]);
  
  const handleGoPro = () => {
    onClose();
    router.push('/paywall');
  };
  
  const handleExtend = async () => {
    // TODO: déclencher le flow Stripe/RevenueCat pour CB sans charge immédiate
    // Pour l'instant : appel extend_trial directement (à raffiner avec CB)
    const result = await extendTrial();
    if (result?.success) {
      onClose();
    }
  };
  
  const handleGoFree = () => {
    onClose();
    router.push('/downgrade-confirmation');
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modal}>
          
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Ton trial PRO se termine</Text>
          
          {stats && (
            <View style={styles.statsBlock}>
              <Text style={styles.statsTitle}>Tu as utilisé en 7 jours :</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.messages_used}</Text>
                <Text style={styles.statLabel}>messages coach</Text>
                <Text style={styles.statLimit}>(gratuit : 35 max)</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.scans_used}</Text>
                <Text style={styles.statLabel}>scans repas</Text>
                <Text style={styles.statLimit}>(gratuit : 21 max)</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.workouts_logged}</Text>
                <Text style={styles.statLabel}>séances loggées</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.meals_logged}</Text>
                <Text style={styles.statLabel}>repas validés</Text>
              </View>
            </View>
          )}
          
          <Pressable style={styles.primaryBtn} onPress={handleGoPro}>
            <Text style={styles.primaryBtnText}>Continuer PRO — 14,99 €/mois</Text>
            <Text style={styles.primaryBtnSubtext}>★ Garde tout illimité</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryBtn} onPress={handleExtend}>
            <Text style={styles.secondaryBtnText}>Essayer 7 jours de plus</Text>
            <Text style={styles.secondaryBtnSubtext}>Avec CB · annulable à tout moment</Text>
          </Pressable>
          
          <Pressable style={styles.tertiaryBtn} onPress={handleGoFree}>
            <Text style={styles.tertiaryBtnText}>Passer en gratuit</Text>
          </Pressable>
          
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsBlock: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B2C',
    minWidth: 40,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  statLimit: {
    fontSize: 11,
    color: '#666',
  },
  primaryBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  secondaryBtn: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryBtnSubtext: { color: '#999', fontSize: 11, marginTop: 2 },
  tertiaryBtn: {
    padding: 12,
    alignItems: 'center',
  },
  tertiaryBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
});
```

### Fichier : `app/downgrade-confirmation.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { useTrial } from '@/hooks/useTrial';

const FEATURES_LOST = [
  { icon: '💬', label: 'Coach IA', from: 'Illimité', to: '5 / jour' },
  { icon: '📸', label: 'Scans repas', from: 'Illimité', to: '3 / jour' },
  { icon: '🏋️', label: 'Programmes', from: '40+ plans', to: '1 seul' },
  { icon: '🍳', label: 'Recettes', from: '510 premium', to: '5 free' },
  { icon: '🎬', label: 'Vidéos étape par étape', from: 'Toutes', to: 'Bloquées' },
  { icon: '📊', label: 'Weekly review détaillée', from: 'Complète', to: 'Aperçu' },
  { icon: '📥', label: 'Export CSV / PDF', from: 'Disponible', to: 'Bloqué' },
  { icon: '📺', label: 'Publicités', from: 'Aucune', to: 'Présentes' },
];

export default function DowngradeConfirmation() {
  const { extendTrial, expireTrial } = useTrial();
  const [step, setStep] = useState<'list' | 'last_chance'>('list');
  const [opacity] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [opacity]);
  
  const handleConfirmFree = () => {
    setStep('last_chance');
  };
  
  const handleLastChanceAccept = async () => {
    const result = await extendTrial();
    if (result?.success) {
      router.back();
    }
  };
  
  const handleLastChanceDecline = async () => {
    await expireTrial();
    router.replace('/(tabs)/home');
  };
  
  if (step === 'last_chance') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lastChanceEmoji}>👋</Text>
          <Text style={styles.lastChanceTitle}>Une dernière chose...</Text>
          <Text style={styles.lastChanceBody}>
            Tu peux essayer <Text style={{fontWeight: '700'}}>1 semaine de plus offerte</Text> avec ta CB.
            Aucun débit pendant 7 jours, annulable en 1 clic depuis l'App Store.
          </Text>
          
          <Pressable style={styles.acceptBtn} onPress={handleLastChanceAccept}>
            <Text style={styles.acceptBtnText}>J'essaie 7 jours de plus</Text>
            <Text style={styles.acceptBtnSubtext}>Gratuit · annulable à tout moment</Text>
          </Pressable>
          
          <Pressable style={styles.declineBtn} onPress={handleLastChanceDecline}>
            <Text style={styles.declineBtnText}>Non merci, passer en gratuit</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tu vas perdre ton accès illimité</Text>
        
        <Animated.View style={{ opacity }}>
          {FEATURES_LOST.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureChange}>
                  <Text style={styles.featureFrom}>{f.from}</Text>
                  <Text style={styles.arrow}> → </Text>
                  <Text style={styles.featureTo}>{f.to}</Text>
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
        
        <Pressable style={styles.keepBtn} onPress={() => router.push('/paywall')}>
          <Text style={styles.keepBtnText}>Garder PRO — 14,99 €/mois</Text>
        </Pressable>
        
        <Pressable style={styles.confirmBtn} onPress={handleConfirmFree}>
          <Text style={styles.confirmBtnText}>Continuer en gratuit</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  featureIcon: { fontSize: 24, marginRight: 12 },
  featureContent: { flex: 1 },
  featureLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },
  featureChange: { fontSize: 12, marginTop: 2 },
  featureFrom: { color: '#FF6B2C' },
  arrow: { color: '#666' },
  featureTo: { color: '#999', textDecorationLine: 'line-through' },
  keepBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  keepBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmBtn: { padding: 14, alignItems: 'center', marginTop: 12 },
  confirmBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
  // Last chance
  lastChanceEmoji: { fontSize: 64, textAlign: 'center', marginTop: 80, marginBottom: 16 },
  lastChanceTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  lastChanceBody: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  acceptBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  acceptBtnSubtext: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  declineBtn: { padding: 14, alignItems: 'center' },
  declineBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
});
```

---

## Phase 6 — Intégrer la modale dans l'app

### Modifier `app/(tabs)/_layout.tsx`

```typescript
import { TrialExpirationModal } from '@/components/TrialExpirationModal';
import { useTrial } from '@/hooks/useTrial';

// Dans le composant Layout :
const { showExpirationModal, refresh } = useTrial();

// Dans le return, ajouter :
<TrialExpirationModal 
  visible={showExpirationModal} 
  onClose={refresh}
/>
```

---

## Checklist d'implémentation

### Phase 1 — Backend
- [ ] Créer `006_quotas_tokens_trial.sql` avec tout le SQL
- [ ] Lancer `supabase db push` pour appliquer la migration
- [ ] Vérifier que les triggers fonctionnent (créer un user test)
- [ ] Vérifier que les RPCs sont callables

### Phase 2 — Edge Functions
- [ ] Modifier `coach-chat/index.ts` (auth + quota check)
- [ ] Modifier `analyze-food/index.ts` (quota check)
- [ ] Modifier `supabase/config.toml` pour `verify_jwt = true` sur coach-chat
- [ ] Tester les Edge Functions en local : `supabase functions serve`
- [ ] Déployer : `supabase functions deploy coach-chat analyze-food`

### Phase 3 — Hooks React Native
- [ ] Créer `src/hooks/useQuota.ts`
- [ ] Créer `src/hooks/useTokens.ts`
- [ ] Créer `src/hooks/useTrial.ts`
- [ ] Adapter `src/services/coachAI.ts` pour catch le 429 et afficher message
- [ ] Adapter `src/services/foodVision.ts` pour catch le 429

### Phase 4 — Notifications
- [ ] Créer `src/services/trialNotifications.ts`
- [ ] Appeler `scheduleTrialNotifications` après onboarding
- [ ] Tester les notifs en simulant des dates passées

### Phase 5 — UI
- [ ] Créer `src/components/TrialExpirationModal.tsx`
- [ ] Créer `app/downgrade-confirmation.tsx`
- [ ] Intégrer la modale dans `app/(tabs)/_layout.tsx`
- [ ] Tester le flow complet : signup → 7j → modal → downgrade

### Phase 6 — Tests
- [ ] Test 1 : nouvel user reçoit auto-trial 7j
- [ ] Test 2 : trial actif = is_premium = true
- [ ] Test 3 : modifier `trial_ends_at` à NOW() en DB → modal apparaît
- [ ] Test 4 : free user envoie 5 messages → 6e bloqué
- [ ] Test 5 : RPC `award_video_tokens` ajoute bonus
- [ ] Test 6 : 6e message avec bonus = OK, bonus consommé
- [ ] Test 7 : 4e vidéo dans la journée = bloquée

---

## Notes importantes

### Compatibilité avec RevenueCat existant
- Le système RevenueCat existant continue de fonctionner pour les vrais paiements
- `is_premium` est mis à jour par RevenueCat quand un user achète
- Le trial 7j n'interfère pas : il met juste `is_premium = TRUE` temporairement

### Edge cases gérés
- User existant (avant cette migration) → init `user_tokens` via le INSERT batch final
- User déjà PRO via Stripe/RevenueCat → trial automation ne le perturbe pas (check `stripe_subscription_id`)
- Trial expiré côté DB mais `is_premium` non updaté → la fonction `expire_trial` corrige

### Ce qu'on NE fait PAS dans cette spec
- ❌ Intégration AdMob (Phase suivante)
- ❌ Le flow CB du "trial étendu" (pour l'instant `extend_trial` étend sans CB — à brancher sur RevenueCat plus tard)
- ❌ Les A/B tests sur le timing des notifs
- ❌ Le tracking PostHog des événements trial (à ajouter dans `events`)

---

## Prochaine étape après cette implémentation

Une fois testé et validé, on attaque :
1. **AdMob + Funding Choices CMP**
2. **Modal "Regarde une pub pour débloquer"** déclenchée sur quota dépassé
3. **Server-Side Verification (SSV)** AdMob → callback vers `award_video_tokens`
4. **A/B test du timing du popup trial** (J7 matin vs J7 soir vs J6 vs J8)

---

**Fin de la spec — bonne implémentation 🔥**
