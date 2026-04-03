import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { getScoreColor, getScoreLabel } from '../../theme/colors';
import type { ForgaScore } from '../../types/score';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

export interface ScoreDisplayProps {
  /** The full FORGA score object */
  score: ForgaScore;
  /** Circle diameter */
  size?: number;
  /** Stroke width for the main circle */
  strokeWidth?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Show pillar bars and score label below the circle (default true) */
  showPillars?: boolean;
}

interface PillarBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  animationDuration: number;
}

function PillarBar({ label, value, maxValue, color, animationDuration }: PillarBarProps) {
  const widthPercent = useSharedValue(0);

  useEffect(() => {
    const target = maxValue > 0 ? (value / maxValue) * 100 : 0;
    widthPercent.value = withTiming(target, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, maxValue, animationDuration, widthPercent]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value}%` as unknown as number,
  }));

  return (
    <View style={pillarStyles.row}>
      <View style={pillarStyles.labelContainer}>
        <Text style={pillarStyles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[pillarStyles.value, { color }]}>
          {Math.round(value)}/{maxValue}
        </Text>
      </View>
      <View style={pillarStyles.trackContainer}>
        <View style={pillarStyles.track} />
        <Animated.View
          style={[
            pillarStyles.fill,
            { backgroundColor: color },
            barStyle,
          ]}
        />
      </View>
    </View>
  );
}

export function ScoreDisplay({
  score,
  size = 160,
  strokeWidth = 12,
  animationDuration = 1200,
  showPillars = true,
}: ScoreDisplayProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const scoreColor = getScoreColor(score.total);
  const scoreLabel = getScoreLabel(score.total);

  const animatedProgress = useSharedValue(0);
  const animatedScore = useSharedValue(0);

  useEffect(() => {
    const progress = score.total / 100;
    animatedProgress.value = withTiming(progress, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
    animatedScore.value = withTiming(score.total, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [score.total, animationDuration, animatedProgress, animatedScore]);

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const displayScore = useDerivedValue(() => {
    return `${Math.round(animatedScore.value)}`;
  });

  const pillars = [
    {
      label: 'Nutrition',
      value: score.nutrition,
      maxValue: 40,
      color: colors.primary,
    },
    {
      label: 'Constance',
      value: score.consistency,
      maxValue: 30,
      color: colors.carbs,
    },
    {
      label: 'Progression',
      value: score.progression,
      maxValue: 20,
      color: colors.fat,
    },
    {
      label: 'Discipline',
      value: score.discipline,
      maxValue: 10,
      color: colors.calories,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Main score circle */}
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surfaceHover}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={circleAnimatedProps}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
          />
        </Svg>
        {/* Center content */}
        <View style={styles.centerContent}>
          <AnimatedText
            style={[styles.scoreValue, { color: scoreColor }]}
          >
            {displayScore}
          </AnimatedText>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      </View>

      {/* Score label */}
      {showPillars && (
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
          {scoreLabel}
        </Text>
      )}

      {/* Pillar progress bars */}
      {showPillars && (
        <View style={styles.pillarsContainer}>
          {pillars.map((pillar) => (
            <PillarBar
              key={pillar.label}
              label={pillar.label}
              value={pillar.value}
              maxValue={pillar.maxValue}
              color={pillar.color}
              animationDuration={animationDuration}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes.score,
    fontWeight: '800',
  },
  scoreMax: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    color: colors.textSecondary,
    marginTop: 16,
  },
  scoreLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  pillarsContainer: {
    width: '100%',
    gap: spacing.md,
  },
});

const pillarStyles = StyleSheet.create({
  row: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  trackContainer: {
    height: 6,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default ScoreDisplay;
