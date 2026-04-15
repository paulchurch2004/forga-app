import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { useMealStore } from '../src/store/mealStore';
import { useScoreStore } from '../src/store/scoreStore';
import { useUserStore } from '../src/store/userStore';
import { useWaterStore } from '../src/store/waterStore';
import { useWater } from '../src/hooks/useWater';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import { getScoreColor } from '../src/theme/colors';
import {
  buildPeriodReport,
  getThisWeekRange,
  getLastWeekRange,
  getThisMonthRange,
  getLastMonthRange,
  type PeriodReport,
} from '../src/engine/reportEngine';

// ──────────── TYPES ────────────

type Period = 'this_week' | 'last_week' | 'this_month' | 'last_month';

const PERIOD_RANGES: Record<Period, () => { start: string; end: string }> = {
  this_week: getThisWeekRange,
  last_week: getLastWeekRange,
  this_month: getThisMonthRange,
  last_month: getLastMonthRange,
};

// ──────────── MINI BAR CHART ────────────

function MacroBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const styles = useBarStyles();
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const height = 80;
  const barH = Math.max(4, height * pct);

  return (
    <View style={styles.barCol}>
      <Text style={styles.barValue}>{value}</Text>
      <Svg width={28} height={height}>
        <Rect x={4} y={0} width={20} height={height} rx={4} fill="rgba(255,255,255,0.06)" />
        <Rect x={4} y={height - barH} width={20} height={barH} rx={4} fill={color} />
      </Svg>
      <Text style={styles.barLabel}>{label}</Text>
    </View>
  );
}

// ──────────── STAT CARD ────────────

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color?: string }) {
  const styles = useCardStyles();
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      {subtitle && <Text style={styles.statSub}>{subtitle}</Text>}
    </View>
  );
}

