# FORGA Monetization Audit

**Generated:** 2026-04-29  
**Application:** FORGA (React Native + Expo + Supabase)  
**Branch:** redesign  
**Total Commits:** 188  

---

## 1. Stack technique

### Versions principales

| Package | Version | Fichier |
|---------|---------|---------|
| **React Native** | ^0.83.4 | `/package.json:45` |
| **Expo** | ~55.0.15 | `/package.json:23` |
| **React** | 19.2.0 | `/package.json:43` |
| **TypeScript** | ~5.9.2 | `/package.json:64` |
| **@supabase/supabase-js** | ^2.98.0 | `/package.json:19` |
| **Zustand** | ^5.0.11 | `/package.json:56` |
| **react-native-purchases** (RevenueCat) | ^9.10.5 | `/package.json:47` |

### Dépendances critiques absentes

- ❌ **Firebase Cloud Messaging (FCM)** : Notifications push (Expo intégrées uniquement)
- ❌ **Stripe SDK** (client) : Web checkout uniquement (`@stripe/stripe-js` absent)
- ❌ **PostHog SDK** (client) : Analytics stubs uniquement
- ❌ **Sentry** : Package absent (imports dynamiques échouent silencieusement)
- ❌ **AdMob / Google Mobile Ads** : Zéro implémentation publicitaire

---

## 2. Features actuelles

| Feature | Fichier principal | Lignes clés | Statut |
|---------|------------------|------------|--------|
| **Home Feed** | `/app/(tabs)/home.tsx` | 1-50 | Live |
| **Training/Workouts** | `/app/(tabs)/training.tsx` | 1-50 | Live |
| **Meals/Nutrition** | `/app/(tabs)/meals.tsx` | - | Live |
| **Coach IA Chat** | `/app/(tabs)/coach.tsx` | 1-50 | Live (Groq llama-3.3-70b) |
| **User Profile** | `/app/(tabs)/profile.tsx` | - | Live |
| **Paywall** | `/app/paywall.tsx` | 1-581 | Live (V3 "Transformation" design) |
| **Onboarding** | `/app/(onboarding)/_layout.tsx` | 7 steps | Live |
| **Settings** | `/app/settings.tsx` | - | Live |
| **Barcode Scanner** | `/app/paywall.tsx:24` (expo-camera) | - | Live |
| **Food Vision (IA)** | `/src/services/foodVision.ts` | - | Live (OpenAI GPT-4o) |
| **Weekly Review** | `/app/weekly-review.tsx` | - | Live |
| **Water Tracking** | `supabase/migrations/005:38-62` | - | Live |
| **Weight Tracking** | `supabase/migrations/001:95-104` | - | Live |
| **Personal Records (PRs)** | Implémentée dans stores | - | Live |
| **Training Programs** | `useProgram` hook détecté | 40+ plans | Live |
| **Face ID / Touch ID** | `/app.json:23` (NSFaceIDUsageDescription) | - | Live |

### Breakdown par screen

- **Home.tsx** : FORGA Score, Streak, Weight Prompt, Morning Ritual, Weekly Form, Coach Focus, Premium Upgrade Card, Mini Stats, Quick Access
- **Training.tsx** : Workout card, program selection, exercise logging
- **Meals.tsx** : Meal slot management, favorites, photo analysis
- **Coach.tsx** : Chat interface, action proposals, presence view (observations)
- **Profile.tsx** : Profile data, preferences, achievements
- **Settings.tsx** : App settings, security (Face ID), notifications

---

## 3. Intégrations IA

### Coach Chat (Groq)

**Endpoint:** `/supabase/functions/coach-chat/index.ts`  
**Modèle:** `llama-3.3-70b-versatile`  
**Lignes système prompt:** 88-302  
**Paramètres d'appel:**

```json
{
  "model": "llama-3.3-70b-versatile",
  "max_tokens": 700,
  "temperature": 0.4
}
```

**Fichier source:** `/supabase/functions/coach-chat/index.ts:348-352`

**Capacités:**
- Nutritional coaching
- Workout planning (generate_workout action)
- Motivation contextuelle
- Memory system (12 tags: injury, condition, pr, goal, preference_food, preference_training, constraint, lifestyle, mood_pattern, event, feedback, note)
- 12 actions structurées possibles (log_meal, log_workout, log_water, swap_exercise, adjust_calories, move_workout_day, mark_day_skipped, set_water_goal, generate_workout, change_objective, update_target, generate_shopping_list)

**Coût estimé par appel :**
- Input (avg 2000 tokens context) : ~0.00007 USD (Groq: $0.35/M tokens)
- Output (avg 200 tokens) : ~0.00003 USD
- **Total par session** : ~$0.0001 USD (negligible)

