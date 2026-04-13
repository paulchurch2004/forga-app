import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { getWorkoutTypeKey } from '../../hooks/useTraining';
import type { WorkoutType } from '../../types/training';

interface Props {
  weeklyCount: number;
  monthlyCount: number;
  favoriteType: WorkoutType | null;
}

export function QuickStats({ weeklyCount, monthlyCount, favoriteType }: Props) {
  const styles = useStyles();
  const { t } = useT();

  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.pillValue}>{weeklyCount}</Text>
        <Text style={styles.pillLabel}>{t('sessionsThisWeek', { count: '' }).trim()}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillValue}>{monthlyCount}</Text>
        <Text style={styles.pillLabel}>{t('sessionsThisMonth', { count: '' }).trim()}</Text>
      </View>
      {favoriteType && (
        <View style={styles.pill}>
          <Text style={styles.pillValue}>{t(getWorkoutTypeKey(favoriteType) as any)}</Text>
          <Text style={styles.pillLabel}>{t('favoriteType')}</Text>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    gap: 2,
  },
  pillValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.text,
  },
  pillLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center' as const,
  },
}));
