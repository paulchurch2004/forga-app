import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { useWeightPrompt } from '../../src/hooks/useWeightPrompt';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { WeightPromptModal } from '../../src/components/ui/WeightPromptModal';
import { SkeletonScreen } from '../../src/components/ui/Skeleton';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { MorningRitual } from '../../src/components/home/MorningRitual';
import { WeeklyFormCard } from '../../src/components/home/WeeklyFormCard';
import { CoachFocusCard } from '../../src/components/home/CoachFocusCard';
import { PremiumUpgradeCard } from '../../src/components/home/PremiumUpgradeCard';
import { usePremium } from '../../src/hooks/usePremium';
import { CoachingTooltip } from '../../src/components/coach/CoachingTooltip';
import { MiniStatsGrid } from '../../src/components/home/MiniStatsGrid';
import { QuickAccessRow } from '../../src/components/home/QuickAccessTile';
import { useMealStore } from '../../src/store/mealStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useTrainingStore } from '../../src/store/trainingStore';
import { todayLocalIso } from '../../src/utils/date';
import { useEngine } from '../../src/hooks/useEngine';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { useWater } from '../../src/hooks/useWater';
import { useProgram } from '../../src/hooks/useProgram';
import { MEAL_SLOT_LABELS } from '../../src/types/meal';

// ──────────── CARD DATA ────────────

const CARDS = [
  {
    key: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    titleKey: 'nutritionCard',
    subKey: 'nutritionCardSub',
    route: '/nutrition',
  },
  {
    key: 'training',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    titleKey: 'trainingCard',
    subKey: 'trainingCardSub',
    route: '/(tabs)/training',
  },
  {
    key: 'space',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    titleKey: 'mySpace',
    subKey: 'mySpaceSub',
    route: '/(tabs)/profile',
  },
  {
    key: 'boutique',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
    titleKey: 'boutiqueCard',
    subKey: 'boutiqueCardSub',
    route: null,
    comingSoon: true,
  },
];

// ──────────── 3D CAROUSEL CARD ────────────

function CarouselCard({
  card,
  index,
  scrollX,
  cardWidth,
  cardHeight,
  snapInterval,
  t,
}: {
  card: typeof CARDS[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
  cardWidth: number;
  cardHeight: number;
  snapInterval: number;
  t: any;
}) {
  const styles = useStyles();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const rotateY = interpolate(scrollX.value, inputRange, [25, 0, -25], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.88, 1, 0.88], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.65, 1, 0.65], Extrapolation.CLAMP);

    return {
      transform: [
        { perspective: 800 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const handlePress = useCallback(() => {
    if (card.route) router.push(card.route as any);
  }, [card.route]);

  const content = (
    <ImageBackground
      source={{ uri: card.image }}
      style={[styles.carouselImage, { width: cardWidth, height: cardHeight }]}
      imageStyle={styles.carouselImageInner}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.8)']}
        style={styles.carouselOverlay}
      >
        {card.comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('comingSoonBadge')}</Text>
          </View>
        )}
        <Text style={styles.carouselTitle}>{t(card.titleKey as any)}</Text>
        <Text style={styles.carouselDesc}>{t(card.subKey as any)}</Text>
      </LinearGradient>
    </ImageBackground>
  );

  return (
    <Animated.View style={[{ width: cardWidth, alignItems: 'center' }, animatedStyle]}>
      {card.route ? (
        <Pressable onPress={handlePress} style={styles.carouselCard}>{content}</Pressable>
      ) : (
        <View style={[styles.carouselCard, { opacity: 0.8 }]}>{content}</View>
      )}
    </Animated.View>
  );
}

// ──────────── DOT INDICATOR ────────────

function DotIndicator({ scrollX, snapInterval, count }: { scrollX: Animated.SharedValue<number>; snapInterval: number; count: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <DotItem key={i} index={i} scrollX={scrollX} snapInterval={snapInterval} colors={colors} />
      ))}
    </View>
  );
}

function DotItem({ index, scrollX, snapInterval, colors }: { index: number; scrollX: Animated.SharedValue<number>; snapInterval: number; colors: any }) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * snapInterval, index * snapInterval, (index + 1) * snapInterval];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: colors.primary }, animStyle]} />
  );
}

