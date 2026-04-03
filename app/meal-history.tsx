import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../src/store/mealStore';
import { getMealById } from '../src/data/meals';
import { MEAL_SLOT_LABELS } from '../src/types/meal';
import { CalendarGrid } from '../src/components/ui/CalendarGrid';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useT } from '../src/i18n';
import { useResponsive } from '../src/hooks/useResponsive';

export default function MealHistoryScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t } = useT();
  const { contentMaxWidth } = useResponsive();

  const mealHistory = useMealStore((s) => s.mealHistory);

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    return new Set(Object.keys(mealHistory).filter((date) => mealHistory[date].length > 0));
  }, [mealHistory]);

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
                .sort((a, b) => {
                  const order = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'bedtime'];
                  return order.indexOf(a.slot) - order.indexOf(b.slot);
                })
                .map((dm) => {
                  const meal = getMealById(dm.mealId);
                  return (
                    <View key={dm.slot} style={styles.mealRow}>
                      <Text style={styles.slotLabel}>{MEAL_SLOT_LABELS[dm.slot]}</Text>
                      <Text style={styles.mealName} numberOfLines={1}>
                        {meal?.name ?? dm.customName ?? dm.mealId}
                      </Text>
                      <Text style={styles.mealCal}>{dm.actualMacros.calories} kcal</Text>
                    </View>
                  );
                })}

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
            <Text style={styles.emptyText}>Aucun repas valide ce jour</Text>
          ) : (
            <Text style={styles.emptyText}>Selectionne un jour pour voir tes repas</Text>
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
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },
}));
