export type Sex = 'male' | 'female';
export type Objective = 'bulk' | 'cut' | 'maintain' | 'recomp' | 'force';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Budget = 'eco' | 'premium' | 'both';
export type Restriction = 'vegetarian' | 'vegan' | 'gluten_free' | 'lactose_free' | 'halal' | 'pork_free';
/** What the user wants tracked in FORGA. Affects which sections of the
 *  Score FORGA are computed.
 *  - 'both'           : default, scores both nutrition and training
 *  - 'nutrition_only' : user follows their own training program elsewhere — we
 *                       skip the training pillar in the score and base
 *                       "active days" on meal validations instead of workouts
 *  - 'training_only'  : user prefers to track only training — the 40-pt
 *                       nutrition pillar is dropped and the score is
 *                       re-normalised over the remaining 60 pts.  */
export type TrackingMode = 'both' | 'nutrition_only' | 'training_only';

// ── Training profile (used by program assignment) ──
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TrainingFrequency = 3 | 4 | 5 | 6;
export type EquipmentAccess = 'full_gym' | 'home_equipped' | 'minimal';
export type GlutePreference = 'glute_focus' | 'quad_focus' | 'no_glute_focus';
/** Lieu d'entraînement — pilote le choix entre programme salle (barres,
 *  racks, machines) ou maison (haltères, élastiques, poids du corps).
 *  Set par le TrainingSetupSheet à la 1re visite de la page training. */
export type TrainingLocation = 'gym' | 'home';

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

  // Training profile (program assignment) — optional for backwards compat
  trainingLevel?: TrainingLevel;
  trainingFrequency?: TrainingFrequency;
  equipmentAccess?: EquipmentAccess;
  glutePreference?: GlutePreference;
  /** Lieu d'entraînement (Salle/Maison). Set via TrainingSetupSheet à
   *  la 1re visite de la page training. Si null, le wizard s'affiche.
   *  Permet de mapper sur la version Salle ou Maison du programme. */
  trainingLocation?: TrainingLocation;

  /** What sections feed the FORGA Score. Defaults to 'both' when missing
   *  (backwards-compat for users created before this field existed). */
  trackingMode?: TrackingMode;

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

  /** URI locale ou URL distante de la photo de profil custom de l'user.
   *  Optionnel — si absent, le hero affiche l'initiale en gradient
   *  comme fallback. Mis à jour via le bouton "Modifier la photo" sur
   *  l'écran profil, persisté via Supabase Storage (`avatars` bucket). */
  avatarUri?: string;

  /** Profil cyclisme commute — quand l'user fait des trajets quotidiens
   *  à vélo. Ajoute la dépense énergétique au TDEE pour calibrer ses
   *  calories cibles plus précisément. Absent si l'user a répondu non
   *  à la question pendant l'onboarding. */
  cycling?: CyclingProfile;

  /** Statut ménopausique — uniquement pertinent pour les femmes >=40.
   *  Détermine des ajustements physiologiques importants :
   *    - TDEE réduit (-5 à -10%) car baisse de l'œstrogène
   *    - Protéines augmentées (combat sarcopénie accélérée)
   *    - Calcium / Vit D rehaussés (densité osseuse)
   *    - Programmes priorisant la force (anti-ostéoporose)
   *  Valeurs :
   *    - 'none'      : pas concernée (préménopause normale)
   *    - 'peri'      : périménopause (cycles irréguliers, début symptômes)
   *    - 'post'      : ménopause établie (12 mois sans règles)
   *  Optionnel — l'onboarding ne pose la question qu'aux femmes 40+. */
  menopauseStatus?: MenopauseStatus;

  createdAt: string;
  updatedAt: string;
}

/**
 * Configuration des trajets vélo réguliers de l'user. Calculée une
 * fois à l'onboarding via 2 adresses + route OSRM, puis appliquée
 * au TDEE quotidien (réparti sur 7 jours pour stabilité).
 */
export interface CyclingProfile {
  /** Trajet vélo activé. Si false, le reste est ignoré dans le calcul. */
  enabled: boolean;
  /** Adresse de départ (généralement domicile) — texte saisi par l'user. */
  homeAddress?: string;
  /** Adresse de destination (généralement boulot/fac). */
  destinationAddress?: string;
  /** Distance one-way en km, calculée par OSRM cycling profile. */
  distanceKm?: number;
  /** Nombre de jours par semaine où l'user fait l'aller-retour (1-7). */
  daysPerWeek: number;
}

