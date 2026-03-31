import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressCircle } from './ProgressCircle';
import { colors, fonts, fontSizes, spacing } from '../../theme';

export type MacroType = 'protein' | 'carbs' | 'fat' | 'calories';

const MACRO_CONFIG: Record<MacroType, { color: string; label: string; unit: string }> = {
  protein: { color: colors.protein, label: 'Protéines', unit: 'g' },
  carbs: { color: colors.carbs, label: 'Glucides', unit: 'g' },
  fat: { color: colors.fat, label: 'Lipides', unit: 'g' },
  calories: { color: colors.calories, label: 'Calories', unit: 'kcal' },
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
  const config = MACRO_CONFIG[type];
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
        color={config.color}
        value={formatValue(current)}
        valueFontSize={size >= 80 ? fontSizes.lg : fontSizes.sm}
      />
      <Text style={[styles.label, { color: config.color }]} numberOfLines={1}>
        {config.label}
      </Text>
      <Text style={styles.target} numberOfLines={1}>
        {Math.round(current)}/{Math.round(target)}{config.unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

export default MacroRing;
