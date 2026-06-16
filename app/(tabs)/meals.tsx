import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  TextInput,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Fuse from 'fuse.js';
import { getMealsBySlotAndBudget } from '../../src/data/meals';
import { useMealSlot } from '../../src/hooks/useMealSlot';
import { usePremium } from '../../src/hooks/usePremium';
import { useEngine } from '../../src/hooks/useEngine';
import { useMealStore } from '../../src/store/mealStore';
import { MealPhotoCard } from '../../src/components/meals/MealPhotoCard';
import { fonts, spacing, makeStyles } from '../../src/theme';
import { FLOATING_TABBAR_HEIGHT } from '../../src/components/layout/CustomTabBar';
import { useTheme } from '../../src/context/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useT } from '../../src/i18n';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { MEAL_SLOT_LABELS, type MealSlot } from '../../src/types/meal';
import type { Meal } from '../../src/types/meal';
import type { Restriction } from '../../src/types/user';

const CARD_GAP = 10;
const SCREEN_PADDING = 40;
const FREE_MAX_SUGGESTIONS = 5;

type BudgetFilter = 'all' | 'eco' | 'premium';
type RestrictionFilter = 'all' | Restriction;

/** Single-line chip — label only. Previous iterations stacked label + time
 *  on two lines, which never aligned cleanly across the row. Keeping it
 *  flat matches the filter chips below and reads at a glance. */
const SLOT_META: Record<MealSlot, { label: string }> = {
  breakfast: { label: 'Matin' },
  morning_snack: { label: 'Collation' },
  lunch: { label: 'Midi' },
  afternoon_snack: { label: 'Goûter' },
  dinner: { label: 'Soir' },
};

const SLOT_ORDER: MealSlot[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];

/** Map current hour → expected meal slot. Used to subtly highlight the
 *  "current" chip (border glow) so the user immediately sees which slot
 *  is now relevant. */
