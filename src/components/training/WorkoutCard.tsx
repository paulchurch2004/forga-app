import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { getWorkoutTypeIcon, getWorkoutTypeKey, getIntensityKey } from '../../hooks/useTraining';
import type { Workout } from '../../types/training';

interface Props {
  workout: Workout;
  onPress: () => void;
}

export function WorkoutCard({ workout, onPress }: Props) {
  const styles = useStyles();
  const { t } = useT();

  const dateLabel = getDateLabel(workout.date, t);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.icon}>{getWorkoutTypeIcon(workout.type)}</Text>
      <View style={styles.content}>
        <Text style={styles.typeName}>{t(getWorkoutTypeKey(workout.type) as any)}</Text>
        <Text style={styles.meta}>
          {dateLabel} {'\u00B7'} {t('durationMinutes', { count: workout.durationMinutes })} {'\u00B7'} {t(getIntensityKey(workout.intensity) as any)}
        </Text>
        {workout.type === 'musculation' && workout.exercises.length > 0 && (
          <Text style={styles.exercises}>
            {t('exercisesCount', { count: workout.exercises.length })}
          </Text>
        )}
      </View>
      <Text style={styles.arrow}>{'\u203A'}</Text>
    </Pressable>
  );
}

function getDateLabel(dateStr: string, t: (key: any, vars?: any) => string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return t('today');
  if (dateStr === yesterday) return t('yesterday');
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  typeName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exercises: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
}));
