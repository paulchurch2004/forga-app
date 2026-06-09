// User Data Sync — Push/Pull all user data to/from Supabase
import { supabase, isDemoMode } from './supabase';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useScoreStore } from '../store/scoreStore';
import { enqueue } from './syncQueue';
import type { DailyMeal } from '../types/meal';
import type { ForgaScore } from '../types/score';
import type { Badge, WeightEntry, WeeklyCheckIn } from '../types/user';
import type { Workout } from '../types/training';
import type { BodyMeasurement } from '../types/user';
import type { StrengthTestResult } from '../types/strength';
import { useTrainingStore, type OneRepMaxRecord } from '../store/trainingStore';
import { useWaterStore } from '../store/waterStore';
import { useSettingsStore } from '../store/settingsStore';
import { useProgramStore } from '../store/programStore';
import { useWeeklyPlanStore } from '../store/weeklyPlanStore';
import { useChatStore, type CoachMemory } from '../store/chatStore';
import { useShoppingListStore, type ShoppingList } from '../store/shoppingListStore';
import { useMetalHistoryStore, type MetalId } from '../store/metalHistoryStore';
import type { ProgressPhoto } from '../types/user';
import { todayLocalIso } from '../utils/date';

/** Parse JSON sûr : si l'input est null/undefined, retourne fallback. Si
 *  c'est déjà un objet (jsonb Supabase), le retourne tel quel. Si c'est
 *  une string malformée → fallback (au lieu de crash boot). */
function safeParseJSON<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    if (__DEV__) console.warn('[userSync] JSON.parse failed, using fallback', value);
    return fallback;
  }
}

// ──────────── PUSH (Local → Supabase) ────────────

/** Sync a validated meal to Supabase */
export function syncMeal(meal: DailyMeal) {
  if (isDemoMode) return;
  enqueue({
    table: 'daily_meals',
    operation: 'upsert',
    data: {
      id: meal.id,
      user_id: meal.userId,
      date: meal.date,
      slot: meal.slot,
      meal_id: meal.mealId,
      custom_name: meal.customName ?? null,
      calories: meal.actualMacros.calories,
      protein: meal.actualMacros.protein,
      carbs: meal.actualMacros.carbs,
      fat: meal.actualMacros.fat,
      validated_at: meal.validatedAt,
    },
  });
}

/** Sync a weight entry to Supabase. Used by the coach `log_weight` action;
 *  the standard weight-entry UI already syncs via the same `weight_log`
 *  upsert pattern below. */
export function syncWeight(entry: WeightEntry, _userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'weight_log',
    operation: 'upsert',
    data: {
      id: entry.id,
      user_id: entry.userId,
      date: entry.date,
      weight: entry.weight,
      created_at: entry.createdAt,
    },
  });
}

/** Sync a weekly check-in to Supabase.
 *
 *  Avant : `addCheckIn` ne pushait JAMAIS — l'user remplit son check-in
 *  hebdo (énergie, sommeil, perf, faim, poids, ajustement calorique),
 *  c'était perdu au logout/réinstall. Or les check-ins servent au
 *  coach IA (contexte sur l'état hebdo), au calcul du score, et à la
 *  visualisation tendance. Maintenant on push à l'upsert (clé naturelle
 *  : user_id + week_start, gère les overwrite sans doublon).
 */
export function syncWeeklyCheckIn(checkIn: WeeklyCheckIn) {
  if (isDemoMode) return;
  enqueue({
    table: 'weekly_check_ins',
    operation: 'upsert',
    data: {
      id: checkIn.id,
      user_id: checkIn.userId,
      week_start: checkIn.weekStart,
      weight: checkIn.weight,
      energy: checkIn.energy,
      hunger: checkIn.hunger,
      performance: checkIn.performance,
      sleep: checkIn.sleep,
      calorie_adjustment: checkIn.calorieAdjustment,
      adjustment_reason: checkIn.adjustmentReason ?? null,
      created_at: checkIn.createdAt,
    },
  });
}

/** Sync a score to Supabase */
export function syncScore(date: string, score: ForgaScore, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'score_history',
    operation: 'upsert',
    data: {
      user_id: userId,
      date,
      total: score.total,
      nutrition: score.nutrition,
      consistency: score.consistency,
      progression: score.progression,
      discipline: score.discipline,
    },
  });
}

