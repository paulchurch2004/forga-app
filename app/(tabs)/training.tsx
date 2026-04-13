import React from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTraining } from '../../src/hooks/useTraining';
import { useProgram } from '../../src/hooks/useProgram';
import { useUserStore } from '../../src/store/userStore';
import { useT } from '../../src/i18n';
import { ProgramSelector } from '../../src/components/training/ProgramSelector';
import { ProgramCard } from '../../src/components/training/ProgramCard';
import { WeeklyPlanCalendar } from '../../src/components/training/WeeklyPlanCalendar';
import { TodayWorkoutCard } from '../../src/components/training/TodayWorkoutCard';
import { WorkoutCard } from '../../src/components/training/WorkoutCard';
import { QuickStats } from '../../src/components/training/QuickStats';

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
        { paddingTop: insets.top + spacing.md, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>{t('trainingTitle')}</Text>
        {hasActivePlan && !isPlanExpired && (
          <Text style={styles.weekBadge}>
            {t('weekLabel', { current: currentWeek })}
          </Text>
        )}
      </View>

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

          {/* Weekly calendar */}
          {weekDays.length > 0 && (
            <WeeklyPlanCalendar weekDays={weekDays} />
          )}

          {/* Today's workout */}
          {todayPlan && (
            <TodayWorkoutCard
              todayPlan={todayPlan}
              programDay={todayProgramDay}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {/* Quick Stats */}
          {recentWorkouts.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <QuickStats
                weeklyCount={weeklyCount}
                monthlyCount={monthlyCount}
                favoriteType={favoriteType}
              />
            </Animated.View>
          )}

          {/* Recent history */}
          {recentWorkouts.length > 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Text style={styles.sectionTitle}>{t('recentWorkouts')}</Text>
              {recentWorkouts.slice(0, 3).map((w) => (
                <WorkoutCard
                  key={w.id}
                  workout={w}
                  onPress={() =>
                    router.push({
                      pathname: '/workout-detail',
                      params: { workoutId: w.id, date: w.date },
                    })
                  }
                />
              ))}
            </Animated.View>
          )}

          {/* Manual workout button */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
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
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.text,
  },
  weekBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 1,
  },
  expiredBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
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
