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
import { localIso } from '../src/utils/date';
import { estimateOneRMEpley } from '../src/engine/oneRepMax';
import { suggestNextWeight } from '../src/utils/workoutComparison';
import { usePremiumGate } from '../src/hooks/usePremiumGate';
import { PremiumLock } from '../src/components/ui/PremiumLock';

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
  const { isPremium, openPaywall } = usePremiumGate();

  const [period, setPeriod] = useState<Period>('30d');

  const history = useMemo(() => getHistory(exerciseId ?? ''), [exerciseId, getHistory]);

  const filteredHistory = useMemo(() => {
    if (period === 'all') return history;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = localIso(cutoff);
    return history.filter((h) => h.date >= cutoffStr);
  }, [history, period]);

  const oneRMData: DataPoint[] = useMemo(() =>
    filteredHistory.map((h) => ({
      date: h.date,
      value: Math.round(
        Math.max(0, ...h.sets.map((s) => estimateOneRMEpley(s.weight, s.reps))),
      ),
    })),
    [filteredHistory]
  );

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

  // Pick the heaviest set of the most recent session as the basis for next-time suggestion.
  const nextWeightSuggestion = useMemo(() => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    if (!last.sets || last.sets.length === 0) return null;
    const heaviest = last.sets.reduce(
      (best, s) => (s.weight > best.weight ? s : best),
      last.sets[0],
    );
    return suggestNextWeight({
      weight: heaviest.weight,
      reps: heaviest.reps,
      targetReps: 8,
    });
  }, [history]);

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

      {nextWeightSuggestion && (
        <View style={styles.suggestCard}>
          <Text style={styles.suggestLabel}>PROCHAINE FOIS</Text>
          <Text style={styles.suggestWeight}>{nextWeightSuggestion.weight} kg</Text>
          <Text style={styles.suggestRationale}>{nextWeightSuggestion.rationale}</Text>
        </View>
      )}

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
          {/* Max Weight Chart — always visible (free + premium) */}
          <View style={styles.chartSection}>
            <LineChart
              data={maxWeightData}
              width={chartWidth}
              height={200}
              lineColor={colors.text}
              fillColor={`${colors.text}15`}
              unit="kg"
              title={t('maxWeight')}
            />
          </View>

          {/* Premium-only — 1RM estimé Epley */}
          {isPremium ? (
            <View style={styles.chartSection}>
              <LineChart
                data={oneRMData}
                width={chartWidth}
                height={200}
                lineColor={colors.primary}
                fillColor={`${colors.primary}30`}
                unit="kg"
                title="1RM estimé (Epley)"
              />
            </View>
          ) : (
            <PremiumLock
              variant="banner"
              label={t('premiumFeature')}
              subtitle={t('premiumExerciseStatsSubtitle')}
              onPress={openPaywall}
              style={{ marginBottom: spacing.xl }}
            />
          )}

          {/* Premium-only — Volume Chart */}
          {isPremium && (
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
          )}
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
  suggestCard: {
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  suggestLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  suggestWeight: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.6,
  },
  suggestRationale: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
}));
