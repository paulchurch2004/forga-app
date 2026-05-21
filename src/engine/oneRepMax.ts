// FORGA — 1RM estimation + progressive overload helpers.
// Pure functions, no I/O, no React.

export interface SetRecord {
  weight: number;
  reps: number;
}

export interface SessionRecord {
  date: string; // YYYY-MM-DD
  sets: SetRecord[];
}

/** Round to nearest 0.5 kg (gym plate granularity). */
function roundToPlate(weight: number): number {
  return Math.round(weight * 2) / 2;
}

/**
 * Epley formula — best fit for reps 1-10.
 *   1RM ≈ weight × (1 + reps / 30)
 * Returns 0 for invalid input.
 */
export function estimateOneRMEpley(weight: number, reps: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Brzycki formula — alternative, slightly lower estimate at high reps.
 *   1RM ≈ weight × 36 / (37 - reps)
 */
export function estimateOneRMBrzycki(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0 || reps >= 37) return 0;
  if (reps === 1) return weight;
  return (weight * 36) / (37 - reps);
}

/** Best estimated 1RM across an array of sets. */
export function bestOneRMFromSets(sets: SetRecord[]): number {
  if (!Array.isArray(sets) || sets.length === 0) return 0;
  let best = 0;
  for (const s of sets) {
    if (!s) continue;
    const e = estimateOneRMEpley(s.weight ?? 0, s.reps ?? 0);
    if (e > best) best = e;
  }
  return best;
}

/** Weight to load to hit a given % of 1RM, rounded to nearest 0.5 kg. */
export function weightForPercent(oneRM: number, pct: number): number {
  if (oneRM <= 0 || pct <= 0) return 0;
  return roundToPlate(oneRM * (pct / 100));
}

/** Reverse lookup: what % of 1RM does this weight represent? */
export function percentOfOneRM(weight: number, oneRM: number): number {
  if (oneRM <= 0 || weight <= 0) return 0;
  return Math.round((weight / oneRM) * 100);
}

export type ProgressionVerdict = 'progress' | 'maintain' | 'stagnant' | 'regress' | 'unknown';

/**
 * Analyse the last N sessions for an exercise.
 * - `progress`: best 1RM strictly increases over the window.
 * - `maintain`: best 1RM stable (within ±2.5%).
 * - `stagnant`: same weight, same or fewer reps for 2+ sessions.
 * - `regress`: best 1RM drops by >5% across 2 consecutive sessions.
 */
export function analyzeProgression(history: SessionRecord[]): ProgressionVerdict {
  if (!Array.isArray(history) || history.length < 2) return 'unknown';

  // Sort ascending by date
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const oneRMs = sorted.map((s) => bestOneRMFromSets(s.sets));
  if (oneRMs.every((v) => v === 0)) return 'unknown';

  const last = oneRMs[oneRMs.length - 1];
  const prev = oneRMs[oneRMs.length - 2];

  if (prev > 0 && last < prev * 0.95) return 'regress';
  if (prev > 0 && last > prev * 1.025) return 'progress';

  // Check stagnation: last 2 sessions same top weight
  const sortByWeightDesc = (sets: SetRecord[]) =>
    [...(sets ?? [])].sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0));
  const lastTop = sortByWeightDesc(sorted[sorted.length - 1].sets)[0];
  const prevTop = sortByWeightDesc(sorted[sorted.length - 2].sets)[0];
  if (lastTop && prevTop && lastTop.weight === prevTop.weight && (lastTop.reps ?? 0) <= (prevTop.reps ?? 0)) {
    return 'stagnant';
  }
  return 'maintain';
}

export interface NextWeightSuggestion {
  /** Weight to suggest for the upcoming session (kg). */
  weight: number;
  /** Diff vs last session (positive = increase, negative = deload). */
  changeKg: number;
  /** One-line FR explanation. */
  reason: string;
  /** True when a planned deload week is recommended. */
  deloadSuggested: boolean;
}