/** Sync a badge unlock to Supabase */
export function syncBadge(badge: Badge, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'badges',
    operation: 'upsert',
    data: {
      id: badge.id,
      user_id: userId,
      type: badge.type,
      unlocked_at: badge.unlockedAt,
    },
  });
}

/** Sync a favorite toggle to Supabase (handles add AND remove) */
export function syncFavorite(mealId: string, userId: string, isFav: boolean) {
  if (isDemoMode) return;
  if (isFav) {
    enqueue({
      table: 'favorites',
      operation: 'upsert',
      data: { user_id: userId, meal_id: mealId },
    });
  } else {
    // Remove favorite directly
    supabase.from('favorites').delete().match({ user_id: userId, meal_id: mealId }).then(() => {}, () => {});
  }
}

/** Sync a workout to Supabase */
export function syncWorkout(workout: Workout, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'workouts',
    operation: 'upsert',
    data: {
      id: workout.id,
      user_id: userId,
      date: workout.date,
      type: workout.type,
      duration_minutes: workout.durationMinutes,
      intensity: workout.intensity ?? null,
      exercises: JSON.stringify(workout.exercises),
      note: workout.note ?? null,
      timestamp: workout.timestamp,
    },
  });
}

/** Sync a water entry to Supabase */
export function syncWater(entry: { id: string; amount: number; timestamp: string }, date: string, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'water_log',
    operation: 'upsert',
    data: {
      id: entry.id,
      user_id: userId,
      date,
      amount_ml: entry.amount,
      timestamp: entry.timestamp,
    },
  });
}

/** Sync a body measurement to Supabase */
export function syncMeasurement(m: BodyMeasurement) {
  if (isDemoMode) return;
  enqueue({
    table: 'measurements',
    operation: 'upsert',
    data: {
      id: m.id,
      user_id: m.userId,
      date: m.date,
      waist_cm: m.waistCm ?? null,
      hips_cm: m.hipsCm ?? null,
      chest_cm: m.chestCm ?? null,
      arms_cm: m.armsCm ?? null,
      thighs_cm: m.thighsCm ?? null,
      body_fat_percent: m.bodyFatPercent ?? null,
    },
  });
}

/** Sync a meal preference (like/dislike) to Supabase */
export function syncMealPreference(mealId: string, userId: string, preference: 'like' | 'dislike' | null) {
  if (isDemoMode) return;
  if (preference) {
    enqueue({
      table: 'meal_preferences',
      operation: 'upsert',
      data: { user_id: userId, meal_id: mealId, preference },
    });
  } else {
    // Remove preference
    supabase.from('meal_preferences').delete().match({ user_id: userId, meal_id: mealId }).then(() => {}, () => {});
  }
}

/** Sync a progress photo to Supabase */
export function syncProgressPhoto(photo: ProgressPhoto) {
  if (isDemoMode) return;
  enqueue({
    table: 'progress_photos',
    operation: 'upsert',
    data: {
      id: photo.id,
      user_id: photo.userId,
      date: photo.date,
      uri: photo.uri,
      weight: photo.weight ?? null,
      note: photo.note ?? null,
    },
  });
}

/** Sync weekly meal plan */
export async function syncWeeklyPlan(userId: string) {
  if (isDemoMode) return;
  const state = useWeeklyPlanStore.getState();
  if (!state.weekStart || state.days.length === 0) return;
  enqueue({
    table: 'weekly_plans',
    operation: 'upsert',
    data: {
      user_id: userId,
      week_start: state.weekStart,
      days: JSON.stringify(state.days),
    },
  });
}

