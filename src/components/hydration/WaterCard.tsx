import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { ProgressCircle } from '../ui/ProgressCircle';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import { useWater } from '../../hooks/useWater';
import { useT } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';
import type { TranslationKey } from '../../i18n/locales/fr';

const WATER_COLOR = '#00BFFF';

const QUICK_AMOUNTS = [
  { label: '250 ML', amount: 250 },
  { label: '500 ML', amount: 500 },
];

const DAY_KEYS: TranslationKey[] = [
  'waterMon', 'waterTue', 'waterWed', 'waterThu', 'waterFri', 'waterSat', 'waterSun',
];

export function WaterCard() {
  const { todayTotal, dailyTarget, progress, weekHistory, daysTargetMet, add } = useWater();
  const { t } = useT();
  const { colors } = useTheme();
  const styles = useStyles();

  const handleAdd = (amount: number) => {
    add(amount);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const remaining = Math.max(0, dailyTarget - todayTotal);
  const liters = Math.round((todayTotal / 1000) * 10) / 10;

  // Find max in week for bar scaling
  const maxWeek = Math.max(dailyTarget, ...weekHistory.map((d) => d.total));

  return (
    <View style={styles.card}>
      {/* Today section */}
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
          <Text style={styles.title}>{t('hydration').toUpperCase()}</Text>
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

      {/* Quick-add buttons */}
      <View style={styles.buttonsRow}>
        {QUICK_AMOUNTS.map((q) => (
          <Pressable
            key={q.amount}
            style={styles.addBtn}
            onPress={() => handleAdd(q.amount)}
          >
            <Text style={styles.addBtnText}>+ {q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Weekly recap */}
      <View style={styles.weekSection}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>{t('waterWeekTitle')}</Text>
          <Text style={styles.weekDays}>
            {t('waterDaysOk', { count: daysTargetMet, total: 7 })}
          </Text>
        </View>

        <View style={styles.barsRow}>
          {weekHistory.map((day, i) => {
            const barH = maxWeek > 0 ? (day.total / maxWeek) * 48 : 0;
            const reached = day.total >= dailyTarget;
            const isToday = i === weekHistory.length - 1;
            const dayOfWeek = new Date(day.date).getDay();
            // getDay: 0=Sun, 1=Mon... map to our DAY_KEYS array (Mon=0)
            const dayKeyIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            return (
              <View key={day.date} style={styles.barCol}>
                <View style={styles.barContainer}>
                  {/* Target line */}
                  <View
                    style={[
                      styles.targetLine,
                      { bottom: maxWeek > 0 ? (dailyTarget / maxWeek) * 48 : 0 },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barH, 3),
                        backgroundColor: reached
                          ? WATER_COLOR
                          : day.total > 0
                            ? 'rgba(0, 191, 255, 0.35)'
                            : colors.border,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                  ]}
                >
                  {t(DAY_KEYS[dayKeyIndex])}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '800' as const,
    letterSpacing: 1,
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
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addBtn: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: WATER_COLOR,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  addBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800' as const,
    letterSpacing: 1,
    color: WATER_COLOR,
  },
  // Weekly recap
  weekSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weekHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  weekTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.text,
  },
  weekDays: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  barsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    gap: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center' as const,
  },
  barContainer: {
    width: '100%' as const,
    height: 48,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  targetLine: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 191, 255, 0.4)',
    borderStyle: 'dashed' as const,
  },
  bar: {
    width: '60%' as const,
    borderRadius: borderRadius.sm,
    minHeight: 3,
  },
  dayLabel: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  dayLabelToday: {
    color: WATER_COLOR,
    fontWeight: '700' as const,
  },
}));
