import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { getMealById } from '../../src/data/meals';
import { useMealStore } from '../../src/store/mealStore';
import { useUserStore } from '../../src/store/userStore';
import { useEngine } from '../../src/hooks/useEngine';
import { usePremium } from '../../src/hooks/usePremium';
import { usePremiumGate } from '../../src/hooks/usePremiumGate';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import type { MealSlot } from '../../src/types/meal';
import { useScore } from '../../src/hooks/useScore';
import { useStreak } from '../../src/hooks/useStreak';
import { calculatePortions } from '../../src/engine/portionCalculator';
import { MealDetailSheet } from '../../src/components/meals/MealDetailSheet';
import { makeStyles, fonts, fontSizes } from '../../src/theme';
import { useT } from '../../src/i18n';
import { syncMeal, syncFavorite } from '../../src/services/userSync';
import { CelebrationOverlay } from '../../src/components/ui/CelebrationOverlay';
import { todayLocalIso } from '../../src/utils/date';
import { returnToNutrition } from '../../src/utils/returnToNutrition';
import { events } from '../../src/services/analytics';

function generateId(): string {
  return `dm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function MealDetailScreen() {
  const { id, slot: slotParam, date: dateParam } = useLocalSearchParams<{
    id: string;
    slot?: string;
    /** Optional ISO date (YYYY-MM-DD). When set, the meal is logged
     *  retroactively to that day (e.g. from the history screen) instead of
     *  to today. Streak is intentionally NOT incremented for past dates. */
    date?: string;
  }>();
  const [validating, setValidating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  // Track si l'user a déjà navigué hors de cet écran (swipe back, close…)
  // Quand true, on n'émet plus de router.replace depuis le timer de
  // celebration — sinon collision avec la navigation en cours →
  // l'écran de destination peut rester figé sur iOS.
  const hasNavigatedAwayRef = useRef(false);
  const styles = useStyles();
  const { t, locale } = useT();

  const celebrationMessages = [t('celebration1'), t('celebration2'), t('celebration3'), t('celebration4'), t('celebration5')];
  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  const profile = useUserStore((s) => s.profile);
  const addValidatedMeal = useMealStore((s) => s.addValidatedMeal);
  const todayMeals = useMealStore((s) => s.todayMeals);
  const favorites = useMealStore((s) => s.favorites);
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  const isFavorite = useMealStore((s) => s.isFavorite);
  const engine = useEngine();
  const { isPremium } = usePremium();
  const { canAddMeal, openPaywall, limits } = usePremiumGate();
  const { currentSlot, slots } = useMealSlot();
  const { recalculate } = useScore();
  const { incrementStreak, isTodayValidated } = useStreak();

  const meal = useMemo(() => {
    if (!id) return null;
    return getMealById(id);
  }, [id]);

  const currentMealSlot = (slotParam as MealSlot) ?? currentSlot?.slot ?? 'lunch';

  useEffect(() => {
    if (meal) events.mealViewed(meal.id, currentMealSlot);
    // Only fire once per (meal, slot) view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meal?.id, currentMealSlot]);

  // Calculate slot target macros
  const slotTargetMacros = useMemo(() => {
    if (!engine) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return engine.getSlotMacros(currentMealSlot);
  }, [engine, currentMealSlot]);

  // Calculate adjusted portions
  const portionResult = useMemo(() => {
    if (!meal || !engine) return null;
    const targetMacros = engine.getSlotMacros(currentMealSlot);
    return calculatePortions(targetMacros, meal.baseMacros, meal.ingredients);
  }, [meal, engine, currentMealSlot]);

  const adjustedIngredients = portionResult?.adjustedIngredients ?? [];
  const adjustedMacros = portionResult?.adjustedMacros ?? {
    calories: meal?.baseMacros.calories ?? 0,
    protein: meal?.baseMacros.protein ?? 0,
    carbs: meal?.baseMacros.carbs ?? 0,
    fat: meal?.baseMacros.fat ?? 0,
  };

  const isMealFavorite = useMemo(() => {
    if (!meal) return false;
    return isFavorite(meal.id);
  }, [meal, isFavorite, favorites]);

  const handleValidate = useCallback(async () => {
    if (!meal || !profile || validating) return;

    // Free tier daily cap — block + open paywall before doing anything heavy.
    if (!canAddMeal(todayMeals.length)) {
      Alert.alert(
        t('mealCapReachedTitle'),
        t('mealCapReachedBody', { max: limits.mealsPerDay }),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('upgradeToPremium'), onPress: openPaywall },
        ],
      );
      return;
    }

    setValidating(true);
    try {
      const today = todayLocalIso();
      const targetDate = dateParam ?? today;
      const isRetro = targetDate !== today;
      const wasTodayValidated = isTodayValidated;

      const validatedMeal = {
        id: generateId(),
        userId: profile.id,
        date: targetDate,
        slot: currentMealSlot,
        mealId: meal.id,
        adjustedQuantities: adjustedIngredients.reduce(
          (acc, ing) => {
            acc[ing.ingredientId] = ing.roundedQuantity;
            return acc;
          },
          {} as Record<string, number>
        ),
        actualMacros: adjustedMacros,
        validatedAt: new Date().toISOString(),
      };
      addValidatedMeal(validatedMeal);
      syncMeal(validatedMeal);
      events.mealValidated(meal.id, currentMealSlot);
      // Funnel d'activation : fire `first_meal_logged` une seule fois
      // (cf hasLoggedFirstMeal dans userStore).
      const { hasLoggedFirstMeal, markFirstMealLogged } = useUserStore.getState();
      if (!hasLoggedFirstMeal) {
        events.firstMealLogged(currentMealSlot, 'recipe');
        markFirstMealLogged();
      }

      // Streak / score touch the *current* state only — skip both when the
      // user is editing a past day, otherwise they could spam-increment by
      // retroactively logging meals they already logged.
      if (!isRetro) {
        if (!wasTodayValidated) {
          incrementStreak();
        }
        recalculate();
      }

      // Show celebration then navigate
      setShowCelebration(true);
    } catch (error) {
      Alert.alert(
        t('error'),
        t('cannotValidateMeal'),
        [{ text: 'OK' }]
      );
    } finally {
      setValidating(false);
    }
  }, [
    meal,
    profile,
    currentMealSlot,
    adjustedIngredients,
    adjustedMacros,
    addValidatedMeal,
    isTodayValidated,
    incrementStreak,
    recalculate,
    t,
    canAddMeal,
    todayMeals.length,
    limits.mealsPerDay,
    openPaywall,
    validating,
  ]);

  // Détecte le swipe-back iOS : useFocusEffect's cleanup function fires
  // dès que l'écran perd le focus (= début du geste, même si l'user
  // peut encore l'annuler en revenant). On marque ainsi le flag tôt,
  // AVANT que le timer de celebration ne puisse déclencher un
  // router.replace conflictuel.
  useFocusEffect(
    useCallback(() => {
      // (onFocus : rien à faire)
      return () => {
        hasNavigatedAwayRef.current = true;
      };
    }, []),
  );

  const handleGoBack = useCallback(() => {
    hasNavigatedAwayRef.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/meals');
    }
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (!meal) return;
    // Lit l'état AVANT le toggle pour envoyer le bon flag à Supabase
    // (le state local n'est pas encore propagé après le set).
    const wasFav = useMealStore.getState().favorites.includes(meal.id);
    toggleFavorite(meal.id);
    // Persist vers Supabase pour que le ♥ survive logout / change device.
    const userId = useUserStore.getState().profile?.id;
    if (userId) syncFavorite(meal.id, userId, !wasFav);
  }, [meal, toggleFavorite]);

  const handleClose = useCallback(() => {
    hasNavigatedAwayRef.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, []);

  const handleShowPaywall = useCallback(() => {
    router.push('/paywall' as any);
  }, []);

  if (!meal) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('mealNotFound')}</Text>
      </View>
    );
  }

  // Après la celebration, on REVIENT en arrière (= là où l'user venait)
  // au lieu de le forcer vers le slot suivant ou /nutrition. Avant,
  // l'auto-navigation faisait que l'user "se sentait obligé de remplir
  // toute la journée" — il ne pouvait pas s'échapper sans valider tout.
  // Maintenant : valide → retour à la liste de repas → user libre de
  // choisir (logger un autre, revenir à Home, etc.).
  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);

    // ⚠ Guard CRITIQUE : si l'user a déjà swipe back PENDANT que le timer
    // de celebration tournait (950ms), on NE DOIT PAS émettre un
    // router.back ici — ça collide avec la navigation iOS en cours
    // et fige l'écran de destination.
    if (hasNavigatedAwayRef.current) return;
    hasNavigatedAwayRef.current = true;

    // Prompt App Store review after 5th validated meal (native only)
    // BUG FIX : mealHistory est Record<string, DailyMeal[]>, pas un array.
    // `.length` retournait undefined → le prompt review n'était JAMAIS
    // déclenché en prod. Maintenant on somme bien les repas de tous les
    // jours pour avoir le total réel.
    if (Platform.OS !== 'web') {
      const mealHistory = useMealStore.getState().mealHistory;
      const totalMeals = Object.values(mealHistory)
        .reduce((acc, dayMeals) => acc + dayMeals.length, 0);
      if (totalMeals === 5 || totalMeals === 20) {
        import('expo-store-review')
          .then((SR) => SR.isAvailableAsync().then((ok) => { if (ok) SR.requestReview(); }))
          .catch(() => {});
      }
    }

    // Navigation post-validation.
    //
    // Cas NORMAL (log d'un repas du jour) : on route directement vers
    // /nutrition — l'écran où l'user voit les repas loggés de sa
    // journée. Avant, on faisait router.back() qui ramenait à la
    // BIBLIOTHÈQUE (l'écran précédent), donnant l'impression de devoir
    // continuer à logger des repas. L'user veut au contraire revenir
    // à sa vue d'ensemble nutrition après avoir validé.
    //
    // Cas RÉTROACTIF (log sur un jour passé depuis l'historique) : on
    // revient en arrière normalement pour retomber sur l'historique du
    // jour édité, pas sur la nutrition d'aujourd'hui.
    const today = todayLocalIso();
    const isRetroNav = !!dateParam && dateParam !== today;

    if (isRetroNav) {
      if (router.canGoBack()) router.back();
      else router.replace('/meal-history');
    } else {
      // Reset propre de la pile (Home → Nutrition) — voir returnToNutrition.
      // Corrige le doublon de nutrition (latence) ET le swipe-back qui
      // retombait sur la bibliothèque au lieu du Home.
      returnToNutrition();
    }
  }, [dateParam]);

  return (
    <View style={{ flex: 1 }}>
      <MealDetailSheet
        meal={meal}
        adjustedIngredients={adjustedIngredients}
        adjustedMacros={adjustedMacros}
        slotTargetMacros={slotTargetMacros}
        isPremium={isPremium}
        isFavorite={isMealFavorite}
        onValidate={handleValidate}
        onGoBack={handleGoBack}
        onToggleFavorite={handleToggleFavorite}
        onClose={handleClose}
        onShowPaywall={handleShowPaywall}
        validating={validating}
      />
      <CelebrationOverlay
        visible={showCelebration}
        onDone={handleCelebrationDone}
        message={randomMessage}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
}));
