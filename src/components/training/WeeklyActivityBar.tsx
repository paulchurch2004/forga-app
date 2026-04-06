import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { getWorkoutTypeIcon } from '../../hooks/useTraining';
import type { WorkoutType } from '../../types/training';

interface DayData {
  date: string;
  dayLabel: string;
  hasWorkout: boolean;
  workoutTypes: WorkoutType[];
}

interface Props {
  weekData: DayData[];
}

export function WeeklyActivityBar({ weekData }: Props) {
  const styles = useStyles();
  const { t } = useT();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.container}>
      <Text style={styles.title}>{t('yourWeek')}</Text>
      <View style={styles.row}>
        {weekData.map((day) => {
          const isToday = day.date === todayStr;
          return (
            <View key={day.date} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {day.dayLabel}
              </Text>
              <View style={[
                styles.circle,
                day.hasWorkout && styles.circleFilled,
                isToday && !day.hasWorkout && styles.circleToday,
              ]}>
                {day.hasWorkout ? (
                  <Text style={styles.circleIcon}>
                    {getWorkoutTypeIcon(day.workoutTypes[0])}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  dayCol: {
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  dayLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700' as const,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  circleFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  circleToday: {
    borderColor: colors.primary,
    borderStyle: 'dashed' as const,
  },
  circleIcon: {
    fontSize: 16,
  },
}));
