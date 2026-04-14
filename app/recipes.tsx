import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ALL_MEALS } from '../src/data/meals';
import { useMealStore } from '../src/store/mealStore';
import { usePremium } from '../src/hooks/usePremium';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import type { Meal, MealSlot } from '../src/types/meal';

// ──────────── FILTER TYPES ────────────

type SortMode = 'name' | 'time' | 'protein' | 'calories';

const SLOT_OPTIONS: { value: MealSlot | 'all'; labelFr: string; labelEn: string }[] = [
  { value: 'all', labelFr: 'Tous', labelEn: 'All' },
  { value: 'breakfast', labelFr: 'Petit-dej', labelEn: 'Breakfast' },
  { value: 'morning_snack', labelFr: 'Snack AM', labelEn: 'AM Snack' },
  { value: 'lunch', labelFr: 'Dejeuner', labelEn: 'Lunch' },
  { value: 'afternoon_snack', labelFr: 'Gouter', labelEn: 'PM Snack' },
  { value: 'dinner', labelFr: 'Diner', labelEn: 'Dinner' },
  { value: 'bedtime', labelFr: 'Coucher', labelEn: 'Bedtime' },
];

const TAG_FILTERS = [
  { value: 'rapide', labelFr: 'Rapide', labelEn: 'Quick' },
  { value: 'hyperproteine', labelFr: 'Hyper prot', labelEn: 'High protein' },
  { value: 'low-carb', labelFr: 'Low carb', labelEn: 'Low carb' },
  { value: 'vegetarian', labelFr: 'Vegetarien', labelEn: 'Vegetarian' },
  { value: 'vegan', labelFr: 'Vegan', labelEn: 'Vegan' },
  { value: 'sans-cuisson', labelFr: 'Sans cuisson', labelEn: 'No cook' },
  { value: 'meal-prep', labelFr: 'Meal prep', labelEn: 'Meal prep' },
];

const DIFFICULTY_LABELS: Record<string, Record<number, string>> = {
  fr: { 1: 'Facile', 2: 'Moyen', 3: 'Avance' },
  en: { 1: 'Easy', 2: 'Medium', 3: 'Advanced' },
};

// ──────────── RECIPE CARD ────────────

