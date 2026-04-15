import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
  Platform,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { fonts, fontSizes, spacing, borderRadius, shadows, makeStyles } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/context/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShareStreakCard } from '../src/components/gamification/ShareStreakCard';
import { WaterCard } from '../src/components/hydration/WaterCard';
import { useShareCard } from '../src/hooks/useShareCard';
import { BadgeUnlockToast } from '../src/components/gamification/BadgeUnlockToast';
import { UndoToast } from '../src/components/ui/UndoToast';
import { PremiumExpiredBanner } from '../src/components/ui/PremiumExpiredBanner';
import { usePremium } from '../src/hooks/usePremium';
import { useT } from '../src/i18n';
import * as Haptics from 'expo-haptics';
import type { BadgeType } from '../src/types/user';

const NUTRITION_HERO_IMAGE =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=60';
const SCAN_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=60';
const PHOTO_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=60';

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastBadge, setToastBadge] = useState<BadgeType | null>(null);
  const [undoSlot, setUndoSlot] = useState<string | null>(null);
  const { cardRef, share } = useShareCard();
  const styles = useStyles();
  const { t } = useT();
  const { colors } = useTheme();

  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const { currentScore, weeklyChange } = useScoreStore();
  const todayMeals = useMealStore((s) => s.todayMeals);
  const prevMealCountRef = useRef(todayMeals.length);
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

  // Detect new meal added → show undo toast + haptic
  useEffect(() => {
    if (todayMeals.length > prevMealCountRef.current) {
      const newest = todayMeals[todayMeals.length - 1];
      if (newest) {
        setUndoSlot(newest.slot);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
    }
    prevMealCountRef.current = todayMeals.length;
  }, [todayMeals]);

  const handleUndoMeal = useCallback(() => {
    if (undoSlot) {
      useMealStore.getState().removeValidatedMeal(undoSlot as any);
      setUndoSlot(null);
    }
  }, [undoSlot]);

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
    const isSunday = now.getDay() === 0;
    if (checkIns.length === 0) return true; // No check-in ever → always show
    const lastCheckIn = [...checkIns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const daysSince = (Date.now() - new Date(lastCheckIn.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    // Show if overdue (> 7 days since last check-in) or on Sunday if due this week
    if (daysSince > 7) return true;
    if (isSunday && daysSince > 6) return true;
    return false;
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
      // Timing insights
      breakfastLogged: todayMeals.some((m) => m.slot === 'breakfast'),
      lastMealHour: todayMeals.length > 0
        ? Math.max(...todayMeals.map((m) => new Date(m.validatedAt).getHours()))
        : undefined,
      hoursWithoutMeal: todayMeals.length > 0
        ? Math.round((now.getTime() - Math.max(...todayMeals.map((m) => new Date(m.validatedAt).getTime()))) / 3600000)
        : undefined,
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
        {/* Hero Header with image */}
        <ImageBackground
          source={{ uri: NUTRITION_HERO_IMAGE }}
          style={styles.headerBg}
          imageStyle={styles.headerBgImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', colors.background]}
            style={styles.headerOverlay}
          >
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
          </LinearGradient>
        </ImageBackground>

        {currentStreak >= 3 && (
          <Pressable
            style={styles.shareStreakBtn}
            onPress={() => setShowShareModal(true)}
          >
            <Text style={styles.shareStreakBtnText}>STREAK {'\u2192'}</Text>
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
              {t('planAdjusted', { adjustment: (lastCalorieAdjustment.calorieAdjustment > 0 ? '+' : '') + lastCalorieAdjustment.calorieAdjustment })}
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

        {/* Objective */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveText}>
              {t('objectiveLabel', { weight: profile.targetWeight })}
              {monthsToGoal > 0 ? ` \u2014 ${t('objectiveMonths', { months: monthsToGoal })}` : ` \u2014 ${t('objectiveReached')}`}
            </Text>
          </View>
        </Animated.View>

        {/* Water tracking */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionLabel}>{t('hydrationSection')}</Text>
          <WaterCard />
        </Animated.View>

        {/* Coach Card */}
        {coachMessage && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={styles.sectionLabel}>COACH</Text>
            <CoachCard message={coachMessage} />
          </Animated.View>
        )}

        {/* Meal Slots */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionLabel}>{t('mealsOfDay')}</Text>
          <View style={styles.section}>
            <MealSlotList slots={slots} />
          </View>
        </Animated.View>

        {/* Scan actions with images */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionLabel}>{t('addMealSection')}</Text>
          <View style={styles.scanActions}>
            <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/barcode')}>
              <ImageBackground
                source={{ uri: SCAN_IMAGE }}
                style={styles.scanActionImage}
                imageStyle={styles.scanActionImageInner}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.scanActionOverlay}
                >
                  <Text style={styles.scanActionTitle}>SCAN</Text>
                  <Text style={styles.scanActionSub}>{t('barcode')}</Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
            <Pressable style={styles.scanActionBtn} onPress={() => router.push('/scan/photo')}>
              <ImageBackground
                source={{ uri: PHOTO_IMAGE }}
                style={styles.scanActionImage}
                imageStyle={styles.scanActionImageInner}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  style={styles.scanActionOverlay}
                >
                  <Text style={styles.scanActionTitle}>PHOTO</Text>
                  <Text style={styles.scanActionSub}>{t('identifyDish')}</Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </View>
        </Animated.View>

        {/* Quick actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionBtn} onPress={() => router.push('/weekly-plan')}>
              <LinearGradient
                colors={[`${colors.primary}18`, `${colors.primary}08`]}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionText}>{t('weeklyPlanLabel')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.quickActionBtn} onPress={() => router.push('/recipes')}>
              <LinearGradient
                colors={[`${colors.primary}18`, `${colors.primary}08`]}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionText}>{t('recipesLabel')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.quickActionBtn} onPress={() => router.push('/meal-history')}>
              <LinearGradient
                colors={[`${colors.primary}18`, `${colors.primary}08`]}
                style={styles.quickActionGradient}
              >
                <Text style={styles.quickActionText}>{t('historyLabel')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      {undoSlot && (
        <UndoToast
          message={t('mealAdded')}
          onUndo={handleUndoMeal}
          onDismiss={() => setUndoSlot(null)}
        />
      )}
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

  // Hero header
  headerBg: {
    width: '100%',
    height: 160,
    marginBottom: spacing.md,
  },
  headerBgImage: {
    borderRadius: borderRadius.xl,
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.white,
    fontWeight: '600',
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.white,
    textTransform: 'uppercase',
  },
  pageSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  shareStreakBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  shareStreakBtnText: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.primary,
  },
  objectiveCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  objectiveText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },

  // Scan actions with images
  scanActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scanActionBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.card,
  },
  scanActionImage: {
    width: '100%',
    height: 100,
  },
  scanActionImageInner: {
    borderRadius: borderRadius.lg - 1,
  },
  scanActionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderRadius: borderRadius.lg - 1,
  },
  scanActionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.white,
  },
  scanActionSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  quickActionGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  quickActionText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.text,
    textAlign: 'center',
  },

  // Modals
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
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.white,
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  modalCancelBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },

  // Check-in banner
  checkInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  checkInBannerText: {
    flex: 1,
  },
  checkInBannerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderLeftColor: colors.carbs,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  adjustedMacrosText: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.carbs,
  },
}));
