import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTraining } from '../../src/hooks/useTraining';
import { useStreak } from '../../src/hooks/useStreak';
import { useT } from '../../src/i18n';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { WeeklyActivityBar } from '../../src/components/training/WeeklyActivityBar';
import { WorkoutCard } from '../../src/components/training/WorkoutCard';
import { QuickStats } from '../../src/components/training/QuickStats';

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { t } = useT();
  const styles = useStyles();
  const { currentStreak, isTodayValidated } = useStreak();
  const {
    recentWorkouts,
    weekBarData,
    weeklyCount,
    monthlyCount,
    favoriteType,
  } = useTraining();

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
        <View>
          <Text style={styles.pageTitle}>{t('trainingTitle')}</Text>
        </View>
        <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
      </View>

      {/* Weekly Activity Bar */}
      <WeeklyActivityBar weekData={weekBarData} />

      {/* CTA */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/log-workout')}
        >
          <Text style={styles.ctaIcon}>{'\uD83C\uDFCB\uFE0F'}</Text>
          <Text style={styles.ctaText}>{t('logWorkout')}</Text>
        </Pressable>
      </Animated.View>

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

      {/* Recent Workouts */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        {recentWorkouts.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>{t('recentWorkouts')}</Text>
            {recentWorkouts.map((w) => (
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
          </View>
        ) : (
          <EmptyState
            icon={'\uD83C\uDFCB\uFE0F'}
            title={t('noWorkoutsYet')}
            subtitle={t('noWorkoutsSubtitle')}
            actionLabel={t('startFirstWorkout')}
            onAction={() => router.push('/log-workout')}
          />
        )}
      </Animated.View>

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
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.text,
  },
  ctaButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  ctaIcon: {
    fontSize: 22,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.white,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
}));