/** Sync program progress (active plan + completed days) */
export async function syncProgramProgress(userId: string) {
  if (isDemoMode) return;
  const state = useProgramStore.getState();
  try {
    await supabase.from('program_progress').upsert({
      user_id: userId,
      active_program_id: state.activePlan?.programId ?? null,
      start_date: state.activePlan?.startDate ?? null,
      planned_days: JSON.stringify(state.activePlan ?? null),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    if (__DEV__) console.warn('[syncProgramProgress]', err);
  }
}

/** Sync profile updates to Supabase, falling back to the offline queue if
 *  the network is down or Supabase rejects the call. */
export async function syncProfile(updates: Record<string, any>, userId: string) {
  if (isDemoMode) return;
  // Convert camelCase to snake_case for Supabase
  const snakeUpdates: Record<string, any> = {};
  const keyMap: Record<string, string> = {
    currentWeight: 'current_weight',
    targetWeight: 'target_weight',
    targetDeadline: 'target_deadline',
    heightCm: 'height_cm',
    currentStreak: 'current_streak',
    bestStreak: 'best_streak',
    streakFreezeUsedThisWeek: 'streak_freeze_used_this_week',
    healthDisclaimerAcceptedAt: 'health_disclaimer_accepted_at',
    forgaScore: 'forga_score',
    isPremium: 'is_premium',
    premiumUntil: 'premium_until',
    stripeCustomerId: 'stripe_customer_id',
    stripeSubscriptionId: 'stripe_subscription_id',
    dailyCalories: 'daily_calories',
    dailyProtein: 'daily_protein',
    dailyCarbs: 'daily_carbs',
    dailyFat: 'daily_fat',
    mealsPerDay: 'meals_per_day',
    tdee: 'tdee',
    objective: 'objective',
    activityLevel: 'activity_level',
    budget: 'budget',
    restrictions: 'restrictions',
    trackingMode: 'tracking_mode',
    menopauseStatus: 'menopause_status',
    // Profil d'entraînement (programme assignment) ajouté en migration 009
    trainingLevel: 'training_level',
    trainingFrequency: 'training_frequency',
    equipmentAccess: 'equipment_access',
    glutePreference: 'glute_preference',
    // Photo de profil custom (ajoutée pour permettre upload via Image
    // Picker côté profile screen)
    avatarUri: 'avatar_uri',
    // Profil cyclisme — stocké à plat pour faciliter les requêtes
    // analytics et éviter un JSONB. Le mapping ci-dessous gère
    // l'aplatissement object → colonnes via une étape spéciale après
    // le keyMap loop (cf. ci-dessous).
    // Référencement
    referralCode: 'referral_code',
    referralCount: 'referral_count',
    referredBy: 'referred_by',
  };
  for (const [key, value] of Object.entries(updates)) {
    const snakeKey = keyMap[key] ?? key;
    snakeUpdates[snakeKey] = value;
  }

  // Aplatissement spécial : `cycling` est un objet imbriqué côté TS
  // mais stocké à plat en colonnes côté DB (cycling_*). Si l'appelant
  // pousse `{ cycling: { enabled, distanceKm, ... } }`, on disperse.
  if (snakeUpdates.cycling && typeof snakeUpdates.cycling === 'object') {
    const c = snakeUpdates.cycling;
    snakeUpdates.cycling_enabled = c.enabled ?? false;
    snakeUpdates.cycling_home_address = c.homeAddress ?? null;
    snakeUpdates.cycling_destination_address = c.destinationAddress ?? null;
    snakeUpdates.cycling_distance_km = c.distanceKm ?? null;
    snakeUpdates.cycling_days_per_week = c.daysPerWeek ?? 0;
    delete snakeUpdates.cycling;
  }

  snakeUpdates.id = userId;
  snakeUpdates.updated_at = new Date().toISOString();

  // Garde session : au démarrage de l'app, certains hooks (usePremium,
  // useScore…) appellent syncProfile AVANT que supabase.auth ait
  // restauré la session depuis AsyncStorage (restore async). Résultat :
  // auth.uid() = null → RLS rejette avec "new row violates row-level
  // security policy" → log bruyant. On vérifie d'abord qu'une session
  // existe ; sinon on queue directement (drainé après SIGNED_IN).
  const hasSession = !!useAuthStore.getState().session;
  if (!hasSession) {
    await enqueue({ table: 'users', operation: 'upsert', data: snakeUpdates });
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update(snakeUpdates)
      .eq('id', userId);
    if (error) throw error;
  } catch (err) {
    if (__DEV__) console.warn('[UserSync] Profile sync failed, queueing:', err);
    // Fall back to the offline queue — the next foreground / online event
    // will drain it.
    await enqueue({
      table: 'users',
      operation: 'upsert',
      data: snakeUpdates,
    });
  }
}

/**
 * Sync le résultat du test de calibration force.
 * Stocké en JSONB sur `users.strength_test` (un seul résultat
 * courant par user — le précédent est écrasé).
 */
export function syncStrengthTest(result: StrengthTestResult, userId: string) {
  if (isDemoMode) return;
  // Passe par syncProfile pour réutiliser le path users.update +
  // fallback queue. Le mapping keyMap ne touche pas `strength_test`
  // donc on l'envoie déjà en snake_case.
  void syncProfile({ strength_test: result } as any, userId);
}

/** Sync un record 1RM (PR sur un exo). Upsert keyé (user_id, exercise_id). */
export function syncOneRepMax(exerciseId: string, record: OneRepMaxRecord, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'one_rep_max',
    operation: 'upsert',
    data: {
      user_id: userId,
      exercise_id: exerciseId,
      value_kg: record.value,
      weight_kg: record.weight,
      reps: record.reps,
      achieved_at: record.achievedAt,
      updated_at: new Date().toISOString(),
    },
  });
}