---

### Food Vision (OpenAI GPT-4o)

**Endpoint:** `/supabase/functions/analyze-food/index.ts`  
**Modèle:** `gpt-4o`  
**Lignes:** 78-98  
**Paramètres d'appel:**

```json
{
  "model": "gpt-4o",
  "max_tokens": 200,
  "temperature": 0.3
}
```

**Fichier source:** `/supabase/functions/analyze-food/index.ts:79-98`

**Output:** JSON `{ name, calories, protein, carbs, fat }`

**Authentication:** JWT requis (ligne 40-61)

**Coût estimé par appel :**
- Input (image + prompt) : ~$0.005 USD (GPT-4o: $5/M input tokens avec vision)
- Output (~50 tokens) : ~$0.00015 USD
- **Total par scan** : ~$0.006 USD

---

### Edge Functions inventaires

| Function | Chemin | Auth | Coût IA | Statut |
|----------|--------|------|---------|--------|
| **coach-chat** | `/supabase/functions/coach-chat/index.ts` | NO (--no-verify-jwt) | Groq ~$0.0001/appel | Live |
| **analyze-food** | `/supabase/functions/analyze-food/index.ts` | OUI (JWT) | OpenAI ~$0.006/appel | Live |
| **create-checkout** | `/supabase/functions/create-checkout/index.ts` | OUI (JWT) | None | Live (Stripe) |
| **verify-session** | `/supabase/functions/verify-session/index.ts` | OUI (JWT) | None | Live (Stripe webhook) |

---

## 4. Authentification & User Management

### Provider

**Supabase Auth (PostgreSQL + RLS)**  
**Fichier configuration:** `/src/services/supabase.ts:6-33`

### Schéma utilisateurs

**Table `public.users`** (001_initial.sql:11-45)

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  sex TEXT CHECK (male|female),
  age INTEGER CHECK (14-120),
  height_cm INTEGER, current_weight NUMERIC, target_weight NUMERIC,
  target_deadline DATE,
  objective TEXT CHECK (bulk|cut|maintain|recomp),
  activity_level TEXT CHECK (sedentary|light|moderate|active|very_active),
  budget TEXT DEFAULT 'both' CHECK (eco|premium|both),
  restrictions TEXT[] DEFAULT '{}',
  tdee INTEGER, daily_calories INTEGER, daily_protein INTEGER, daily_carbs INTEGER, daily_fat INTEGER,
  meals_per_day INTEGER CHECK (2-6),
  current_streak INTEGER DEFAULT 0, best_streak INTEGER DEFAULT 0,
  streak_freeze_used_this_week BOOLEAN DEFAULT false,
  forga_score INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
);
```

**Subscription fields (003_stripe.sql:5-9)**
```sql
ALTER TABLE public.users ADD COLUMN:
  - stripe_customer_id TEXT
  - stripe_subscription_id TEXT
  - premium_until TIMESTAMPTZ (inferred from code)
