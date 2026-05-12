import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../src/store/mealStore';
import { getMealById } from '../src/data/meals';
import { MEAL_SLOT_LABELS } from '../src/types/meal';
import { CalendarGrid } from '../src/components/ui/CalendarGrid';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useT } from '../src/i18n';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useResponsive } from '../src/hooks/useResponsive';
import { usePremiumGate } from '../src/hooks/usePremiumGate';
import { PremiumLock } from '../src/components/ui/PremiumLock';

export default function MealHistoryScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useT();
  const { contentMaxWidth } = useResponsive();

  const mealHistory = useMealStore((s) => s.mealHistory);
  const { mealHistoryDayCap, openPaywall } = usePremiumGate();

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Free users only see the last N days. Compute the cutoff once.
  const historyCutoff = useMemo(() => {
    if (mealHistoryDayCap === null) return null;
    const d = new Date();
    d.setDate(d.getDate() - mealHistoryDayCap);
    return d.toISOString().slice(0, 10);
  }, [mealHistoryDayCap]);

  const markedDates = useMemo(() => {
    return new Set(
      Object.keys(mealHistory).filter((date) => {
        if (mealHistory[date].length === 0) return false;
        if (historyCutoff && date < historyCutoff) return false;
        return true;
      }),
    );
  }, [mealHistory, historyCutoff]);

  const handleChangeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  const selectedMeals = useMemo(() => {
    if (!selectedDate) return [];
    return mealHistory[selectedDate] ?? [];
  }, [selectedDate, mealHistory]);

  const selectedMacros = useMemo(() => {
    if (selectedMeals.length === 0) return null;
    return selectedMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.actualMacros.calories,
        protein: acc.protein + m.actualMacros.protein,
        carbs: acc.carbs + m.actualMacros.carbs,
        fat: acc.fat + m.actualMacros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedMeals]);

  // Action sheet for a meal logged on a past day — info, delete, cancel.
  // Uses the by-id removal in mealStore (which scans every mealHistory
  // entry), so it works regardless of how many days ago the meal was logged.
  const handleMealPress = useCallback(
    (meal: typeof selectedMeals[number]) => {
      const recipe = getMealById(meal.mealId);
      const name = meal.customName ?? recipe?.name ?? t('emptyHistoryTitle');
      const kcal = Math.round(meal.actualMacros.calories);
      const protein = Math.round(meal.actualMacros.protein);
      Alert.alert(
        name,
        `${kcal} kcal · ${protein}g ${t('proteinLabel' as any)}`,
        [
          {
            text: t('mealActionInfo' as any) as string,
            onPress: () => router.push(`/meal/${meal.mealId}?slot=${meal.slot}` as any),
          },
          {
            text: t('mealActionDelete' as any) as string,
            style: 'destructive',
            onPress: () => {
              useMealStore.getState().removeValidatedMealById(meal.id);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              }
            },
          },
          { text: t('cancel' as any) as string, style: 'cancel' },
        ],
      );
    },
    [t],
  );

  // Find the first slot not yet logged on the selected day; default to
  // lunch if everything is full. Used to pre-select a slot when the user
  // taps "Add a meal" on a past date — they can still change it on the
  // meals tab via the chip selector.
  const firstEmptySlotFor = useCallback(
    (date: string) => {
      const order = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'] as const;
      const day = mealHistory[date] ?? [];
      const taken = new Set(day.map((m) => m.slot));
      return order.find((s) => !taken.has(s)) ?? 'lunch';
    },
    [mealHistory],
  );

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
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('history')}</Text>
          <View style={{ width: 50 }} />
        </View>

        {mealHistoryDayCap !== null && (
          <PremiumLock
            variant="banner"
            label={t('premiumFeature')}
            subtitle={t('mealHistoryFreeBanner', { days: mealHistoryDayCap })}
            onPress={openPaywall}
            style={{ marginBottom: spacing.lg }}
          />
        )}

        {/* Calendar */}
        <CalendarGrid
          currentMonth={currentMonth}
          markedDates={markedDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={handleChangeMonth}
        />

        {/* Selected day detail */}
        <View style={styles.detailSection}>
          {selectedDate && selectedMeals.length > 0 ? (
            <>
              <Text style={styles.detailTitle}>
                {formatDisplayDate(selectedDate)}
              </Text>

              {selectedMeals
                .slice()
                .sort((a, b) => {
                  const order = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'bedtime'];
                  // Stable secondary sort by id so multiple meals in same
                  // slot don't shuffle position between renders.
                  return order.indexOf(a.slot) - order.indexOf(b.slot) || a.id.localeCompare(b.id);
                })
                .map((dm) => {
                  const meal = getMealById(dm.mealId);
                  return (
                    <Pressable
                      key={dm.id}
                      style={({ pressed }) => [styles.mealRow, pressed && { opacity: 0.7 }]}
                      onPress={() => handleMealPress(dm)}
                      accessibilityRole="button"
                      accessibilityLabel={`${MEAL_SLOT_LABELS[dm.slot]} · ${meal?.name ?? dm.customName ?? dm.mealId}`}
                    >
                      <Text style={styles.slotLabel}>{MEAL_SLOT_LABELS[dm.slot]}</Text>
                      <Text style={styles.mealName} numberOfLines={1}>
                        {meal?.name ?? dm.customName ?? dm.mealId}
                      </Text>
                      <Text style={styles.mealCal}>{Math.round(dm.actualMacros.calories)} kcal</Text>
                    </Pressable>
                  );
                })}

              {/* Retroactive log — useful when the user forgot a meal that
                  day. The detail screen receives ?date= and skips streak
                  increments to prevent gamification abuse. */}
              <Pressable
                style={styles.addMealBtn}
                onPress={() => {
                  const slot = firstEmptySlotFor(selectedDate);
                  router.push(`/(tabs)/meals?slot=${slot}&date=${selectedDate}` as any);
                }}
                hitSlop={6}
              >
                <Text style={styles.addMealBtnText}>
                  + {t('mealActionAddAnother' as any)}
                </Text>
              </Pressable>

              {/* Macro total */}
              {selectedMacros && (
                <View style={styles.macroTotal}>
                  <Text style={styles.macroTotalLabel}>Total</Text>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroValue}>{selectedMacros.calories} kcal</Text>
                    <Text style={styles.macroDot}>{'\u00B7'}</Text>
                    <Text style={styles.macroValue}>{selectedMacros.protein}g P</Text>
                    <Text style={styles.macroDot}>{'\u00B7'}</Text>
                    <Text style={styles.macroValue}>{selectedMacros.carbs}g G</Text>
                    <Text style={styles.macroDot}>{'\u00B7'}</Text>
                    <Text style={styles.macroValue}>{selectedMacros.fat}g L</Text>
                  </View>
                </View>
              )}
            </>
          ) : selectedDate ? (
            <EmptyState icon={'\uD83D\uDCCB'} title={t('emptyHistoryTitle')} subtitle={t('emptyHistorySubtitle')} />
          ) : (
            <EmptyState icon={'\uD83D\uDCC5'} title={t('emptyHistorySelect')} />
          )}
        </View>

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['jan.', 'fev.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];
  return `${d} ${months[m - 1]} ${y}`;
}

const useStyles = makeStyles((colors) => ({
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
  detailSection: {
    marginTop: spacing.xl,
  },
  detailTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    width: 80,
  },
  mealName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  mealCal: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  macroTotal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  macroTotalLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  macroDot: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  addMealBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,107,53,0.05)',
    alignItems: 'center',
  },
  addMealBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
}));
