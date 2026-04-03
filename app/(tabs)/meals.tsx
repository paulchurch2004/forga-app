import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_MEALS, getMealsBySlotAndBudget } from '../../src/data/meals';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { usePremium } from '../../src/hooks/usePremium';
import { useEngine } from '../../src/hooks/useEngine';
import { useUserStore } from '../../src/store/userStore';
import { useMealStore } from '../../src/store/mealStore';
import { MealPhotoCard } from '../../src/components/meals/MealPhotoCard';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { MEAL_SLOT_LABELS, type MealSlot } from '../../src/types/meal';
import type { Meal } from '../../src/types/meal';
import type { Budget, Restriction } from '../../src/types/user';

const CARD_GAP = spacing.md;
const SCREEN_PADDING = spacing.lg * 2;
const FREE_MAX_SUGGESTIONS = 2;

type BudgetFilter = 'all' | 'eco' | 'premium';
type RestrictionFilter = 'all' | Restriction;

const BUDGET_FILTERS: { key: BudgetFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'eco', label: 'Eco' },
  { key: 'premium', label: 'Premium' },
];

const RESTRICTION_FILTERS: { key: RestrictionFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'vegetarian', label: 'Végétarien' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten_free', label: 'Sans gluten' },
  { key: 'lactose_free', label: 'Sans lactose' },
  { key: 'halal', label: 'Halal' },
  { key: 'pork_free', label: 'Sans porc' },
];

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { contentMaxWidth } = useResponsive();
  const { currentSlot, slots } = useMealSlot();
  const { isPremium } = usePremium();
  const engine = useEngine();
  const profile = useUserStore((s) => s.profile);

  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');
  const [restrictionFilter, setRestrictionFilter] = useState<RestrictionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const favorites = useMealStore((s) => s.favorites);
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);

  // Responsive grid: 2 cols on phone, 3-4 on tablet/PC
  const contentWidth = Math.min(windowWidth, contentMaxWidth);
  const numColumns = contentWidth >= 800 ? 4 : contentWidth >= 500 ? 3 : 2;
  const cardWidth = Math.floor(
    (contentWidth - SCREEN_PADDING - CARD_GAP * (numColumns - 1)) / numColumns
  );

  const currentSlotInfo = currentSlot;
  const currentMealSlot: MealSlot = currentSlotInfo?.slot ?? 'lunch';
  const currentSlotLabel = MEAL_SLOT_LABELS[currentMealSlot];
  const currentSlotTime = currentSlotInfo?.time ?? '12:30';

  // Get target macros for current slot
  const slotTargetMacros = useMemo(() => {
    if (!engine) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return engine.getSlotMacros(currentMealSlot);
  }, [engine, currentMealSlot]);

  // Filter meals
  const filteredMeals = useMemo(() => {
    const budgetParam: 'eco' | 'premium' | 'both' =
      budgetFilter === 'all' ? 'both' : budgetFilter;

    let meals = getMealsBySlotAndBudget(currentMealSlot, budgetParam);

    // Apply restriction filter
    if (restrictionFilter !== 'all') {
      meals = meals.filter(
        (meal) =>
          meal.restrictions.length === 0 ||
          meal.restrictions.includes(restrictionFilter as Restriction)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      meals = meals.filter(
        (meal) =>
          meal.name.toLowerCase().includes(query) ||
          meal.description.toLowerCase().includes(query) ||
          meal.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          meal.ingredients.some((i) => i.name.toLowerCase().includes(query))
      );
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      meals = meals.filter((meal) => favorites.includes(meal.id));
    }

    // Sort by feedback: liked (+1) first, neutral (0) middle, disliked (-1) last
    meals = [...meals].sort((a, b) => {
      const scoreA = likedMeals.includes(a.id) ? 1 : dislikedMeals.includes(a.id) ? -1 : 0;
      const scoreB = likedMeals.includes(b.id) ? 1 : dislikedMeals.includes(b.id) ? -1 : 0;
      return scoreB - scoreA;
    });

    return meals;
  }, [currentMealSlot, budgetFilter, restrictionFilter, searchQuery, showFavoritesOnly, favorites, likedMeals, dislikedMeals]);

  // Limit for free users
  const displayedMeals = useMemo(() => {
    if (isPremium) return filteredMeals;
    return filteredMeals.slice(0, FREE_MAX_SUGGESTIONS);
  }, [isPremium, filteredMeals]);

  const remainingCount = filteredMeals.length - displayedMeals.length;

  const handleMealPress = useCallback(
    (mealId: string) => {
      router.push(`/meal/${mealId}`);
    },
    []
  );

  const handlePaywall = useCallback(() => {
    router.push('/paywall' as any);
  }, []);

  const renderMealItem = useCallback(
    ({ item }: { item: Meal }) => <MealPhotoCard meal={item} cardWidth={cardWidth} />,
    [cardWidth]
  );

  const renderTextMealItem = useCallback(
    ({ item }: { item: Meal }) => (
      <Pressable
        style={styles.textMealRow}
        onPress={() => handleMealPress(item.id)}
      >
        <View style={styles.textMealInfo}>
          <Text style={styles.textMealName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.textMealMacros}>
            <Text style={[styles.textMacroValue, { color: colors.calories }]}>
              {Math.round(item.baseMacros.calories)}kcal
            </Text>
            <Text style={styles.textMacroDot}>{'\u00B7'}</Text>
            <Text style={[styles.textMacroValue, { color: colors.protein }]}>
              {Math.round(item.baseMacros.protein)}g P
            </Text>
            <Text style={styles.textMacroDot}>{'\u00B7'}</Text>
            <Text style={[styles.textMacroValue, { color: colors.carbs }]}>
              {Math.round(item.baseMacros.carbs)}g G
            </Text>
            <Text style={styles.textMacroDot}>{'\u00B7'}</Text>
            <Text style={[styles.textMacroValue, { color: colors.fat }]}>
              {Math.round(item.baseMacros.fat)}g L
            </Text>
          </View>
        </View>
        <View style={styles.textMealBudget}>
          <Text
            style={[
              styles.textBudgetLabel,
              {
                color:
                  item.budget === 'eco' ? colors.success : colors.fat,
              },
            ]}
          >
            {item.budget === 'eco' ? 'eco' : 'premium'}
          </Text>
        </View>
        <Text style={styles.textMealArrow}>{'\u203A'}</Text>
      </Pressable>
    ),
    [handleMealPress]
  );

  const keyExtractor = useCallback((item: Meal) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { maxWidth: contentMaxWidth }]}>
        <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={16} style={styles.backRow}>
          <Text style={styles.backArrow}>{'\u2039'} Accueil</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{currentSlotLabel}</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.headerTime}>{currentSlotTime}</Text>
          <View style={styles.headerDot} />
          <Text style={styles.headerMacroTarget}>
            {Math.round(slotTargetMacros.calories)} kcal cible
          </Text>
        </View>
        <View style={styles.headerTargetRow}>
          <TargetChip
            label="P"
            value={Math.round(slotTargetMacros.protein)}
            unit="g"
            color={colors.protein}
          />
          <TargetChip
            label="G"
            value={Math.round(slotTargetMacros.carbs)}
            unit="g"
            color={colors.carbs}
          />
          <TargetChip
            label="L"
            value={Math.round(slotTargetMacros.fat)}
            unit="g"
            color={colors.fat}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { maxWidth: contentMaxWidth }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un repas ou ingrédient..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <Pressable
          style={[
            styles.favToggle,
            showFavoritesOnly && styles.favToggleActive,
          ]}
          onPress={() => setShowFavoritesOnly((prev) => !prev)}
          hitSlop={8}
        >
          <Text style={[
            styles.favToggleText,
            showFavoritesOnly && styles.favToggleTextActive,
          ]}>
            {showFavoritesOnly ? '\u2665' : '\u2661'}
          </Text>
        </Pressable>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {BUDGET_FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterChip,
                budgetFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setBudgetFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  budgetFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
          <View style={styles.filterSeparator} />
          {RESTRICTION_FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterChip,
                restrictionFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setRestrictionFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  restrictionFilter === filter.key &&
                    styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Meals list */}
      {isPremium ? (
        // Premium: Photo grid
        <FlatList
          key={`premium-grid-${numColumns}`}
          data={displayedMeals}
          renderItem={renderMealItem}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucun repas ne correspond à tes filtres.
              </Text>
            </View>
          }
        />
      ) : (
        // Free: Text list
        <FlatList
          key="free-list"
          data={displayedMeals}
          renderItem={renderTextMealItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucun repas ne correspond à tes filtres.
              </Text>
            </View>
          }
          ListFooterComponent={
            remainingCount > 0 ? (
              <Pressable style={styles.paywallBanner} onPress={handlePaywall}>
                <Text style={styles.paywallBannerTitle}>
                  +{remainingCount} repas disponibles
                </Text>
                <Text style={styles.paywallBannerSubtitle}>
                  Passe a FORGA PRO pour toutes les suggestions,
                  photos et recettes détaillées.
                </Text>
                <View style={styles.paywallButton}>
                  <Text style={styles.paywallButtonText}>
                    Débloquer FORGA PRO
                  </Text>
                </View>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
  );
}

function TargetChip({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={[targetStyles.chip, { borderColor: color }]}>
      <Text style={[targetStyles.label, { color }]}>{label}</Text>
      <Text style={[targetStyles.value, { color }]}>
        {value}{unit}
      </Text>
    </View>
  );
}

const targetStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  value: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backRow: {
    marginBottom: spacing.sm,
  },
  backArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignSelf: 'center',
    width: '100%',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  headerTime: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  headerMacroTarget: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  headerTargetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filtersContainer: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterSeparator: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['5xl'],
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['5xl'],
  },
  textMealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  textMealInfo: {
    flex: 1,
  },
  textMealName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textMealMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textMacroValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  textMacroDot: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  textMealBudget: {
    marginHorizontal: spacing.sm,
  },
  textBudgetLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textMealArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paywallBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  paywallBannerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  paywallBannerSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  paywallButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  paywallButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignSelf: 'center',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  favToggle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  favToggleText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  favToggleTextActive: {
    color: colors.white,
  },
});
