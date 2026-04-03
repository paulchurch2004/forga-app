import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';

export interface StreakBadgeProps {
  /** Number of consecutive days */
  streak: number;
  /** Whether the streak is currently active (triggers glow animation) */
  isActive?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { iconSize: 16, fontSize: fontSizes.sm, paddingH: spacing.sm, paddingV: spacing.xs, gap: 4 },
  md: { iconSize: 22, fontSize: fontSizes.md, paddingH: spacing.md, paddingV: spacing.sm, gap: 6 },
  lg: { iconSize: 28, fontSize: fontSizes.lg, paddingH: spacing.lg, paddingV: spacing.md, gap: 8 },
};

function FlameIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M12 23C7.58 23 4 19.42 4 15c0-2.79 1.64-5.13 2.94-6.7.63-.76 1.35-1.46 2.06-2.06.28-.24.73-.08.78.28.19 1.31.92 2.48 1.97 3.23.13.09.3.05.38-.09.56-.96.84-2.06.84-3.16 0-.64-.08-1.28-.24-1.89-.1-.38.28-.7.62-.48C15.78 6.16 20 10.11 20 15c0 4.42-3.58 8-8 8zm0-2c3.31 0 6-2.69 6-6 0-3.08-2.31-5.82-4.63-7.52.06.53.04 1.08-.07 1.62-.22 1.08-.73 2.08-1.47 2.88-.55.6-1.32.44-1.7-.13-.67-1.01-1.07-2.19-1.13-3.4C7.79 10.38 6 12.57 6 15c0 3.31 2.69 6 6 6z"
      />
    </Svg>
  );
}

export function StreakBadge({
  streak,
  isActive = true,
  size = 'md',
}: StreakBadgeProps) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();
  const config = SIZE_CONFIG[size];
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const entryScale = useSharedValue(0.8);

  useEffect(() => {
    // Entry animation
    entryScale.value = withSpring(1, { damping: 12, stiffness: 200 });

    if (isActive && streak > 0) {
      // Pulse animation for active streaks
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // infinite
        true,
      );

      // Glow animation
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [isActive, streak, pulseScale, glowOpacity, entryScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: entryScale.value }],
  }));

  const flameAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
  }));

  const flameColor = streak >= 30
    ? '#FFD700' // gold for 30+ days
    : streak >= 7
      ? colors.primary
      : streak > 0
        ? colors.primaryLight
        : colors.textMuted;

  const formatStreak = (days: number): string => {
    if (days === 0) return t('streakDayZero');
    if (days === 1) return t('streakDaySingular');
    return t('streakDayPlural', { count: days });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingHorizontal: config.paddingH,
          paddingVertical: config.paddingV,
        },
        containerAnimatedStyle,
      ]}
    >
      <Animated.View style={flameAnimatedStyle}>
        <FlameIcon size={config.iconSize} color={flameColor} />
      </Animated.View>
      <View style={{ width: config.gap }} />
      <Text
        style={[
          styles.text,
          { fontSize: config.fontSize, color: flameColor },
        ]}
      >
        {formatStreak(streak)}
      </Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: fonts.data,
    fontWeight: '700',
  },
}));

export default StreakBadge;
