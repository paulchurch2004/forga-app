// FORGA — Free tier quotas.
// Single source of truth for all free-vs-premium limits.
// Adjust here to A/B test pricing or tweak the funnel; do not hardcode
// limits in screens.

export const FREE_LIMITS = {
  /** Max meals a free user can validate per day. Beyond this → paywall. */
  mealsPerDay: 5,

  /** Days of meal history visible to a free user (rolling window). */
  mealHistoryDays: 14,

  /** Max progress photos a free user can store in total. */
  photosTotal: 3,

  /** Max body measurement entries a free user can keep. */
  measurementsTotal: 3,

  /** Max simultaneously active training programs a free user can have. */
  programsActive: 1,

  /** LLM coach interactions per day (only enforced when LLM is wired in v1.1+). */
  llmInteractionsPerDay: 5,

  /** Number of charts shown on the per-exercise progression page (premium = 3). */
  exerciseProgressCharts: 1,

  /** Free users cannot live-swap exercises mid-workout. */
  liveSwapEnabled: false,

  /** Free users cannot view the per-muscle volume breakdown in StatsSheet. */
  muscleVolumeEnabled: false,

  /** Free users cannot retake the strength test (one shot at onboarding). */
  strengthTestRetake: false,

  /** Free users cannot toggle Apple Health sync (when feature lands). */
  appleHealthSync: false,
} as const;

export type FreeFeature = keyof typeof FREE_LIMITS;