function getCurrentSlot(hour: number): MealSlot {
  if (hour < 10) return 'breakfast';
  if (hour < 12) return 'morning_snack';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'afternoon_snack';
  return 'dinner';
}

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { contentMaxWidth } = useResponsive();
  const params = useLocalSearchParams<{
    slot?: string;
    /** Optional ISO date forwarded to /meal/[id]?date= for retroactive
     *  logging (used by the meal-history screen's "Add a meal" button). */
    date?: string;
  }>();
  const { currentSlot } = useMealSlot();
  const { isPremium } = usePremium();
  const engine = useEngine();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();

  const requestedSlot = params.slot as MealSlot | undefined;
  const initialSlot: MealSlot = requestedSlot ?? currentSlot?.slot ?? 'lunch';

  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(initialSlot);
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');
  const [restrictionFilter, setRestrictionFilter] = useState<RestrictionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const favorites = useMealStore((s) => s.favorites);
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);

  // If user navigates here with a new ?slot=, sync.
  useEffect(() => {
    if (requestedSlot && requestedSlot !== selectedSlot) {
      setSelectedSlot(requestedSlot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSlot]);

  const contentWidth = Math.min(windowWidth, contentMaxWidth);
  const numColumns = contentWidth >= 800 ? 4 : contentWidth >= 500 ? 3 : 2;
  const cardWidth = Math.floor(
    (contentWidth - SCREEN_PADDING - CARD_GAP * (numColumns - 1)) / numColumns
  );

  const slotTargetMacros = useMemo(() => {
    if (!engine) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return engine.getSlotMacros(selectedSlot);
  }, [engine, selectedSlot]);

  const BUDGET_FILTERS: { key: BudgetFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'eco', label: t('budgetEco') },
    { key: 'premium', label: t('budgetPremium') },
  ];

  const RESTRICTION_FILTERS: { key: RestrictionFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'vegetarian', label: t('restrictionVegetarian') },
    { key: 'vegan', label: t('restrictionVegan') },
    { key: 'gluten_free', label: t('restrictionGlutenFree') },
    { key: 'lactose_free', label: t('restrictionLactoseFree') },
    { key: 'halal', label: t('restrictionHalal') },
    { key: 'pork_free', label: t('restrictionPorkFree') },
  ];

  const filteredMeals = useMemo(() => {
    const budgetParam: 'eco' | 'premium' | 'both' =
      budgetFilter === 'all' ? 'both' : budgetFilter;

    let meals = getMealsBySlotAndBudget(selectedSlot, budgetParam);

    if (restrictionFilter !== 'all') {
      meals = meals.filter(
        (meal) =>
          meal.restrictions.length === 0 ||
          meal.restrictions.includes(restrictionFilter as Restriction)
      );
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(meals, {
        keys: ['name', 'description', 'tags', 'ingredients.name'],
        threshold: 0.35,
        ignoreLocation: true,
      });
      meals = fuse.search(searchQuery.trim()).map((r) => r.item);
    }

    if (showFavoritesOnly) {
      meals = meals.filter((meal) => favorites.includes(meal.id));
    }

    meals = [...meals].sort((a, b) => {
      const scoreA = likedMeals.includes(a.id) ? 1 : dislikedMeals.includes(a.id) ? -1 : 0;
      const scoreB = likedMeals.includes(b.id) ? 1 : dislikedMeals.includes(b.id) ? -1 : 0;
      return scoreB - scoreA;
    });

    return meals;
  }, [selectedSlot, budgetFilter, restrictionFilter, searchQuery, showFavoritesOnly, favorites, likedMeals, dislikedMeals]);

  const displayedMeals = useMemo(() => {
    if (isPremium) return filteredMeals;
    return filteredMeals.slice(0, FREE_MAX_SUGGESTIONS);
  }, [isPremium, filteredMeals]);

  const remainingCount = filteredMeals.length - displayedMeals.length;

  const handlePaywall = useCallback(() => {
    router.push('/paywall' as any);
  }, []);

  const renderMealItem = useCallback(
    ({ item }: { item: Meal }) => (
      <MealPhotoCard meal={item} cardWidth={cardWidth} slot={selectedSlot} date={params.date} />
    ),
    [cardWidth, selectedSlot, params.date]
  );

  const keyExtractor = useCallback((item: Meal) => item.id, []);

  const slotLabel = MEAL_SLOT_LABELS[selectedSlot];
  const totalMealsForSlot = filteredMeals.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Glass header */}
      <View style={[styles.header, { maxWidth: contentMaxWidth }]}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12} style={styles.iconBtn}>
            <ArrowLeftIcon color={colors.text} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerEyebrow}>{t('mealsLibraryTitle' as any)}</Text>
            <Text style={styles.headerTitle}>{slotLabel}</Text>
          </View>
          <Pressable
            onPress={() => router.push(`/meal/custom?slot=${selectedSlot}` as any)}
            hitSlop={12}
            style={styles.iconBtn}
          >
            <Text style={styles.plusIcon}>+</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowFavoritesOnly((v) => !v)}
            hitSlop={12}
            style={[styles.iconBtn, showFavoritesOnly && styles.iconBtnActive]}
          >
            <Text style={[styles.heartIcon, showFavoritesOnly && styles.heartIconActive]}>
              {showFavoritesOnly ? '♥' : '♡'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.headerSub}>
          {totalMealsForSlot} recettes · cible {Math.round(slotTargetMacros.calories)} kcal · P{Math.round(slotTargetMacros.protein)}g
        </Text>
      </View>

      {/* Slot quick-switcher — single-line label chips.
          The chip matching the current hour gets a subtle "now" outline.
          `style={styles.slotScroll}` impose une hauteur explicite +
          flexGrow:0 pour éviter que RN compresse la barre en dessous
          de la taille du contenu (bug "chips à moitié cachées" sur
          certains devices iOS où la hauteur intrinsic du ScrollView
          horizontal était mal calculée). */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.slotScroll}
        contentContainerStyle={styles.slotChipsRow}
      >
        {SLOT_ORDER.map((s) => {
          const active = selectedSlot === s;
          const isNow = getCurrentSlot(new Date().getHours()) === s;
          const meta = SLOT_META[s];
          return (
            <Pressable
              key={s}
              onPress={() => setSelectedSlot(s)}
              style={[
                styles.slotChip,
                active && styles.slotChipActive,
                !active && isNow && styles.slotChipNow,
              ]}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[styles.slotChipText, active && styles.slotChipTextActive]}
                numberOfLines={1}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Glass search pill */}
      <View style={[styles.searchWrap, { maxWidth: contentMaxWidth }]}>
        <SearchIcon color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchMeal')}
          placeholderTextColor="rgba(255,255,255,0.38)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {!isPremium && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Filters: budget + restrictions in one row */}
      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {BUDGET_FILTERS.map((filter) => {
            const active = budgetFilter === filter.key;
            return (
              <Pressable
                key={`b-${filter.key}`}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setBudgetFilter(filter.key)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.filterSep} />
          {RESTRICTION_FILTERS.map((filter) => {
            const active = restrictionFilter === filter.key;
            return (
              <Pressable
                key={`r-${filter.key}`}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setRestrictionFilter(filter.key)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Meals grid (premium and free both grid; free shows paywall after FREE_MAX) */}
      <FlatList
        key={`grid-${numColumns}`}
        data={displayedMeals}
        renderItem={renderMealItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
        contentContainerStyle={[
          styles.gridContent,
          {
            maxWidth: contentMaxWidth,
            alignSelf: 'center' as const,
            width: '100%' as const,
            paddingBottom: insets.bottom + FLOATING_TABBAR_HEIGHT + spacing.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS !== 'web'}
        ListEmptyComponent={
          searchQuery.trim() ? (
            <EmptyState
              icon={'✕'}
              title={t('searchNoResultsFor', { query: searchQuery.trim() })}
              subtitle={t('searchTryAnother')}
              actionLabel={t('logCustomMeal' as any) as string}
              onAction={() => router.push(`/meal/custom?slot=${selectedSlot}` as any)}
            />
          ) : (
            <EmptyState icon={'—'} title={t('emptyMealsTitle')} subtitle={t('emptyMealsSubtitle')} />
          )
        }
        ListFooterComponent={
          <>
            {/* Always-available custom meal entry */}
            <Pressable
              style={styles.customCta}
              onPress={() => router.push(`/meal/custom?slot=${selectedSlot}` as any)}
            >
              <View style={styles.customCtaIcon}>
                <Text style={styles.customCtaPlus}>+</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customCtaTitle}>{t('customMealCtaTitle' as any)}</Text>
                <Text style={styles.customCtaSub}>{t('customMealCtaSub' as any)}</Text>
              </View>
              <Text style={styles.customCtaArrow}>›</Text>
            </Pressable>

            {!isPremium && remainingCount > 0 ? (
              <Pressable style={styles.paywallCard} onPress={handlePaywall}>
                <View style={styles.paywallGlow} />
                <Text style={styles.paywallEyebrow}>BIBLIOTHÈQUE COMPLÈTE</Text>
                <Text style={styles.paywallTitle}>
                  {t('moreMealsAvailable', { count: remainingCount })}
                </Text>
                <Text style={styles.paywallSubtitle}>{t('paywallProSubtitle')}</Text>
                <View style={styles.paywallCta}>
                  <Text style={styles.paywallCtaText}>{t('unlockPro')}</Text>
                </View>
              </Pressable>
            ) : null}
          </>
        }
      />
    </View>
  );
}

function ArrowLeftIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18 L9 12 L15 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4 A7 7 0 1 1 11 18 A7 7 0 1 1 11 4 Z M16 16 L21 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignSelf: 'center' as const,
    width: '100%' as const,
  },
  headerTopRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconBtnActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderColor: 'rgba(255,107,53,0.4)',
  },
  plusIcon: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '300' as const,
    lineHeight: 22,
  },
  heartIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.62)',
  },
  heartIconActive: {
    color: '#FF6B35',
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
  },
  /** Wrapper du ScrollView slot. Hauteur explicite = somme chip
   *  minHeight (36) + paddings vertical (14+12) + 4px de respiration
   *  = 66. `flexGrow: 0` empêche le ScrollView d'être étiré ou
   *  compressé par le layout parent. */
  slotScroll: {
    height: 66,
    flexGrow: 0,
    flexShrink: 0,
  },
  slotChipsRow: {
    paddingHorizontal: spacing.lg,
    gap: 8,
    flexDirection: 'row' as const,
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: 'center' as const,
  },
  /** Pill chip — single line of text, sized by content. minHeight et
   *  minWidth explicites pour éviter les rendus "barre vide" observés
   *  sur certains devices quand le contenu est petit. */
  slotChip: {
    minHeight: 36,
    minWidth: 64,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  slotChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  /** Subtle outline glow on the chip whose time range covers the current
   *  hour — helps the user spot "where they should be" at a glance. */
  slotChipNow: {
    borderColor: 'rgba(255,107,53,0.55)',
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  /** Texte du chip — couleur HEX explicite (pas rgba) pour éviter les
   *  bugs de rendu opacité sur certains devices iOS. */
  slotChipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    opacity: 0.92,
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  slotChipTextActive: {
    color: '#FFFFFF',
    opacity: 1,
    fontWeight: '700' as const,
  },
  searchWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginHorizontal: spacing.lg,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    alignSelf: 'center' as const,
    width: 'auto' as any,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
    minHeight: 18,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  proBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FF6B35',
    letterSpacing: 0.8,
  },
  filtersWrap: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterChips: {
    paddingHorizontal: spacing.lg,
    gap: 6,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderColor: 'rgba(255,107,53,0.4)',
  },
  filterChipText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.62)',
  },
  filterChipTextActive: {
    color: '#FF6B35',
  },
  filterSep: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    marginHorizontal: 4,
  },
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 14,
    paddingBottom: spacing['5xl'] * 1.5,
  },
  gridRow: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  customCta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    marginTop: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  customCtaIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  customCtaPlus: {
    fontSize: 22,
    color: '#FF6B35',
    fontWeight: '300' as const,
    lineHeight: 22,
  },
  customCtaTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  customCtaSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  customCtaArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.38)',
  },
  paywallCard: {
    marginTop: 24,
    padding: 22,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  paywallGlow: {
    position: 'absolute' as const,
    top: -40,
    left: '50%' as any,
    width: 220,
    height: 120,
    backgroundColor: 'rgba(255,107,53,0.18)',
    borderRadius: 999,
    transform: [{ translateX: -110 }],
  },
  paywallEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700' as const,
  },
  paywallTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.3,
  },
  paywallSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 18,
  },
  paywallCta: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: '#FF6B35',
  },
  paywallCtaText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
}));
