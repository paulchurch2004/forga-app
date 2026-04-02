import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getMealById } from '../../src/data/meals';
import { useMealStore } from '../../src/store/mealStore';
import { useUserStore } from '../../src/store/userStore';
import { useEngine } from '../../src/hooks/useEngine';
import { usePremium } from '../../src/hooks/usePremium';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { useScore } from '../../src/hooks/useScore';
import { useStreak } from '../../src/hooks/useStreak';
import { calculatePortions } from '../../src/engine/portionCalculator';
import { MealDetailSheet } from '../../src/components/meals/MealDetailSheet';
import { colors, fonts, fontSizes } from '../../src/theme';

function generateId(): string {
  return `dm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [validating, setValidating] = useState(false);

  const profile = useUserStore((s) => s.profile);
  const addValidatedMeal = useMealStore((s) => s.addValidatedMeal);
  const favorites = useMealStore((s) => s.favorites);
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  const isFavorite = useMealStore((s) => s.isFavorite);
  const engine = useEngine();
  const { isPremium } = usePremium();
  const { currentSlot } = useMealSlot();
  const { recalculate } = useScore();
  const { incrementStreak, isTodayValidated } = useStreak();

  const meal = useMemo(() => {
    if (!id) return null;
    return getMealById(id);
  }, [id]);

  const currentMealSlot = currentSlot?.slot ?? 'lunch';

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
    if (!meal || !profile) return;

    setValidating(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const wasTodayValidated = isTodayValidated;

      addValidatedMeal({
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
      });

      // Increment streak if this is the first meal today
      if (!wasTodayValidated) {
        incrementStreak();
      }

      // Recalculate score
      recalculate();

      // Navigate back
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de valider le repas. Réessaie.',
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

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
