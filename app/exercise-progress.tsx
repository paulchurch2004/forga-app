import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import { useTrainingStore } from '../src/store/trainingStore';
import { LineChart, type DataPoint } from '../src/components/charts/LineChart';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useTheme } from '../src/context/ThemeContext';

type Period = '7d' | '30d' | '90d' | 'all';

export default function ExerciseProgressScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  const { exerciseId, exerciseName } = useLocalSearchParams<{ exerciseId: string; exerciseName: string }>();
  const getHistory = useTrainingStore((s) => s.getExerciseHistory);

  const [period, setPeriod] = useState<Period>('30d');

  const history = useMemo(() => getHistory(exerciseId ?? ''), [exerciseId, getHistory]);

  const filteredHistory = useMemo(() => {
    if (period === 'all') return history;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return history.filter((h) => h.date >= cutoffStr);
  }, [history, period]);

  const maxWeightData: DataPoint[] = useMemo(() =>
    filteredHistory.map((h) => ({
      date: h.date,
      value: Math.max(...h.sets.map((s) => s.weight), 0),
    })),
    [filteredHistory]
  );

  const volumeData: DataPoint[] = useMemo(() =>
    filteredHistory.map((h) => ({
      date: h.date,
      value: h.sets.reduce((sum, s) => sum + s.reps * s.weight, 0),
    })),
    [filteredHistory]
  );

  const chartWidth = Math.min(screenWidth - spacing.lg * 2, contentMaxWidth - spacing.lg * 2);

  const periods: Period[] = ['7d', '30d', '90d', 'all'];
  const periodKeys: Record<Period, string> = {
    '7d': 'period7d', '30d': 'period30d', '90d': 'period90d', all: 'periodAll',
  };

  return (
    <ScrollView
      style={[styles.wrapper, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={16} style={styles.headerRow}>
        <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
      </Pressable>

      <Text style={styles.pageTitle}>{exerciseName}</Text>
      <Text style={styles.subtitle}>{t('exerciseProgression')}</Text>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {periods.map((p) => (
          <Pressable
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {t(periodKeys[p] as any)}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredHistory.length >= 2 ? (
        <>
          {/* Max Weight Chart */}
          <View style={styles.chartSection}>
            <LineChart
              data={maxWeightData}
              width={chartWidth}
              height={200}
              lineColor={colors.primary}
              fillColor={`${colors.primary}30`}
              unit="kg"
              title={t('maxWeight')}
            />
          </View>

          {/* Volume Chart */}
          <View style={styles.chartSection}>
            <LineChart
              data={volumeData}
              width={chartWidth}
              height={200}
              lineColor={colors.carbs}
              fillColor={`${colors.carbs}30`}
              unit="kg"
              title={t('totalVolume')}
            />
          </View>
        </>
      ) : (
        <EmptyState
          icon={'\uD83D\uDCC8'}
          title={t('noProgressionData')}
          subtitle={t('noProgressionSubtitle')}
        />
      )}

      <View style={{ height: spacing['5xl'] }} />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center' as const,
    width: '100%' as any,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  periodRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  periodBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodBtnActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  periodText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
  },
  chartSection: {
    marginBottom: spacing.xl,
  },
}));
