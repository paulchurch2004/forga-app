// FORGA — Estimation de la durée d'une séance.
//
// Remplace l'ancien `exercises.length * 12` (sous-estimation grossière :
// une séance force 3 exos en 5×5 avec 3min de repos dure ~50min, pas
// 36). L'user planifiait mal son temps et était surpris quand la séance
// dépassait largement l'estimation affichée.
//
// Modèle simple mais honnête, par série :
//   temps_série ≈ temps_repos_inter_séries + temps_exécution
//   temps_exécution ≈ reps × 4s (tempo moyen) + 10s de mise en place
// Cardio : sa durée prescrite directement.

interface EstimableExercise {
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

interface EstimableDay {
  exercises: EstimableExercise[];
  cardio?: { durationMinutes: number };
}

export function estimateSessionMinutes(day: EstimableDay): number {
  let seconds = 0;
  for (const ex of day.exercises) {
    const sets = Math.max(1, ex.targetSets);
    const execPerSet = ex.targetReps * 4 + 10; // tempo ~4s/rep + setup
    const rest = ex.restSeconds ?? 90;
    // N séries = N exécutions + (N-1) repos inter-séries
    seconds += sets * execPerSet + (sets - 1) * rest;
  }
  if (day.cardio) seconds += day.cardio.durationMinutes * 60;
  // +3min de transition générale (échauffement léger, eau, déplacements)
  seconds += 180;
  return Math.max(5, Math.round(seconds / 60));
}