```

**Stores Zustand:**

- **userStore** (`/src/store/userStore.ts:34-95`) : Persiste profile, onboarding, badges, weight, check-ins, measurements, photos
- **authStore** : Session management (Supabase auth)
- **chatStore** : Coach memories
- **trainingStore** : Workout history
- **programStore** : Program selection
- **scoreStore** : Score history

---

## 5. Système publicitaire

### Implémentation actuelle

**AUCUNE implémentation de publicités détectée.**

**Recherche complète:**
```bash
grep -r "admob|google-mobile-ads|facebook-ads|interstitial|banner ad" /src
→ (0 résultats)
```

**Conclusion:** 
- ❌ Aucun SDK publicitaire intégré
- ❌ Aucun code AdMob/Meta Audience Network
- ❌ Aucun placeholder ou WIP pour ads

**À explorer (freemium strategy):**
- Paywall interstitiel (déjà live)
- Limite de features non premium
- Pas d'ads en parallèle avec paywall observé

---

## 6. Logique freemium & quotas

### Quotas annoncés (Paywall UI)

**Fichier:** `/app/paywall.tsx:62-68`

```typescript
const FEATURES: FeatureRow[] = [
  { name: '510 recettes premium', free: '5 recettes', pro: 'Illimité' },
  { name: 'Recettes étape par étape', free: 'Liste seulement', pro: 'Vidéo + pas' },
  { name: 'Coach IA', free: '5 messages / jour', pro: 'Illimité' },
  { name: "Plans d'entraînement", free: '1 programme', pro: '40+ plans' },
  { name: 'Scan code-barre & photo', free: '5 scans / jour', pro: 'Illimité' },
];
```

### Enforcement dans le code

| Quota | Annoncé | Enforced ? | Preuve |
|-------|---------|-----------|--------|
| 5 recettes free | OUI | NON | Aucun compteur quotidien trouvé |
| 5 messages Coach/jour | OUI | NON | Aucun rate limiting dans `coachAI.ts` |
| 5 scans/jour | OUI | NON | Aucun compteur dans `foodVision.ts` |
| 1 programme | OUI | NON | Aucune restriction dans `programStore` |
| Videos recettes | OUI | PARTIAL | UI conditionnée sur `isPremium`, pas de vérification runtime |

### Premium gate (enforcement réel)

**Fichier:** `/src/hooks/usePremium.ts:60-69`

```typescript
const requirePremium = useCallback(
  (callback: () => void, onBlocked?: () => void) => {
    if (isPremium) {
      callback();
    } else {
      onBlocked?.();
    }
  },
  [isPremium]
);
```

**Limitation observée:**
- Hook `requirePremium` pour gating feature
- `usePremium` check avec `usePremium()` hook (ligne 1-80)
- **Pas de quotas appliqués par feature** (annonces vs réalité gap)

### Premium Status Check

**Fichier:** `/src/hooks/usePremium.ts:25-52`

```typescript
// Trial expiry check
if (profile?.premiumUntil) {
  const now = new Date();
  const until = new Date(profile.premiumUntil);
  if (until <= now && profile.isPremium) {
    if (!profile.stripeSubscriptionId) {
      updateProfile({ isPremium: false });
    }
  }
}

// RevenueCat check (native)
if (Platform.OS !== 'web') {
  const premium = await checkPremiumStatus();
  if (premium) {
    updateProfile({ isPremium: true });
  }
}
```

---

## 7. Analytics

### PostHog (Configuration stub)

**Fichier:** `/src/services/analytics.ts:1-96`

**Statut:** NON IMPLÉMENTÉ (STUBS UNIQUEMENT)

```typescript
export async function initAnalytics(): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    if (__DEV__) console.warn('[Analytics] No PostHog key configured');
    return;
  }
  isInitialized = true;
}