/** Sync une mémoire coach IA (préférence, blessure, goal…). */
export function syncCoachMemory(mem: CoachMemory, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'coach_memories',
    operation: 'upsert',
    data: {
      id: mem.id,
      user_id: userId,
      date: mem.date,
      tag: mem.tag,
      summary: mem.summary,
      weight: mem.weight,
    },
  });
}

/** Sync une liste de courses (current ou archivée). */
export function syncShoppingList(list: ShoppingList, isArchived: boolean, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'shopping_lists',
    operation: 'upsert',
    data: {
      id: list.id,
      user_id: userId,
      title: list.title,
      items: list.items,
      is_archived: isArchived,
      created_at: list.createdAt,
      archived_at: isArchived ? new Date().toISOString() : null,
    },
  });
}

/**
 * Sync une entrée de frise gamification métal pour une date donnée.
 * Upsert par (user_id, date) — un seul métal par jour par user.
 * Sans ce sync, la frise du profil restait purement locale → l'user
 * perdait toute sa gamification à chaque réinstall/multi-device.
 */
export function syncMetalEntry(date: string, metal: MetalId, userId: string) {
  if (isDemoMode) return;
  enqueue({
    table: 'metal_history',
    operation: 'upsert',
    data: {
      user_id: userId,
      date,
      metal,
      updated_at: new Date().toISOString(),
    },
  });
}

/**
 * Bump `last_active_at` à NOW(). Appelé sur foreground d'app (max
 * une fois toutes les 6h pour pas spammer la DB). Critique pour le
 * cron de cleanup à 180 jours — sans ce bump, l'user serait
 * supprimé même actif.
 */
let lastActiveBumpAt = 0;
const ACTIVE_BUMP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h
export async function bumpLastActiveAt(userId: string) {
  if (isDemoMode) return;
  const now = Date.now();
  if (now - lastActiveBumpAt < ACTIVE_BUMP_INTERVAL_MS) return;
  lastActiveBumpAt = now;
  try {
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  } catch {
    // Best-effort. Si ça foire l'user sera bumped au prochain
    // foreground — pas grave si on rate quelques bumps.
  }
}

// ──────────── PULL (Supabase → Local) ────────────

