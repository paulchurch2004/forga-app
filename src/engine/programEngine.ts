import type { Objective, ActivityLevel, Sex } from '../types/user';
import type {
  ProgramId,
  ProgramDay,
  GeneratedPlan,
  PlannedDay,
  CardioRecommendation,
  Level,
} from '../types/program';
import { PROGRAMS, resolveLegacyProgramId } from '../data/programs';

/** Local-timezone YYYY-MM-DD (avoids UTC shift from toISOString) */
export function toLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// V3 — 16-program library selection
// ============================================================================

export function mapActivityToLevel(a: ActivityLevel): Level {
  if (a === 'sedentary' || a === 'light') return 'beginner';
  if (a === 'moderate') return 'intermediate';
  return 'advanced';
}

/**
 * Map (activity_level) → preferred days per week.
 * Used as a default when picking a program; the user can always override
 * by selecting a different program manually.
 */
function defaultDaysPerWeek(activity: ActivityLevel): 3 | 4 | 5 | 6 {
  if (activity === 'sedentary' || activity === 'light') return 3;
  if (activity === 'moderate') return 4;
  if (activity === 'active') return 5;
  return 6;
}

/**
 * Recommend a program from the v3 library based on objective, level
 * (derived from activity), sex, and preferred frequency.
 *
 * Backwards-compat: legacy 2-arg form (no sex) defaults to 'male'.
 */
export function recommendProgram(
  sexOrActivity: Sex | ActivityLevel,
  activityOrObjective: ActivityLevel | Objective,
  objective?: Objective
): ProgramId {
  const isLegacy = !objective;
  const sex: Sex = isLegacy ? 'male' : (sexOrActivity as Sex);
  const activityLevel: ActivityLevel = isLegacy
    ? (sexOrActivity as ActivityLevel)
    : (activityOrObjective as ActivityLevel);
  const obj: Objective = isLegacy
    ? (activityOrObjective as Objective)
    : (objective as Objective);

  const level = mapActivityToLevel(activityLevel);
  const days = defaultDaysPerWeek(activityLevel);
  const isFemale = sex === 'female';

  // ─── BULK ──
  if (obj === 'bulk') {
    if (level === 'beginner') {
      return days >= 4 ? 'BULK_DEB_4D_UL' : 'BULK_DEB_3D_FB';
    }
    if (level === 'advanced') return 'BULK_AVA_4D_531';
    // intermediate
    if (days >= 6) return isFemale ? 'BULK_INT_6D_PPL_F' : 'BULK_INT_6D_PPL_M';
    if (days === 5) return isFemale ? 'BULK_INT_5D_UL_PPL_F' : 'BULK_INT_5D_UL_PPL_M';
    return isFemale ? 'BULK_INT_4D_PHUL_F' : 'BULK_INT_4D_PHUL_M';
  }

  // ─── CUT ──
  if (obj === 'cut') {
    if (level === 'beginner') {
      return days >= 4 ? 'CUT_DEB_4D_UL' : 'CUT_DEB_3D_FB';
    }
    if (days >= 5) return isFemale ? 'CUT_INT_5D_PPL_UL_F' : 'CUT_INT_5D_PPL_UL_M';
    return isFemale ? 'CUT_INT_4D_UL_F' : 'CUT_INT_4D_UL_M';
  }

  // ─── MAINTAIN ──
  if (obj === 'maintain') {
    return days >= 4 ? 'MAINTAIN_4D_UL' : 'MAINTAIN_3D_FB';
  }

  // ─── RECOMP ──
  if (level === 'beginner') return 'RECOMP_DEB_3D_FB';
  if (days >= 5) return isFemale ? 'RECOMP_INT_5D_HYB_F' : 'RECOMP_INT_5D_HYB_M';
  return isFemale ? 'RECOMP_INT_4D_UL_F' : 'RECOMP_INT_4D_UL_M';
}

// ============================================================================
// applyObjectiveModifiers — neutralised in v3.
// V3 programs are pre-calibrated for their objective and level, so no
// runtime adjustment is needed. Kept as identity for backwards-compat
// with callers that still invoke it.
// ============================================================================

export function applyObjectiveModifiers(
  programDay: ProgramDay,
  _sex: Sex,
  _objective: Objective
): ProgramDay {
  return programDay;
}

