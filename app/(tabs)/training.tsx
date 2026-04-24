import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTraining } from '../../src/hooks/useTraining';
import { useStreak } from '../../src/hooks/useStreak';
import { useProgram } from '../../src/hooks/useProgram';
import { useProgramStore } from '../../src/store/programStore';
import { useUserStore } from '../../src/store/userStore';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { ProgramSelector } from '../../src/components/training/ProgramSelector';
import { ProgramCard } from '../../src/components/training/ProgramCard';
import { WeeklyPlanCalendar } from '../../src/components/training/WeeklyPlanCalendar';
import { TodayWorkoutCard } from '../../src/components/training/TodayWorkoutCard';
import { WorkoutCard } from '../../src/components/training/WorkoutCard';
import { QuickStats } from '../../src/components/training/QuickStats';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { WeeklyDaysGrid, type WeekDayItem, type DayStatus } from '../../src/components/training/WeeklyDaysGrid';
import { TodayWorkoutPreview, type ExercisePreview } from '../../src/components/training/TodayWorkoutPreview';
import { SessionHistoryList, type SessionHistoryItem } from '../../src/components/training/SessionHistoryList';
import { TrainingHero } from '../../src/components/training/TrainingHero';
import { WeekNavigator } from '../../src/components/training/WeekNavigator';
import { WeekDayCalendar, type WeekCalendarDay, type WeekDayStatus } from '../../src/components/training/WeekDayCalendar';
import { QuickStatsRow, type QuickStatItem } from '../../src/components/training/QuickStatsRow';
import { SelectedDayCard, type SelectedDayState, type SelectedDayExercise } from '../../src/components/training/SelectedDayCard';
import { EXERCISES } from '../../src/data/exercises';

