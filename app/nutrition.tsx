import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { useScoreStore } from '../src/store/scoreStore';
import { useMealStore } from '../src/store/mealStore';
import { useEngine } from '../src/hooks/useEngine';
import { useMealSlot } from '../src/hooks/useMealSlot';
import { useStreak } from '../src/hooks/useStreak';
import { useScore } from '../src/hooks/useScore';
import { HeroScore } from '../src/components/home/HeroScore';
import { MealSlotList } from '../src/components/home/MealSlotList';
import { StreakBadge } from '../src/components/ui/StreakBadge';
import { CoachCard } from '../src/components/home/CoachCard';
import { getCoachMessage, type CoachInput } from '../src/engine/coachEngine';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShareStreakCard } from '../src/components/gamification/ShareStreakCard';
import { WaterCard } from '../src/components/hydration/WaterCard';
import { useShareCard } from '../src/hooks/useShareCard';
import { BadgeUnlockToast } from '../src/components/gamification/BadgeUnlockToast';
import { PremiumExpiredBanner } from '../src/components/ui/PremiumExpiredBanner';
import { usePremium } from '../src/hooks/usePremium';
import { useT } from '../src/i18n';
import type { BadgeType } from '../src/types/user';

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastBadge, setToastBadge] = useState<BadgeType | null>(null);
  const { cardRef, share } = useShareCard();
  const styles = useStyles();
  const { t } = useT();

  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const { currentScore, weeklyChange } = useScoreStore();
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { slots, currentSlot } = useMealSlot();
  const { currentStreak, isTodayValidated } = useStreak();
  const { recalculate } = useScore();
  const badges = useUserStore((s) => s.badges);
  const { isTrialExpired } = usePremium();
  const prevBadgeCount = useRef(badges.length);

  useEffect(() => {
    if (badges.length > prevBadgeCount.current) {
      const newest = badges[badges.length - 1];
      if (newest) setToastBadge(newest.type);
    }
    prevBadgeCount.current = badges.length;
  }, [badges]);

  // Recalculate score on mount and when meals/streak change
  useEffect(() => {
    recalculate();
  }, [todayMeals.length, currentStreak]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    recalculate();
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, [recalculate]);

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

  const monthsToGoal = useMemo(() => {
    if (!profile?.targetDeadline) return 0;
    const now = new Date();
    const deadline = new Date(profile.targetDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  }, [profile]);

  const showCheckInBanner = useMemo(() => {
    const now = new Date();
    const isSunday = now.getDay() === 0; // 0 = Sunday in JS
    if (checkIns.length === 0) return isSunday;
    const lastCheckIn = [...checkIns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const daysSince = (Date.now() - new Date(lastCheckIn.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    // Show on Sunday if no check-in this week, or any day if overdue (> 6 days)
    const noCheckInThisWeek = daysSince > 6;
    return (isSunday && noCheckInThisWeek) || daysSince > 13;
  }, [checkIns]);

  const lastCalorieAdjustment = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((c) => c.calorieAdjustment !== 0) ?? null;
  }, [checkIns]);

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
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = t('greetingMorning');
  else if (hour < 18) greeting = t('greetingAfternoon');
  else greeting = t('greetingEvening');

  const firstName = profile.name.split(' ')[0];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={styles.backText.color}
            colors={[styles.backText.color]}
            progressBackgroundColor={styles.objectiveCard.backgroundColor}
          />
        }
      >
        {/* Back + Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
          </Pressable>
          <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
        </View>

        <Text style={styles.pageTitle}>{t('nutrition')}</Text>
        <Text style={styles.pageSubtitle}>
          {greeting}, {firstName}
        </Text>

        {currentStreak >= 3 && (
          <Pressable
            style={styles.shareStreakBtn}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.shareStreakBtnText}>{'\uD83D\uDD25'} {t('shareMyStreak')}</Text>
          </Pressable>
        )}

        {isTrialExpired && <PremiumExpiredBanner />}

        {/* Share Streak Modal */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ShareStreakCard ref={cardRef} streak={currentStreak} score={currentScore.total} />
              <View style={styles.modalActions}>
                <Pressable style={styles.modalShareBtn} onPress={share}>
                  <Text style={styles.modalShareBtnText}>{t('share')}</Text>
                </Pressable>
                <Pressable style={styles.modalCancelBtn} onPress={() => setShowShareModal(false)}>
                  <Text style={styles.modalCancelBtnText}>{t('close')}</Text>
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
              <Text style={styles.checkInBannerTitle}>{t('checkInTitle')}</Text>
              <Text style={styles.checkInBannerSub}>{t('checkInSub')}</Text>
            </View>
            <Text style={styles.checkInBannerArrow}>{'\u203A'}</Text>
          </Pressable>
        )}

        {/* Adjusted macros */}
        {lastCalorieAdjustment && (
          <View style={styles.adjustedMacros}>
            <Text style={styles.adjustedMacrosText}>
              {'\u26A1'} {t('planAdjusted', { adjustment: (lastCalorieAdjustment.calorieAdjustment > 0 ? '+' : '') + lastCalorieAdjustment.calorieAdjustment })}
            </Text>
          </View>
        )}

        {/* Hero Score */}
        <HeroScore
          score={currentScore}
          weeklyChange={weeklyChange}
          consumed={consumedMacros}
          target={targetMacros}
        />

        {/* Water tracking */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <WaterCard />
        </Animated.View>

        {/* Coach Card */}
        {coachMessage && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <CoachCard message={coachMessage} />
          </Animated.View>
        )}

        {/* Objective */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveIcon}>{'\u2691'}</Text>
            <Text style={styles.objectiveText}>
              {t('objectiveLabel', { weight: profile.targetWeight })}
              {monthsToGoal > 0 ? ` - ${t('objectiveMonths', { months: monthsToGoal })}` : ` - ${t('objectiveReached')}`}
            </Text>
          </View>
        </Animated.View>

        {/* Meal Slots */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <View style={styles.section}>
            <MealSlotList slots={slots} />
          </View>
        </Animated.View>

        {/* Scan actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={styles.scanActions}>
            <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/barcode')}>
              <Text style={styles.scanActionIcon}>{'\uD83D\uDCF7'}</Text>
              <View>
                <Text style={styles.scanActionTitle}>{t('scanner')}</Text>
                <Text style={styles.scanActionSub}>{t('barcode')}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/photo')}>
              <Text style={styles.scanActionIcon}>{'\uD83E\uDD16'}</Text>
              <View>
                <Text style={styles.scanActionTitle}>{t('photoAI')}</Text>
                <Text style={styles.scanActionSub}>{t('identifyDish')}</Text>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionBtn} onPress={() => router.push('/weekly-plan')}>
              <Text style={styles.quickActionIcon}>{'\uD83D\uDCCB'}</Text>
              <Text style={styles.quickActionText}>{t('planAndShopping')}</Text>
            </Pressable>
            <Pressable style={styles.quickActionBtn} onPress={() => router.push('/meal-history')}>
              <Text style={styles.quickActionIcon}>{'\uD83D\uDCC5'}</Text>
              <Text style={styles.quickActionText}>{t('history')}</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <BadgeUnlockToast badgeType={toastBadge} onHide={() => setToastBadge(null)} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  pageSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  shareStreakBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  shareStreakBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
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
}));
