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
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../src/store/userStore';
import { useScoreStore } from '../src/store/scoreStore';
import { useMealStore } from '../src/store/mealStore';
import { useEngine } from '../src/hooks/useEngine';
import { useMealSlot } from '../src/hooks/useMealSlot';
import { useStreak } from '../src/hooks/useStreak';
import { useScore } from '../src/hooks/useScore';
import { MacroRingsCard } from '../src/components/home/MacroRingsCard';
import { PrimaryMealAction } from '../src/components/home/PrimaryMealAction';
import { HydrationSegmentsCard } from '../src/components/nutrition/HydrationSegmentsCard';
import { NutritionCoachCard } from '../src/components/nutrition/NutritionCoachCard';
import { MealSlotPhotoList, type MealSlotPhotoItem } from '../src/components/nutrition/MealSlotPhotoList';
import { SportRecipeCarousel } from '../src/components/nutrition/SportRecipeCarousel';
import { QuickLogFAB } from '../src/components/nutrition/QuickLogFAB';
import { LogMealActionSheet } from '../src/components/nutrition/LogMealActionSheet';
import { ValidatedMealOverlay } from '../src/components/nutrition/ValidatedMealOverlay';
import { useWater } from '../src/hooks/useWater';
import { MEAL_SLOT_LABELS, MEAL_SLOT_TIMES, getMealSlotLabel, type MealSlot } from '../src/types/meal';
import { getMealById } from '../src/data/meals';
import { getSportRecipeById } from '../src/data/meals/sport';
import { StreakBadge } from '../src/components/ui/StreakBadge';
import { getCoachMessage, type CoachInput } from '../src/engine/coachEngine';
import { fonts, fontSizes, spacing, borderRadius, shadows, makeStyles } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useTheme } from '../src/context/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ShareStreakCard } from '../src/components/gamification/ShareStreakCard';
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
// Big tiles "Plan hebdo" et "Historique" — remplacent les anciennes
// tuiles SCAN/PHOTO (redondantes : déjà dans le FAB flottant + le
// sheet "Logger un repas"). Et la tuile "Recettes" disparaît car
// la bibliothèque a son onglet dédié dans le bottom tab bar.
const WEEKLY_PLAN_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=60';
const HISTORY_IMAGE =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=60';

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastBadge, setToastBadge] = useState<BadgeType | null>(null);
  const [undoSlot, setUndoSlot] = useState<string | null>(null);
  const [validatedOverlay, setValidatedOverlay] = useState<{ kcal: number; protein: number } | null>(null);
  // Slot ciblé par l'action sheet "comment logger ce repas". null =
  // sheet fermée. Le slot est mémorisé pour propager le bon créneau
  // à la destination choisie (recette / scan / saisie manuelle).
  const [logSheetSlot, setLogSheetSlot] = useState<string | null>(null);
  const { cardRef, share } = useShareCard();
  const styles = useStyles();
  const { t, locale } = useT();
  const { colors } = useTheme();

  const profile = useUserStore((s) => s.profile);
  const checkIns = useUserStore((s) => s.checkIns);
  const { todayTotal: waterMl, dailyTarget: waterGoal, add: addWater } = useWater();
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

  // Detect new meal added → undo toast seulement.
  //
  // ⚠ On NE déclenche PLUS le ValidatedMealOverlay (cérémonie plein écran)
  // ici. Cause d'un bug de "double célébration" + latence/superposition :
  // les repas sont toujours ajoutés via un sous-écran (meal/[id] ou
  // meal/custom) qui affiche DÉJÀ sa propre CelebrationOverlay. Quand on
  // revient sur /nutrition, ce useEffect re-célébrait le même repas → 2
  // overlays plein écran empilés → l'app ramait au retour. On garde juste
  // le UndoToast (léger, utile pour annuler un mauvais tap).
  useEffect(() => {
    if (todayMeals.length > prevMealCountRef.current) {
      const newest = todayMeals[todayMeals.length - 1];
      if (newest) {
        setUndoSlot(newest.slot);
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

  // BUG FIX : après validation d'un repas + retour sur nutrition,
  // le scroll était parfois figé (user devait changer de page et
  // revenir pour le débloquer). Cause probable : RefreshControl resté
  // dans un état "pulled" si l'user a navigué pendant l'animation
  // pull-to-refresh, OU un Modal stale qui intercepte les gestures.
  // Fix défensif : au focus de l'écran, on force refreshing=false +
  // on close tout modal stale.
  useFocusEffect(
    useCallback(() => {
      setRefreshing(false);
      setShowShareModal(false);
      // Pas de cleanup nécessaire — l'état se gère via setState.
    }, []),
  );

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

  // Open the action sheet for a single specific meal in a slot. Used both
  // when the slot has only one meal (direct from slot tap) AND when the
  // user picks one entry from the multi-meals selector.
  const openSingleMealActions = useCallback(
    (mealEntry: typeof todayMeals[number]) => {
      const recipe = getMealById(mealEntry.mealId);
      const name = mealEntry.customName ?? recipe?.name ?? '';
      const kcal = Math.round(mealEntry.actualMacros.calories);
      const protein = Math.round(mealEntry.actualMacros.protein);
      Alert.alert(
        name || (t('mealActionTitle' as any) as string),
        `${kcal} kcal · ${protein}g ${t('proteinLabel' as any)}`,
        [
          {
            text: t('mealActionInfo' as any) as string,
            onPress: () =>
              router.push(`/meal/${mealEntry.mealId}?slot=${mealEntry.slot}` as any),
          },
          {
            text: t('mealActionDelete' as any) as string,
            style: 'destructive',
            onPress: () => {
              useMealStore.getState().removeValidatedMealById(mealEntry.id);
              recalculate();
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              }
            },
          },
          { text: t('cancel' as any) as string, style: 'cancel' },
        ],
      );
    },
    [t, recalculate],
  );

  // Slot tap dispatcher.
  // - 0 meal in slot  → navigate to selection
  // - 1 meal in slot  → action sheet (Info / Change / Delete / Cancel)
  // - 2+ meals        → list-style alert: each meal becomes a button that
  //                     opens its own action sheet, plus an "Add another"
  //                     and a "Cancel".
  const handleSlotPress = useCallback(
    (slot: string) => {
      const slotMeals = todayMeals.filter((m) => m.slot === slot);

      if (slotMeals.length === 0) {
        // Avant : push direct vers la bibliothèque. Maintenant on
        // propose le choix entre recette / scan / saisie manuelle —
        // 3 chemins distincts d'entrée pour matcher les habitudes
        // user (recette = "je suis le plan", scan = "produit acheté",
        // manuel = "fait maison ou autre"). Le sheet se ferme et
        // route vers la bonne destination via les callbacks ci-dessous.
        setLogSheetSlot(slot);
        return;
      }

      if (slotMeals.length === 1) {
        const mealEntry = slotMeals[0];
        const recipe = getMealById(mealEntry.mealId);
        const name = mealEntry.customName ?? recipe?.name ?? '';
        const kcal = Math.round(mealEntry.actualMacros.calories);
        const protein = Math.round(mealEntry.actualMacros.protein);
        Alert.alert(
          name || (t('mealActionTitle' as any) as string),
          `${kcal} kcal · ${protein}g ${t('proteinLabel' as any)}`,
          [
            {
              text: t('mealActionAddAnother' as any) as string,
              onPress: () => router.push(`/(tabs)/meals?slot=${slot}` as any),
            },
            {
              text: t('mealActionInfo' as any) as string,
              onPress: () =>
                router.push(`/meal/${mealEntry.mealId}?slot=${slot}` as any),
            },
            {
              text: t('mealActionDelete' as any) as string,
              style: 'destructive',
              onPress: () => {
                useMealStore.getState().removeValidatedMealById(mealEntry.id);
                recalculate();
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                }
              },
            },
            { text: t('cancel' as any) as string, style: 'cancel' },
          ],
        );
        return;
      }

      // Multiple meals in this slot — let the user pick one to act on.
      const totalKcal = Math.round(
        slotMeals.reduce((sum, m) => sum + m.actualMacros.calories, 0),
      );
      const summary = slotMeals
        .map((m) => {
          const r = getMealById(m.mealId);
          const n = m.customName ?? r?.name ?? '';
          return `• ${n} (${Math.round(m.actualMacros.calories)} kcal)`;
        })
        .join('\n');

      const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default' }[] = [
        {
          text: t('mealActionAddAnother' as any) as string,
          onPress: () => router.push(`/(tabs)/meals?slot=${slot}` as any),
        },
      ];

      // Up to 2 meal-specific buttons (iOS Alert is happiest with ≤4 total).
      // For more than 2 meals, we show a "See all" that goes to the same
      // selection screen filtered by slot.
      slotMeals.slice(0, 2).forEach((m) => {
        const r = getMealById(m.mealId);
        const n = m.customName ?? r?.name ?? '';
        buttons.push({
          text: `${n.length > 24 ? n.slice(0, 23) + '…' : n}`,
          onPress: () => openSingleMealActions(m),
        });
      });

      buttons.push({ text: t('cancel' as any) as string, style: 'cancel' });

      Alert.alert(
        `${slotMeals.length} ${t('mealActionMultipleTitle' as any)}`,
        `${totalKcal} kcal\n\n${summary}`,
        buttons,
      );
    },
    [todayMeals, t, recalculate, openSingleMealActions],
  );

  // Map today's slots → meal items with real recipe image / aggregated kcal.
  // A slot with multiple meals shows "Nom du 1er + N de plus" and the
  // total kcal sum.
  const mealItems = useMemo<MealSlotPhotoItem[]>(() => {
    return slots.map((s) => {
      const slotMeals = todayMeals.filter((m) => m.slot === s.slot);
      const first = slotMeals[0];
      // Une recette SPORT loguée a un mealId absent du catalogue classique
      // → on résout son image/nom via getSportRecipeById. Sinon catalogue
      // normal.
      const firstSport = first?.isSportRecipe ? getSportRecipeById(first.mealId) : undefined;
      const firstRecipe = first && !firstSport ? getMealById(first.mealId) : undefined;
      const firstName = first
        ? first.customName ?? firstSport?.name ?? firstRecipe?.name ?? null
        : null;
      const label =
        slotMeals.length > 1 && firstName
          ? `${firstName} +${slotMeals.length - 1}`
          : firstName;
      const totalKcal = slotMeals.length
        ? Math.round(slotMeals.reduce((sum, m) => sum + m.actualMacros.calories, 0))
        : undefined;
      return {
        id: s.slot,
        label: MEAL_SLOT_LABELS[s.slot] ?? s.slot,
        time: MEAL_SLOT_TIMES[s.slot] ?? s.time,
        meal: label,
        kcal: totalKcal,
        imageUri: firstSport?.photoUrl ?? firstRecipe?.photoUrl,
        done: s.isValidated,
        optional: s.slot === 'pre_bed' || s.slot === 'morning_snack',
        // Badge "SPORT" distinctif quand le repas vient de la biblio sport.
        isSport: !!firstSport,
        onPress: () => handleSlotPress(s.slot),
      };
    });
  }, [slots, todayMeals, handleSlotPress]);

  const lastCalorieAdjustment = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((c) => c.calorieAdjustment !== 0) ?? null;
  }, [checkIns]);

  const coachMessage = useMemo(() => {
    if (!profile) return null;
    const now = new Date();
    const input: CoachInput = {
      firstName: profile.name?.split(' ')[0] || 'Champion',
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

  const firstName = profile.name?.split(' ')[0] || 'Champion';

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
            tintColor="#FF6B35"
            colors={['#FF6B35']}
            progressBackgroundColor="rgba(7,7,13,0.92)"
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

        {/* SCORE NUTRITIONNEL DU JOUR — 4 anneaux macros animés.
            Note : c'est le score de la JOURNÉE nutritionnelle (macros
            consommées vs cibles), pas le Score FORGA global (qui agrège
            nutrition + entraînement sur la semaine). */}
        <Animated.View >
          <MacroRingsCard
            macros={[
              { label: 'kcal', value: Math.round(consumedMacros.calories), goal: targetMacros.calories || 1, color: '#FF6B35' },
              { label: 'Prot', value: Math.round(consumedMacros.protein), goal: targetMacros.protein || 1, color: '#5B8BFF' },
              { label: 'Gluc', value: Math.round(consumedMacros.carbs), goal: targetMacros.carbs || 1, color: '#FFC94D' },
              { label: 'Lip', value: Math.round(consumedMacros.fat), goal: targetMacros.fat || 1, color: '#FF6B6B' },
            ]}
          />
        </Animated.View>

        {/* Objective */}
        <Animated.View >
          <View style={styles.objectiveCard}>
            <Text style={styles.objectiveText}>
              {t('objectiveLabel', { weight: profile.targetWeight })}
              {monthsToGoal > 0 ? ` \u2014 ${t('objectiveMonths', { months: monthsToGoal })}` : ` \u2014 ${t('objectiveReached')}`}
            </Text>
          </View>
        </Animated.View>

        {/* Hydratation — 10 segments + quick add */}
        <Animated.View  style={{ marginTop: spacing.md }}>
          <HydrationSegmentsCard
            currentMl={waterMl}
            goalMl={waterGoal}
            onAdd={(ml) => addWater(ml)}
          />
        </Animated.View>

        {/* Coach card — message du coach IA */}
        {coachMessage && (
          <Animated.View  style={{ marginTop: spacing.md }}>
            <NutritionCoachCard
              timeLabel={`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`}
              message={coachMessage.text}
            />
          </Animated.View>
        )}

        {/* Repas du jour — liste avec photos */}
        <Animated.View  style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionLabel}>{t('mealsOfDayLabelUpper')}</Text>
          <MealSlotPhotoList items={mealItems} />
        </Animated.View>

        {/* Section ISOLÉE : 72 recettes sport (high-protein, post-workout,
            pré-workout, etc.). Carrousel horizontal → tap = page détail.
            Pas mélangées avec les suggestions par slot ci-dessus (volonté
            UX : effet "bibliothèque exclusive" pour les sportifs). */}
        <SportRecipeCarousel />


        {/* Primary action — raccourci vers le coach IA pour logger un
            repas par texte plutôt que via le picker. UX plus rapide :
            l'user décrit "j'ai mangé un poulet riz", le coach le logge
            via action card. Évite de scroller le catalogue à 1000+ plats. */}
        <Animated.View style={{ marginTop: spacing.md }}>
          <PrimaryMealAction
            slotLabel=""
            // On override le title via la prop hint pour que ça
            // matche exactement ce que l'user a demandé.
            customTitle={t('mealCoachShortcutTitle' as any) as string}
            customHint={t('mealCoachShortcutHint' as any) as string}
            onPress={() => router.push('/(tabs)/coach')}
          />
        </Animated.View>

        {/* Big tiles — Plan hebdomadaire + Historique.
            Avant ici : SCAN / PHOTO (redondantes avec le FAB flottant
            et le sheet "Logger un repas") + Recettes (redondante avec
            le tab "Bibliothèque"). On garde uniquement les deux vues
            que l'user ne peut atteindre qu'ici, en gros plan. */}
        <Animated.View>
          <Text style={styles.sectionLabel}>{t('exploreSection' as any) as string}</Text>
          <View style={styles.bigTilesRow}>
            <Pressable style={styles.bigTileBtn} onPress={() => router.push('/weekly-plan')}>
              <ImageBackground
                source={{ uri: WEEKLY_PLAN_IMAGE }}
                style={styles.bigTileImage}
                imageStyle={styles.bigTileImageInner}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.bigTileOverlay}
                >
                  <Text style={styles.bigTileTitle}>{t('weeklyPlanLabel')}</Text>
                  <Text style={styles.bigTileSub}>{t('weeklyPlanHint' as any) as string}</Text>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
            <Pressable style={styles.bigTileBtn} onPress={() => router.push('/meal-history')}>
              <ImageBackground
                source={{ uri: HISTORY_IMAGE }}
                style={styles.bigTileImage}
                imageStyle={styles.bigTileImageInner}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.bigTileOverlay}
                >
                  <Text style={styles.bigTileTitle}>{t('historyLabel')}</Text>
                  <Text style={styles.bigTileSub}>{t('historyHint' as any) as string}</Text>
                </LinearGradient>
              </ImageBackground>
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

      {/* Floating quick-log: scan / photo / search — primary nutrition entry point */}
      <QuickLogFAB
        actions={[
          { label: t('fabScanBarcode'), icon: 'barcode', onPress: () => router.push('/scan/barcode') },
          { label: t('fabPhoto'), icon: 'camera', onPress: () => router.push('/scan/photo') },
          { label: t('fabSearch'), icon: 'search', onPress: () => router.push('/recipes') },
        ]}
      />

      {/* Cérémonie post-validation : check vert + +X kcal · +Yg prot */}
      <ValidatedMealOverlay
        visible={validatedOverlay !== null}
        kcal={validatedOverlay?.kcal ?? 0}
        protein={validatedOverlay?.protein ?? 0}
        onDone={() => setValidatedOverlay(null)}
      />

      {/* Sheet "Comment logger ce repas ?" — 3 chemins : recette /
          scan / saisie manuelle. Le slot ciblé est passé en query
          param à chaque destination pour que le log atterrisse au
          bon créneau. */}
      <LogMealActionSheet
        visible={logSheetSlot !== null}
        slotLabel={logSheetSlot ? getMealSlotLabel(logSheetSlot as MealSlot, locale) : undefined}
        onClose={() => setLogSheetSlot(null)}
        onPickRecipe={() => {
          const slot = logSheetSlot;
          setLogSheetSlot(null);
          if (slot) router.push(`/(tabs)/meals?slot=${slot}` as any);
        }}
        onScan={() => {
          const slot = logSheetSlot;
          setLogSheetSlot(null);
          if (slot) router.push(`/scan/barcode?slot=${slot}` as any);
        }}
        onLogManual={() => {
          const slot = logSheetSlot;
          setLogSheetSlot(null);
          if (slot) router.push(`/meal/custom?slot=${slot}` as any);
        }}
        onDescribeToCoach={() => {
          const slot = logSheetSlot;
          setLogSheetSlot(null);
          // Mapping slot → clé i18n du prefill. Le wording du prefill
          // est volontairement laissé OUVERT (se termine par ": ") :
          // l'user complète librement, le coach parse à l'envoi.
          const prefillKey = slot
            ? ({
                breakfast: 'logMealCoachPrefillBreakfast',
                morning_snack: 'logMealCoachPrefillMorningSnack',
                lunch: 'logMealCoachPrefillLunch',
                afternoon_snack: 'logMealCoachPrefillAfternoonSnack',
                dinner: 'logMealCoachPrefillDinner',
                bedtime: 'logMealCoachPrefillBedtime',
              } as const)[slot as MealSlot] ?? 'logMealCoachPrefillDefault'
            : 'logMealCoachPrefillDefault';
          const prefill = t(prefillKey as any) as string;
          router.push(`/(tabs)/coach?prefill=${encodeURIComponent(prefill)}` as any);
        }}
      />
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
  // Big tiles — Plan hebdo + Historique (remplacent SCAN/PHOTO et
  // l'ancien Quick actions row). Hauteur 170 vs 100 avant : on a
  // assumé que ces deux vues méritent d'être vraiment mises en avant,
  // pas réduites à des chips de 100px qu'on rate au scroll.
  bigTilesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bigTileBtn: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.card,
  },
  bigTileImage: {
    width: '100%',
    height: 170,
  },
  bigTileImageInner: {
    borderRadius: borderRadius.lg - 1,
  },
  bigTileOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderRadius: borderRadius.lg - 1,
  },
  bigTileTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.white,
    textTransform: 'uppercase',
  },
  bigTileSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
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