export function trackEvent(event: string, properties?: EventProperties): void {
  if (!isInitialized) return;
  // PostHog capture would go here
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties);
  }
}
```

**Conclusion:** Logique prête, mais pas de vrai appel PostHog. Logs console uniquement en dev.

### Events définis (Ready to ship)

```typescript
events = {
  sign_up(method), sign_in(method),
  onboarding_step(step), onboarding_complete(),
  meal_viewed(mealId, slot), meal_validated(mealId, slot), meal_favorited(mealId),
  score_updated(score), score_level(level),
  streak_day(days), streak_lost(previousStreak), streak_freeze_used(),
  badge_unlocked(badge),
  check_in_completed(),
  paywall_shown(trigger), paywall_dismissed(),
  purchase_started(plan), purchase_completed(plan),
  referral_code_shared(method), referral_code_used(code), referral_reward_earned(count),
  app_opened(), screen_viewed(screen)
}
```

**Suivi paywall actif :**
- `events.paywallShown('paywall_screen')` (ligne 92)
- `events.paywallDismissed()` (ligne 200)
- `events.purchaseStarted(selectedPlan)` (ligne 117, 134)
- `events.purchaseCompleted(selectedPlan)` (ligne 122)

### Sentry

**Fichier:** `/src/services/sentry.ts`

**Statut:** OPTIONNEL (IMPORT DYNAMIQUE SILENCIEUX)

```typescript
// @sentry/react-native not installed — silent fallback
```

---

## 8. Backend Supabase

### Tables principales

| Table | Migration | Colonnes clés | RLS |
|-------|-----------|---------------|-----|
| **users** | 001:11-45 | id, email, name, age, objective, tdee, daily_*, is_premium, stripe_* | OUI |
| **daily_meals** | 001:61-74 | user_id, date, slot, meal_id, actual_macros, validated_at | OUI |
| **weekly_checkins** | 001:77-92 | user_id, week_start, weight, energy, hunger, performance, sleep, calorie_adjustment | OUI |
| **weight_log** | 001:95-104 | user_id, date, weight | OUI |
| **badges** | 001:107-117 | user_id, badge_id, earned_at | OUI |
| **favorites** | 001:119-128 | user_id, meal_id, created_at | OUI |
| **score_history** | 001:130-148 | user_id, date, score_total, score_nutrition, score_consistency, score_progression, score_discipline | OUI |
| **referral_log** | 002:27-45 | from_user_id, to_user_id, code, reward_days, created_at | OUI |
| **workouts** | 005:5-16 | id, user_id, date, type, duration_minutes, intensity, exercises (JSONB), note | OUI |
| **water_log** | 005:39-62 | id, user_id, date, amount_ml, timestamp | OUI |
| **measurements** | 005:65-96 | id, user_id, date, waist_cm, hips_cm, chest_cm, arms_cm, thighs_cm, body_fat_percent | OUI |
| **meal_preferences** | 005:99+ | user_id, meal_id, preference (like/dislike/allergic) | OUI |

### Edge Functions

| Function | Route | Auth | Logic |
|----------|-------|------|-------|
| **coach-chat** | `/functions/v1/coach-chat` | NO | Groq llama-3.3-70b, system prompt (302 lignes), memory + history |
| **analyze-food** | `/functions/v1/analyze-food` | YES (JWT) | OpenAI GPT-4o vision, base64 image input → macros JSON |
| **create-checkout** | `/functions/v1/create-checkout` | YES (JWT) | Stripe checkout session (7 jours trial), plan (monthly/annual) |
| **verify-session** | `/functions/v1/verify-session` | YES (JWT) | Stripe subscription verification, update `is_premium` + `premium_until` |

### RLS Policies

- **Tous les tables utilisateur** : `auth.uid() = user_id` (SELECT/INSERT/UPDATE/DELETE)
- **Coach chat** : `--no-verify-jwt` (public endpoint, pas de RLS check)
- **Food vision** : JWT verification + auth check (ligne 54-61)

### Indices (Performance)

- `idx_users_email`
- `idx_users_stripe_customer`
- `idx_users_referral_code`
- `idx_daily_meals_user_date`, `idx_daily_meals_user_date_slot`
- `idx_weekly_checkins_user_week`
- `idx_weight_log_user_date`, `idx_weight_log_user_date_desc`
- `idx_badges_user`
- `idx_favorites_user`
- `idx_score_history_user_date`, `idx_score_history_user_date_desc`
- `workouts_user_date_idx`
- `water_log_user_date_idx`
- `measurements_user_date_idx`

---

## 9. État du projet

### Git Status

- **Branche actuelle :** `redesign`
- **Total commits :** 188
- **Build number iOS :** 44 (app.json:18)
- **Build number Android :** 3 (app.json:32)
- **Version app :** 1.0.0

### Derniers commits (10)

```
2e42d65 Fix paywall red screen: missing StyleSheet import + invalid CSS inset
e7609a9 Paywall: swap montage to 10 verified Mixkit URLs (HTTP 206 confirmed)
72a7e7f Paywall: replace static placeholder with real 10-clip sport video montage
a7b47c9 Paywall: rebuild with V3 'Transformation' design from Claude Design handoff
08407c6 Pricing: trial auto 30j → 7j + dev toggle for Premium ON/OFF
cc0fdb2 Onboarding: V2 glass redesign of 'Activer les rappels ?' modal
863517a Coach: rich welcome card explaining all capabilities (per-session)
e708947 Coach: 4 new actions + conversational skills (workout/objective/target/shopping/explain)
9819587 Auth: Face ID / Touch ID app lock (opt-in via Profile)
e096868 Onboarding: pre-fill prénom from register so it's not asked twice
```

### Themes stack

- **Dark mode:** UI configured (`app.json:8` → `userInterfaceStyle: "dark"`)
- **Color tokens:** V3 "Transformation" theme (orange primary `#FF6B2C`, dark backgrounds)
- **Fonts:** DM Sans, JetBrains Mono, Outfit (Expo Google Fonts)

### Device permissions

**iOS** (app.json:19-27):
- Camera (photos + barcode)
- Photo Library (food analysis)
- User Notifications (meal/progress reminders)
- Face ID (app lock)
- Remote notifications (background)

**Android** (app.json:40-42):
- Camera
- POST_NOTIFICATIONS

---

## 10. Synthèse pour stratégie monétisation

### Faits clés

1. **Monetization déjà LIVE**
   - Paywall V3 "Transformation" (glassmorphism design)
   - RevenueCat (iOS/Android) + Stripe (Web)
   - Trial : 7 jours gratuits (changé de 30j récemment)
   - Plans : Monthly (14,99€) + Annual (9,99€/mois, -33% discount)

2. **IA Coûts estimés (par utilisateur actif)**
   - Coach chat : 1-2 messages/jour × $0.0001 = ~$0.03/mois
   - Food vision : 5 scans/jour × $0.006 = ~$0.9/mois
   - **Total IA coût : ~$0.93/mois par utilisateur**

