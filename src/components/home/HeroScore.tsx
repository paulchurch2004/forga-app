import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { getScoreColor } from '../../theme/colors';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { ForgaScore } from '../../types/score';

const EASE_OUT = Easing.out(Easing.cubic);

interface HeroScoreProps {
  score: ForgaScore;
  weeklyChange: number;
  consumed: { calories: number; protein: number; carbs: number; fat: number };
  target: { calories: number; protein: number; carbs: number; fat: number };
}

/* -- Macro column (brutalist, no pill) -- */

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

/* -- Hero Score (brutalist) -- */

export function HeroScore({ score, weeklyChange, consumed, target }: HeroScoreProps) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();
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
      300,
      withTiming(caloriePct * 100, { duration: 900, easing: EASE_OUT })
    );
  }, [caloriePct]);

  const calorieBarStyle = useAnimatedStyle(() => ({
    width: `${calorieBarWidth.value}%` as unknown as number,
  }));

  return (
    <View style={styles.hero}>
      {/* === SCORE BLOCK === */}
      <Text style={styles.blockLabel}>FORGA SCORE</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreNumberRow}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {Math.round(score.total)}
          </Text>
          <Text style={styles.scoreSlash}>/100</Text>
        </View>
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {changePrefix}{weeklyChange} PTS / SEM
          </Text>
        </Animated.View>
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
    borderRadius: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  blockLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scoreNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scoreNumber: {
    fontFamily: fonts.display,
    fontSize: 96,
    fontWeight: '800',
    letterSpacing: -4,
    lineHeight: 96,
    includeFontPadding: false,
  },
  scoreSlash: {
    fontFamily: fonts.data,
    fontSize: 18,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: spacing.md,
  },
  changeText: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
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
    borderRadius: 0,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  calorieFill: {
    height: '100%',
    backgroundColor: colors.calories,
    borderRadius: 0,
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
