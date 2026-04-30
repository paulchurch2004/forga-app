import type { SubstituteOption } from '../components/training/ReplaceExerciseSheet';

interface SubstituteTarget {
  id: string;
  sets: number;
  reps: string | number;
}

/** Build a list of suggested substitute exercises for a given exercise. */
export function buildSubstitutesFor(target: SubstituteTarget): SubstituteOption[] {
  const reps = String(target.reps);
  const map: Record<string, SubstituteOption[]> = {
    bench_press: [
      { id: 'incline_db_press', name: 'Développé incliné haltères', sets: target.sets, reps, match: 95 },
      { id: 'incline_press', name: 'Développé incliné barre', sets: target.sets, reps, match: 92 },
      { id: 'dips', name: 'Dips pectoraux', sets: target.sets, reps: '8-12', match: 78 },
      { id: 'cable_fly', name: 'Écarté à la poulie', sets: target.sets, reps: '12-15', match: 65 },
    ],
    incline_press: [
      { id: 'incline_db_press', name: 'Développé incliné haltères', sets: target.sets, reps, match: 96 },
      { id: 'bench_press', name: 'Développé couché barre', sets: target.sets, reps, match: 88 },
      { id: 'dips', name: 'Dips pectoraux', sets: target.sets, reps: '8-12', match: 75 },
    ],
    incline_db_press: [
      { id: 'incline_press', name: 'Développé incliné barre', sets: target.sets, reps, match: 95 },
      { id: 'bench_press', name: 'Développé couché barre', sets: target.sets, reps, match: 86 },
      { id: 'cable_fly', name: 'Écarté à la poulie', sets: target.sets, reps: '12-15', match: 70 },
    ],
    squat: [
      { id: 'front_squat', name: 'Front Squat', sets: target.sets, reps, match: 92 },
      { id: 'goblet_squat', name: 'Goblet Squat', sets: target.sets, reps, match: 85 },
      { id: 'leg_press', name: 'Presse à cuisses', sets: target.sets, reps: '10-12', match: 80 },
      { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', sets: target.sets, reps: '10-12/jambe', match: 75 },
      { id: 'hack_squat', name: 'Hack Squat', sets: target.sets, reps: '10-12', match: 82 },
    ],
    front_squat: [
      { id: 'squat', name: 'Squat barre', sets: target.sets, reps, match: 92 },
      { id: 'goblet_squat', name: 'Goblet Squat', sets: target.sets, reps, match: 88 },
      { id: 'hack_squat', name: 'Hack Squat', sets: target.sets, reps: '10-12', match: 80 },
    ],
    deadlift: [
      { id: 'sumo_deadlift', name: 'Soulevé de terre Sumo', sets: target.sets, reps, match: 92 },
      { id: 'romanian_deadlift', name: 'Soulevé de terre roumain', sets: target.sets, reps: '8-10', match: 85 },
      { id: 'rack_pull', name: 'Rack Pull', sets: target.sets, reps, match: 80 },
    ],
    romanian_deadlift: [
      { id: 'deadlift', name: 'Soulevé de terre', sets: target.sets, reps, match: 88 },
      { id: 'good_morning', name: 'Good Morning', sets: target.sets, reps, match: 80 },
      { id: 'cable_pull_through', name: 'Pull-through poulie basse', sets: target.sets, reps: '12-15', match: 75 },
    ],
    barbell_rows: [
      { id: 't_bar_row', name: 'T-Bar Row', sets: target.sets, reps, match: 92 },
      { id: 'pendlay_row', name: 'Pendlay Row', sets: target.sets, reps, match: 88 },
      { id: 'seated_cable_row', name: 'Rowing assis à la poulie', sets: target.sets, reps: '10-12', match: 80 },
    ],
    pull_ups: [
      { id: 'lat_pulldown', name: 'Tirage poulie haute', sets: target.sets, reps: '8-12', match: 90 },
      { id: 'barbell_rows', name: 'Tirage barre buste penché', sets: target.sets, reps, match: 75 },
    ],
    lat_pulldown: [
      { id: 'pull_ups', name: 'Tractions', sets: target.sets, reps: '6-10', match: 92 },
      { id: 'seated_cable_row', name: 'Rowing assis à la poulie', sets: target.sets, reps, match: 80 },
    ],
    overhead_press: [
      { id: 'seated_db_press', name: 'Développé épaules haltères', sets: target.sets, reps, match: 92 },
      { id: 'arnold_press', name: 'Arnold Press', sets: target.sets, reps, match: 85 },
      { id: 'push_press', name: 'Push Press', sets: target.sets, reps: '5-8', match: 80 },
    ],
    seated_db_press: [
      { id: 'overhead_press', name: 'Développé militaire barre', sets: target.sets, reps, match: 92 },
      { id: 'arnold_press', name: 'Arnold Press', sets: target.sets, reps, match: 90 },
    ],
    hip_thrust: [
      { id: 'single_leg_hip_thrust', name: 'Hip Thrust unilatéral', sets: target.sets, reps: '10-12/jambe', match: 90 },
      { id: 'glute_bridge', name: 'Glute Bridge', sets: target.sets, reps: '15-20', match: 80 },
      { id: 'cable_kickbacks', name: 'Cable Kickbacks', sets: target.sets, reps: '12-15/jambe', match: 70 },
    ],
    bicep_curls: [
      { id: 'hammer_curls', name: 'Curl marteau', sets: target.sets, reps, match: 92 },
      { id: 'barbell_curl', name: 'Curl barre', sets: target.sets, reps, match: 90 },
      { id: 'cable_curls', name: 'Curl à la poulie', sets: target.sets, reps, match: 85 },
    ],
    tricep_extensions: [
      { id: 'tricep_pushdown', name: 'Extensions triceps poulie', sets: target.sets, reps, match: 92 },
      { id: 'skull_crushers', name: 'Skull crushers', sets: target.sets, reps, match: 88 },
      { id: 'overhead_tricep_extension', name: 'Triceps overhead', sets: target.sets, reps, match: 85 },
    ],
  };
  return map[target.id] ?? [];
}
