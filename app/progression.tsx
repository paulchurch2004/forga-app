import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { useScoreStore } from '../src/store/scoreStore';
import { LineChart, type DataPoint } from '../src/components/charts/LineChart';
import {
  makeStyles,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  getScoreColor,
} from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useResponsive } from '../src/hooks/useResponsive';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '7d', label: 'period7d' },
  { key: '30d', label: 'period30d' },
  { key: '90d', label: 'period90d' },
  { key: 'all', label: 'periodAll' },
];

export default function ProgressionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const { width: windowWidth } = useWindowDimensions();
  const { contentMaxWidth } = useResponsive();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  function StatCard({
    label,
    value,
    unit,
    color,
  }: {
    label: string;
    value: string;
    unit: string;
    color: string;
  }) {
    return (
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>
          {value}
          <Text style={styles.statUnit}> {unit}</Text>
        </Text>
      </View>
    );
  }

  function GoalProgress({
    currentWeight,
    startWeight,
    targetWeight,
    objective,
  }: {
    currentWeight: number;
    startWeight: number;
    targetWeight: number;
    objective: string;
  }) {
    const totalDiff = Math.abs(targetWeight - startWeight);
    const currentDiff = Math.abs(currentWeight - startWeight);
    const progress = totalDiff > 0 ? Math.min(1, currentDiff / totalDiff) : 0;

    // Check if going in right direction
    const isCorrectDirection =
      (objective === 'cut' && currentWeight <= startWeight) ||
      (objective === 'bulk' && currentWeight >= startWeight) ||
      objective === 'recomp';

    const effectiveProgress = isCorrectDirection ? progress : 0;
    const progressPercent = Math.round(effectiveProgress * 100);

    const remaining = Math.abs(targetWeight - currentWeight);

    return (
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>{t("goalTitle")}</Text>
        <View style={styles.goalRow}>
          <Text style={styles.goalWeight}>{startWeight} kg</Text>
          <View style={styles.goalBarContainer}>
            <View style={styles.goalBarBg}>
              <View
                style={[
                  styles.goalBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.goalPercent}>{progressPercent}%</Text>
          </View>
          <Text style={styles.goalWeight}>{targetWeight} kg</Text>
        </View>
        <Text style={styles.goalRemaining}>
          {objective === 'cut' ? t('stillToLose', { remaining: remaining.toFixed(1) }) : t('stillToGain', { remaining: remaining.toFixed(1) })}
        </Text>
      </View>
    );
  }

  const weightLog = useUserStore((s) => s.weightLog);
  const profile = useUserStore((s) => s.profile);
  const scoreHistory = useScoreStore((s) => s.history);

  const chartWidth = Math.min(windowWidth, contentMaxWidth) - spacing.lg * 2 - spacing.md * 2;

  const cutoffDate = useMemo(() => {
    if (timeRange === 'all') return null;
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }, [timeRange]);

  const weightData: DataPoint[] = useMemo(() => {
    let entries = [...weightLog].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (cutoffDate) {
      entries = entries.filter((e) => new Date(e.date) >= cutoffDate);
    }
    return entries.map((e) => ({
      date: e.date,
      value: e.weight,
    }));
  }, [weightLog, cutoffDate]);

  const scoreData: DataPoint[] = useMemo(() => {
    let entries = [...scoreHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (cutoffDate) {
      entries = entries.filter((e) => new Date(e.date) >= cutoffDate);
    }
    return entries.map((e) => ({
      date: e.date,
      value: e.total ?? 0,
    }));
  }, [scoreHistory, cutoffDate]);

  // Stats cards
  const weightStats = useMemo(() => {
    if (weightData.length < 2) return null;
    const first = weightData[0].value;
    const last = weightData[weightData.length - 1].value;
    const diff = last - first;
    const min = Math.min(...weightData.map((d) => d.value));
    const max = Math.max(...weightData.map((d) => d.value));
    return { current: last, diff, min, max, entries: weightData.length };
  }, [weightData]);

  const scoreStats = useMemo(() => {
    if (scoreData.length < 2) return null;
    const first = scoreData[0].value;
    const last = scoreData[scoreData.length - 1].value;
    const diff = last - first;
    const avg = scoreData.reduce((sum, d) => sum + d.value, 0) / scoreData.length;
    return { current: last, diff, avg: Math.round(avg), entries: scoreData.length };
  }, [scoreData]);

  // Determine weight trend color based on objective
  const weightTrendColor = useMemo(() => {
    if (!weightStats || !profile) return colors.textSecondary;
    const { diff } = weightStats;
    const obj = profile.objective;
    // Positive trend good for bulk, negative good for cut
    if (obj === 'bulk' || obj === 'recomp') {
      return diff > 0 ? colors.success : diff < 0 ? colors.error : colors.textSecondary;
    }
    if (obj === 'cut') {
      return diff < 0 ? colors.success : diff > 0 ? colors.error : colors.textSecondary;
    }
    // Maintain — close to 0 is good
    return Math.abs(diff) < 0.5 ? colors.success : colors.warning;
  }, [weightStats, profile]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>{t("back")}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t("myProgress")}</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Time range selector */}
      <View style={styles.timeRangeRow}>
        {TIME_RANGES.map((range) => (
          <Pressable
            key={range.key}
            style={[
              styles.timeRangeChip,
              timeRange === range.key && styles.timeRangeChipActive,
            ]}
            onPress={() => setTimeRange(range.key)}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === range.key && styles.timeRangeTextActive,
              ]}
            >
              {t(range.label as any)}
            </Text>
          </Pressable>
        ))}
      </View>

      {weightData.length === 0 && scoreData.length === 0 ? (
        <EmptyState icon={'\uD83D\uDCC8'} title={t('emptyProgressTitle')} subtitle={t('emptyProgressSubtitle')} actionLabel={t('emptyProgressAction')} onAction={() => router.push('/checkin')} />
      ) : (
        <>
          {/* Weight Chart */}
          <View style={styles.section}>
            <LineChart
              data={weightData}
              width={chartWidth}
              height={220}
              lineColor={weightTrendColor}
              unit=" kg"
              formatValue={(v) => v.toFixed(1)}
              title={t("weightLabel")}
              emptyMessage={t("startCheckInForChart")}
            />
          </View>

          {/* Weight Stats */}
          {weightStats && (
            <View style={styles.statsRow}>
              <StatCard
                label={t("statVariation")}
                value={`${weightStats.diff >= 0 ? '+' : ''}${weightStats.diff.toFixed(1)}`}
                unit="kg"
                color={weightTrendColor}
              />
              <StatCard
                label={t("statMin")}
                value={weightStats.min.toFixed(1)}
                unit="kg"
                color={colors.textSecondary}
              />
              <StatCard
                label={t("statMax")}
                value={weightStats.max.toFixed(1)}
                unit="kg"
                color={colors.textSecondary}
              />
            </View>
          )}

          {/* Score Chart */}
          <View style={styles.section}>
            <LineChart
              data={scoreData}
              width={chartWidth}
              height={220}
              lineColor={scoreData.length > 0 ? getScoreColor(scoreData[scoreData.length - 1].value) : colors.primary}
              unit=" pts"
              formatValue={(v) => Math.round(v).toString()}
              title={t("scoreForga2")}
              emptyMessage={t("scoreChartEmptyMessage")}
            />
          </View>

          {/* Score Stats */}
          {scoreStats && (
            <View style={styles.statsRow}>
              <StatCard
                label={t("statEvolution")}
                value={`${scoreStats.diff >= 0 ? '+' : ''}${scoreStats.diff}`}
                unit="pts"
                color={scoreStats.diff >= 0 ? colors.success : colors.error}
              />
              <StatCard
                label={t("statAverage")}
                value={scoreStats.avg.toString()}
                unit="pts"
                color={getScoreColor(scoreStats.avg)}
              />
              <StatCard
                label={t("statEntries")}
                value={scoreStats.entries.toString()}
                unit=""
                color={colors.textSecondary}
              />
            </View>
          )}

          {/* Goal Progress */}
          {profile && profile.objective !== 'maintain' && (
            <GoalProgress
              currentWeight={weightData.length > 0 ? weightData[weightData.length - 1].value : profile.currentWeight}
              startWeight={profile.currentWeight}
              targetWeight={profile.targetWeight}
              objective={profile.objective}
            />
          )}
        </>
      )}

      <View style={{ height: spacing['5xl'] }} />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  timeRangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  timeRangeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeRangeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeRangeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timeRangeTextActive: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  statUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginTop: spacing.sm,
  },
  goalTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalWeight: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  goalBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  goalPercent: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  goalRemaining: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
}));
