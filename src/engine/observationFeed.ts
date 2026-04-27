// Coach Présence — observation feed engine.
// Pure function: scans the user's recent activity across all stores,
// returns a typed list of "things FORGA noticed" with timestamps.
//
// Each detector is independent and contributes 0..N observations.
// Final feed is sorted by recency and capped, so we never spam the UI.

import { EXERCISES } from '../data/exercises';
import type { Workout } from '../types/training';
import type { DailyMeal } from '../types/meal';
import type { WeeklyCheckIn, UserProfile } from '../types/user';

export interface CoachObservation {
  id: string;
  timestamp: Date; // when the underlying event happened
  tag: 'Nutrition' | 'Workout' | 'Check-in' | 'Hydratation' | 'Habitude' | 'Streak';
  color: string;
  title: string;
  body: string;
}

const TAG_COLORS: Record<CoachObservation['tag'], string> = {
  Nutrition: '#FF6B35',
  Workout: '#FFB870',
  'Check-in': '#00D4AA',
  Hydratation: '#5B8BFF',
  Habitude: '#5B8BFF',
  Streak: '#FFC94D',
};

export interface ObservationFeedInput {
  profile: UserProfile | null;
  workoutsByDate: Record<string, Workout[]>;
  mealsByDate: Record<string, DailyMeal[]>;
  waterByDate: Record<string, { amount: number; timestamp: string }[]>;
  checkIns: WeeklyCheckIn[];
  todayIso: string; // 'YYYY-MM-DD'
  /** i18n resolver for exercise name keys. Falls back to id if undefined. */
  tExercise?: (key: string) => string;
}

const MAX_OBSERVATIONS = 6;
const FEED_WINDOW_DAYS = 7;

// ─── Public API ───────────────────────────────────────────────

export function computeObservations(input: ObservationFeedInput): CoachObservation[] {
  const observations: CoachObservation[] = [
    ...detectRecentPR(input),
    ...detectMacroMilestone(input),
    ...detectSessionDone(input),
    ...detectSleepTrend(input),
    ...detectHydrationTrend(input),
    ...detectStreakMilestone(input),
  ];

  return observations
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, MAX_OBSERVATIONS);
}

// ─── Detectors ────────────────────────────────────────────────

/**
 * Scan workouts from the last FEED_WINDOW_DAYS. For each exercise touched,
 * if the heaviest set in that workout beats every set logged before that
 * workout, emit a PR observation.
 */
function detectRecentPR(input: ObservationFeedInput): CoachObservation[] {
  const out: CoachObservation[] = [];
  const cutoff = daysAgoIso(input.todayIso, FEED_WINDOW_DAYS);

  // Flatten + sort all workouts chronologically so "before this one" is well-defined.
  const all: Workout[] = [];
  for (const list of Object.values(input.workoutsByDate)) {
    for (const w of list) all.push(w);
  }
  all.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Track running PR per exerciseId as we iterate forward in time.
  const runningPR: Record<string, number> = {};
  for (const w of all) {
    if (w.date < cutoff) {
      // Pre-window workouts only update the baseline, no observation emitted.
      for (const ex of w.exercises) {
        const max = ex.sets.reduce((m, s) => Math.max(m, s.weight ?? 0), 0);
        if (max > (runningPR[ex.exerciseId] ?? 0)) runningPR[ex.exerciseId] = max;
      }
      continue;
    }
    for (const ex of w.exercises) {
      const sets = ex.sets;
      const maxSet = sets.reduce((m, s) => ((s.weight ?? 0) > (m?.weight ?? 0) ? s : m), sets[0]);
      if (!maxSet) continue;
      const previous = runningPR[ex.exerciseId] ?? 0;
      if ((maxSet.weight ?? 0) > previous && (maxSet.weight ?? 0) > 0) {
        const exerciseName =
          input.tExercise && EXERCISES[ex.exerciseId]?.nameKey
            ? input.tExercise(EXERCISES[ex.exerciseId].nameKey)
            : EXERCISES[ex.exerciseId]?.nameKey ?? ex.exerciseId;
        const delta = previous > 0 ? Math.round((maxSet.weight - previous) * 10) / 10 : null;
        out.push({
          id: `pr-${w.id}-${ex.exerciseId}`,
          timestamp: new Date(w.timestamp),
          tag: 'Workout',
          color: TAG_COLORS.Workout,
          title: previous > 0 ? `Nouveau PR · ${exerciseName}` : `Premier set lourd · ${exerciseName}`,
          body:
            previous > 0
              ? `${maxSet.weight}kg × ${maxSet.reps} (+${delta}kg vs ton record précédent).`
              : `${maxSet.weight}kg × ${maxSet.reps}. Premier ancrage sur cet exercice.`,
        });
        runningPR[ex.exerciseId] = maxSet.weight;
      } else {
        const max = sets.reduce((m, s) => Math.max(m, s.weight ?? 0), 0);
        if (max > previous) runningPR[ex.exerciseId] = max;
      }
    }
  }
  return out;
}