function RecipeCard({ meal, isFav, locale }: { meal: Meal; isFav: boolean; locale: string }) {
  const styles = useCardStyles();
  const { colors } = useTheme();

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/meal/${meal.id}`)}>
      <Image source={{ uri: meal.photoUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={2}>{meal.name}</Text>
          {isFav && <Text style={styles.favIcon}>{'\u2764'}</Text>}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{meal.prepTimeMin} min</Text>
          <Text style={styles.metaDot}>{'\u00B7'}</Text>
          <Text style={styles.metaText}>{DIFFICULTY_LABELS[locale]?.[meal.difficulty] ?? DIFFICULTY_LABELS.fr[meal.difficulty]}</Text>
          <Text style={styles.metaDot}>{'\u00B7'}</Text>
          <Text style={[styles.metaText, { color: colors.primary }]}>{meal.baseMacros.calories} kcal</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={[styles.macroChip, { color: colors.success }]}>{meal.baseMacros.protein}g P</Text>
          <Text style={[styles.macroChip, { color: colors.warning }]}>{meal.baseMacros.carbs}g G</Text>
          <Text style={[styles.macroChip, { color: colors.info }]}>{meal.baseMacros.fat}g L</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ──────────── MAIN SCREEN ────────────

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, locale } = useT();
  const { isPremium } = usePremium();
  const { width: screenWidth } = useWindowDimensions();

  const favorites = useMealStore((s) => s.favorites);

  const [search, setSearch] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const filteredMeals = useMemo(() => {
    let meals = ALL_MEALS;

    // Slot filter
    if (selectedSlot !== 'all') {
      meals = meals.filter((m) => m.slot === selectedSlot);
    }

    // Budget filter (free users see only eco)
    if (!isPremium) {
      meals = meals.filter((m) => m.budget === 'eco' || m.budget === 'both');
    }

    // Tag filters
    if (selectedTags.length > 0) {
      meals = meals.filter((m) => {
        const mealTags = [...m.tags, ...m.restrictions];
        return selectedTags.every((t) => mealTags.includes(t));
      });
    }

    // Favorites only
    if (showFavsOnly) {
      meals = meals.filter((m) => favorites.includes(m.id));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      meals = meals.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        m.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortMode) {
      case 'name':
        meals = [...meals].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        break;
      case 'time':
        meals = [...meals].sort((a, b) => a.prepTimeMin - b.prepTimeMin);
        break;
      case 'protein':
        meals = [...meals].sort((a, b) => b.baseMacros.protein - a.baseMacros.protein);
        break;
      case 'calories':
        meals = [...meals].sort((a, b) => a.baseMacros.calories - b.baseMacros.calories);
        break;
    }

    return meals;
  }, [selectedSlot, selectedTags, search, sortMode, showFavsOnly, favorites, isPremium]);

  const numCols = screenWidth > 700 ? 3 : 2;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
        </Pressable>
        <Text style={styles.title}>{locale === 'en' ? 'Recipes' : 'Recettes'}</Text>
        <Text style={styles.countBadge}>{filteredMeals.length}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: spacing.sm }}>
          <Path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={locale === 'en' ? 'Search by name, ingredient, tag...' : 'Chercher par nom, ingredient, tag...'}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Slot filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {SLOT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.filterChip, selectedSlot === opt.value && styles.filterChipActive]}
            onPress={() => setSelectedSlot(opt.value)}
          >
            <Text style={[styles.filterText, selectedSlot === opt.value && styles.filterTextActive]}>
              {locale === 'en' ? opt.labelEn : opt.labelFr}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tag filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {TAG_FILTERS.map((tag) => (
          <Pressable
            key={tag.value}
            style={[styles.tagChip, selectedTags.includes(tag.value) && styles.tagChipActive]}
            onPress={() => toggleTag(tag.value)}
          >
            <Text style={[styles.tagText, selectedTags.includes(tag.value) && styles.tagTextActive]}>
              {locale === 'en' ? tag.labelEn : tag.labelFr}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.tagChip, showFavsOnly && styles.tagChipActive]}
          onPress={() => setShowFavsOnly(!showFavsOnly)}
        >
          <Text style={[styles.tagText, showFavsOnly && styles.tagTextActive]}>
            {'\u2764'} {locale === 'en' ? 'Favs' : 'Favoris'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>{locale === 'en' ? 'Sort:' : 'Trier :'}</Text>
        {([
          { value: 'name' as SortMode, fr: 'Nom', en: 'Name' },
          { value: 'time' as SortMode, fr: 'Temps', en: 'Time' },
          { value: 'protein' as SortMode, fr: 'Prot', en: 'Protein' },
          { value: 'calories' as SortMode, fr: 'Calories', en: 'Calories' },
        ]).map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.sortChip, sortMode === opt.value && styles.sortChipActive]}
            onPress={() => setSortMode(opt.value)}
          >
            <Text style={[styles.sortText, sortMode === opt.value && styles.sortTextActive]}>
              {locale === 'en' ? opt.en : opt.fr}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      {filteredMeals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\uD83C\uDF7D'}</Text>
          <Text style={styles.emptyTitle}>
            {locale === 'en' ? 'No recipes found' : 'Aucune recette trouvee'}
          </Text>
          <Text style={styles.emptySub}>
            {locale === 'en' ? 'Try different filters or keywords' : 'Essaie d\'autres filtres ou mots-cles'}
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredMeals.map((meal) => (
            <View key={meal.id} style={{ width: `${100 / numCols}%`, padding: spacing.xs }}>
              <RecipeCard meal={meal} isFav={favorites.includes(meal.id)} locale={locale} />
            </View>
          ))}
        </View>
      )}

      {/* Premium upsell */}
      {!isPremium && (
        <Pressable style={styles.premiumBanner} onPress={() => router.push('/paywall')}>
          <Text style={styles.premiumText}>
            {locale === 'en'
              ? 'Unlock 300+ premium recipes with FORGA PRO'
              : 'Debloque 300+ recettes premium avec FORGA PRO'}
          </Text>
        </Pressable>
      )}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

// ──────────── STYLES ────────────

const useCardStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceHover,
  },
  cardBody: {
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  favIcon: {
    fontSize: 12,
    color: colors.error,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 10,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  macroChip: {
    fontFamily: fonts.data,
    fontSize: 10,
    fontWeight: '700',
  },
}));

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  countBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: `${colors.primary}18`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  filterRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}18`,
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.border}80`,
  },
  tagChipActive: {
    backgroundColor: `${colors.success}18`,
    borderColor: colors.success,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tagTextActive: {
    color: colors.success,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  sortLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  sortChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  sortChipActive: {
    backgroundColor: `${colors.primary}15`,
  },
  sortText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sortTextActive: {
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  premiumBanner: {
    backgroundColor: `${colors.primary}12`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  premiumText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
}));
