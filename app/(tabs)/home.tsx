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
});
