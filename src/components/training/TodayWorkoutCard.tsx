import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import { estimateWorkoutDuration } from '../../engine/programEngine';
import { EXERCISES } from '../../data/exercises';
import { hasTutorial } from '../../data/exerciseTips';
import { ExerciseTutorialModal } from './ExerciseTutorialModal';
import type { PlannedDay, ProgramDay } from '../../types/program';
import Svg, { Path } from 'react-native-svg';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Medium)
  ).catch(() => {});
};

interface Props {
  todayPlan: PlannedDay;
  programDay: ProgramDay | null;
  onStartWorkout: () => void;
  onSkipDay?: () => void;
}

export function TodayWorkoutCard({ todayPlan, programDay, onStartWorkout, onSkipDay }: Props) {
  const styles = useStyles();
  const { t } = useT();
  const { colors } = useTheme();
  const [tutorialExerciseId, setTutorialExerciseId] = useState<string | null>(null);

  const isCompleted = todayPlan.status === 'completed';
  const isRest = todayPlan.status === 'rest' || !programDay;

  // Rest day
  if (isRest) {
    return (
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
        <View style={styles.innerContent}>
          <Text style={styles.dayName}>{t('restDayTitle')}</Text>
          <Text style={styles.restTip}>{t('restDayTip')}</Text>
        </View>
      </Animated.View>
    );
  }

  const isCardio = programDay.type === 'cardio';
  const duration = isCardio
    ? programDay.cardio?.durationMinutes ?? 25
    : estimateWorkoutDuration(programDay.exercises);

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
      <LinearGradient
        colors={[`${colors.primary}12`, colors.surface, colors.surface]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      >
        <View style={styles.innerContent}>
          <View style={styles.header}>
            <Text style={styles.sectionLabel}>{t('todayWorkout')}</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 6L9 17l-5-5"
                    stroke={colors.success}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.completedText}>{t('workoutCompleted')}</Text>
              </View>
            )}
          </View>

          <Text style={styles.dayName}>{t(programDay.nameKey as any)}</Text>

          <Text style={styles.meta}>
            {t('estimatedDuration', { minutes: duration })}
            {'  ·  '}
            {isCardio
              ? (programDay.cardio?.intensity ?? 'moderate')
              : t('exerciseCountPreview', { count: programDay.exercises.length })}
          </Text>

          {/* Exercise list for muscu */}
          {!isCardio && (
            <View style={styles.exerciseList}>
              {programDay.exercises.map((ex) => (
                <View key={ex.exerciseId} style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>
                    {t((EXERCISES[ex.exerciseId]?.nameKey ?? ex.exerciseId) as any)}
                  </Text>
                  <View style={styles.exerciseRowRight}>
                    {hasTutorial(ex.exerciseId) && (
                      <Pressable
                        onPress={() => {
                          triggerHaptic();
                          setTutorialExerciseId(ex.exerciseId);
                        }}
                        hitSlop={8}
                        style={styles.infoBtn}
                      >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 5a1 1 0 110 2 1 1 0 010-2zm-1 4h2v6h-2v-6z"
                            fill={colors.textMuted}
                          />
                        </Svg>
                      </Pressable>
                    )}
                    <Text style={styles.exerciseSets}>
                      {ex.targetSets}x{ex.targetReps}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cardio info */}
          {isCardio && programDay.cardio && (
            <View style={styles.cardioInfo}>
              <Text style={styles.cardioDetail}>
                {t((EXERCISES[programDay.cardio.exerciseId]?.nameKey ?? programDay.cardio.exerciseId) as any)}
                {'  ·  '}
                {programDay.cardio.durationMinutes} min
              </Text>
            </View>
          )}

          {/* Start + Skip buttons */}
          {!isCompleted && (
            <View style={styles.actionRow}>
              <Pressable
                style={styles.startBtn}
                onPress={() => {
                  triggerHaptic();
                  onStartWorkout();
                }}
              >
                <Text style={styles.startBtnText}>
                  {isCardio ? t('cardioSessionStart') : t('startWorkout')}
                </Text>
              </Pressable>
              {onSkipDay && (
                <Pressable
                  style={styles.skipDayBtn}
                  onPress={() => {
                    triggerHaptic();
                    onSkipDay();
                  }}
                >
                  <Text style={styles.skipDayText}>{t('skipDay')}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Exercise tutorial modal */}
          <ExerciseTutorialModal
            visible={tutorialExerciseId !== null}
            exerciseId={tutorialExerciseId}
            onClose={() => setTutorialExerciseId(null)}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    marginBottom: spacing.lg,
  },
  gradient: {
    borderRadius: borderRadius.lg,
  },
  innerContent: {
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
  },
  completedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  completedText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.success,
    letterSpacing: 1,
  },
  dayName: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  meta: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
  exerciseList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  exerciseRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}80`,
  },
  exerciseName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    flex: 1,
  },
  exerciseRowRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  infoBtn: {
    padding: spacing.xs,
  },
  exerciseSets: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  cardioInfo: {
    marginBottom: spacing.xl,
  },
  cardioDetail: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  restTip: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  startBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
  },
  startBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800' as const,
    color: colors.white,
    letterSpacing: 1,
  },
  skipDayBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  skipDayText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
}));
