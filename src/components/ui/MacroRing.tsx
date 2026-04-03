import React from 'react';
import { View, Text } from 'react-native';
import { ProgressCircle } from './ProgressCircle';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n';

export type MacroType = 'protein' | 'carbs' | 'fat' | 'calories';

const MACRO_LABEL_KEYS: Record<MacroType, TranslationKey> = {
  protein: 'proteinLabel',
  carbs: 'carbsLabel',
  fat: 'fatLabel',
  calories: 'caloriesLabel',
};

const MACRO_UNITS: Record<MacroType, string> = {
  protein: 'g',
  carbs: 'g',
  fat: 'g',
  calories: 'kcal',
};

const MACRO_COLOR_KEYS: Record<MacroType, 'protein' | 'carbs' | 'fat' | 'calories'> = {
  protein: 'protein',
  carbs: 'carbs',
  fat: 'fat',
  calories: 'calories',
};

export interface MacroRingProps {
  /** Which macro this ring represents */
  type: MacroType;
  /** Current consumed value */
  current: number;
  /** Target value */
  target: number;
  /** Circle diameter in px */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
}

export function MacroRing({
  type,
  current,
  target,
  size = 80,
  strokeWidth = 6,
}: MacroRingProps) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();

  const color = colors[MACRO_COLOR_KEYS[type]];
  const label = t(MACRO_LABEL_KEYS[type]);
  const unit = MACRO_UNITS[type];
  const progress = target > 0 ? current / target : 0;

  const formatValue = (val: number): string => {
    if (type === 'calories') {
      return val >= 1000
        ? `${Math.round(val / 100) / 10}k`
        : `${Math.round(val)}`;
    }
    return `${Math.round(val)}`;
  };

  return (
    <View style={styles.container}>
      <ProgressCircle
        progress={progress}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        value={formatValue(current)}
        valueFontSize={size >= 80 ? fontSizes.lg : fontSizes.sm}
      />
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.target} numberOfLines={1}>
        {Math.round(current)}/{Math.round(target)}{unit}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  target: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
}));

export default MacroRing;
