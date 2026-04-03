import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { BADGE_INFO, type BadgeType } from '../../types/user';

const BADGE_ICONS: Record<BadgeType, string> = {
  first_meal: '\uD83C\uDF7D',
  first_week: '\uD83D\uDD25',
  first_kilo: '\u2696',
  forgeron: '\uD83D\uDD28',
  month_of_forge: '\uD83C\uDFC6',
};

interface BadgeCardProps {
  type: BadgeType;
  unlocked: boolean;
  unlockedAt?: string;
}

export function BadgeCard({ type, unlocked, unlockedAt }: BadgeCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const info = BADGE_INFO[type];
  const icon = BADGE_ICONS[type];

  const BADGE_COLORS: Record<BadgeType, string> = {
    first_meal: colors.success,
    first_week: colors.primary,
    first_kilo: colors.carbs,
    forgeron: colors.fat,
    month_of_forge: '#FFD700',
  };

  const color = unlocked ? BADGE_COLORS[type] : colors.textMuted;

  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <View style={[styles.iconCircle, { borderColor: color, backgroundColor: unlocked ? `${color}20` : colors.surface }]}>
        <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{icon}</Text>
      </View>
      <Text style={[styles.name, { color: unlocked ? colors.text : colors.textMuted }]} numberOfLines={2}>
        {info.name}
      </Text>
      {unlocked && unlockedAt ? (
        <Text style={styles.date}>
          {new Date(unlockedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Text>
      ) : (
        <Text style={styles.locked}>{unlocked ? '' : '\uD83D\uDD12'}</Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    minWidth: 90,
  },
  cardLocked: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  iconLocked: {
    opacity: 0.4,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  date: {
    fontFamily: fonts.data,
    fontSize: 9,
    color: colors.textMuted,
  },
  locked: {
    fontSize: 12,
  },
}));
