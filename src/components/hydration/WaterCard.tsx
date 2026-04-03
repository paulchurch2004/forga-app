import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { ProgressCircle } from '../ui/ProgressCircle';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useWater } from '../../hooks/useWater';
import { useT } from '../../i18n';
import * as Haptics from 'expo-haptics';

const WATER_COLOR = '#00BFFF';

const QUICK_AMOUNTS = [
  { label: '250 ml', amount: 250, icon: '\uD83E\uDD43' },
  { label: '500 ml', amount: 500, icon: '\uD83E\uDED9' },
];

export function WaterCard() {
  const { todayTotal, dailyTarget, progress, add } = useWater();
  const { t } = useT();
  const styles = useStyles();

  const handleAdd = (amount: number) => {
    add(amount);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const remaining = Math.max(0, dailyTarget - todayTotal);
  const liters = Math.round((todayTotal / 1000) * 10) / 10;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ProgressCircle
          progress={progress}
          size={72}
          strokeWidth={7}
          color={WATER_COLOR}
          value={`${liters}L`}
          label={t('waterLabel')}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{'\uD83D\uDCA7'} {t('hydration')}</Text>
          <Text style={styles.subtitle}>
            {remaining > 0
              ? t('waterRemaining', { amount: remaining })
              : t('waterTargetReached')}
          </Text>
          <Text style={styles.target}>
            {t('waterDailyTarget', { target: (dailyTarget / 1000).toFixed(1) })}
          </Text>
        </View>
      </View>

      <View style={styles.buttonsRow}>
        {QUICK_AMOUNTS.map((q) => (
          <Pressable
            key={q.amount}
            style={styles.addBtn}
            onPress={() => handleAdd(q.amount)}
          >
            <Text style={styles.addBtnIcon}>{q.icon}</Text>
            <Text style={styles.addBtnText}>+ {q.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  target: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.3)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addBtnIcon: {
    fontSize: 16,
  },
  addBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: WATER_COLOR,
  },
}));
