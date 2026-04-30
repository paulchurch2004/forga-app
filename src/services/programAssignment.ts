// FORGA — Program Assignment v3
// Maps a user profile to one of the 16 programs in src/data/programs.ts.
// Includes validation, gender variant resolution, and a defensive fallback.

import { supabase } from './supabase';
import { PROGRAMS } from '../data/programs';
import type {
  Sex,
  Objective,
  ActivityLevel,
  TrainingLevel,
  TrainingFrequency,
  EquipmentAccess,
  GlutePreference,
} from '../types/user';

export interface AssignmentInput {
  objective: Objective;
  sex: Sex;
  age: number;
  trainingLevel?: TrainingLevel;
  trainingFrequency?: TrainingFrequency;
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

/** Map (objective, level, frequency) → program id, with sex-aware variants. */
function lookupProgram(
  objective: Objective,
  level: TrainingLevel,
  frequency: TrainingFrequency,
  sex: Sex,
): string | null {
  const isFemale = sex === 'female';

  // ─── BULK ──
  if (objective === 'bulk') {
    if (level === 'beginner') {
      return frequency >= 4 ? 'BULK_DEB_4D_UL' : 'BULK_DEB_3D_FB';
    }
    if (level === 'advanced' || level === 'expert') return 'BULK_AVA_4D_531';
    // intermediate
    if (frequency >= 6) return isFemale ? 'BULK_INT_6D_PPL_F' : 'BULK_INT_6D_PPL_M';
    if (frequency === 5) return isFemale ? 'BULK_INT_5D_UL_PPL_F' : 'BULK_INT_5D_UL_PPL_M';
    return isFemale ? 'BULK_INT_4D_PHUL_F' : 'BULK_INT_4D_PHUL_M';
  }

  // ─── CUT ──
  if (objective === 'cut') {
    if (level === 'beginner') {
      return frequency >= 4 ? 'CUT_DEB_4D_UL' : 'CUT_DEB_3D_FB';
    }
    if (frequency >= 5) return isFemale ? 'CUT_INT_5D_PPL_UL_F' : 'CUT_INT_5D_PPL_UL_M';
    return isFemale ? 'CUT_INT_4D_UL_F' : 'CUT_INT_4D_UL_M';
  }

  // ─── MAINTAIN ──
  if (objective === 'maintain') {
    return frequency >= 4 ? 'MAINTAIN_4D_UL' : 'MAINTAIN_3D_FB';
  }

  // ─── RECOMP ──
  if (level === 'beginner') return 'RECOMP_DEB_3D_FB';
  if (frequency >= 5) return isFemale ? 'RECOMP_INT_5D_HYB_F' : 'RECOMP_INT_5D_HYB_M';
  return isFemale ? 'RECOMP_INT_4D_UL_F' : 'RECOMP_INT_4D_UL_M';
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

/**
 * Assign a program to a user. Pure function — no side effects.
 * Performs validation/adjustments first (beginner can't do 6j, minor can't cut, etc.)
 * then runs the mapping table, with fallback if the combination is unmapped.
 */
export function assignProgram(input: AssignmentInput): AssignmentResult {
  const warnings: string[] = [];

  let objective = input.objective;
  let level: TrainingLevel = input.trainingLevel ?? deriveTrainingLevel(input.activityLevel ?? 'moderate');
  let frequency: TrainingFrequency = input.trainingFrequency ?? deriveTrainingFrequency(input.activityLevel ?? 'moderate');
  const sex = input.sex;
  const age = input.age;

  // ── Validation rules (per spec §3.1) ──

  // Beginner can't do 5-6j safely
  if (level === 'beginner' && frequency >= 5) {
    frequency = 4;
    warnings.push("À ton niveau, on commence avec 4 séances/semaine pour bien récupérer.");
  }

  // Minors should not cut — switch to recomp
  if (objective === 'cut' && age < 16) {
    objective = 'recomp';
    warnings.push("À ton âge, on évite la sèche. On fait de la recomposition.");
  }

  // Older users with very high frequency
  if (age > 55 && frequency >= 5) {
    frequency = 4;
    warnings.push("Pour optimiser ta récupération, on te recommande 4 séances max.");
  }

  // ── Special case: female intermediate bulk 4j → glute-focus program ──
  if (
    objective === 'bulk'
    && level === 'intermediate'
    && frequency === 4
    && sex === 'female'
    && input.glutePreference !== 'no_glute_focus'
  ) {
    return {
      programId: 'BULK_INT_4D_UL_GLUTE',
      reason: 'Programme dédié femme avec focus fessiers et chaîne postérieure.',
      warnings,
    };
  }

  // ── Standard mapping ──
  let programId = lookupProgram(objective, level, frequency, sex);

  // ── Fallback: degrade level + cap frequency ──
  if (!programId || !PROGRAMS[programId]) {
    const fbLevel: TrainingLevel = level === 'expert' ? 'advanced' : level === 'advanced' ? 'intermediate' : level;
    const fbFreq = Math.min(frequency, 4) as TrainingFrequency;
    programId = lookupProgram(objective, fbLevel, fbFreq, sex);
    if (programId && PROGRAMS[programId]) {
      warnings.push("Programme adapté à ton profil par approximation.");
    }
  }

  // ── Ultimate fallback ──
  if (!programId || !PROGRAMS[programId]) {
    programId = 'MAINTAIN_3D_FB';
    warnings.push("Combinaison non couverte — on te met en mode maintien le temps de te trouver mieux.");
  }

  return {
    programId,
    reason: `Assigné selon : ${objective} / ${level} / ${frequency}j${sex === 'female' ? ' (F)' : ''}`,
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
