import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import { getScoreColor, getScoreLabel } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { ForgaScore } from '../../types/score';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;
const EASE_OUT = Easing.out(Easing.cubic);

const RING_SIZE = 200;
const RING_STROKE = 10;
const GLOW_STROKE = 20;
const SPARK_STROKE = 3;
const RING_RADIUS = (RING_SIZE - GLOW_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_CENTER = RING_SIZE / 2;

interface HeroScoreProps {
  score: ForgaScore;
  weeklyChange: number;
  consumed: { calories: number; protein: number; carbs: number; fat: number };
  target: { calories: number; protein: number; carbs: number; fat: number };
}

/* -- Macro column -- */

interface MacroColProps {
  label: string;
  current: number;
  target: number;
  color: string;
  withDivider?: boolean;
}

function MacroCol({ label, current, target, color, withDivider }: MacroColProps) {
  const styles = useMacroStyles();
  const progress = target > 0 ? Math.min(1, current / target) : 0;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withDelay(
      600,
      withTiming(progress * 100, { duration: 900, easing: EASE_OUT })
    );
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%` as unknown as number,
  }));

  return (
    <View style={[styles.col, withDivider && styles.colDivider]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={styles.value}>{Math.round(current)}</Text>
      <Text style={styles.target}>/{Math.round(target)} G</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
      </View>
    </View>
  );
}

/* -- Hero Score with animated energy ring -- */

export function HeroScore({ score, weeklyChange, consumed, target }: HeroScoreProps) {
  const { colors } = useTheme();
  const { t, locale } = useT();
  const styles = useStyles();
  const scoreColor = getScoreColor(score.total);
  const scoreLabel = getScoreLabel(score.total, locale);
  const changeColor = weeklyChange >= 0 ? colors.success : colors.error;
  const changePrefix = weeklyChange >= 0 ? '+' : '';
  const caloriesRemaining = Math.max(0, target.calories - consumed.calories);

  // === RING PROGRESS ANIMATION ===
  const animatedProgress = useSharedValue(0);
  useEffect(() => {
    animatedProgress.value = withTiming(score.total / 100, {
      duration: 1200,
      easing: EASE_OUT,
    });
  }, [score.total]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  // === GLOW PULSE (outer glow that breathes) ===
  const glowOpacity = useSharedValue(0.15);
  useEffect(() => {
    glowOpacity.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1, // infinite
        true
      )
    );
  }, []);

  const glowAnimatedProps = useAnimatedProps(() => ({
    strokeOpacity: glowOpacity.value,
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  // === SPARK 1 (electric particle traveling along arc) ===
  const spark1Offset = useSharedValue(RING_CIRCUMFERENCE);
  useEffect(() => {
    spark1Offset.value = withDelay(
      1400,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.linear }),
        -1
      )
    );
  }, []);

  const spark1Props = useAnimatedProps(() => {
    const arcLength = RING_CIRCUMFERENCE * animatedProgress.value;
    const sparkGap = RING_CIRCUMFERENCE - 8; // small dash, big gap
    return {
      strokeDashoffset: spark1Offset.value % RING_CIRCUMFERENCE,
      strokeDasharray: [8, sparkGap] as unknown as string,
      strokeOpacity: arcLength > 20 ? 0.9 : 0,
    };
  });

  // === SPARK 2 (second particle, offset timing) ===
  const spark2Offset = useSharedValue(RING_CIRCUMFERENCE);
  useEffect(() => {
    spark2Offset.value = withDelay(
      2400,
      withRepeat(
        withTiming(0, { duration: 2800, easing: Easing.linear }),
        -1
      )
    );
  }, []);

  const spark2Props = useAnimatedProps(() => {
    const arcLength = RING_CIRCUMFERENCE * animatedProgress.value;
    const sparkGap = RING_CIRCUMFERENCE - 4;
    return {
      strokeDashoffset: spark2Offset.value % RING_CIRCUMFERENCE,
      strokeDasharray: [4, sparkGap] as unknown as string,
      strokeOpacity: arcLength > 40 ? 0.7 : 0,
    };
  });

  // === SCORE NUMBER PULSE ===
  const scorePulse = useSharedValue(1);
  useEffect(() => {
    scorePulse.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const scorePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scorePulse.value }],
  }));

  // Calorie bar animation
  const caloriePct = target.calories > 0
    ? Math.min(1, consumed.calories / target.calories)
    : 0;
  const calorieBarWidth = useSharedValue(0);

  useEffect(() => {
    calorieBarWidth.value = withDelay(
      300,
      withTiming(caloriePct * 100, { duration: 900, easing: EASE_OUT })
    );
  }, [caloriePct]);

  const calorieBarStyle = useAnimatedStyle(() => ({
    width: `${calorieBarWidth.value}%` as unknown as number,
  }));

  return (
    <View style={styles.hero}>
      {/* === SCORE RING === */}
      <View style={styles.ringSection}>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background track */}
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke={colors.surfaceHover}
              strokeWidth={RING_STROKE}
              fill="none"
            />

            {/* Glow layer (pulsating outer glow) */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke={scoreColor}
              strokeWidth={GLOW_STROKE}
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              animatedProps={glowAnimatedProps}
              strokeLinecap="round"
              transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
            />

            {/* Main progress arc */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke={scoreColor}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              animatedProps={ringAnimatedProps}
              strokeLinecap="round"
              transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
            />

            {/* Electric spark 1 */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke="#FFFFFF"
              strokeWidth={SPARK_STROKE}
              fill="none"
              animatedProps={spark1Props}
              strokeLinecap="round"
              transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
            />

            {/* Electric spark 2 */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              stroke={scoreColor}
              strokeWidth={SPARK_STROKE + 2}
              fill="none"
              animatedProps={spark2Props}
              strokeLinecap="round"
              transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
            />
          </Svg>

          {/* Center content with pulse */}
          <AnimatedView style={[styles.ringCenter, scorePulseStyle]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {Math.round(score.total)}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </AnimatedView>
        </View>

        {/* Label + weekly change */}
        <View style={styles.ringMeta}>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>
          <Animated.View entering={FadeIn.delay(400).duration(300)}>
            <Text style={[styles.changeText, { color: changeColor }]}>
              {changePrefix}{weeklyChange} PTS / SEM
            </Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* === CALORIES BLOCK === */}
      <Text style={styles.blockLabel}>{t('calories').toUpperCase()}</Text>
      <View style={styles.calorieRow}>
        <Text style={styles.calorieNumber}>{Math.round(consumed.calories)}</Text>
        <Text style={styles.calorieTarget}>
          /{Math.round(target.calories)} KCAL
        </Text>
      </View>
      <View style={styles.calorieTrack}>
        <Animated.View style={[styles.calorieFill, calorieBarStyle]} />
      </View>
      <Text style={styles.calorieRemaining}>
        {Math.round(caloriesRemaining)} KCAL RESTANTES
      </Text>

      <View style={styles.divider} />

      {/* === MACROS BLOCK === */}
      <Text style={styles.blockLabel}>MACROS</Text>
      <View style={styles.macrosRow}>
        <MacroCol
          label="PROT"
          current={consumed.protein}
          target={target.protein}
          color={colors.protein}
        />
        <MacroCol
          label="GLUC"
          current={consumed.carbs}
          target={target.carbs}
          color={colors.carbs}
          withDivider
        />
        <MacroCol
          label="LIPID"
          current={consumed.fat}
          target={target.fat}
          color={colors.fat}
          withDivider
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scoreNumber: {
    fontFamily: fonts.display,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 52,
    includeFontPadding: false,
  },
  scoreMax: {
    fontFamily: fonts.data,
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 2,
    marginTop: 14,
  },
  ringMeta: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  scoreLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  changeText: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  blockLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  calorieNumber: {
    fontFamily: fonts.display,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    color: colors.calories,
    lineHeight: 64,
    includeFontPadding: false,
  },
  calorieTarget: {
    fontFamily: fonts.data,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  calorieTrack: {
    height: 6,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  macrosRow: {
    flexDirection: 'row',
  },
}));

const useMacroStyles = makeStyles((colors) => ({
  col: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  colDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.text,
    lineHeight: 34,
    includeFontPadding: false,
  },
  target: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  track: {
    height: 2,
    backgroundColor: colors.surfaceHover,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
}));

export default HeroScore;