/**
 * Today's macros — observation if protein has hit a milestone (50/80/100%).
 */
function detectMacroMilestone(input: ObservationFeedInput): CoachObservation[] {
  const target = input.profile?.dailyProtein;
  if (!target || target <= 0) return [];

  const todayMeals = input.mealsByDate[input.todayIso] ?? [];
  if (todayMeals.length === 0) return [];

  const consumed = todayMeals.reduce((s, m) => s + m.actualMacros.protein, 0);
  const pct = consumed / target;

  let milestone: { pct: number; label: string } | null = null;
  if (pct >= 1) milestone = { pct: 1, label: 'Objectif protéines atteint' };
  else if (pct >= 0.8) milestone = { pct: 0.8, label: 'Objectif protéines presque atteint' };
  else if (pct >= 0.5) milestone = { pct: 0.5, label: 'Mi-chemin protéines' };
  else return [];

  // Anchor timestamp on the most recent meal so the "il y a X min" is meaningful.
  const lastMeal = [...todayMeals].sort((a, b) => b.validatedAt.localeCompare(a.validatedAt))[0];
  return [
    {
      id: `protein-${milestone.pct}-${input.todayIso}`,
      timestamp: new Date(lastMeal.validatedAt),
      tag: 'Nutrition',
      color: TAG_COLORS.Nutrition,
      title: milestone.label,
      body: `${Math.round(consumed)}g sur ${target}g aujourd'hui.`,
    },
  ];
}

/**
 * Workout completed today or yesterday — observation with duration + volume.
 */
function detectSessionDone(input: ObservationFeedInput): CoachObservation[] {
  const out: CoachObservation[] = [];
  for (const offset of [0, 1]) {
    const iso = daysAgoIso(input.todayIso, offset);
    const list = input.workoutsByDate[iso] ?? [];
    for (const w of list) {
      const totalVol = w.exercises.reduce(
        (acc, ex) => acc + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0),
        0
      );
      out.push({
        id: `session-${w.id}`,
        timestamp: new Date(w.timestamp),
        tag: 'Workout',
        color: TAG_COLORS.Workout,
        title: offset === 0 ? 'Séance bouclée' : 'Séance bouclée hier',
        body: totalVol > 0
          ? `${w.durationMinutes ?? '—'} min · ${Math.round(totalVol).toLocaleString('fr-FR')} kg de volume.`
          : `${w.durationMinutes ?? '—'} min de ${w.type}.`,
      });
    }
  }
  return out;
}

/**
 * Compare last check-in's sleep score to the previous one.
 * Sleep is 1-4 in WeeklyCheckIn; we surface a meaningful change.
 */
