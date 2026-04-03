import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { MacroRing } from '../ui/MacroRing';
import type { MacroType } from '../ui/MacroRing';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useT } from '../../i18n';

interface MacroData {
  type: MacroType;
  current: number;
  target: number;
}

interface DailyMacrosProps {
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  target: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function DailyMacros({ consumed, target }: DailyMacrosProps) {
  const { t } = useT();
  const styles = useStyles();
  const macros: MacroData[] = [
    { type: 'calories', current: consumed.calories, target: target.calories },
    { type: 'protein', current: consumed.protein, target: target.protein },
    { type: 'carbs', current: consumed.carbs, target: target.carbs },
    { type: 'fat', current: consumed.fat, target: target.fat },
  ];

  const caloriesRemaining = Math.max(0, target.calories - consumed.calories);

  return (
    <Card header={t('dailyMacros')}>
      <View style={styles.ringRow}>
        {macros.map((macro) => (
          <View key={macro.type} style={styles.ringWrapper}>
            <MacroRing
              type={macro.type}
              current={macro.current}
              target={macro.target}
              size={70}
              strokeWidth={5}
            />
          </View>
        ))}
      </View>
      <View style={styles.remainingRow}>
        <Text style={styles.remainingLabel}>{t('remaining')}</Text>
        <Text style={styles.remainingValue}>
          {Math.round(caloriesRemaining)} kcal
        </Text>
      </View>
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ringWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  remainingLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  remainingValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
}));

export default DailyMacros;
