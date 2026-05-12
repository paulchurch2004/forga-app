export interface ForgaScore {
  total: number;        // 0-100
  nutrition: number;    // 0-40
  consistency: number;  // 0-30
  progression: number;  // 0-20
  discipline: number;   // 0-10
}

export interface ScoreHistory {
  id: string;
  userId: string;
  date: string;
  total: number;
  nutrition: number;
  consistency: number;
  progression: number;
  discipline: number;
  createdAt: string;
}

export interface ScoreInput {
  // Nutrition (7 derniers jours)
  mealsValidated: number;
  mealsExpected: number;
  proteinTargetDays: number; // jours sur 7 où protéines ±10%
  uniqueMealsChosen: number;

  // Constance
  currentStreak: number;
  checkInsCompleted: number; // sur 4 semaines (0-4)

  // Progression
  weightTrendPerWeek: number; // kg/semaine (positif = prise, négatif = perte)
  objective: 'bulk' | 'cut' | 'maintain' | 'recomp';
  goalProgressPercent: number; // 0-100
  hasWeightData?: boolean; // false si aucune pesée récente — empêche le score fallback

  // Discipline
  activeDaysLast7: number; // jours actifs cette semaine (0-7) — typiquement
                           //   le nombre de jours avec ≥1 séance d'entraînement.
                           //   En mode 'nutrition_only' on substitue par le
                           //   nombre de jours avec ≥1 repas validé.
  thisWeekCheckIn: boolean;

  // Hydratation (optionnel)
  waterTargetDaysMet?: number; // jours sur 7 où objectif eau atteint (0-7)

  // Tracking mode — détermine comment le score est calculé.
  //   - 'both'           : 4 piliers complets (default si non fourni)
  //   - 'nutrition_only' : ignore le manque de séances dans la discipline,
  //                        active days = jours-avec-repas-validés
  //   - 'training_only'  : skip le pilier nutrition (40pts), rescale les
  //                        autres pour totaliser /100
  trackingMode?: 'both' | 'nutrition_only' | 'training_only';
}
