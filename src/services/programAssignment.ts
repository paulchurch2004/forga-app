// FORGA — Program Assignment v4
// Maps a user profile to one of the 60 programs in src/data/programs.ts.
// New convention : `${OBJ}_${LEVEL}_${LOC}_${SEX}` (ex. BULK_INTERMEDIATE_GYM_M).
// Includes validation, gender variant resolution, and a defensive fallback.

import { supabase } from './supabase';
import { PROGRAMS } from '../data/programs';
import type {
  Sex,
  Objective,
  ActivityLevel,
  TrainingLevel,
  TrainingFrequency,
  TrainingLocation,
  EquipmentAccess,
  GlutePreference,
} from '../types/user';

export interface AssignmentInput {
  objective: Objective;
  sex: Sex;
  age: number;
  trainingLevel?: TrainingLevel;
  trainingFrequency?: TrainingFrequency;
  /** Salle ou maison — pilote le choix de la version GYM vs HOME du
   *  même split. Si absent, on tombe sur GYM par défaut (équipement
   *  standard pour le marché francophone). */
  trainingLocation?: TrainingLocation;
  equipmentAccess?: EquipmentAccess;
  glutePreference?: GlutePreference;
  /** Used as a fallback when training_level / training_frequency aren't set (legacy users). */
  activityLevel?: ActivityLevel;
}

export interface AssignmentResult {
  programId: string;
  reason: string;
  warnings: string[];
}

/** Construit l'ID programme V4 selon la convention de nommage des 60
 *  programmes (cf src/data/programs.ts buildProgram). */
function buildProgramId(
  objective: Objective,
  level: TrainingLevel,
  location: TrainingLocation,
  sex: Sex,
): string {
  // Le moteur ne connaît pas 'expert' — on le mappe sur 'advanced' (le
  // doc spec utilise 3 niveaux : Débutant / Intermédiaire / Avancé).
  const lvl = level === 'expert' ? 'advanced' : level;
  return `${objective.toUpperCase()}_${lvl.toUpperCase()}_${location.toUpperCase()}_${sex === 'male' ? 'M' : 'F'}`;
}

/** Derive a sensible training_level from the legacy activity_level field. */
function deriveTrainingLevel(a: ActivityLevel): TrainingLevel {
  if (a === 'sedentary' || a === 'light') return 'beginner';
  if (a === 'moderate') return 'intermediate';
  return 'advanced';
}

/** Derive a sensible training_frequency from the legacy activity_level field. */
function deriveTrainingFrequency(a: ActivityLevel): TrainingFrequency {
  if (a === 'sedentary' || a === 'light') return 3;
  if (a === 'moderate') return 4;
  if (a === 'active') return 5;
  return 6;
}

/** Derive location from equipmentAccess (legacy users qui n'ont pas
 *  trainingLocation set). minimal/home_equipped → 'home', full_gym → 'gym'. */
function deriveLocation(equipment?: EquipmentAccess): TrainingLocation {
  if (equipment === 'home_equipped' || equipment === 'minimal') return 'home';
  return 'gym';
}

/**
 * Assign a program to a user. Pure function — no side effects.
 * Performs validation/adjustments first (beginner can't do 6j, minor can't cut, etc.)
 * then runs the mapping, with fallback if the combination is unmapped.
 */
export function assignProgram(input: AssignmentInput): AssignmentResult {
  const warnings: string[] = [];

  let objective = input.objective;
  let level: TrainingLevel = input.trainingLevel ?? deriveTrainingLevel(input.activityLevel ?? 'moderate');
  const frequency: TrainingFrequency = input.trainingFrequency ?? deriveTrainingFrequency(input.activityLevel ?? 'moderate');
  const location: TrainingLocation = input.trainingLocation ?? deriveLocation(input.equipmentAccess);
  const sex = input.sex;
  const age = input.age;

  // ── Validation rules ──

  // Minors should not cut — switch to recomp
  if (objective === 'cut' && age < 16) {
    objective = 'recomp';
    warnings.push("À ton âge, on évite la sèche. On fait de la recomposition.");
  }

  // Force avancé maison → spec dit "barre + rack requis"
  // On accepte quand même mais on warn que c'est un programme d'entretien.
  if (objective === 'force' && level === 'advanced' && location === 'home') {
    warnings.push(
      "Powerlifting avancé en maison = variante d'entretien. Pour maximiser ton 1RM, il faut barre + rack + plaques.",
    );
  }

  // Beginner avec haute fréquence → on descend à 4
  if (level === 'beginner' && frequency >= 5) {
    warnings.push("À ton niveau, on commence avec 3-4 séances/semaine pour bien récupérer.");
  }

  // Older users avec haute fréquence
  if (age > 55 && frequency >= 5) {
    warnings.push("Pour optimiser ta récupération à ton âge, vise 4 séances max.");
  }

  // ── Mapping V4 : déterministe sur (objectif, level, lieu, sexe) ──
  let programId = buildProgramId(objective, level, location, sex);

  // ── Fallback : si l'ID n'existe pas (cas impossible normalement vu
  // que tous les 60 sont générés), on dégrade le niveau et on retente.
  if (!PROGRAMS[programId]) {
    const fbLevel: TrainingLevel = level === 'expert'
      ? 'advanced'
      : level === 'advanced'
        ? 'intermediate'
        : level;
    programId = buildProgramId(objective, fbLevel, location, sex);
    if (PROGRAMS[programId]) {
      warnings.push("Programme adapté à ton profil par approximation.");
    }
  }

  // ── Ultimate fallback ──
  if (!PROGRAMS[programId]) {
    programId = buildProgramId('maintain', 'beginner', 'gym', sex);
    warnings.push("Combinaison non couverte — on te met en mode maintien le temps de te trouver mieux.");
  }

  return {
    programId,
    reason: `Assigné selon : ${objective} / ${level} / ${location} / ${sex === 'female' ? 'F' : 'M'}`,
    warnings,
  };
}

/**
 * Persist the assignment in DB:
 * - close any current program in user_program_history
 * - update users.current_program_id + program_started_at
 */
export async function applyProgramToUser(
  userId: string,
  result: AssignmentResult,
  reasonEnded: string = 'reassigned',
): Promise<void> {
  const { data: currentUser } = await supabase
    .from('users')
    .select('current_program_id, program_started_at')
    .eq('id', userId)
    .maybeSingle();

  if (currentUser?.current_program_id && currentUser.program_started_at) {
    await supabase.from('user_program_history').insert({
      user_id: userId,
      program_id: currentUser.current_program_id,
      started_at: currentUser.program_started_at,
      ended_at: new Date().toISOString(),
      reason_ended: reasonEnded,
    });
  }

  await supabase
    .from('users')
    .update({
      current_program_id: result.programId,
      program_started_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

/**
 * Check if a manual override is reasonable. Returns null if OK, or a warning string
 * the UI should show before confirming.
 */
export function validateManualOverride(
  userLevel: TrainingLevel,
  targetProgramId: string,
): string | null {
  const program = PROGRAMS[targetProgramId];
  if (!program) return 'Programme inconnu.';

  if (userLevel === 'beginner' && program.level === 'advanced') {
    return "Ce programme est conçu pour des avancés. Risque de blessure et de surentraînement. Tu confirmes ?";
  }

  return null;
}
