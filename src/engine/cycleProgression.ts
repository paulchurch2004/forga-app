// FORGA — Progression de cycle d'entraînement.
//
// Quand un user termine son programme de 4 semaines, au lieu de le
// laisser re-choisir un programme à l'aveugle, on :
//  1. Lui recommande le NIVEAU SUPÉRIEUR du même objectif/lieu (progression
//     logique : Débutant → Intermédiaire → Avancé).
//  2. Lui montre un BILAN de cycle (séances faites, PR gagnés) pour
//     valoriser l'effort et donner envie de continuer.
//
// L'historique (workouts, 1RM) est conservé entre les cycles car il vit
// dans trainingStore (jamais reset au changement de programme — seul
// l'activePlan + completedDays sont régénérés).

import { PROGRAMS } from '../data/programs';
import type { TrainingProgram } from '../types/program';
import type { Workout } from '../types/training';
import type { OneRepMaxRecord } from '../store/trainingStore';

/** Ordre de progression des niveaux. Avancé est le plafond (pas d'expert
 *  dans le catalogue des 60 programmes). */
const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'] as const;
type LevelId = (typeof LEVEL_ORDER)[number];

/**
 * Recommande le programme du NIVEAU SUPÉRIEUR, même objectif + lieu + sexe.
 * Si déjà au max (avancé), retourne le même programme (rebelote au même
 * niveau — l'user avancé peut refaire un cycle avancé).
 *
 * Retourne `null` si le programme courant est introuvable ou si aucun
 * programme du niveau suivant n'existe (cas théorique).
 */
export function recommendNextProgram(currentProgramId: string): TrainingProgram | null {
  const current = PROGRAMS[currentProgramId];
  if (!current) return null;

  const currentLevel = (current.level ?? 'beginner') as LevelId;
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  // Niveau suivant, ou plafonné à 'advanced'
  const nextLevel = LEVEL_ORDER[Math.min(idx + 1, LEVEL_ORDER.length - 1)];

  // Reconstruit l'ID au format OBJECTIF_NIVEAU_LIEU_SEXE
  const obj = (current.objective ?? 'bulk').toUpperCase();
  const loc = (current.location ?? 'gym').toUpperCase();
  const sexSuffix = current.sexVariant === 'female' ? 'F' : 'M';
  const nextId = `${obj}_${nextLevel.toUpperCase()}_${loc}_${sexSuffix}`;

  return PROGRAMS[nextId] ?? current;
}

/** True si l'user a déjà atteint le niveau max sur cet objectif/lieu. */
export function isAtMaxLevel(programId: string): boolean {
  const p = PROGRAMS[programId];
  return (p?.level ?? 'beginner') === 'advanced';
}

export interface CycleSummary {
  /** Nombre de séances réellement faites pendant le cycle. */
  sessionsCompleted: number;
  /** Durée totale entraînée (minutes) sur le cycle. */
  totalMinutes: number;
  /** Volume total soulevé (kg) sur le cycle. */
  totalVolumeKg: number;
  /** Top 3 progressions de 1RM estimé pendant le cycle (kg gagnés). */
  topPrGains: Array<{ exerciseId: string; gainKg: number; current: number }>;
}

/**
 * Calcule le bilan d'un cycle terminé à partir des workouts loggés entre
 * startDate et endDate (inclus), et des 1RM courants.
 *
 * Les gains de PR sont approximés : pour chaque exercice présent dans les
 * workouts du cycle, on compare le 1RM estimé du PREMIER vs du DERNIER
 * passage dans la fenêtre. C'est honnête (basé sur les vraies séries
 * loggées) sans dépendre d'un snapshot historique de 1RM.
 */
export function computeCycleSummary(
  workoutsByDate: Record<string, Workout[]>,
  startDate: string,
  endDate: string,
  _oneRepMaxes: Record<string, OneRepMaxRecord>,
): CycleSummary {
  let sessionsCompleted = 0;
  let totalMinutes = 0;
  let totalVolumeKg = 0;

  // Pour chaque exercice : 1er et dernier 1RM estimé dans la fenêtre.
  const firstE1RM: Record<string, number> = {};
  const lastE1RM: Record<string, number> = {};

  // Epley simplifié pour estimer le 1RM d'une série (weight × (1 + reps/30)).
  const epley = (w: number, r: number) => (w > 0 && r > 0 ? w * (1 + r / 30) : 0);

  for (const [date, list] of Object.entries(workoutsByDate)) {
    if (date < startDate || date > endDate) continue;
    for (const w of list ?? []) {
      sessionsCompleted += 1;
      totalMinutes += w.durationMinutes ?? 0;
      for (const ex of w.exercises) {
        let bestSetE1RM = 0;
        for (const set of ex.sets) {
          const vol = (set.weight ?? 0) * (set.reps ?? 0);
          totalVolumeKg += vol;
          const e = epley(set.weight ?? 0, set.reps ?? 0);
          if (e > bestSetE1RM) bestSetE1RM = e;
        }
        if (bestSetE1RM > 0) {
          if (firstE1RM[ex.exerciseId] === undefined) firstE1RM[ex.exerciseId] = bestSetE1RM;
          lastE1RM[ex.exerciseId] = bestSetE1RM; // écrasé → garde le dernier
        }
      }
    }
  }

  // Gains = dernier - premier, positifs seulement, top 3.
  const gains = Object.keys(lastE1RM)
    .map((exId) => ({
      exerciseId: exId,
      gainKg: Math.round((lastE1RM[exId] - (firstE1RM[exId] ?? lastE1RM[exId])) * 2) / 2,
      current: Math.round(lastE1RM[exId]),
    }))
    .filter((g) => g.gainKg > 0)
    .sort((a, b) => b.gainKg - a.gainKg)
    .slice(0, 3);

  return {
    sessionsCompleted,
    totalMinutes: Math.round(totalMinutes),
    totalVolumeKg: Math.round(totalVolumeKg),
    topPrGains: gains,
  };
}