/**
 * Suggest weight for the next session based on the last session(s).
 *
 * Aligné sur TRAINING_PROGRAMS_SPEC.md §A.3 :
 *   - Débutant : surcharge linéaire à chaque séance si toutes les reps
 *     prescrites sont validées → **+2.5 kg compounds bas du corps**,
 *     **+1.25 kg compounds haut du corps**.
 *   - Intermédiaire+ : double progression (augmenter reps puis charge).
 *     Concrètement même règle : on monte la charge quand tous les sets
 *     atteignent la cible (la "borne haute" de la fourchette implicite).
 *
 * Et §A.6 (signaux deload) :
 *   - Régression de force/reps 2 séances consécutives → deload -10 %.
 *
 * @param isLowerBody true pour squat/deadlift/leg press/etc. (compound
 *                    qui sollicite jambes/dos = +2.5 kg). false pour
 *                    bench/OHP/row (compound haut du corps = +1.25 kg).
 *                    Ignoré si isCompound=false (isolation +1 kg).
 */
export function suggestNextWeight(
  history: SessionRecord[],
  isCompound: boolean,
  targetReps: number,
  isLowerBody: boolean = false,
): NextWeightSuggestion {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      weight: 0,
      changeKg: 0,
      reason: isCompound
        ? 'Choisis une charge où tu peux compléter toutes les reps avec 2-3 reps en réserve.'
        : 'Charge légère pour bien sentir le muscle, 1-2 reps en réserve.',
      deloadSuggested: false,
    };
  }

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const lastTop = [...last.sets].sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0))[0];
  if (!lastTop || !lastTop.weight) {
    return {
      weight: 0,
      changeKg: 0,
      reason: 'Pas de référence, choisis une charge maîtrisable.',
      deloadSuggested: false,
    };
  }

  // Règle stricte "all reps hit" — conforme TRAINING_PROGRAMS_SPEC.md §A.3.
  // Pour monter la charge il faut TOUS les sets à la cible, pas une moyenne.
  // C'est la double progression : tant que l'user n'a pas atteint la borne
  // haute de la fourchette, il reste à la même charge et vise plus de reps.
  // Quand tous les sets valident → +charge la séance suivante.
  const allRepsHit = last.sets.every((s) => (s?.reps ?? 0) >= targetReps);
  const allRepsMissed = last.sets.every((s) => (s?.reps ?? 0) < targetReps);

  // Increment différencié conformément à la spec :
  //   - Compound bas du corps (squat, DL, leg press, hip thrust) : +2.5 kg
  //   - Compound haut du corps (bench, OHP, row, pull-up) : +1.25 kg
  //   - Isolation (curl, lateral raise, extension) : +1 kg (intermédiaire
  //     entre haltère 1 kg et plaque 2.5 kg ; rounding gère le snap final)
  const increment = isCompound
    ? (isLowerBody ? 2.5 : 1.25)
    : 1;

  if (allRepsHit) {
    return {
      weight: roundToPlate(lastTop.weight + increment),
      changeKg: increment,
      reason: `+${increment} kg : tu as validé toutes les reps la dernière fois.`,
      deloadSuggested: false,
    };
  }

  // Two failed sessions in a row → suggest deload
  if (allRepsMissed && sorted.length >= 2) {
    const prev = sorted[sorted.length - 2];
    const prevAllMissed = prev.sets.every((s) => (s?.reps ?? 0) < targetReps);
    if (prevAllMissed) {
      const deloadWeight = roundToPlate(lastTop.weight * 0.9);
      return {
        weight: deloadWeight,
        changeKg: deloadWeight - lastTop.weight,
        reason: 'Deload conseillé (-10 %). Refais le plein de motivation, on remontera vite.',
        deloadSuggested: true,
      };
    }
  }

  return {
    weight: lastTop.weight,
    changeKg: 0,
    reason: 'Même charge — termine toutes les reps cibles avant de monter.',
    deloadSuggested: false,
  };
}
