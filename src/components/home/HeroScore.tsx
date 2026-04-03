import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { getScoreColor } from '../../theme/colors';
import type { ForgaScore } from '../../types/score';

const EASE_OUT = Easing.out(Easing.cubic);

interface HeroScoreProps {
  score: ForgaScore;
  weeklyChange: number;
  consumed: { calories: number; protein: number; carbs: number; fat: number };
  target: { calories: number; protein: number; carbs: number; fat: number };
}

/* ── Macro Pill ── */

interface MacroPillProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit: string;
}

function MacroPill({ label, current, target, color, unit }: MacroPillProps) {
  const progress = target > 0 ? Math.min(1, current / target) : 0;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withDelay(
      800,
      withTiming(progress * 100, { duration: 1000, easing: EASE_OUT })
    );
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%` as unknown as number,
  }));

  return (
    <View style={pillStyles.container}>
      <View style={pillStyles.header}>
        <View style={[pillStyles.dot, { backgroundColor: color }]} />
        <Text style={[pillStyles.label, { color }]}>{label}</Text>
        <Text style={pillStyles.values}>
          {Math.round(current)}/{Math.round(target)}{unit}
        </Text>
      </View>
      <View style={pillStyles.track}>
        <Animated.View
          style={[pillStyles.fill, { backgroundColor: color }, fillStyle]}
        />
      </View>
    </View>
  );
}

/* ── Hero Score ── */

export function HeroScore({ score, weeklyChange, consumed, target }: HeroScoreProps) {
  const scoreColor = getScoreColor(score.total);
  const changeColor = weeklyChange >= 0 ? colors.success : colors.error;
  const changePrefix = weeklyChange >= 0 ? '+' : '';
  const caloriesRemaining = Math.max(0, target.calories - consumed.calories);

  // Calorie bar animation
  const caloriePct = target.calories > 0
    ? Math.min(1, consumed.calories / target.calories)
    : 0;
  const calorieBarWidth = useSharedValue(0);

  useEffect(() => {
    calorieBarWidth.value = withDelay(
      400,
      withTiming(caloriePct * 100, { duration: 1000, easing: EASE_OUT })
    );
  }, [caloriePct]);

  const calorieBarStyle = useAnimatedStyle(() => ({
    width: `${calorieBarWidth.value}%` as unknown as number,
  }));

  return (
    <View style={styles.hero}>
      {/* Radial glow behind score */}
      <View style={styles.glowWrapper} pointerEvents="none">
        <Svg width={260} height={260} style={styles.glowSvg}>
          <Defs>
            <RadialGradient id="scoreGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={scoreColor} stopOpacity={0.2} />
              <Stop offset="70%" stopColor={scoreColor} stopOpacity={0.05} />
              <Stop offset="100%" stopColor={scoreColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={260} height={260} fill="url(#scoreGlow)" />
        </Svg>
      </View>

      {/* Score circle */}
      <View style={styles.scoreSection}>
        <ScoreDisplay
          score={score}
          size={180}
          strokeWidth={14}
          animationDuration={1200}
          showPillars={false}
        />
      </View>

      {/* Weekly change badge */}
      <Animated.View entering={FadeIn.delay(400).duration(300)} style={styles.changeBadge}>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {changePrefix}{weeklyChange} pts cette semaine
        </Text>
      </Animated.View>

      {/* Calorie progress */}
      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.calorieSection}>
        <View style={styles.calorieHeader}>
          <Text style={styles.calorieLabel}>Calories</Text>
          <Text style={styles.calorieValues}>
            <Text style={styles.calorieConsumed}>{Math.round(consumed.calories)}</Text>
            <Text style={styles.calorieSep}> / </Text>
            <Text style={styles.calorieTarget}>{Math.round(target.calories)} kcal</Text>
          </Text>
        </View>
        <View style={styles.calorieTrack}>
          <Animated.View style={[styles.calorieFill, calorieBarStyle]} />
        </View>
        <Text style={styles.calorieRemaining}>
          {Math.round(caloriesRemaining)} kcal restant
        </Text>
      </Animated.View>

      {/* Macro pills */}
      <Animated.View entering={FadeInDown.delay(800).duration(400)} style={styles.macroPillsRow}>
        <MacroPill
          label="P"
          current={consumed.protein}
          target={target.protein}
          color={colors.protein}
          unit="g"
        />
        <MacroPill
          label="G"
          current={consumed.carbs}
          target={target.carbs}
          color={colors.carbs}
          unit="g"
        />
        <MacroPill
          label="L"
          current={consumed.fat}
          target={target.fat}
          color={colors.fat}
          unit="g"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  glowWrapper: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowSvg: {
    opacity: 0.8,
  },
  scoreSection: {
    alignItems: 'center',
    zIndex: 1,
  },
  changeBadge: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  changeText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  calorieSection: {
    marginTop: spacing.xl,
    width: '100%',
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  calorieLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  calorieValues: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
  },
  calorieConsumed: {
    color: colors.calories,
    fontWeight: '700',
  },
  calorieSep: {
    color: colors.textSecondary,
  },
  calorieTarget: {
    color: colors.textSecondary,
  },
  calorieTrack: {
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  calorieFill: {
    height: '100%',
    backgroundColor: colors.calories,
    borderRadius: borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  calorieRemaining: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});

const pillStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  values: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  track: {
    height: 4,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default HeroScore;
