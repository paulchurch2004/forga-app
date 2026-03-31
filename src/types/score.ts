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

  // Discipline
  activeDaysLast7: number; // jours actifs cette semaine (0-7)
  thisWeekCheckIn: boolean;
}
