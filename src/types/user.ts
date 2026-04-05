export type Sex = 'male' | 'female';
export type Objective = 'bulk' | 'cut' | 'maintain' | 'recomp';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Budget = 'eco' | 'premium' | 'both';
export type Restriction = 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free' | 'halal' | 'pork_free';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  currentWeight: number;
  targetWeight: number;
  targetDeadline: string; // ISO date
  objective: Objective;
  activityLevel: ActivityLevel;
  budget: Budget;
  restrictions: Restriction[];

  // Computed by engine
  tdee: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  mealsPerDay: number;

  // Gamification
  currentStreak: number;
  bestStreak: number;
  streakFreezeUsedThisWeek: boolean;
  forgaScore: number;

  // Subscription
  isPremium: boolean;
  premiumUntil?: string; // ISO date — for gifted premium weeks (referral rewards)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Referral
  referralCode: string; // unique code to share (e.g. "FORGA-A3K9")
  referralCount: number; // how many people signed up with this code
  referredBy?: string; // referral code used at signup

  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  sex?: Sex;
  age?: number;
  heightCm?: number;
  currentWeight?: number;
  targetWeight?: number;
  targetDeadline?: string;
  objective?: Objective;
  activityLevel?: ActivityLevel;
  budget?: Budget;
  restrictions?: Restriction[];
  referredByCode?: string; // referral code entered at signup
}

export interface WeeklyCheckIn {
  id: string;
  userId: string;
  weekStart: string;
  weight: number;
  energy: 1 | 2 | 3 | 4 | 5;
  hunger: 1 | 2 | 3 | 4 | 5;
  performance: 1 | 2 | 3 | 4;
  sleep: 1 | 2 | 3 | 4;
  calorieAdjustment: number;
  adjustmentReason: string;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weight: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  type: BadgeType;
  unlockedAt: string;
}

export type BadgeType =
  | 'first_meal'
  | 'first_week'
  | 'first_kilo'
  | 'forgeron'
  | 'month_of_forge';

export const BADGE_INFO: Record<BadgeType, { name: string; description: string }> = {
  first_meal: { name: 'Premier Repas', description: 'Valider son premier repas' },
  first_week: { name: 'Première Semaine', description: '7 jours de streak' },
  first_kilo: { name: 'Premier Kilo', description: '1 kg de progression vers l\'objectif' },
  forgeron: { name: 'Forgeron', description: 'Score FORGA > 70' },
  month_of_forge: { name: 'Mois de Forge', description: '30 jours de streak' },
};

export function getBadgeInfo(type: BadgeType, locale: string = 'fr'): { name: string; description: string } {
  const info: Record<string, Record<BadgeType, { name: string; description: string }>> = {
    fr: {
      first_meal: { name: 'Premier Repas', description: 'Valider son premier repas' },
      first_week: { name: 'Première Semaine', description: '7 jours de streak' },
      first_kilo: { name: 'Premier Kilo', description: '1 kg de progression vers l\'objectif' },
      forgeron: { name: 'Forgeron', description: 'Score FORGA > 70' },
      month_of_forge: { name: 'Mois de Forge', description: '30 jours de streak' },
    },
    en: {
      first_meal: { name: 'First Meal', description: 'Validate your first meal' },
      first_week: { name: 'First Week', description: '7-day streak' },
      first_kilo: { name: 'First Kilo', description: '1 kg progress toward goal' },
      forgeron: { name: 'Forger', description: 'FORGA Score > 70' },
      month_of_forge: { name: 'Month of Forge', description: '30-day streak' },
    },
  };
  return (info[locale] ?? info.fr)[type];
}