export type Archetype = 'warrior' | 'craftsman' | 'explorer';
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Statut ménopausique. `none` = pas concernée (avant 40 ou postménopause
 * gérée). `peri` = périménopause (transition, cycles irréguliers,
 * début des symptômes). `post` = ménopause établie (12+ mois sans règles).
 *
 * On utilise ces 3 valeurs (au lieu de 4 avec 'pre') car la distinction
 * "pré-ménopause normale" et "pas concernée" n'a pas d'impact sur les
 * calculs — la périménopause est le 1er stade qui change les besoins.
 */
export type MenopauseStatus = 'none' | 'peri' | 'post';

export interface OnboardingData {
  archetype?: Archetype;
  intensity?: IntensityLevel;
  name?: string;
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
  /** Profil cyclisme renseigné à l'étape vélo de l'onboarding.
   *  Reporté dans `UserProfile.cycling` à la finalisation. */
  cycling?: CyclingProfile;
  /** Statut ménopausique demandé à l'onboarding pour les femmes 40+.
   *  Reporté dans UserProfile à la finalisation. Absent si non concernée. */
  menopauseStatus?: MenopauseStatus;
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

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bodyFatPercent?: number;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  date: string;
  uri: string; // local file URI
  weight?: number;
  note?: string;
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
  | 'month_of_forge'
  // Training badges
  | 'first_workout'
  | 'ten_workouts'
  | 'thirty_workouts'
  | 'hundred_workouts'
  | 'training_week_streak'
  | 'training_month_streak';

export const BADGE_INFO: Record<BadgeType, { name: string; description: string }> = {
  first_meal: { name: 'Premier Repas', description: 'Valider son premier repas' },
  first_week: { name: 'Première Semaine', description: '7 jours de streak' },
  first_kilo: { name: 'Premier Kilo', description: '1 kg de progression vers l\'objectif' },
  forgeron: { name: 'Forgeron', description: 'Score FORGA > 70' },
  month_of_forge: { name: 'Mois de Forge', description: '30 jours de streak' },
  first_workout: { name: 'Première Séance', description: 'Compléter ta première séance' },
  ten_workouts: { name: 'Dix Séances', description: '10 séances complétées' },
  thirty_workouts: { name: 'Trente Séances', description: '30 séances complétées' },
  hundred_workouts: { name: 'Centurion', description: '100 séances complétées' },
  training_week_streak: { name: 'Semaine d\'Acier', description: '7 jours d\'entraînement consécutifs' },
  training_month_streak: { name: 'Mois d\'Acier', description: '30 jours d\'entraînement consécutifs' },
};

export function getBadgeInfo(type: BadgeType, locale: string = 'fr'): { name: string; description: string } {
  const info: Record<string, Record<BadgeType, { name: string; description: string }>> = {
    fr: {
      first_meal: { name: 'Premier Repas', description: 'Valider son premier repas' },
      first_week: { name: 'Première Semaine', description: '7 jours de streak' },
      first_kilo: { name: 'Premier Kilo', description: '1 kg de progression vers l\'objectif' },
      forgeron: { name: 'Forgeron', description: 'Score FORGA > 70' },
      month_of_forge: { name: 'Mois de Forge', description: '30 jours de streak' },
      first_workout: { name: 'Première Séance', description: 'Compléter ta première séance' },
      ten_workouts: { name: 'Dix Séances', description: '10 séances complétées' },
      thirty_workouts: { name: 'Trente Séances', description: '30 séances complétées' },
      hundred_workouts: { name: 'Centurion', description: '100 séances complétées' },
      training_week_streak: { name: 'Semaine d\'Acier', description: '7 jours d\'entraînement consécutifs' },
      training_month_streak: { name: 'Mois d\'Acier', description: '30 jours d\'entraînement consécutifs' },
    },
    en: {
      first_meal: { name: 'First Meal', description: 'Validate your first meal' },
      first_week: { name: 'First Week', description: '7-day streak' },
      first_kilo: { name: 'First Kilo', description: '1 kg progress toward goal' },
      forgeron: { name: 'Forger', description: 'FORGA Score > 70' },
      month_of_forge: { name: 'Month of Forge', description: '30-day streak' },
      first_workout: { name: 'First Workout', description: 'Complete your first session' },
      ten_workouts: { name: 'Ten Workouts', description: '10 workouts completed' },
      thirty_workouts: { name: 'Thirty Workouts', description: '30 workouts completed' },
      hundred_workouts: { name: 'Centurion', description: '100 workouts completed' },
      training_week_streak: { name: 'Iron Week', description: '7 consecutive training days' },
      training_month_streak: { name: 'Iron Month', description: '30 consecutive training days' },
    },
  };
  return (info[locale] ?? info.fr)[type];
}