// ============================================================================
// applyBlockRotation — neutralised in v3.
// V3 programs ship with their own deload schedules baked into the duration
// guidance. Kept as identity for backwards-compat.
// ============================================================================

export function applyBlockRotation(
  programDay: ProgramDay,
  _programId: ProgramId,
  _weekNumber: number
): ProgramDay {
  return programDay;
}

// ============================================================================
// Cardio + plan generation
// ============================================================================

function getCardioRecommendation(objective: Objective): CardioRecommendation {
  switch (objective) {
    case 'bulk':
      return { sessionsPerWeek: 1, type: 'liss', durationMinutes: 30, descriptionKey: 'cardioRecBulk' };
    case 'cut':
      return { sessionsPerWeek: 3, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecCut' };
    case 'maintain':
      return { sessionsPerWeek: 2, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecMaintain' };
    case 'recomp':
      return { sessionsPerWeek: 2, type: 'mixed', durationMinutes: 25, descriptionKey: 'cardioRecRecomp' };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const isoDay = day === 0 ? 6 : day - 1;
  if (isoDay === 0) return toLocalDateStr(now);
  const daysUntilMonday = 7 - isoDay;
  const monday = new Date(now);
  monday.setDate(monday.getDate() + daysUntilMonday);
  return toLocalDateStr(monday);
}

function pickCardioDays(trainingSlots: number[], sessionsPerWeek: number): number[] {
  const restDays = [0, 1, 2, 3, 4, 5].filter((d) => !trainingSlots.includes(d));
  if (restDays.length === 0 || sessionsPerWeek === 0) return [];
  const step = Math.max(1, Math.floor(restDays.length / sessionsPerWeek));
  const picked: number[] = [];
  for (let i = 0; i < sessionsPerWeek && i * step < restDays.length; i++) {
    picked.push(restDays[i * step]);
  }
  return picked;
}

/**
 * Generate a 4-week plan. Backwards-compat: legacy 2-arg form
 * (programId, objective) defaults sex='male'.
 */
export function generatePlan(
  programId: ProgramId,
  sexOrObjective: Sex | Objective,
  objective?: Objective
): GeneratedPlan {
  const isLegacy = !objective;
  const sex: Sex = isLegacy ? 'male' : (sexOrObjective as Sex);
  const obj: Objective = isLegacy ? (sexOrObjective as Objective) : (objective as Objective);

  // Resolve legacy program ids on the fly (v1 → v3, v2 → v3)
  const resolvedId = resolveLegacyProgramId(programId, sex) as ProgramId;
  const program = PROGRAMS[resolvedId] ?? PROGRAMS[programId];
  if (!program) throw new Error(`Unknown program: ${programId}`);

  const startDate = getNextMonday();
  const endDate = addDays(startDate, 27);
  const cardioRec = getCardioRecommendation(obj);
  const cardioDays = pickCardioDays(program.trainingSlots, cardioRec.sessionsPerWeek);

  const days: PlannedDay[] = [];
  let rotationIdx = 0;

  for (let i = 0; i < 28; i++) {
    const date = addDays(startDate, i);
    const dow = i % 7;

    if (program.trainingSlots.includes(dow)) {
      const dayIdx = rotationIdx % program.rotation.length;
      rotationIdx++;
      days.push({
        date,
        dayOfWeek: dow,
        programDayId: program.rotation[dayIdx].id,
        status: 'upcoming',
      });
    } else if (cardioDays.includes(dow)) {
      const cardioCount = days.filter((d) => d.programDayId?.startsWith('cardio_')).length;
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

  const today = toLocalDateStr();
  const todayDay = days.find((d) => d.date === today);
  if (todayDay && todayDay.status !== 'rest') {
    todayDay.status = 'today';
  }

  return {
    programId: resolvedId,
    startDate,
    endDate,
    days,
    cardioRecommendation: cardioRec,
  };
}

/**
 * Build the final ProgramDay used at workout time.
 * In v3, programs are pre-calibrated so this just returns the raw day.
 */
export function resolveProgramDayForWorkout(
  rawDay: ProgramDay,
  _programId: ProgramId,
  _sex: Sex,
  _objective: Objective,
  _weekNumber: number
): ProgramDay {
  return rawDay;
}