function detectSleepTrend(input: ObservationFeedInput): CoachObservation[] {
  if (input.checkIns.length < 2) return [];
  const sorted = [...input.checkIns].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const delta = last.sleep - prev.sleep;
  if (Math.abs(delta) < 1) return [];

  return [
    {
      id: `sleep-${last.id}`,
      timestamp: new Date(last.createdAt),
      tag: 'Check-in',
      color: TAG_COLORS['Check-in'],
      title: delta > 0 ? 'Sommeil en hausse' : 'Sommeil en baisse',
      body:
        delta > 0
          ? `Tu dors mieux que la semaine passée. Bon timing pour pousser un peu.`
          : `Sommeil dégradé vs la semaine passée. Ne force pas l'intensité aujourd'hui.`,
    },
  ];
}

/**
 * Compare hydration this week vs last week (avg ml/day).
 */
function detectHydrationTrend(input: ObservationFeedInput): CoachObservation[] {
  const thisWeek: number[] = [];
  const lastWeek: number[] = [];
  for (let i = 0; i < 7; i++) {
    const t = totalForDate(input.waterByDate, daysAgoIso(input.todayIso, i));
    if (t > 0) thisWeek.push(t);
  }
  for (let i = 7; i < 14; i++) {
    const t = totalForDate(input.waterByDate, daysAgoIso(input.todayIso, i));
    if (t > 0) lastWeek.push(t);
  }
  if (thisWeek.length < 3 || lastWeek.length < 3) return [];

  const avgThis = thisWeek.reduce((s, x) => s + x, 0) / thisWeek.length;
  const avgLast = lastWeek.reduce((s, x) => s + x, 0) / lastWeek.length;
  const deltaPct = ((avgThis - avgLast) / avgLast) * 100;
  if (Math.abs(deltaPct) < 15) return [];

  return [
    {
      id: `hydration-${input.todayIso}`,
      timestamp: new Date(),
      tag: 'Hydratation',
      color: TAG_COLORS.Hydratation,
      title: deltaPct > 0 ? 'Hydratation en progrès' : 'Hydratation en baisse',
      body: `${(avgThis / 1000).toFixed(1)}L/jour cette semaine (${
        deltaPct > 0 ? '+' : ''
      }${Math.round(deltaPct)}% vs semaine passée).`,
    },
  ];
}

/**
 * Surface streak milestones when crossed (7, 14, 30, 60, 100).
 */
function detectStreakMilestone(input: ObservationFeedInput): CoachObservation[] {
  const streak = input.profile?.currentStreak ?? 0;
  const milestones = [100, 60, 30, 14, 7];
  const hit = milestones.find((m) => streak === m || (streak > m && streak < m + 1));
  if (!hit) return [];

  return [
    {
      id: `streak-${hit}`,
      timestamp: new Date(),
      tag: 'Streak',
      color: TAG_COLORS.Streak,
      title: `${hit} jours d'affilée`,
      body:
        hit >= 30
          ? `Mois de Forge atteint. Le système est calibré sur toi maintenant.`
          : `Ta consistance commence à parler. Garde le cap.`,
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────

function daysAgoIso(todayIso: string, n: number): string {
  const d = new Date(todayIso + 'T00:00:00');
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function totalForDate(
  waterByDate: Record<string, { amount: number; timestamp: string }[]>,
  iso: string
): number {
  const entries = waterByDate[iso] ?? [];
  return entries.reduce((s, e) => s + e.amount, 0);
}

/**
 * Format an absolute timestamp into a French relative label.
 * Used by the consumer (PresenceView expects pre-formatted timeLabel).
 */
export function formatTimeAgo(ts: Date, now: Date = new Date()): string {
  const diffSec = (now.getTime() - ts.getTime()) / 1000;
  if (diffSec < 60) return "À l'instant";
  if (diffSec < 3600) return `Il y a ${Math.round(diffSec / 60)} min`;
  if (diffSec < 86400) return `Il y a ${Math.round(diffSec / 3600)}h`;

  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    return days[ts.getDay()].charAt(0).toUpperCase() + days[ts.getDay()].slice(1);
  }
  return `Il y a ${diffDays}j`;
}
