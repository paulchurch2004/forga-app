import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getMealById } from '../../src/data/meals';
import { useMealStore } from '../../src/store/mealStore';
import { useUserStore } from '../../src/store/userStore';
import { useEngine } from '../../src/hooks/useEngine';
import { usePremium } from '../../src/hooks/usePremium';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import type { MealSlot } from '../../src/types/meal';
import { useScore } from '../../src/hooks/useScore';
import { useStreak } from '../../src/hooks/useStreak';
import { calculatePortions } from '../../src/engine/portionCalculator';
import { MealDetailSheet } from '../../src/components/meals/MealDetailSheet';
import { makeStyles, fonts, fontSizes } from '../../src/theme';
import { useT } from '../../src/i18n';
import { syncMeal } from '../../src/services/userSync';
import { CelebrationOverlay } from '../../src/components/ui/CelebrationOverlay';

function generateId(): string {
  return `dm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function MealDetailScreen() {
  const { id, slot: slotParam } = useLocalSearchParams<{ id: string; slot?: string }>();
  const [validating, setValidating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const styles = useStyles();
  const { t, locale } = useT();

  const celebrationMessages = locale === 'en'
    ? ['Nice one!', 'Crushed it!', 'Keep going!', 'On fire!', 'Beast mode!']
    : ['Bien joue !', 'Enorme !', 'Continue !', 'En feu !', 'Machine !'];
  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  const profile = useUserStore((s) => s.profile);
  const addValidatedMeal = useMealStore((s) => s.addValidatedMeal);
  const favorites = useMealStore((s) => s.favorites);
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  const isFavorite = useMealStore((s) => s.isFavorite);
  const engine = useEngine();
  const { isPremium } = usePremium();
  const { currentSlot, slots } = useMealSlot();
  const { recalculate } = useScore();
  const { incrementStreak, isTodayValidated } = useStreak();

  const meal = useMemo(() => {
    if (!id) return null;
    return getMealById(id);
  }, [id]);

  const currentMealSlot = (slotParam as MealSlot) ?? currentSlot?.slot ?? 'lunch';

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

    setValidating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const wasTodayValidated = isTodayValidated;

      const validatedMeal = {
        id: generateId(),
        userId: profile.id,
        date: today,
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

      // Increment streak if this is the first meal today
      if (!wasTodayValidated) {
        incrementStreak();
      }

      // Recalculate score
      recalculate();

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
  ]);

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/meals');
    }
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (!meal) return;
    toggleFavorite(meal.id);
  }, [meal, toggleFavorite]);

  const handleClose = useCallback(() => {
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
        <Text style={styles.errorText}>Repas introuvable</Text>
      </View>
    );
  }

  // After celebration, navigate to next unvalidated slot or go home
  const handleCelebrationDone = useCallback(() => {
    setShowCelebration(false);
    // Find next unvalidated slot after the current one
    const allSlots = slots.map((s) => s.slot);
    const currentIndex = allSlots.indexOf(currentMealSlot);
    const nextSlot = slots.find((s, i) => i > currentIndex && !s.isValidated);

    if (nextSlot) {
      // Go to meals screen for the next slot
      router.replace(`/(tabs)/meals?slot=${nextSlot.slot}`);
    } else {
      // All slots done or no next slot — go to nutrition
      router.replace('/nutrition');
    }
  }, [slots, currentMealSlot]);

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
