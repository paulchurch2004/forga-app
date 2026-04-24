import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTraining } from '../../src/hooks/useTraining';
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
        /* ── Mode B: Active Plan ── */
        <>
          {/* Current program card */}
          {activeProgram && (
            <ProgramCard
              program={activeProgram}
              onChangePress={changeProgram}
            />
          )}

          {/* Weekly grid — redesign : 7 carrés colorés par status */}
          {weekDays.length > 0 && (
            <Animated.View  style={{ marginTop: spacing.md }}>
              <WeeklyDaysGrid
                days={weekDays.map<WeekDayItem>((d) => {
                  const date = new Date(d.date);
                  const dayLetters = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
                  const status: DayStatus =
                    d.status === 'completed' ? 'done'
                    : d.status === 'today' ? 'today'
                    : d.status === 'rest' ? 'rest'
                    : 'plan';
                  return { letter: dayLetters[date.getDay()], status };
                })}
              />
            </Animated.View>
          )}

          {/* Séance du jour — redesign : intention quote + 3 exos preview + CTA */}
          {todayPlan && todayProgramDay && (
            <Animated.View  style={{ marginTop: spacing.md }}>
              <Text style={styles.sectionTitle}>SÉANCE DU JOUR</Text>
              <TodayWorkoutPreview
                type={`${t(todayProgramDay.nameKey as any)} · ${todayProgramDay.exercises.length * 12} min`}
                title={todayProgramDay.muscleGroups.map((g) => t(`muscle_${g}` as any)).join(' & ')}
                intention={`Consolider ta séance ${t(todayProgramDay.nameKey as any).toLowerCase()}. On garde l'intensité, on soigne l'exécution.`}
                exercises={todayProgramDay.exercises.map<ExercisePreview>((e) => ({
                  id: e.exerciseId,
                  name: EXERCISES[e.exerciseId]?.nameFr ?? e.exerciseId,
                  sets: e.targetSets,
                  reps: String(e.targetReps),
                }))}
                totalExercises={todayProgramDay.exercises.length}
                onStart={handleStartWorkout}
              />
            </Animated.View>
          )}

          {/* Fallback if no programDay (rest day) */}
          {todayPlan && !todayProgramDay && (
            <TodayWorkoutCard
              todayPlan={todayPlan}
              programDay={todayProgramDay}
              onStartWorkout={handleStartWorkout}
              onSkipDay={handleSkipDay}
            />
          )}

          {/* Quick Stats */}
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
