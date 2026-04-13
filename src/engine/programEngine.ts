import type { Objective, ActivityLevel } from '../types/user';
import type {
  ProgramId,
  GeneratedPlan,
  PlannedDay,
  CardioRecommendation,
} from '../types/program';
import { PROGRAMS } from '../data/programs';

export function recommendProgram(
  activityLevel: ActivityLevel,
  objective: Objective
): ProgramId {
  switch (activityLevel) {
    case 'sedentary':
    case 'light':
      return objective === 'bulk' ? 'stronglifts_5x5' : 'full_body';
    case 'moderate':
      return 'upper_lower';
    case 'active':
    case 'very_active':
      return objective === 'cut' ? 'upper_lower' : 'ppl';
  }
}

function getCardioRecommendation(objective: Objective): CardioRecommendation {
  switch (objective) {
    case 'bulk':
      return {
        sessionsPerWeek: 1,
        type: 'liss',
        durationMinutes: 30,
        descriptionKey: 'cardioRecBulk',
      };
    case 'cut':
      return {
        sessionsPerWeek: 3,
        type: 'mixed',
        durationMinutes: 25,
        descriptionKey: 'cardioRecCut',
      };
    case 'maintain':
      return {
        sessionsPerWeek: 2,
        type: 'mixed',
        durationMinutes: 25,
        descriptionKey: 'cardioRecMaintain',
      };
    case 'recomp':
      return {
        sessionsPerWeek: 2,
        type: 'mixed',
        durationMinutes: 25,
        descriptionKey: 'cardioRecRecomp',
      };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  // Convert to ISO week: 0=Mon..6=Sun
  const isoDay = day === 0 ? 6 : day - 1;
  if (isoDay === 0) {
    // Today is Monday
    return now.toISOString().split('T')[0];
  }
  const daysUntilMonday = 7 - isoDay;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + daysUntilMonday);
  return monday.toISOString().split('T')[0];
}

function pickCardioDays(
  trainingSlots: number[],
  sessionsPerWeek: number
): number[] {
  // Available rest days (0=Mon..6=Sun), exclude Sunday (6)
  const restDays = [0, 1, 2, 3, 4, 5].filter(
    (d) => !trainingSlots.includes(d)
  );

  if (restDays.length === 0 || sessionsPerWeek === 0) return [];

  // Spread cardio evenly across rest days
  const step = Math.max(1, Math.floor(restDays.length / sessionsPerWeek));
  const picked: number[] = [];
  for (let i = 0; i < sessionsPerWeek && i * step < restDays.length; i++) {
    picked.push(restDays[i * step]);
  }
  return picked;
}

export function generatePlan(
  programId: ProgramId,
  objective: Objective
): GeneratedPlan {
  const program = PROGRAMS[programId];
  const startDate = getNextMonday();
  const endDate = addDays(startDate, 27);
  const cardioRec = getCardioRecommendation(objective);
  const cardioDays = pickCardioDays(
    program.trainingSlots,
    cardioRec.sessionsPerWeek
  );

  const days: PlannedDay[] = [];
  let rotationIdx = 0;

  for (let i = 0; i < 28; i++) {
    const date = addDays(startDate, i);
    const dow = i % 7; // 0=Mon..6=Sun

    if (program.trainingSlots.includes(dow)) {
      // For StrongLifts: alternate A-B pattern per week
      let dayIdx: number;
      if (programId === 'stronglifts_5x5') {
        const weekNum = Math.floor(i / 7);
        const slotInWeek = program.trainingSlots.indexOf(dow);
        // Week 0: A-B-A (indices 0,1,0), Week 1: B-A-B (1,0,1)
        const isEvenWeek = weekNum % 2 === 0;
        const pattern = isEvenWeek ? [0, 1, 0] : [1, 0, 1];
        dayIdx = pattern[slotInWeek] ?? 0;
      } else {
        dayIdx = rotationIdx % program.rotation.length;
        rotationIdx++;
      }

      days.push({
        date,
        dayOfWeek: dow,
        programDayId: program.rotation[dayIdx].id,
        status: 'upcoming',
      });
    } else if (cardioDays.includes(dow)) {
      // Cardio day — alternate between HIIT and LISS for mixed
      const cardioCount = days.filter(
        (d) => d.programDayId?.startsWith('cardio_')
      ).length;
      const cardioId =
        cardioRec.type === 'liss'
          ? 'cardio_liss'
          : cardioRec.type === 'hiit'
            ? 'cardio_hiit'
            : cardioCount % 2 === 0
              ? 'cardio_hiit'
              : 'cardio_liss';

      days.push({
        date,
        dayOfWeek: dow,
        programDayId: cardioId,
        status: 'upcoming',
      });
    } else {
      days.push({
        date,
        dayOfWeek: dow,
        programDayId: null,
        status: 'rest',
      });
    }
  }

  // Mark today if within plan range
  const today = new Date().toISOString().split('T')[0];
  const todayDay = days.find((d) => d.date === today);
  if (todayDay && todayDay.status !== 'rest') {
    todayDay.status = 'today';
  }

  return {
    programId,
    startDate,
    endDate,
    days,
    cardioRecommendation: cardioRec,
  };
}

export function estimateWorkoutDuration(
  exercises: { targetSets: number; targetReps: number; restSeconds: number }[]
): number {
  let totalSeconds = 0;
  for (const ex of exercises) {
    const setTime = 30; // ~30s per set execution
    totalSeconds += ex.targetSets * (setTime + ex.restSeconds);
  }
  return Math.ceil(totalSeconds / 60);
}
