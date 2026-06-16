import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { Glow } from '../ui/Glow';
import { BADGE_INFO, type BadgeType } from '../../types/user';

const BADGE_ICONS: Record<BadgeType, string> = {
  first_meal: '🍽',
  first_week: '🔥',
  first_kilo: '⚖',
  forgeron: '🔨',
  month_of_forge: '🏆',
};

interface BadgeCardProps {
  type: BadgeType;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: string; // e.g. "3/7 jours"
}

export function BadgeCard({ type, unlocked, unlockedAt, progress }: BadgeCardProps) {
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
      {/* Médaille 3D : halo + sphère biseautée (reflet haut / ombre bas) */}
      <Animated.View
        entering={unlocked ? ZoomIn.springify().damping(13) : undefined}
        style={styles.medalWrap}
      >
        {unlocked && <Glow color={color} size={66} intensity={0.5} style={styles.medalGlow} />}
        <View
          style={[
            styles.iconCircle,
            { borderColor: color, backgroundColor: unlocked ? `${color}22` : colors.surface },
          ]}
        >
          {unlocked && (
            <LinearGradient
              colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.30)']}
              start={{ x: 0.3, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={styles.medalSheen}
              pointerEvents="none"
            />
          )}
          <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{icon}</Text>
        </View>
      </Animated.View>

      <Text style={[styles.name, { color: unlocked ? colors.text : colors.textMuted }]} numberOfLines={2}>
        {info.name}
      </Text>
      {unlocked && unlockedAt ? (
        <Text style={styles.date}>
          {new Date(unlockedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </Text>
      ) : progress ? (
        <Text style={styles.progress}>{progress}</Text>
      ) : (
        <Text style={styles.locked}>{'🔒'}</Text>
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
  medalWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalGlow: {
    position: 'absolute',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
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
  progress: {
    fontFamily: fonts.data,
    fontSize: 9,
    fontWeight: '600',
    color: colors.primary,
  },
}));
