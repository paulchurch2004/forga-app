import type { Objective, ActivityLevel, Sex, MenopauseStatus } from '../types/user';
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

/**
 * Map activity_level (lifestyle) → training Level (gym experience).
 *
 * Important : "activity_level" ne reflète PAS l'expérience en musculation
 * mais le mode de vie global. Un mec "active" qui fait du sport collectif
 * 3×/sem n'est PAS automatiquement un lifter intermédiaire/avancé.
 *
 * Avant ce fix, `active` mappait sur `advanced` → recommandation 5/3/1
 * (programme force pure pour vrais avancés) à des users en réalité
 * intermédiaires qui voulaient juste un PPL classique. Bug majeur.
 *
 * Nouvelle règle :
 *   - sedentary / light  → beginner (full body, 3j/sem)
 *   - moderate / active  → intermediate (PHUL, PPL, etc.)
 *   - very_active        → advanced (5/3/1, programmes structurés)
 *
 * `very_active` reste mappé en advanced car ce profil est explicitement
 * "athlète", mais reste accessible à l'user qui veut tester via le
 * sélecteur de programmes.
 */
export function mapActivityToLevel(a: ActivityLevel): Level {
  if (a === 'sedentary' || a === 'light') return 'beginner';
  if (a === 'moderate' || a === 'active') return 'intermediate';
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
  objective?: Objective,
  menopauseStatus?: MenopauseStatus,
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
  // V4 (60 programmes) : on construit l'ID via la convention de nommage
  // V4 `${OBJ}_${LEVEL}_${LOC}_${SEX}`. Le lieu n'est pas connu ici
  // (`recommendProgram` est appelé hors du wizard), on default sur 'gym'
  // qui est le cas le plus fréquent en France. L'user peut toujours
  // changer via le wizard ou le picker.
  const lvl = (level === 'expert' ? 'advanced' : level).toUpperCase();
  const sexCode = sex === 'female' ? 'F' : 'M';

  // Ménopause : priorité absolue à la FORCE pour combattre la
  // sarcopénie + l'ostéoporose post-baisse œstrogène. On envoie sur
  // un programme musculation structuré avec charges (BULK pour conserver
  // le surplus calorique + densité osseuse).
  const isMenopausal = menopauseStatus === 'peri' || menopauseStatus === 'post';
  if (isFemale && isMenopausal) {
    const mlvl = (level === 'beginner' ? 'BEGINNER' : 'INTERMEDIATE');
    return `BULK_${mlvl}_GYM_F`;
  }

  // V4 : tous les objectifs (bulk/cut/maintain/recomp/force) suivent la
  // même convention. days n'est plus utilisé — la fréquence est figée
  // par le niveau (3j débutant, 4j inter, 6j avancé).
  return `${obj.toUpperCase()}_${lvl}_GYM_${sexCode}`;
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
    case 'force':
      // Powerlifter : cardio minimal pour minimiser l'interférence avec
      // les adaptations de force (Schoenfeld/Wilson meta 2012). 1 session
      // LISS courte pour la santé cardio + récup active. Pas de HIIT
      // (épuise le SNC nécessaire aux lourdes).
      return { sessionsPerWeek: 1, type: 'liss', durationMinutes: 20, descriptionKey: 'cardioRecForce' };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

/** Plans now start TODAY (not next Monday) — users want to begin immediately. */
function getPlanStartDate(): string {
  return toLocalDateStr(new Date());
}

/** Convert a YYYY-MM-DD string to ISO day-of-week (0=Mon..6=Sun). */
function isoDayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun..6=Sat
  return day === 0 ? 6 : day - 1;
}

function pickCardioDays(trainingSlots: number[], sessionsPerWeek: number): number[] {
  const restDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !trainingSlots.includes(d));
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

  const startDate = getPlanStartDate();
  const endDate = addDays(startDate, 27);
  const cardioRec = getCardioRecommendation(obj);
  const cardioDays = pickCardioDays(program.trainingSlots, cardioRec.sessionsPerWeek);

  const days: PlannedDay[] = [];
  let rotationIdx = 0;

  for (let i = 0; i < 28; i++) {
    const date = addDays(startDate, i);
    // Use the actual calendar day-of-week (not the index), so training slots
    // align with real Mondays/Tuesdays/etc. regardless of when the plan starts.
    const dow = isoDayOfWeek(date);

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