/** Load all user data from Supabase after login */
export async function loadAllUserData(userId: string): Promise<void> {
  if (isDemoMode) return;

  try {
    // Fetch all data in parallel
    const [mealsRes, scoresRes, badgesRes, favoritesRes, weightRes, checkInsRes, workoutsRes, waterRes, measurementsRes, preferencesRes, photosRes, planRes, progressRes, oneRepMaxRes, memoriesRes, shoppingRes, strengthRes, metalRes] = await Promise.all([
      supabase.from('daily_meals').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('score_history').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('badges').select('*').eq('user_id', userId),
      supabase.from('favorites').select('*').eq('user_id', userId),
      supabase.from('weight_log').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('weekly_checkins').select('*').eq('user_id', userId).order('week_start', { ascending: true }),
      supabase.from('workouts').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('water_log').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('measurements').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('meal_preferences').select('*').eq('user_id', userId),
      supabase.from('progress_photos').select('*').eq('user_id', userId).order('date', { ascending: true }),
      supabase.from('weekly_plans').select('*').eq('user_id', userId).order('week_start', { ascending: false }).limit(1),
      supabase.from('program_progress').select('*').eq('user_id', userId).maybeSingle(),
      // Nouvelles tables (migration 014) — calibration force, mémoires
      // coach et listes de courses. Catch silencieusement les erreurs si
      // la migration n'est pas encore appliquée (l'app continue à marcher).
      supabase.from('one_rep_max').select('*').eq('user_id', userId),
      supabase.from('coach_memories').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('shopping_lists').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('users').select('strength_test').eq('id', userId).maybeSingle(),
      // Frise gamification 30 derniers jours (migration 018).
      supabase.from('metal_history').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(60),
    ]);

    // Populate meal history
    if (mealsRes.data && mealsRes.data.length > 0) {
      const mealHistory: Record<string, DailyMeal[]> = {};
      const today = todayLocalIso();
      const todayMeals: DailyMeal[] = [];

      for (const row of mealsRes.data) {
        const meal: DailyMeal = {
          id: row.id,
          userId: row.user_id,
          date: row.date,
          slot: row.slot,
          mealId: row.meal_id,
          customName: row.custom_name ?? undefined,
          adjustedQuantities: {},
          actualMacros: {
            calories: row.calories,
            protein: row.protein,
            carbs: row.carbs,
            fat: row.fat,
          },
          validatedAt: row.validated_at,
        };
        if (!mealHistory[row.date]) mealHistory[row.date] = [];
        mealHistory[row.date].push(meal);
        if (row.date === today) todayMeals.push(meal);
      }

      // Merge avec l'historique local en filtrant les meals qui
      // appartiennent à un AUTRE user (cross-user contamination).
      // Scénario : User A se déco mal → reset incomplet → User B se
      // logue → localHistory contient encore des meals de User A
      // qui auraient écrasé celles de User B sans ce filtre.
      const rawLocalHistory = useMealStore.getState().mealHistory;
      const localHistory: Record<string, DailyMeal[]> = {};
      for (const [date, meals] of Object.entries(rawLocalHistory)) {
        const sameUserMeals = meals.filter((m) => m.userId === userId);
        if (sameUserMeals.length > 0) localHistory[date] = sameUserMeals;
      }
      const merged = { ...mealHistory, ...localHistory };
      useMealStore.setState({ mealHistory: merged });
      if (todayMeals.length > 0 && useMealStore.getState().todayMeals.length === 0) {
        useMealStore.setState({ todayMeals });
      }
    }

    // Populate score history
    if (scoresRes.data && scoresRes.data.length > 0) {
      const scoreHistory: Record<string, ForgaScore> = {};
      for (const row of scoresRes.data) {
        scoreHistory[row.date] = {
          total: row.total,
          nutrition: row.nutrition,
          consistency: row.consistency,
          progression: row.progression,
          discipline: row.discipline,
        };
      }
      const localScores = useScoreStore.getState().scoreHistory;
      useScoreStore.setState({ scoreHistory: { ...scoreHistory, ...localScores } });
    }

    // Populate badges
    if (badgesRes.data && badgesRes.data.length > 0) {
      const badges = badgesRes.data.map((row) => ({
        id: row.id,
        type: row.type,
        unlockedAt: row.unlocked_at,
      }));
      // Merge: keep unique badge types
      const localBadges = useUserStore.getState().badges;
      const allTypes = new Set([...localBadges.map((b) => b.type), ...badges.map((b) => b.type)]);
      const merged = [...allTypes].map((type) =>
        localBadges.find((b) => b.type === type) ?? badges.find((b) => b.type === type)!
      );
      useUserStore.setState({ badges: merged });
    }

    // Populate favorites
    if (favoritesRes.data && favoritesRes.data.length > 0) {
      const cloudFavs = favoritesRes.data.map((row) => row.meal_id);
      const localFavs = useMealStore.getState().favorites;
      const merged = [...new Set([...localFavs, ...cloudFavs])];
      useMealStore.setState({ favorites: merged });
    }

    // Populate weight log
    if (weightRes.data && weightRes.data.length > 0) {
      const weights: WeightEntry[] = weightRes.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        weight: row.weight,
        createdAt: row.created_at,
      }));
      const localWeights = useUserStore.getState().weightLog;
      const allDates = new Set([...localWeights.map((w) => w.date), ...weights.map((w) => w.date)]);
      const merged = [...allDates].map((date) =>
        localWeights.find((w) => w.date === date) ?? weights.find((w) => w.date === date)!
      );
      useUserStore.setState({ weightLog: merged });
    }

    // Populate check-ins
    if (checkInsRes.data && checkInsRes.data.length > 0) {
      const checkIns: WeeklyCheckIn[] = checkInsRes.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        weekStart: row.week_start,
        weight: row.weight,
        energy: row.energy,
        hunger: row.hunger,
        performance: row.performance,
        sleep: row.sleep,
        calorieAdjustment: row.calorie_adjustment,
        adjustmentReason: row.adjustment_reason ?? '',
        createdAt: row.created_at,
      }));
      const localCheckIns = useUserStore.getState().checkIns;
      const allWeeks = new Set([...localCheckIns.map((c) => c.weekStart), ...checkIns.map((c) => c.weekStart)]);
      const merged = [...allWeeks].map((week) =>
        localCheckIns.find((c) => c.weekStart === week) ?? checkIns.find((c) => c.weekStart === week)!
      );
      useUserStore.setState({ checkIns: merged });
    }

    // Populate workouts
    if (workoutsRes.data && workoutsRes.data.length > 0) {
      const workouts: Record<string, Workout[]> = {};
      for (const row of workoutsRes.data) {
        const workout: Workout = {
          id: row.id,
          date: row.date,
          timestamp: row.timestamp,
          type: row.type,
          durationMinutes: row.duration_minutes,
          intensity: row.intensity ?? 'moderate',
          exercises: safeParseJSON(row.exercises, []),
          note: row.note ?? undefined,
        };
        if (!workouts[row.date]) workouts[row.date] = [];
        workouts[row.date].push(workout);
      }
      const localWorkouts = useTrainingStore.getState().workouts;
      useTrainingStore.setState({ workouts: { ...workouts, ...localWorkouts } });
    }

    // Populate water log
    if (waterRes.data && waterRes.data.length > 0) {
      const waterHistory: Record<string, { id: string; amount: number; timestamp: string }[]> = {};
      for (const row of waterRes.data) {
        if (!waterHistory[row.date]) waterHistory[row.date] = [];
        waterHistory[row.date].push({
          id: row.id,
          amount: row.amount_ml,
          timestamp: row.timestamp,
        });
      }
      const localWater = useWaterStore.getState().history;
      useWaterStore.setState({ history: { ...waterHistory, ...localWater } });
    }

    // Populate body measurements
    if (measurementsRes.data && measurementsRes.data.length > 0) {
      const measurements: BodyMeasurement[] = measurementsRes.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        waistCm: row.waist_cm ?? undefined,
        hipsCm: row.hips_cm ?? undefined,
        chestCm: row.chest_cm ?? undefined,
        armsCm: row.arms_cm ?? undefined,
        thighsCm: row.thighs_cm ?? undefined,
        bodyFatPercent: row.body_fat_percent ?? undefined,
        createdAt: row.created_at,
      }));
      const localMeasurements = useUserStore.getState().measurements;
      const allIds = new Set([...localMeasurements.map((m) => m.id), ...measurements.map((m) => m.id)]);
      const merged = [...allIds].map((id) =>
        localMeasurements.find((m) => m.id === id) ?? measurements.find((m) => m.id === id)!
      );
      useUserStore.setState({ measurements: merged });
    }

    // Populate meal preferences (likes/dislikes)
    if (preferencesRes.data && preferencesRes.data.length > 0) {
      const liked: string[] = [];
      const disliked: string[] = [];
      for (const row of preferencesRes.data) {
        if (row.preference === 'like') liked.push(row.meal_id);
        else if (row.preference === 'dislike') disliked.push(row.meal_id);
      }
      const localLiked = useMealStore.getState().likedMeals;
      const localDisliked = useMealStore.getState().dislikedMeals;
      useMealStore.setState({
        likedMeals: [...new Set([...localLiked, ...liked])],
        dislikedMeals: [...new Set([...localDisliked, ...disliked])],
      });
    }

    // Populate progress photos
    if (photosRes.data && photosRes.data.length > 0) {
      const photos: ProgressPhoto[] = photosRes.data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        uri: row.uri,
        weight: row.weight ?? undefined,
        note: row.note ?? undefined,
        createdAt: row.created_at,
      }));
      const localPhotos = useUserStore.getState().progressPhotos;
      const allIds = new Set([...localPhotos.map((p) => p.id), ...photos.map((p) => p.id)]);
      const merged = [...allIds].map((id) =>
        localPhotos.find((p) => p.id === id) ?? photos.find((p) => p.id === id)!
      );
      useUserStore.setState({ progressPhotos: merged });
    }

    // Populate weekly meal plan
    if (planRes.data && planRes.data.length > 0) {
      const row = planRes.data[0];
      const days = safeParseJSON(row.days, []);
      useWeeklyPlanStore.setState({
        weekStart: row.week_start,
        days,
      });
    }

    // Populate program progress
    if (progressRes.data) {
      const row = progressRes.data;
      if (row.active_program_id && row.planned_days) {
        try {
          const activePlan = safeParseJSON(row.planned_days, null as any);
          if (activePlan && activePlan.programId) {
            useProgramStore.setState({ activePlan });
          }
        } catch {}
      }
    }

    // Populate one_rep_max records — keyés par exercise_id côté store.
    if (oneRepMaxRes.data && oneRepMaxRes.data.length > 0) {
      const oneRepMaxByExercise: Record<string, OneRepMaxRecord> = {};
      for (const row of oneRepMaxRes.data) {
        oneRepMaxByExercise[row.exercise_id] = {
          value: Number(row.value_kg),
          weight: Number(row.weight_kg),
          reps: row.reps,
          achievedAt: row.achieved_at,
        };
      }
      // Merge avec le local (le record le plus haut gagne — l'user a
      // pu PR offline sur un autre device).
      const local = useTrainingStore.getState().oneRepMaxByExercise;
      const merged: Record<string, OneRepMaxRecord> = { ...oneRepMaxByExercise };
      for (const [k, v] of Object.entries(local)) {
        if (!merged[k] || merged[k].value < v.value) merged[k] = v;
      }
      useTrainingStore.setState({ oneRepMaxByExercise: merged });
    }

    // Populate strength_test (calibration force). Une seule colonne
    // JSONB sur users — pas de merge complexe, le serveur fait foi.
    if (strengthRes.data?.strength_test) {
      const st = strengthRes.data.strength_test as StrengthTestResult;
      useUserStore.getState().setStrengthTest(st);
    }

    // Populate coach memories. Cap à 50 côté client (cf MAX_MEMORIES
    // dans chatStore). On garde les plus récentes en cas de surplus.
    if (memoriesRes.data && memoriesRes.data.length > 0) {
      const memories: CoachMemory[] = memoriesRes.data.slice(0, 50).map((row: any) => ({
        id: row.id,
        date: row.date,
        tag: row.tag,
        summary: row.summary,
        weight: row.weight,
      }));
      useChatStore.setState({ memories });
    }

    // Populate shopping lists — current (is_archived=false, max 1) +
    // archived (is_archived=true, max 10).
    if (shoppingRes.data && shoppingRes.data.length > 0) {
      const lists: ShoppingList[] = shoppingRes.data.map((row: any) => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        items: Array.isArray(row.items) ? row.items : [],
      }));
      const currentRow = shoppingRes.data.find((r: any) => !r.is_archived);
      const current = currentRow
        ? lists.find((l) => l.id === currentRow.id) ?? null
        : null;
      const archived = lists.filter((l) => l.id !== current?.id).slice(0, 10);
      useShoppingListStore.setState({ current, archived });
    }

    // Frise gamification métaux — restore les check-ins quotidiens
    // depuis Supabase pour que l'user retrouve sa frise après un
    // réinstall / changement de device. On merge avec le local : la
    // valeur la plus récente gagne par date (updated_at fait foi).
    if (metalRes.data && metalRes.data.length > 0) {
      const remoteHistory: Record<string, MetalId> = {};
      for (const row of metalRes.data as any[]) {
        // Garde-fou : si une ancienne entrée a une clé EN (lead/gold)
        // qui aurait fui en DB avant le fix du mapping, on convertit.
        const m = row.metal;
        const FR_KEYS: Record<string, MetalId> = {
          lead: 'plomb', iron: 'fer', steel: 'acier', gold: 'or', bronze: 'bronze',
          plomb: 'plomb', fer: 'fer', acier: 'acier', or: 'or',
        };
        const mapped = FR_KEYS[m];
        if (mapped) remoteHistory[row.date] = mapped;
      }
      const localHistory = useMetalHistoryStore.getState().history;
      useMetalHistoryStore.setState({
        history: { ...remoteHistory, ...localHistory },
      });
    }
  } catch (err) {
    if (__DEV__) console.warn('[UserSync] Failed to load user data:', err);
  }
}