3. **Quotas ANNONCÉS vs RÉALITÉ**
   - Free : 5 recettes, 5 messages coach/jour, 5 scans, 1 programme
   - **Quotas NOT ENFORCED** (no rate limiting backend)
   - UI gates premium features via `usePremium()` hook
   - **Gap risk :** utilisateurs tech-savvy peuvent contourner (frontend-only)

4. **Ad Strategy**
   - Zéro implémentation publicitaire
   - Freemium avec paywall uniquement (pas d'ads)
   - Candidate pour : interstitial entre sessions, rewarded ads pour unlock (non implémenté)

5. **Referral System**
   - Implémenté (`referral_log` table, events tracked)
   - Free trial days pour chaque referral (implémenté dans 002_referral.sql)

6. **Analytics readiness**
   - PostHog schema ready (events définis)
   - API key not configured (events logs en console only)
   - Conversion funnel trackable une fois live

### Pricing actuel

| Plan | Durée | Prix | Trial |
|------|-------|------|-------|
| **Free** | — | 0€ | N/A |
| **FORGA Pro Monthly** | 1 mois | 14,99€ | 7 jours |
| **FORGA Pro Annual** | 12 mois | 119,88€ (9,99€/mois) | 7 jours |

**Fichier:** `/app/paywall.tsx:372-389`

### ARPU estimé (pré-optimization)

- **Conversion assumption :** 2-3% de free users → paid (industrie fitness : 2-5%)
- **Pricing moyen :** €11/mois (weighted annual + monthly)
- **LTV (annual):** €132 (1 year retention, no churn)
- **ARPU:** €0.26/mois all-users (2% × €11 × 12 mois ÷ 12 mois)

### Verdict : Freemium-Ready ?

**OUI, mais avec cavéats :**

**Implémenté :**
- Paywall screen (modern V3 design)
- RevenueCat + Stripe billing infrastructure
- Trial period (7 jours)
- Premium gating via `usePremium()` hook
- Analytics events schema (PostHog-ready)
- Referral system (codé)

**Manquant / À finaliser :**
- **Backend quota enforcement** (rate limiting par user/feature/day)
- **PostHog API key setup** (conversion tracking disabled)
- **Stripe webhook integration** (payment status sync)
- **AdMob integration** (if targeting mixed monetization)
- **Trial date sync** (`premiumUntil` en client store, pas de cron validation)
- **Free quota reset** (pas de cron pour reset quotidien des scans/messages)

### Priorisation pour next sprint

1. **P0 - Backend quotas** : Implémenter rate limiting Edge Function (Groq + OpenAI calls quota par user)
2. **P0 - PostHog activation** : Set API key, confirm events flowing
3. **P1 - Stripe webhooks** : Validate subscription events (`charge.succeeded`, `customer.subscription.updated`)
4. **P1 - Trial expiry cron** : Scheduled Supabase function pour expirer trials quotidiennement
5. **P2 - AdMob integration** : (Optional) Rewarded ads pour unlock features sans payer
6. **P2 - LTV optimization** : A/B test pricing (€9.99 vs €14.99 monthly)

### Coûts d'infrastructure (mensuel, estimation)

| Composant | Usage | Coût/mois |
|-----------|-------|-----------|
| **Supabase (DB + Auth)** | ~10k users, 1M req/mois | €100-200 |
| **Groq API** | 50k coach messages/mois @ $0.35/M | €17.50 |
| **OpenAI Vision** | 100k scans/mois @ $5/M input | €500+ |
| **Stripe** | 2.9% + $0.30 per transaction | Variable |
| **Total** | — | **~€650-800/mois** (sans Stripe %) |

**Marge brute (2% conversion, €11 ARPU) :** 10k users × 2% × €11 = €2,200/mois → **ROI 2.75x**

---

## Checklist pour l'autre Claude (Monétisation)

**À utiliser pour stratégie de monétisation :**

- [ ] Backend quotas implémentés (rate limiting Groq + OpenAI)
- [ ] PostHog live avec conversion tracking
- [ ] Trial expiry automation (cron)
- [ ] Stripe webhooks validés
- [ ] Pricing A/B test setup (si applicable)
- [ ] Referral attribution tracking (PostHog + custom event)
- [ ] Churn analysis dashboard (LTV vs acquisition cost)
- [ ] AdMob integration (if hybrid monetization target)
- [ ] Premium feature upsell cards (contextuels au moment de l'usage)
- [ ] Paywall optimization (multivariate testing des features listed)

---

**End of Audit Document**