// ──────────── MAIN SCREEN ────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const profile = useUserStore((s) => s.profile);
  const { currentStreak, isTodayValidated } = useStreak();
  const tutorialStep = useSettingsStore((s) => s.tutorialStep);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const { shouldPrompt, daysSinceLastWeighIn } = useWeightPrompt();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const { isPremium } = usePremium();
  const styles = useStyles();
  const { t } = useT();

  // Real macros / score / next slot for the redesign cards
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const { currentSlot, slots } = useMealSlot();
  const currentScore = useScoreStore((s) => s.currentScore);
  const weeklyChange = useScoreStore((s) => s.weeklyChange);
  const { todayTotal: waterMl, dailyTarget: waterGoal } = useWater();
  const { todayProgramDay, hasActivePlan } = useProgram();

  const consumed = useMemo(() => {
    return todayMeals.reduce(
      (a, m) => ({
        calories: a.calories + m.actualMacros.calories,
        protein: a.protein + m.actualMacros.protein,
        carbs: a.carbs + m.actualMacros.carbs,
        fat: a.fat + m.actualMacros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const targets = engine?.dailyMacros ?? { calories: 2000, protein: 120, carbs: 220, fat: 60 };

  // Tile progress rings.
  // Nutrition = ratio of consumed kcal to target (capped at 1).
  // Séance   = 1 once today has at least one logged workout, else 0.
  // (We could get fancier with "fraction of exercises completed" mid-session,
  //  but the workouts list is only updated on session completion, so the
  //  binary today-done flag is the honest signal here.)
  const nutritionProgress = targets.calories
    ? Math.min(1, consumed.calories / targets.calories)
    : 0;
  // Important: return a primitive (boolean) from the selector — returning
  // `s.workouts[date] ?? []` would create a fresh empty array each render
  // and trigger an infinite re-render loop (Zustand uses Object.is).
  const hasWorkoutToday = useTrainingStore(
    (s) => (s.workouts[todayLocalIso()]?.length ?? 0) > 0,
  );
  const seanceProgress = hasActivePlan && todayProgramDay
    ? (hasWorkoutToday ? 1 : 0)
    : 1; // rest day or no plan → ring is "complete" (no action expected)

  // Compose the coach focus message from real data
  const focusMsg = useMemo(() => {
    const calLeft = Math.max(0, Math.round(targets.calories - consumed.calories));
    const protLeft = Math.max(0, Math.round(targets.protein - consumed.protein));
    const protPct = targets.protein ? consumed.protein / targets.protein : 0;
    const calPct = targets.calories ? consumed.calories / targets.calories : 0;

    const nextSlot = slots.find((s) => !s.isValidated && s.status !== 'upcoming') ?? currentSlot;
    const nextSlotName = nextSlot ? (MEAL_SLOT_LABELS[nextSlot.slot] ?? '').toLowerCase() : null;

    // No data yet today
    if (todayMeals.length === 0) {
      const grams = Math.round(targets.protein / (slots.length || 4));
      return nextSlotName
        ? { message: t('coachFocusOpenerWithSlot', { slot: nextSlotName, grams }), highlight: `${grams}g` }
        : { message: t('coachFocusOpener'), highlight: '' };
    }

    if (calLeft === 0 && protLeft === 0) {
      return { message: t('coachFocusDayDone'), highlight: '' };
    }

    if (protPct < calPct - 0.1 && protLeft > 20) {
      return {
        message: t('coachFocusProteinLever', { slot: nextSlotName ?? t('primaryMealActionFallback'), grams: protLeft }),
        highlight: `${protLeft}g`,
      };
    }

    if (nextSlot?.slot === 'dinner' && calLeft > 200) {
      return {
        message: t('coachFocusDinnerLever', { grams: protLeft }),
        highlight: `${protLeft}g`,
      };
    }

    return {
      message: nextSlotName
        ? t('coachFocusGenericForSlot', { kcal: calLeft, grams: protLeft, slot: nextSlotName })
        : t('coachFocusGenericRest', { kcal: calLeft, grams: protLeft }),
      highlight: `${protLeft}g`,
    };
  }, [todayMeals, consumed, targets, currentSlot, slots, t]);

  // Weekly form score breakdown — derived from currentScore (each subscore
  // normalised to /100 so the bars are comparable on the card).
  const formBreakdown = useMemo(() => {
    const nutritionPct = currentScore ? Math.round((currentScore.nutrition / 40) * 100) : 0;
    const consistencyPct = currentScore ? Math.round((currentScore.consistency / 30) * 100) : 0;
    const disciplinePct = currentScore ? Math.round((currentScore.discipline / 10) * 100) : 0;
    return [
      { label: 'Nutrition', value: nutritionPct, color: '#FF6B35' },
      { label: 'Constance', value: consistencyPct, color: '#5B8BFF' },
      { label: 'Discipline', value: disciplinePct, color: '#00D4AA' },
    ];
  }, [currentScore]);

  const scrollX = useSharedValue(0);
  const visibleWidth = Math.min(screenWidth, contentMaxWidth);
  const cardWidth = visibleWidth * 0.70;
  const cardSpacing = (visibleWidth - cardWidth) / 2;
  const snapInterval = cardWidth + spacing.lg;
  const cardHeight = Math.min(screenHeight - insets.top - insets.bottom - 200, 480);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    if (profile && tutorialStep === 0) {
      const timer = setTimeout(() => setTutorialStep(1), 800);
      return () => clearTimeout(timer);
    }
  }, [profile, tutorialStep, setTutorialStep]);

  // Ask for tracking permission once, after onboarding is done and user is on
  // the home screen. Apple recommends asking AFTER showing value, not at launch.
  useEffect(() => {
    if (!profile) return;
    const t = setTimeout(() => {
      import('../../src/services/tracking').then((m) => m.requestATTIfNeeded());
    }, 2500);
    return () => clearTimeout(t);
  }, [profile]);

  useEffect(() => {
    if (shouldPrompt && profile && tutorialStep === -1) {
      const timer = setTimeout(() => setShowWeightModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPrompt, profile, tutorialStep]);

  if (!profile) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <SkeletonScreen />
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
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.xl }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
      >
        {/* Header */}
        <View style={[styles.header, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg }]}>
          <View style={styles.greetingCol}>
            <Text style={styles.greeting}>
              {greeting}, {firstName}
            </Text>
            <Text style={styles.subtitle}>
              {isTodayValidated ? t('keepItUp') : t('readyToForge')}
            </Text>
          </View>
          <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
        </View>

        {/* Stack centrée — tout le contenu redesign */}
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md }}>
          {/* Morning Ritual — check-in métal qui adapte le plan du jour */}
          <MorningRitual />

          {/* Premium upgrade CTA — visible only for non-premium users */}
          {!isPremium && (
            <PremiumUpgradeCard onPress={() => router.push('/paywall')} />
          )}

          {/* Indice de forme hebdo */}
          <WeeklyFormCard
            score={Math.round(currentScore?.total ?? 0)}
            delta={Math.round(weeklyChange ?? 0)}
            breakdown={formBreakdown}
          />

          {/* Coach focus — message dérivé des vraies macros consommées vs cibles */}
          <CoachFocusCard
            message={focusMsg.message}
            highlight={focusMsg.highlight || undefined}
            onPress={() => router.push('/(tabs)/coach')}
          />

          {/* Quick access — Nutrition + Séance, vraies données */}
          <Text style={styles.sectionLabel}>{t('homeTodayLabel')}</Text>
          <QuickAccessRow
            tiles={[
              {
                eyebrow: t('tileNutritionEyebrow'),
                title: t('tileNutritionTitle'),
                subtitle: t('tileNutritionSubtitle', {
                  consumed: Math.round(consumed.calories),
                  target: Math.round(targets.calories),
                }),
                imageUri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
                accent: true,
                progress: nutritionProgress,
                onPress: () => router.push('/nutrition'),
              },
              hasActivePlan && todayProgramDay
                ? {
                    eyebrow: t('tileSeanceEyebrow'),
                    title: `${t(todayProgramDay.nameKey as any)} · ${todayProgramDay.exercises.length * 12} ${t('tileSeanceMin')}`,
                    subtitle: todayProgramDay.muscleGroups.map((g) => t(`muscle_${g}` as any)).join(' & '),
                    imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
                    progress: seanceProgress,
                    onPress: () => router.push('/(tabs)/training'),
                  }
                : {
                    eyebrow: t('tileSeanceEyebrow'),
                    title: t('tileSeanceRestTitle'),
                    subtitle: hasActivePlan ? t('tileSeanceRestSubNoToday') : t('tileSeanceRestSubNoPlan'),
                    imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
                    progress: 1, // rest day → ring complete, no action pending
                    onPress: () => router.push('/(tabs)/training'),
                  },
            ]}
          />

          {/* Mini stats — vraies données du jour */}
          <MiniStatsGrid
            items={[
              {
                label: t('miniStatCalories'),
                value: String(Math.round(consumed.calories)),
                unit: `/ ${Math.round(targets.calories)}`,
                progress: targets.calories ? consumed.calories / targets.calories : 0,
                color: '#FF6B35',
              },
              {
                label: t('miniStatProteins'),
                value: String(Math.round(consumed.protein)),
                unit: `g / ${Math.round(targets.protein)}`,
                progress: targets.protein ? consumed.protein / targets.protein : 0,
                color: '#5B8BFF',
              },
              {
                label: t('miniStatWater'),
                value: (waterMl / 1000).toFixed(1),
                unit: `L / ${(waterGoal / 1000).toFixed(1)}`,
                progress: waterGoal ? waterMl / waterGoal : 0,
                color: '#00D4AA',
              },
              {
                label: t('miniStatCarbs'),
                value: String(Math.round(consumed.carbs)),
                unit: `g / ${Math.round(targets.carbs)}`,
                progress: targets.carbs ? consumed.carbs / targets.carbs : 0,
                color: '#FFC94D',
              },
            ]}
          />
        </View>
      </Animated.ScrollView>

      {/* Tutorial overlay */}
      <TutorialOverlay step={tutorialStep} />

      {/* First-time coaching tooltips — fire one after the other on first home visit */}
      <CoachingTooltip
        id="home-morning-ritual-v1"
        title={t('tooltipMorningRitualTitle')}
        body={t('tooltipMorningRitualBody')}
        delayMs={900}
      />
      <CoachingTooltip
        id="home-coach-focus-v1"
        title={t('tooltipCoachFocusTitle')}
        body={t('tooltipCoachFocusBody')}
        delayMs={5000}
      />

      {/* Weight prompt modal */}
      <WeightPromptModal
        visible={showWeightModal}
        daysSinceLastWeighIn={daysSinceLastWeighIn}
        onClose={() => setShowWeightModal(false)}
      />
    </View>
  );
}

// ──────────── STYLES ────────────

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  carouselCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  carouselImage: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  carouselImageInner: {
    borderRadius: borderRadius.xl,
  },
  carouselOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  carouselTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  carouselDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