// ──────────── MAIN SCREEN ────────────

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, locale } = useT();
  const [period, setPeriod] = useState<Period>('this_week');

  const mealHistory = useMealStore((s) => s.mealHistory);
  const scoreHistory = useScoreStore((s) => s.scoreHistory);
  const waterHistory = useWaterStore((s) => s.history);
  const weightLog = useUserStore((s) => s.weightLog);
  const profile = useUserStore((s) => s.profile);
  const { dailyTarget: waterTarget } = useWater();

  const report: PeriodReport = useMemo(() => {
    const { start, end } = PERIOD_RANGES[period]();
    return buildPeriodReport(
      start,
      end,
      mealHistory,
      scoreHistory,
      waterHistory,
      weightLog,
      waterTarget,
      profile?.mealsPerDay ?? 4,
    );
  }, [period, mealHistory, scoreHistory, waterHistory, weightLog, waterTarget, profile]);

  const periodLabels: Record<Period, string> = {
    this_week: locale === 'en' ? 'This week' : 'Cette semaine',
    last_week: locale === 'en' ? 'Last week' : 'Semaine derniere',
    this_month: locale === 'en' ? 'This month' : 'Ce mois',
    last_month: locale === 'en' ? 'Last month' : 'Mois dernier',
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
        </Pressable>
        <Text style={styles.title}>{locale === 'en' ? 'Report' : 'Bilan'}</Text>
      </View>

      {/* Period selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
        {(Object.keys(periodLabels) as Period[]).map((p) => (
          <Pressable
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {periodLabels[p]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date range */}
      <Text style={styles.dateRange}>
        {formatDate(report.startDate)} — {formatDate(report.endDate)}
      </Text>

      {/* Overview stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title={locale === 'en' ? 'Adherence' : 'Adherence'}
          value={`${report.adherencePct}%`}
          subtitle={`${report.daysWithMeals}/${report.totalDays} ${locale === 'en' ? 'days' : 'jours'}`}
          color={report.adherencePct >= 80 ? colors.success : report.adherencePct >= 50 ? colors.warning : colors.error}
        />
        <StatCard
          title={locale === 'en' ? 'Avg score' : 'Score moyen'}
          value={`${report.avgScore}`}
          subtitle={report.scoreTrend >= 0 ? `+${report.scoreTrend}` : `${report.scoreTrend}`}
          color={getScoreColor(report.avgScore)}
        />
        <StatCard
          title={locale === 'en' ? 'Weight' : 'Poids'}
          value={report.weightChange !== null ? `${report.weightChange > 0 ? '+' : ''}${report.weightChange} kg` : '—'}
          subtitle={report.weightEnd !== null ? `${report.weightEnd} kg` : undefined}
        />
        <StatCard
          title={locale === 'en' ? 'Water' : 'Eau'}
          value={`${Math.round(report.waterAvgMl / 1000 * 10) / 10}L`}
          subtitle={`${report.waterDaysOnTarget}/${report.totalDays} ${locale === 'en' ? 'on target' : 'objectif'}`}
          color={report.waterDaysOnTarget >= report.totalDays * 0.7 ? '#00BFFF' : colors.textSecondary}
        />
      </View>

      {/* Average macros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {locale === 'en' ? 'Average daily macros' : 'Macros moyennes / jour'}
        </Text>
        <View style={styles.macroRow}>
          <MacroBar
            value={report.avgMacros.calories}
            max={profile?.dailyCalories ?? 2500}
            color={colors.primary}
            label="kcal"
          />
          <MacroBar
            value={report.avgMacros.protein}
            max={profile?.dailyProtein ?? 150}
            color={colors.success}
            label={locale === 'en' ? 'Prot' : 'Prot'}
          />
          <MacroBar
            value={report.avgMacros.carbs}
            max={profile?.dailyCarbs ?? 250}
            color={colors.warning}
            label={locale === 'en' ? 'Carbs' : 'Gluc'}
          />
          <MacroBar
            value={report.avgMacros.fat}
            max={profile?.dailyFat ?? 70}
            color={colors.fat}
            label={locale === 'en' ? 'Fat' : 'Lip'}
          />
        </View>
      </View>

      {/* Daily breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {locale === 'en' ? 'Daily breakdown' : 'Detail par jour'}
        </Text>
        {report.days.map((day) => (
          <View key={day.date} style={styles.dayRow}>
            <View style={styles.dayLeft}>
              <Text style={styles.dayDate}>
                {new Date(day.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { weekday: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.dayMeals}>
                {day.mealsLogged} {locale === 'en' ? 'meals' : 'repas'}
              </Text>
            </View>
            <Text style={styles.dayCal}>{day.macros.calories} kcal</Text>
            <Text style={styles.dayProt}>{day.macros.protein}g P</Text>
            {day.score && (
              <View style={[styles.dayScoreBadge, { backgroundColor: `${getScoreColor(day.score.total)}20` }]}>
                <Text style={[styles.dayScore, { color: getScoreColor(day.score.total) }]}>
                  {day.score.total}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Best / Worst day */}
      {(report.bestDay || report.worstDay) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? 'Highlights' : 'Points forts'}
          </Text>
          {report.bestDay && (
            <View style={styles.highlightRow}>
              <Text style={styles.highlightIcon}>{'\u2B50'}</Text>
              <Text style={styles.highlightText}>
                {locale === 'en' ? 'Best day' : 'Meilleur jour'}: {formatDate(report.bestDay.date)} — {locale === 'en' ? 'Score' : 'Score'} {report.bestDay.score}
              </Text>
            </View>
          )}
          {report.worstDay && report.worstDay.date !== report.bestDay?.date && (
            <View style={styles.highlightRow}>
              <Text style={styles.highlightIcon}>{'\u26A0'}</Text>
              <Text style={styles.highlightText}>
                {locale === 'en' ? 'Needs work' : 'A ameliorer'}: {formatDate(report.worstDay.date)} — {locale === 'en' ? 'Score' : 'Score'} {report.worstDay.score}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

// ──────────── STYLES ────────────

const useBarStyles = makeStyles((colors) => ({
  barCol: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  barValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
  },
  barLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
}));

const useCardStyles = makeStyles((colors) => ({
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: '45%',
  },
  statTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statSub: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
}));

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  periodRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodChipActive: {
    backgroundColor: `${colors.primary}18`,
    borderColor: colors.primary,
  },
  periodText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
  },
  dateRange: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  macroRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}60`,
    gap: spacing.md,
  },
  dayLeft: {
    flex: 1,
  },
  dayDate: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  dayMeals: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  dayCal: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  dayProt: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.success,
  },
  dayScoreBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dayScore: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  highlightIcon: {
    fontSize: 18,
  },
  highlightText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
}));
