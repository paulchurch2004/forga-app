import { supabase, isDemoMode } from './supabase';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../types/user';

/**
 * Load the full user profile from Supabase and populate both stores.
 * Returns true if the user has completed onboarding (has objective set).
 */
export async function loadProfileFromSupabase(userId: string): Promise<boolean> {
  if (isDemoMode) return false;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    useAuthStore.getState().setOnboarded(false);
    return false;
  }

  const profile: UserProfile = {
    id: data.id,
    email: data.email,
    name: data.name ?? '',
    sex: data.sex,
    age: data.age,
    heightCm: data.height_cm,
    currentWeight: Number(data.current_weight),
    targetWeight: Number(data.target_weight),
    targetDeadline: data.target_deadline ?? '',
    objective: data.objective,
    activityLevel: data.activity_level,
    budget: data.budget,
    restrictions: data.restrictions ?? [],
    tdee: data.tdee,
    dailyCalories: data.daily_calories,
    dailyProtein: data.daily_protein,
    dailyCarbs: data.daily_carbs,
    dailyFat: data.daily_fat,
    mealsPerDay: data.meals_per_day,
    currentStreak: data.current_streak,
    bestStreak: data.best_streak,
    streakFreezeUsedThisWeek: data.streak_freeze_used_this_week,
    forgaScore: data.forga_score,
    isPremium: data.is_premium,
    premiumUntil: data.premium_until ?? undefined,
    referralCode: data.referral_code ?? '',
    referralCount: data.referral_count ?? 0,
    referredBy: data.referred_by ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  useUserStore.getState().setProfile(profile);
  useAuthStore.getState().setOnboarded(!!data.objective);

  return !!data.objective;
}
