import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { useMealStore } from '../src/store/mealStore';
import { useWeeklyPlanStore } from '../src/store/weeklyPlanStore';
import { generateWeeklyPlan, getCurrentWeekStart } from '../src/engine/weeklyPlanner';
import { getMealById, getMealsBySlotAndBudget } from '../src/data/meals';
import { calculatePortions } from '../src/engine/portionCalculator';
import { useEngine } from '../src/hooks/useEngine';
import { MEAL_SLOT_LABELS, type MealSlot } from '../src/types/meal';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function WeeklyPlanScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  const profile = useUserStore((s) => s.profile);
  const engine = useEngine();
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);

  const { days, weekStart, setWeeklyPlan, swapMeal } = useWeeklyPlanStore();

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [swapModal, setSwapModal] = useState<{ date: string; slot: MealSlot } | null>(null);

  const handleGenerate = useCallback(() => {
    if (!profile) return;
    const newDays = generateWeeklyPlan({
      objective: profile.objective,
      dailyCalories: profile.dailyCalories,
      budget: profile.budget,
      restrictions: profile.restrictions,
      likedMeals,
      dislikedMeals,
    });
    const ws = getCurrentWeekStart();
    setWeeklyPlan(ws, newDays);
  }, [profile, likedMeals, dislikedMeals, setWeeklyPlan]);

  const selectedDay = days[selectedDayIdx] ?? null;

  const swapCandidates = useMemo(() => {
    if (!swapModal || !profile) return [];
    const budgetParam: 'eco' | 'premium' | 'both' = profile.budget === 'both' ? 'both' : profile.budget;
    return getMealsBySlotAndBudget(swapModal.slot, budgetParam)
      .filter((m) => !dislikedMeals.includes(m.id))
      .filter((m) => {
        if (profile.restrictions.length === 0) return true;
        if (m.restrictions.length === 0) return true;
        return profile.restrictions.every((r) => m.restrictions.includes(r));
      })
      .slice(0, 20);
  }, [swapModal, profile, dislikedMeals]);

  const handleSwap = (mealId: string, mealName: string) => {
    if (!swapModal) return;
    swapMeal(swapModal.date, swapModal.slot, mealId, mealName);
    setSwapModal(null);
  };

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Profil non configuré</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Plan semaine</Text>
          <Pressable onPress={handleGenerate} hitSlop={12}>
            <Text style={styles.regenerateText}>{days.length > 0 ? 'Refaire' : 'Générer'}</Text>
          </Pressable>
        </View>

        {days.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucun plan généré</Text>
            <Text style={styles.emptySubtitle}>
              Génère un plan pour voir tes repas de la semaine.
            </Text>
            <Pressable style={styles.generateBtn} onPress={handleGenerate}>
              <Text style={styles.generateBtnText}>Générer le plan</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Day selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daySelector}
            >
              {days.map((day, idx) => (
                <Pressable
                  key={day.date}
                  style={[
                    styles.dayChip,
                    selectedDayIdx === idx && styles.dayChipActive,
                  ]}
                  onPress={() => setSelectedDayIdx(idx)}
                >
                  <Text
                    style={[
                      styles.dayChipLabel,
                      selectedDayIdx === idx && styles.dayChipLabelActive,
                    ]}
                  >
                    {DAY_LABELS[idx]}
                  </Text>
                  <Text
                    style={[
                      styles.dayChipDate,
                      selectedDayIdx === idx && styles.dayChipDateActive,
                    ]}
                  >
                    {day.date.split('-')[2]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Selected day meals */}
            {selectedDay && (
              <View style={styles.mealsSection}>
                {selectedDay.meals.map((m) => {
                  const meal = getMealById(m.mealId);
                  const slotTarget = engine?.getSlotMacros(m.slot);
                  const adjusted = meal && slotTarget
                    ? calculatePortions(slotTarget, meal.baseMacros, meal.ingredients)
                    : null;
                  const macros = adjusted?.adjustedMacros ?? meal?.baseMacros;
                  return (
                    <View key={m.slot} style={styles.mealCard}>
                      <View style={styles.mealCardTop}>
                        <Text style={styles.slotLabel}>{MEAL_SLOT_LABELS[m.slot]}</Text>
                        <Pressable
                          hitSlop={8}
                          onPress={() => setSwapModal({ date: selectedDay.date, slot: m.slot })}
                        >
                          <Text style={styles.swapText}>Changer</Text>
                        </Pressable>
                      </View>
                      <Pressable onPress={() => router.push(`/meal/${m.mealId}`)}>
                        <Text style={styles.mealName}>{m.mealName}</Text>
                        {macros && (
                          <Text style={styles.mealMacros}>
                            {macros.calories} kcal {'\u00B7'} {macros.protein}g P {'\u00B7'} {macros.carbs}g G {'\u00B7'} {macros.fat}g L
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}

                {/* Daily total */}
                {engine && (() => {
                  const dayTotal = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                  for (const m of selectedDay.meals) {
                    const meal = getMealById(m.mealId);
                    const slotTarget = engine.getSlotMacros(m.slot);
                    if (meal && slotTarget) {
                      const adj = calculatePortions(slotTarget, meal.baseMacros, meal.ingredients);
                      dayTotal.calories += adj.adjustedMacros.calories;
                      dayTotal.protein += adj.adjustedMacros.protein;
                      dayTotal.carbs += adj.adjustedMacros.carbs;
                      dayTotal.fat += adj.adjustedMacros.fat;
                    }
                  }
                  return (
                    <View style={styles.dayTotalCard}>
                      <Text style={styles.dayTotalLabel}>Total du jour</Text>
                      <Text style={styles.dayTotalValue}>
                        {dayTotal.calories} kcal {'\u00B7'} {dayTotal.protein}g P {'\u00B7'} {dayTotal.carbs}g G {'\u00B7'} {dayTotal.fat}g L
                      </Text>
                      <Text style={styles.dayTotalTarget}>
                        Objectif : {engine.dailyMacros.calories} kcal
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}
          </>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* Swap modal */}
      <Modal
        visible={swapModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSwapModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {swapModal ? MEAL_SLOT_LABELS[swapModal.slot] : ''}
              </Text>
              <Pressable onPress={() => setSwapModal(null)} hitSlop={12}>
                <Text style={styles.modalClose}>Fermer</Text>
              </Pressable>
            </View>
            <FlatList
              data={swapCandidates}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const slotTarget = swapModal && engine ? engine.getSlotMacros(swapModal.slot) : null;
                const adj = slotTarget
                  ? calculatePortions(slotTarget, item.baseMacros, item.ingredients)
                  : null;
                const cal = adj ? adj.adjustedMacros.calories : item.baseMacros.calories;
                return (
                  <Pressable
                    style={styles.swapItem}
                    onPress={() => handleSwap(item.id, item.name)}
                  >
                    <Text style={styles.swapItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.swapItemCal}>{cal} kcal</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  regenerateText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  daySelector: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  dayChip: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayChipLabelActive: {
    color: colors.white,
  },
  dayChipDate: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  dayChipDateActive: {
    color: colors.white,
  },
  mealsSection: {
    gap: spacing.sm,
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  mealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swapText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealMacros: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
  },
  generateBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '60%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  modalList: {
    paddingHorizontal: spacing.lg,
  },
  swapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  swapItemName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  swapItemCal: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  dayTotalCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    padding: spacing.lg,
    alignItems: 'center',
  },
  dayTotalLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayTotalValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dayTotalTarget: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
});
