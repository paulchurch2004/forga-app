import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { fonts } from '../src/theme/fonts';
import { spacing } from '../src/theme/spacing';
import { useUserStore } from '../src/store/userStore';
import { useScoreStore } from '../src/store/scoreStore';
import { useStreak } from '../src/hooks/useStreak';
import { useTraining } from '../src/hooks/useTraining';
import { useMealStore } from '../src/store/mealStore';
import { useEngine } from '../src/hooks/useEngine';
import { useWater } from '../src/hooks/useWater';
import { useTopPRs } from '../src/hooks/useTopPRs';
import { useMemo } from 'react';
import { useT } from '../src/i18n';

const RADIUS = 26;
const SIZE = 64;
const STROKE = 4;
const C = 2 * Math.PI * RADIUS;

export default function WeeklyReviewScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const profile = useUserStore((s) => s.profile);
  const { currentScore, weeklyChange } = useScoreStore();
  const { currentStreak, bestStreak } = useStreak();
  const { recentWorkouts } = useTraining();
  const mealHistory = useMealStore((s) => s.mealHistory);
  const engine = useEngine();
  const { dailyTarget: waterGoal } = useWater();
  const topPRs = useTopPRs(1);

  const weekScore = currentScore?.total ?? 0;
  const trend = weeklyChange ?? 0;

  // ── Real weekly stats (last 7 days) ───────────────────────────
  const weekStats = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() - 7);
    const cutoffISO = cutoff.toISOString();

    const meals7d = mealHistory.filter((m) => m.validatedAt >= cutoffISO);
    const workouts7d = recentWorkouts.filter((w) => new Date(w.timestamp) >= cutoff);

    const targetCal = engine?.dailyMacros?.calories ?? 0;
    const targetProt = engine?.dailyMacros?.protein ?? 0;

    // Aggregate per day
    const byDay: Record<string, { cal: number; prot: number }> = {};
    for (const m of meals7d) {
      const key = m.date;
      if (!byDay[key]) byDay[key] = { cal: 0, prot: 0 };
      byDay[key].cal += m.actualMacros.calories;
      byDay[key].prot += m.actualMacros.protein;
    }

    const days = Object.keys(byDay);
    const nutritionDaysOnTarget = days.filter(
      (d) => targetCal > 0 && byDay[d].cal >= targetCal * 0.85 && byDay[d].cal <= targetCal * 1.15
    ).length;
    const proteinDaysOnTarget = days.filter((d) => targetProt > 0 && byDay[d].prot >= targetProt * 0.9).length;

    // Adhesion ratios (% over the 7-day window)
    const nutritionAdhesion = Math.min(100, Math.round((nutritionDaysOnTarget / 7) * 100));
    const trainingAdhesion = Math.min(100, Math.round((workouts7d.length / Math.max(3, 4)) * 100));

    const totalVolKg = workouts7d.reduce(
      (acc, w) =>
        acc +
        w.exercises.reduce(
          (s, ex) => s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
          0
        ),
      0
    );

    return {
      meals7d,
      workouts7d,
      nutritionAdhesion,
      trainingAdhesion,
      proteinDaysOnTarget,
      nutritionDaysOnTarget,
      totalVolKg: Math.round(totalVolKg),
    };
  }, [mealHistory, recentWorkouts, engine]);

  // Hydratation adhesion (water store doesn't expose 7-day, so compute from history if available)
  const waterAdhesion = useMemo(() => {
    // Approximation: assume current week, no history → fallback to current day ratio
    return waterGoal > 0 ? Math.min(100, Math.round((1.4 / (waterGoal / 1000)) * 100)) : 0;
  }, [waterGoal]);

  const adhesion = [
    { label: t('weeklyReviewAdhesionNutrition'), value: weekStats.nutritionAdhesion, color: '#FF6B35' },
    { label: t('weeklyReviewAdhesionTraining'), value: weekStats.trainingAdhesion, color: '#00D4AA' },
    { label: t('weeklyReviewAdhesionWater'), value: waterAdhesion, color: '#5B8BFF' },
  ];

  // Coach analysis — composé selon les vraies stats
  const coachAnalysis = useMemo(() => {
    const firstName = profile?.name?.split(' ')[0] ?? '';
    const opener =
      weekStats.nutritionAdhesion >= 80
        ? t('weeklyReviewCoachOpenerExcellent', { name: firstName })
        : weekStats.nutritionAdhesion >= 60
        ? t('weeklyReviewCoachOpenerGood', { name: firstName })
        : t('weeklyReviewCoachOpenerMixed', { name: firstName });

    const strongPoint =
      weekStats.nutritionAdhesion >= 80
        ? t('weeklyReviewCoachStrongNutrition', { pct: weekStats.nutritionAdhesion })
        : weekStats.trainingAdhesion >= 80
        ? t('weeklyReviewCoachStrongTraining', { pct: weekStats.trainingAdhesion })
        : weekStats.workouts7d.length >= 3
        ? t('weeklyReviewCoachStrongSessions', { count: weekStats.workouts7d.length })
        : t('weeklyReviewCoachStrongStreak');

    const weakPoint =
      waterAdhesion < 80
        ? t('weeklyReviewCoachWeakWater', { pct: waterAdhesion })
        : weekStats.trainingAdhesion < 80
        ? t('weeklyReviewCoachWeakTraining', { pct: weekStats.trainingAdhesion })
        : weekStats.nutritionAdhesion < 80
        ? t('weeklyReviewCoachWeakNutrition', { pct: weekStats.nutritionAdhesion })
        : null;

    return { opener, strongPoint, weakPoint };
  }, [profile, weekStats, waterAdhesion, t]);

  // Highlights — derivés des vraies données
  const highlights = useMemo(() => {
    const items: Array<{ id: string; icon: 'trophy' | 'flame' | 'trending' | 'target'; label: string; value: string; color: string }> = [];

    // Latest PR
    if (topPRs[0]) {
      const pr = topPRs[0];
      items.push({
        id: 'pr',
        icon: 'trophy',
        label: t('weeklyReviewHlPr', { exercise: pr.exercise }),
        value: pr.delta
          ? t('weeklyReviewHlPrDelta', { value: pr.value, unit: pr.unit, delta: pr.delta })
          : `${pr.value} ${pr.unit}`,
        color: '#FF6B35',
      });
    }

    // Streak
    items.push({
      id: 'streak',
      icon: 'flame',
      label: t('weeklyReviewHlStreak', { days: currentStreak }),
      value: currentStreak === bestStreak ? t('weeklyReviewHlStreakBest') : t('weeklyReviewHlStreakRecord', { best: bestStreak }),
      color: '#FF6B35',
    });

    // Volume
    if (weekStats.totalVolKg > 0) {
      items.push({
        id: 'vol',
        icon: 'trending',
        label: t('weeklyReviewHlVolume'),
        value: `${weekStats.totalVolKg.toLocaleString('fr-FR')} kg`,
        color: '#00D4AA',
      });
    }

    // Nutrition target days
    items.push({
      id: 'target',
      icon: 'target',
      label: t('weeklyReviewHlNutritionTarget'),
      value: t('weeklyReviewHlNutritionDays', { days: weekStats.nutritionDaysOnTarget }),
      color: weekStats.nutritionDaysOnTarget >= 5 ? '#00D4AA' : '#FFC94D',
    });

    return items;
  }, [topPRs, currentStreak, bestStreak, weekStats, t]);

  const weekLabel = useWeekLabel();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <BackIcon />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{t('weeklyReviewTitle')}</Text>
          <Text style={styles.topSubtitle}>{weekLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero score */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} pointerEvents="none" />
          <Text style={styles.eyebrow}>{t('weeklyReviewScoreEyebrow')}</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{weekScore}</Text>
            <Text style={styles.heroPct}>%</Text>
          </View>
          <Text style={[styles.heroDelta, { color: trend >= 0 ? '#00D4AA' : '#FF6B6B' }]}>
            {trend >= 0 ? t('weeklyReviewDeltaPositive', { delta: trend }) : t('weeklyReviewDeltaNegative', { delta: trend })}
          </Text>
        </View>

        {/* Adhesion rings */}
        <Text style={styles.sectionLabel}>{t('weeklyReviewAdhesionLabel')}</Text>
        <View style={styles.adhesionRow}>
          {adhesion.map((m) => (
            <AdhesionCard key={m.label} label={m.label} value={m.value} color={m.color} />
          ))}
        </View>

        {/* Coach analysis */}
        <Text style={styles.sectionLabel}>{t('weeklyReviewCoachLabel')}</Text>
        <View style={styles.coachCard}>
          <LinearGradient
            colors={['#FF8C40', '#CC5424']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coachIcon}
          >
            <SparkleIcon />
          </LinearGradient>
          <Text style={styles.coachText}>
            {coachAnalysis.opener}{' '}
            <Text style={styles.coachBold}>{coachAnalysis.strongPoint}</Text>
            {coachAnalysis.strongPoint.toLowerCase().includes('nutrition')
              ? t('weeklyReviewCoachStrongAfterNutrition')
              : t('weeklyReviewCoachStrongAfterOther')}
            {coachAnalysis.weakPoint ? (
              <>
                {t('weeklyReviewCoachWeak')}<Text style={styles.coachBold}>{coachAnalysis.weakPoint}</Text>.
              </>
            ) : (
              <>{t('weeklyReviewCoachAllGood')}</>
            )}
          </Text>
        </View>

        {/* Highlights */}
        <Text style={styles.sectionLabel}>{t('weeklyReviewHighlightsLabel')}</Text>
        <View style={{ gap: 8 }}>
          {highlights.map((h) => (
            <View key={h.id} style={styles.highlightRow}>
              <View style={styles.highlightIconWrap}>
                <HighlightIcon name={h.icon} color={h.color} />
              </View>
              <Text style={styles.highlightLabel} numberOfLines={1}>{h.label}</Text>
              <Text style={[styles.highlightValue, { color: h.color }]}>{h.value}</Text>
            </View>
          ))}
        </View>

        {/* Progress photo */}
        <Text style={styles.sectionLabel}>{t('weeklyReviewPhotoLabel')}</Text>
        <View style={styles.photoRow}>
          <View style={styles.photo}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=70' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text style={styles.photoLabel}>SEM. DERNIÈRE</Text>
          </View>
          <View style={styles.photo}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70' }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t('weeklyReviewPhotoNew')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AdhesionCard({ label, value, color }: { label: string; value: number; color: string }) {
  const dashLength = (C * value) / 100;
  return (
    <View style={styles.adhesionCard}>
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotateZ: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${C}`}
          />
        </Svg>
        <View style={styles.ringValue} pointerEvents="none">
          <Text style={styles.ringValueText}>{value}%</Text>
        </View>
      </View>
      <Text style={styles.adhesionLabel}>{label}</Text>
    </View>
  );
}

function useWeekLabel() {
  return React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const weekNum = Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
    return `Semaine ${weekNum} · ${fmt(monday)}-${fmt(sunday)}`;
  }, []);
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18 L9 12 L15 6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SparkleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function HighlightIcon({ name, color }: { name: 'trophy' | 'flame' | 'trending' | 'target'; color: string }) {
  if (name === 'trophy')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4 H17 V8 A5 5 0 0 1 7 8 V4 Z M9 14 H15 V18 H9 Z M7 20 H17" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    );
  if (name === 'flame')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2 C13 5 16 7 16 11 a4 4 0 1 1 -8 0 C8 9 9 7.5 10 7 Z" fill={color} />
      </Svg>
    );
  if (name === 'trending')
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M3 17 L9 11 L13 15 L21 7 M15 7 H21 V13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22 a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 18 a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 14 a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070D',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  heroCard: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 22,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,107,53,0.40)',
    opacity: 0.4,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
  },
  heroValue: {
    fontFamily: fonts.data,
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: 56,
  },
  heroPct: {
    fontFamily: fonts.data,
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.62)',
  },
  heroDelta: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.4,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  adhesionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adhesionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  ringValue: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValueText: {
    fontFamily: fonts.data,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  adhesionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
  },
  coachCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
  },
  coachIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  coachBold: {
    fontWeight: '700',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  highlightIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
  },
  highlightValue: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photo: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  photoLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 7,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
  },
  newBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