const TRAINING_HEADER_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Light)
  ).catch(() => {});
};

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { t } = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  const profile = useUserStore((s) => s.profile);
  const {
    recentWorkouts,
    weeklyCount,
    monthlyCount,
    favoriteType,
  } = useTraining();
  const {
    hasActivePlan,
    activeProgram,
    recommendedProgramId,
    currentWeek,
    todayPlan,
    todayProgramDay,
    weekDays,
    isPlanExpired,
    selectProgram,
    changeProgram,
  } = useProgram();

  const objective = profile?.objective ?? 'maintain';
  const markDaySkipped = useProgramStore((s) => s.markDaySkipped);

  // ─── Week navigator + calendar state ─────────────────────────
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const calendarDays = useMemo<WeekCalendarDay[]>(() => {
    const today = new Date();
    const todayDow = (today.getDay() + 6) % 7; // 0=Mon..6=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayDow + weekOffset * 7);

    const letters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const planDay = weekDays.find((p) => {
        const pd = new Date(p.date);
        return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth() && pd.getDate() === d.getDate();
      });
      let status: WeekDayStatus = 'plan';
      if (planDay) {
        if (planDay.status === 'completed') status = 'done';
        else if (planDay.status === 'today') status = 'today';
        else if (planDay.status === 'rest') status = 'rest';
        else if (planDay.status === 'skipped') status = 'skipped';
      } else {
        // No plan loaded: still show today/rest based on the date
        const isToday = d.toDateString() === today.toDateString();
        if (isToday) status = 'today';
        else status = 'rest';
      }
      return {
        letter: letters[i],
        date: String(d.getDate()),
        status,
      };
    });
  }, [weekDays, weekOffset]);

  // Auto-select today when offset = 0 on first render
  React.useEffect(() => {
    if (selectedDayIndex !== null) return;
    const todayIdx = calendarDays.findIndex((d) => d.status === 'today');
    if (todayIdx >= 0) setSelectedDayIndex(todayIdx);
  }, [calendarDays, selectedDayIndex]);

  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const todayDow = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayDow + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'short' })}`;
    return `${monday.getDate()} — ${fmt(sunday)}`;
  }, [weekOffset]);

  const weekOffsetLabel = useMemo(() => {
    if (weekOffset === 0) return 'Cette semaine';
    if (weekOffset < 0) return `Il y a ${-weekOffset} sem.`;
    return `Dans ${weekOffset} sem.`;
  }, [weekOffset]);

  // ─── Stats for QuickStatsRow ──────────────────────────────────
  const { currentStreak, bestStreak } = useStreak();
  const weeklyVolumeKg = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return Math.round(
      recentWorkouts
        .filter((w) => new Date(w.date) >= cutoff)
        .reduce(
          (acc, w) =>
            acc +
            w.exercises.reduce(
              (s, ex) => s + ex.sets.reduce((ss, set) => ss + (set.weight ?? 0) * (set.reps ?? 0), 0),
              0
            ),
          0
        )
    );
  }, [recentWorkouts]);
  const weeklyVolumeTargetKg = activeProgram ? activeProgram.daysPerWeek * 4500 : 0;

  // ─── Selected day card data (today / done / rest / plan) ─────
  const selectedDayCardData = useMemo(() => {
    const day = selectedDayIndex !== null ? calendarDays[selectedDayIndex] : null;
    const isSelectedToday = day?.status === 'today';
    const isSelectedDone = day?.status === 'done';
    const isSelectedRest = day?.status === 'rest';

    let state: SelectedDayState = 'plan';
    if (isSelectedRest) state = 'rest';
    else if (isSelectedDone) state = 'done';
    else if (isSelectedToday) state = 'today';

    const sectionLabel = isSelectedToday
      ? 'SÉANCE DU JOUR'
      : isSelectedDone
      ? 'SÉANCE TERMINÉE'
      : isSelectedRest
      ? 'JOUR DE REPOS'
      : 'SÉANCE PRÉVUE';

    const typeLabel = todayProgramDay ? t(todayProgramDay.nameKey as any) : '';
    const durationMin = todayProgramDay ? todayProgramDay.exercises.length * 12 : 0;
    const title = todayProgramDay
      ? todayProgramDay.muscleGroups.map((g) => t(`muscle_${g}` as any)).join(' & ')
      : typeLabel;

    const exercisesPreview: SelectedDayExercise[] | undefined = todayProgramDay
      ? todayProgramDay.exercises.map((e) => ({
          id: e.exerciseId,
          name: EXERCISES[e.exerciseId]?.nameFr ?? e.exerciseId,
          sets: e.targetSets,
          reps: String(e.targetReps),
          restSec: e.restSeconds,
        }))
      : undefined;

    return {
      state,
      sectionLabel,
      typeLabel,
      durationMin,
      title,
      intentionQuote: isSelectedToday
        ? `Consolider ta séance ${typeLabel.toLowerCase()}. On garde l'intensité, on soigne l'exécution.`
        : undefined,
      muscleChips: todayProgramDay?.muscleGroups.map((g) => t(`muscle_${g}` as any)),
      exercisesPreview,
      totalExercises: todayProgramDay?.exercises.length,
      volumeKg: undefined,
    };
  }, [calendarDays, selectedDayIndex, todayProgramDay, t]);

  // ─── Header data for the new TrainingHero ────────────────────
  const heroData = useMemo(() => {
    const date = new Date();
    const dateLabel = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const programName = activeProgram ? t(activeProgram.nameKey as any) : t('selectProgram' as any);
    const totalWeeks = 8;
    const weekLabel = hasActivePlan ? `Semaine ${currentWeek} / ${totalWeeks}` : '';
    const subtitle = todayProgramDay
      ? `${t(todayProgramDay.nameKey as any)} · ${todayProgramDay.exercises.length * 12} min prévues`
      : todayPlan?.status === 'rest'
      ? 'Jour de repos'
      : 'Pas de séance';
    return { dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1), programName, weekLabel, subtitle };
  }, [activeProgram, currentWeek, hasActivePlan, todayPlan, todayProgramDay, t]);

  const handleSkipDay = () => {
    if (!todayPlan) return;
    triggerHaptic();
    markDaySkipped(todayPlan.date);
  };

  const handleStartWorkout = () => {
    if (!todayPlan || !todayProgramDay) return;
    triggerHaptic();
    router.push({
      pathname: '/active-workout',
      params: {
        programDayId: todayPlan.programDayId ?? '',
        date: todayPlan.date,
        programId: hasActivePlan ? (activeProgram?.id ?? '') : '',
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* New Hero v2 — full bleed image + program pill + history button + date block */}
      <TrainingHero
        weekLabel={heroData.weekLabel || (hasActivePlan ? '' : ' ')}
        dateLabel={heroData.dateLabel}
        subtitle={heroData.subtitle}
        programName={heroData.programName}
        onProgramPress={() => {
          triggerHaptic();
          changeProgram();
        }}
        onHistoryPress={() => {
          triggerHaptic();
          // Open recent workouts list — for now scroll into view; sheet to come.
        }}
      />

    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Week navigator + 7-day calendar (always shown when a plan exists) */}
      {hasActivePlan && !isPlanExpired && (
        <View style={{ paddingTop: 18 }}>
          <WeekNavigator
            label={weekOffsetLabel}
            rangeLabel={weekRangeLabel}
            onPrev={() => setWeekOffset((w) => w - 1)}
            onNext={() => setWeekOffset((w) => w + 1)}
          />
          <WeekDayCalendar
            days={calendarDays}
            selectedIndex={selectedDayIndex ?? 0}
            onSelect={(i) => setSelectedDayIndex(i)}
          />
        </View>
      )}

      {!hasActivePlan || isPlanExpired ? (
        /* ── Mode A: Program Selection ── */
        <Animated.View entering={FadeInDown.duration(400)}>
          {isPlanExpired && (
            <View style={styles.expiredBanner}>
              <Text style={styles.expiredTitle}>{t('planExpired')}</Text>
              <Text style={styles.expiredSub}>{t('planExpiredSub')}</Text>
            </View>
          )}

          <ProgramSelector
            recommendedId={recommendedProgramId}
            objective={objective}
            onSelect={selectProgram}
          />

          {/* Manual workout always accessible */}
          <Pressable
            style={styles.manualBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/log-workout');
            }}
          >
            <Text style={styles.manualBtnText}>
              {t('logManualWorkout')} {'\u2192'}
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        /* ── Mode B: Active Plan (V2 design) ── */
        <>
          {/* Quick stats row : 3 mini cards (Volume / Sessions / Streak) */}
          <QuickStatsRow
            items={[
              {
                id: 'volume',
                label: 'Volume',
                value: weeklyVolumeKg >= 1000 ? (weeklyVolumeKg / 1000).toFixed(1) : String(weeklyVolumeKg),
                unit: weeklyVolumeKg >= 1000 ? 'k' : 'kg',
                hint: weeklyVolumeTargetKg > 0 ? `${Math.round((weeklyVolumeKg / weeklyVolumeTargetKg) * 100)}% obj.` : undefined,
              },
              {
                id: 'sessions',
                label: 'Séances',
                value: String(weeklyCount),
                unit: hasActivePlan && activeProgram ? `/${activeProgram.daysPerWeek}` : undefined,
                hint: weeklyCount > 0 ? 'Sur les rails' : undefined,
                hintColor: 'rgba(255,255,255,0.38)',
              },
              {
                id: 'streak',
                label: 'Streak',
                value: String(currentStreak),
                unit: 'j',
                hint: currentStreak >= bestStreak && currentStreak > 0 ? 'Record ✦' : undefined,
                hintColor: 'rgba(255,255,255,0.38)',
              },
            ]}
          />

          {/* Section label for the selected-day card */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {selectedDayCardData.sectionLabel}
          </Text>

          {/* Selected day card — switches between today / done / rest / plan */}
          <SelectedDayCard
            state={selectedDayCardData.state}
            typeLabel={selectedDayCardData.typeLabel}
            durationMin={selectedDayCardData.durationMin}
            title={selectedDayCardData.title}
            intentionQuote={selectedDayCardData.intentionQuote}
            muscleChips={selectedDayCardData.muscleChips}
            exercisesPreview={selectedDayCardData.exercisesPreview}
            totalExercises={selectedDayCardData.totalExercises}
            volumeKg={selectedDayCardData.volumeKg}
            onStart={handleStartWorkout}
            onActions={() => triggerHaptic()}
            onMoveUp={() => triggerHaptic()}
            onSkip={handleSkipDay}
            onSeeSummary={() => router.back()}
            onDuplicate={() => triggerHaptic()}
            onForceWorkout={() => router.push('/log-workout')}
          />

          {/* Quick Stats (legacy — kept while history list lives below) */}
          {recentWorkouts.length > 0 && (
            <Animated.View >
              <QuickStats
                weeklyCount={weeklyCount}
                monthlyCount={monthlyCount}
                favoriteType={favoriteType}
              />
            </Animated.View>
          )}

          {/* Recent history — redesign list */}
          {recentWorkouts.length > 0 ? (
            <Animated.View  style={{ marginTop: spacing.md }}>
              <Text style={styles.sectionTitle}>{t('recentWorkouts')}</Text>
              <SessionHistoryList
                items={recentWorkouts.slice(0, 5).map<SessionHistoryItem>((w) => {
                  const date = new Date(w.date);
                  const today = new Date();
                  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  const dateLabel = diffDays === 0 ? 'Aujourd\'hui' : diffDays === 1 ? 'Hier' : diffDays === 2 ? 'Avant-hier' : `Il y a ${diffDays}j`;
                  const totalVol = w.exercises.reduce((acc, ex) => acc + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0), 0);
                  return {
                    id: w.id,
                    name: w.name ?? t('workoutLabel'),
                    dateLabel: `${dateLabel} · ${w.durationMinutes ?? '—'} min`,
                    volumeLabel: totalVol > 0 ? `${totalVol.toLocaleString('fr-FR')} kg vol` : '',
                    onPress: () => router.push({ pathname: '/workout-detail', params: { workoutId: w.id, date: w.date } }),
                  };
                })}
              />
            </Animated.View>
          ) : (
            <Animated.View >
              <EmptyState
                icon={'\uD83D\uDCAA'}
                title={t('noWorkoutsYet')}
                subtitle={t('noWorkoutsYetSub')}
                actionLabel={t('logManualWorkout')}
                onAction={() => router.push('/log-workout')}
              />
            </Animated.View>
          )}

          {/* Manual workout button */}
          <Animated.View >
            <Pressable
              style={styles.manualBtn}
              onPress={() => {
                triggerHaptic();
                router.push('/log-workout');
              }}
            >
              <Text style={styles.manualBtnText}>
                {t('logManualWorkout')} {'\u2192'}
              </Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center' as const,
    width: '100%' as any,
  },
  headerBg: {
    width: '100%',
    height: 140,
    marginBottom: spacing.lg,
  },
  headerBgImage: {
    borderRadius: borderRadius.xl,
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.white,
  },
  weekBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 1,
  },
  expiredBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  expiredTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  expiredSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },
  manualBtn: {
    alignSelf: 'center' as const,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  manualBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
}));
