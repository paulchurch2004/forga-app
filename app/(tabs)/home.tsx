import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/store/userStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
import { useEngine } from '../../src/hooks/useEngine';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { useStreak } from '../../src/hooks/useStreak';
import { useScore } from '../../src/hooks/useScore';
import { ScoreCard } from '../../src/components/home/ScoreCard';
import { DailyMacros } from '../../src/components/home/DailyMacros';
import { MealSlotList } from '../../src/components/home/MealSlotList';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { CoachCard } from '../../src/components/home/CoachCard';
import { getCoachMessage, type CoachInput } from '../../src/engine/coachEngine';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { FitnessVideoBanner } from '../../src/components/home/FitnessVideoBanner';
import { ShareStreakCard } from '../../src/components/gamification/ShareStreakCard';
import { useShareCard } from '../../src/hooks/useShareCard';
import { BadgeUnlockToast } from '../../src/components/gamification/BadgeUnlockToast';
import type { BadgeType } from '../../src/types/user';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastBadge, setToastBadge] = useState<BadgeType | null>(null);
  const { cardRef, share } = useShareCard();

  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const { currentScore, weeklyChange } = useScoreStore();
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { slots, currentSlot } = useMealSlot();
  const { currentStreak, isTodayValidated } = useStreak();
  const { recalculate } = useScore();
  const badges = useUserStore((s) => s.badges);
  const prevBadgeCount = useRef(badges.length);

  // Show toast when a new badge is unlocked
  useEffect(() => {
    if (badges.length > prevBadgeCount.current) {
      const newest = badges[badges.length - 1];
      if (newest) setToastBadge(newest.type);
    }
    prevBadgeCount.current = badges.length;
  }, [badges]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculate();
    // Small delay so the user sees the refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [recalculate]);

  // Calculate consumed macros from today's validated meals
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

  // Target macros from engine
  const targetMacros = useMemo(() => {
    if (!engine) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return engine.dailyMacros;
  }, [engine]);

  // Calculate months remaining from user's selected deadline
  const monthsToGoal = useMemo(() => {
    if (!profile?.targetDeadline) return 0;
    const now = new Date();
    const deadline = new Date(profile.targetDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
    return Math.round(diffMonths);
  }, [profile]);

  // Check-in banner: show if no check-in for > 6 days
  const showCheckInBanner = useMemo(() => {
    if (checkIns.length === 0) return true;
    const lastCheckIn = [...checkIns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const daysSince = (Date.now() - new Date(lastCheckIn.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 6;
  }, [checkIns]);

  // Last calorie adjustment from check-ins
  const lastCalorieAdjustment = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((c) => c.calorieAdjustment !== 0) ?? null;
  }, [checkIns]);

  // Coach message
  const coachMessage = useMemo(() => {
    if (!profile) return null;
    const now = new Date();
    const input: CoachInput = {
      firstName: profile.name.split(' ')[0],
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      currentStreak,
      isTodayValidated,
      mealsValidatedCount: todayMeals.length,
      mealsExpected: profile.mealsPerDay || 4,
      currentSlot: currentSlot?.slot ?? null,
      score: currentScore,
      objective: profile.objective || 'maintain',
      consumedProtein: consumedMacros.protein,
      targetProtein: targetMacros.protein,
      consumedCalories: consumedMacros.calories,
      targetCalories: targetMacros.calories,
    };
    return getCoachMessage(input);
  }, [profile, currentStreak, isTodayValidated, todayMeals, currentSlot, currentScore, consumedMacros, targetMacros]);

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  // Greeting based on time of day
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) {
    greeting = 'Bonjour';
  } else if (hour < 18) {
    greeting = 'Bon apres-midi';
  } else {
    greeting = 'Bonsoir';
  }

  const firstName = profile.name.split(' ')[0];

  return (
    <View style={styles.wrapper}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      {/* Fitness Video Banner */}
      <FitnessVideoBanner />

      {/* Greeting Header */}
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextContainer}>
            <Text style={styles.greeting}>
              {greeting}, {firstName}
            </Text>
            <Text style={styles.subtitle}>
              {isTodayValidated
                ? 'Continue comme ca, tu geres !'
                : 'Pret a forger ta journee ?'}
            </Text>
          </View>
          <StreakBadge
            streak={currentStreak}
            isActive={isTodayValidated}
            size="sm"
          />
        </View>
        {currentStreak >= 3 && (
          <Pressable
            style={styles.shareStreakBtn}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.shareStreakBtnText}>{'\uD83D\uDD25'} Partager mon streak</Text>
          </Pressable>
        )}
      </View>

      {/* Share Streak Modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ShareStreakCard
              ref={cardRef}
              streak={currentStreak}
              score={currentScore.total}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalShareBtn} onPress={share}>
                <Text style={styles.modalShareBtnText}>Partager</Text>
              </Pressable>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Check-in banner */}
      {showCheckInBanner && (
        <Pressable style={styles.checkInBanner} onPress={() => router.push('/checkin')}>
          <Text style={styles.checkInBannerIcon}>{'\uD83D\uDDD3'}</Text>
          <View style={styles.checkInBannerText}>
            <Text style={styles.checkInBannerTitle}>Check-in de la semaine</Text>
            <Text style={styles.checkInBannerSub}>2 min pour affiner ton plan</Text>
          </View>
          <Text style={styles.checkInBannerArrow}>{'\u203A'}</Text>
        </Pressable>
      )}

      {/* Adjusted macros indicator */}
      {lastCalorieAdjustment && (
        <View style={styles.adjustedMacros}>
          <Text style={styles.adjustedMacrosText}>
            {'\u26A1'} Plan ajuste {lastCalorieAdjustment.calorieAdjustment > 0 ? '+' : ''}{lastCalorieAdjustment.calorieAdjustment} kcal
          </Text>
        </View>
      )}

      {/* Coach Card */}
      {coachMessage && <CoachCard message={coachMessage} />}

      {/* Objective Reminder */}
      <View style={styles.objectiveCard}>
        <Text style={styles.objectiveIcon}>{'\u2691'}</Text>
        <Text style={styles.objectiveText}>
          Objectif : {profile.targetWeight}kg
          {monthsToGoal > 0 ? ` - dans ~${monthsToGoal} mois` : ' - atteint !'}
        </Text>
      </View>

      {/* Score Card */}
      <View style={styles.section}>
        <ScoreCard score={currentScore} weeklyChange={weeklyChange} />
      </View>

      {/* Daily Macros */}
      <View style={styles.section}>
        <DailyMacros consumed={consumedMacros} target={targetMacros} />
      </View>

      {/* Meal Slots */}
      <View style={styles.section}>
        <MealSlotList slots={slots} />
      </View>

      {/* Scan actions */}
      <View style={styles.scanActions}>
        <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/barcode')}>
          <Text style={styles.scanActionIcon}>{'\uD83D\uDCF7'}</Text>
          <View>
            <Text style={styles.scanActionTitle}>Scanner</Text>
            <Text style={styles.scanActionSub}>Code-barres</Text>
          </View>
        </Pressable>
        <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/photo')}>
          <Text style={styles.scanActionIcon}>{'\uD83E\uDD16'}</Text>
          <View>
            <Text style={styles.scanActionTitle}>Photo IA</Text>
            <Text style={styles.scanActionSub}>Identifier un plat</Text>
          </View>
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/shopping-list')}>
          <Text style={styles.quickActionIcon}>{'\uD83D\uDED2'}</Text>
          <Text style={styles.quickActionText}>Liste de courses</Text>
        </Pressable>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/weekly-plan')}>
          <Text style={styles.quickActionIcon}>{'\uD83D\uDCCB'}</Text>
          <Text style={styles.quickActionText}>Plan semaine</Text>
        </Pressable>
        <Pressable style={styles.quickActionBtn} onPress={() => router.push('/meal-history')}>
          <Text style={styles.quickActionIcon}>{'\uD83D\uDCC5'}</Text>
          <Text style={styles.quickActionText}>Historique</Text>
        </Pressable>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
    <BadgeUnlockToast
      badgeType={toastBadge}
      onHide={() => setToastBadge(null)}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
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
  header: {
    marginBottom: spacing.lg,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTextContainer: {
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
  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  objectiveIcon: {
    fontSize: 18,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  objectiveText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
  scanActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scanActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scanActionIcon: {
    fontSize: 22,
  },
  scanActionTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
  },
  scanActionSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  shareStreakBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  shareStreakBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalShareBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalShareBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  modalCancelBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalCancelBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  checkInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: `${colors.primary}18`,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  checkInBannerIcon: {
    fontSize: 20,
  },
  checkInBannerText: {
    flex: 1,
  },
  checkInBannerTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  checkInBannerSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  checkInBannerArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xl,
    color: colors.primary,
  },
  adjustedMacros: {
    backgroundColor: `${colors.carbs}15`,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  adjustedMacrosText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.carbs,
  },
});
