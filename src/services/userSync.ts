// User Data Sync — Push/Pull all user data to/from Supabase
import { supabase, isDemoMode } from './supabase';
import { useUserStore } from '../store/userStore';
import { useMealStore } from '../store/mealStore';
import { useScoreStore } from '../store/scoreStore';
import { enqueue } from './syncQueue';
import type { DailyMeal } from '../types/meal';
import type { ForgaScore } from '../types/score';
import type { Badge, WeightEntry, WeeklyCheckIn } from '../types/user';
import type { Workout } from '../types/training';
import type { BodyMeasurement } from '../types/user';
import { useTrainingStore } from '../store/trainingStore';
import { useWaterStore } from '../store/waterStore';
import { useSettingsStore } from '../store/settingsStore';

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

/** Sync a favorite toggle to Supabase */
export function syncFavorite(mealId: string, userId: string, isFav: boolean) {
  if (isDemoMode) return;
  if (isFav) {
    enqueue({
      table: 'favorites',
      operation: 'upsert',
      data: { user_id: userId, meal_id: mealId },
    });
  }
  // Note: remove favorites via direct delete if needed
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

/** Sync profile updates to Supabase */
export async function syncProfile(updates: Record<string, any>, userId: string) {
  if (isDemoMode) return;
  try {
    // Convert camelCase to snake_case for Supabase
    const snakeUpdates: Record<string, any> = {};
    const keyMap: Record<string, string> = {
      currentWeight: 'current_weight',
      targetWeight: 'target_weight',
      currentStreak: 'current_streak',
      bestStreak: 'best_streak',
      streakFreezeUsedThisWeek: 'streak_freeze_used_this_week',
      forgaScore: 'forga_score',
      isPremium: 'is_premium',
      premiumUntil: 'premium_until',
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
    };
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = keyMap[key] ?? key;
      snakeUpdates[snakeKey] = value;
    }
    snakeUpdates.updated_at = new Date().toISOString();

    await supabase.from('users').update(snakeUpdates).eq('id', userId);
  } catch (err) {
    if (__DEV__) console.warn('[UserSync] Profile sync failed:', err);
  }
}

// ──────────── PULL (Supabase → Local) ────────────

/** Load all user data from Supabase after login */
export async function loadAllUserData(userId: string): Promise<void> {
  if (isDemoMode) return;

  try {
    // Fetch all data in parallel
    const [mealsRes, scoresRes, badgesRes, favoritesRes, weightRes, checkInsRes, workoutsRes, waterRes, measurementsRes, preferencesRes] = await Promise.all([
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
    ]);

    // Populate meal history
    if (mealsRes.data && mealsRes.data.length > 0) {
      const mealHistory: Record<string, DailyMeal[]> = {};
      const today = new Date().toISOString().split('T')[0];
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

      // Merge with existing local history (local takes priority for today)
      const localHistory = useMealStore.getState().mealHistory;
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
          exercises: typeof row.exercises === 'string' ? JSON.parse(row.exercises) : (row.exercises ?? []),
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
  } catch (err) {
    if (__DEV__) console.warn('[UserSync] Failed to load user data:', err);
  }
}
