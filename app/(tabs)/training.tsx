import React from 'react';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <ImageBackground
        source={{ uri: TRAINING_HEADER_IMAGE }}
        style={styles.headerBg}
        imageStyle={styles.headerBgImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', colors.background]}
          style={styles.headerOverlay}
        >
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>{t('trainingTitle')}</Text>
            {hasActivePlan && !isPlanExpired && (
              <Text style={styles.weekBadge}>
                {t('weekLabel', { current: currentWeek })}
              </Text>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>

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
