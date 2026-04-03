import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../src/store/userStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
import { useEngine } from '../../src/hooks/useEngine';
import { useStreak } from '../../src/hooks/useStreak';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { colors, fonts, fontSizes, spacing, borderRadius, getScoreColor, getScoreLabel } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import type { Objective } from '../../src/types/user';

const OBJECTIVE_LABELS: Record<Objective, string> = {
  bulk: 'Prise de masse',
  cut: 'Seche',
  maintain: 'Maintien',
  recomp: 'Recomposition',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  const profile = useUserStore((s) => s.profile);
  const { currentScore, weeklyChange } = useScoreStore();
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { currentStreak, isTodayValidated } = useStreak();

  const consumedMacros = useMemo(() => {
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of todayMeals) {
      result.calories += meal.actualMacros.calories;
      result.protein += meal.actualMacros.protein;
      result.carbs += meal.actualMacros.carbs;
      result.fat += meal.actualMacros.fat;
    }
    return result;
  }, [todayMeals]);

  const targetMacros = useMemo(() => {
    if (!engine) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return engine.dailyMacros;
  }, [engine]);

  if (!profile) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = 'Bonjour';
  else if (hour < 18) greeting = 'Bon apres-midi';
  else greeting = 'Bonsoir';

  const firstName = profile.name.split(' ')[0];
  const calPct = targetMacros.calories > 0
    ? Math.min(Math.round((consumedMacros.calories / targetMacros.calories) * 100), 100)
    : 0;

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingCol}>
          <Text style={styles.greeting}>
            {greeting}, {firstName}
          </Text>
          <Text style={styles.subtitle}>
            {isTodayValidated ? 'Continue comme ca !' : 'Pret a forger ta journee ?'}
          </Text>
        </View>
        <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
      </View>

      {/* ── NUTRITION CARD ── */}
      <Pressable style={styles.cardLarge} onPress={() => router.push('/nutrition')}>
        <LinearGradient
          colors={['#1a1033', '#FF6B3518']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>NUTRITION</Text>
            <Text style={styles.cardArrow}>{'\u203A'}</Text>
          </View>

          {/* Calorie bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${calPct}%` }]} />
          </View>
          <Text style={styles.calText}>
            {consumedMacros.calories} / {targetMacros.calories} kcal
          </Text>

          {/* Macro pills */}
          <View style={styles.macroPills}>
            <View style={[styles.macroPill, { borderColor: colors.protein }]}>
              <Text style={[styles.macroPillText, { color: colors.protein }]}>
                P {consumedMacros.protein}g
              </Text>
            </View>
            <View style={[styles.macroPill, { borderColor: colors.carbs }]}>
              <Text style={[styles.macroPillText, { color: colors.carbs }]}>
                G {consumedMacros.carbs}g
              </Text>
            </View>
            <View style={[styles.macroPill, { borderColor: colors.fat }]}>
              <Text style={[styles.macroPillText, { color: colors.fat }]}>
                L {consumedMacros.fat}g
              </Text>
            </View>
          </View>

          <Text style={styles.cardHint}>
            Score, repas, coach, scanner...
          </Text>
        </LinearGradient>
      </Pressable>

      {/* ── ENTRAÎNEMENT CARD ── */}
      <Pressable
        style={styles.cardLarge}
        onPress={() => {
          if (Platform.OS === 'web') {
            window.alert('Bientot disponible !');
          } else {
            import('react-native').then(({ Alert }) => {
              Alert.alert('FORGA', 'La section Entrainement arrive bientot !');
            });
          }
        }}
      >
        <LinearGradient
          colors={['#1a1033', '#00D4AA18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>ENTRAINEMENT</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Bientot</Text>
            </View>
          </View>

          <Text style={styles.trainingIcon}>{'\uD83D\uDCAA'}</Text>

          <Text style={styles.trainingDesc}>
            Programmes personnalises, suivi des seances, et progression.
          </Text>
        </LinearGradient>
      </Pressable>

      {/* ── MON ESPACE CARD ── */}
      <Pressable style={styles.cardLarge} onPress={() => router.push('/(tabs)/profile')}>
        <LinearGradient
          colors={['#1a1033', '#7B61FF18']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>MON ESPACE</Text>
            <Text style={styles.cardArrow}>{'\u203A'}</Text>
          </View>

          <View style={styles.spaceRow}>
            {/* Score mini */}
            <View style={styles.scoreMini}>
              <Text style={[styles.scoreMiniNumber, { color: getScoreColor(currentScore.total) }]}>
                {currentScore.total}
              </Text>
              <Text style={styles.scoreMiniLabel}>/100</Text>
            </View>

            {/* User info */}
            <View style={styles.spaceInfo}>
              <Text style={styles.spaceName}>{profile.name}</Text>
              <Text style={styles.spaceObjective}>
                {OBJECTIVE_LABELS[profile.objective] || 'Maintien'}
              </Text>
              <Text style={styles.spaceWeight}>
                {profile.currentWeight}kg {'\u2192'} {profile.targetWeight}kg
              </Text>
            </View>
          </View>

          <Text style={styles.cardHint}>
            Profil, badges, reglages, notifications...
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/scan/barcode')}>
          <Text style={styles.quickActionIcon}>{'\uD83D\uDCF7'}</Text>
          <Text style={styles.quickActionText}>Scanner</Text>
        </Pressable>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/scan/photo')}>
          <Text style={styles.quickActionIcon}>{'\uD83E\uDD16'}</Text>
          <Text style={styles.quickActionText}>Photo IA</Text>
        </Pressable>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/shopping-list')}>
          <Text style={styles.quickActionIcon}>{'\uD83D\uDED2'}</Text>
          <Text style={styles.quickActionText}>Courses</Text>
        </Pressable>
      </View>

      <View style={{ height: spacing['5xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  greetingCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Cards
  cardLarge: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardGradient: {
    padding: spacing.xl,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  cardArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes['2xl'],
    color: colors.textMuted,
  },
  cardHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  // Nutrition card
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  calText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  macroPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroPill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  macroPillText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },

  // Training card
  comingSoonBadge: {
    backgroundColor: `${colors.success}20`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.success,
  },
  trainingIcon: {
    fontSize: 40,
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  trainingDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Mon Espace card
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  scoreMini: {
    alignItems: 'center',
  },
  scoreMiniNumber: {
    fontFamily: fonts.data,
    fontSize: 36,
    fontWeight: '700',
  },
  scoreMiniLabel: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: -4,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  spaceObjective: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  spaceWeight: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
