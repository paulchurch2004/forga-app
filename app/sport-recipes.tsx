// Page "Bibliothèque sport" — liste TOUTES les recettes sport
// (SPORT_RECIPES, isolées d'ALL_MEALS comme demandé par le produit).
// Accessible depuis le carousel "Tout voir →" de la page Nutrition.
//
// Filtres : tag (high-protein, post-workout, vegan, etc.) + recherche
// par nom. Tap sur une card → /sport-recipe/[id].

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SPORT_RECIPES, type SportRecipe } from '../src/data/meals/sport';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { ScreenTopBar } from '../src/components/ui/ScreenTopBar';

const TAG_FILTERS: { value: string; label: string }[] = [
  { value: 'high-protein', label: 'Hyper prot' },
  { value: 'post-workout', label: 'Post-séance' },
  { value: 'pre-workout', label: 'Pré-séance' },
  { value: 'recovery', label: 'Récup' },
  { value: 'bulk', label: 'Bulk' },
  { value: 'cut', label: 'Sèche' },
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Sans gluten' },
];

export default function SportRecipesScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ tag?: string }>();

  // Pré-sélection du tag via query param (ex: /sport-recipes?tag=post-workout).
  // Init lazy pour que les nav répétées ne reset pas la sélection user.
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(
    typeof params.tag === 'string' && params.tag !== 'sport' ? params.tag : null,
  );

  const filtered = useMemo(() => {
    let list: SportRecipe[] = SPORT_RECIPES;
    if (activeTag) {
      list = list.filter((r) => r.tags.includes(activeTag));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeTag, search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenTopBar title="Recettes sport" />

      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher une recette..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsRow}
      >
        <Pressable
          onPress={() => setActiveTag(null)}
          style={[styles.tagChip, !activeTag && styles.tagChipActive]}
        >
          <Text style={[styles.tagText, !activeTag && styles.tagTextActive]}>Tous</Text>
        </Pressable>
        {TAG_FILTERS.map((t) => {
          const isActive = activeTag === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => setActiveTag(isActive ? null : t.value)}
              style={[styles.tagChip, isActive && styles.tagChipActive]}
            >
              <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune recette ne correspond à ces filtres.</Text>
          </View>
        ) : (
          filtered.map((r) => <RecipeRow key={r.id} recipe={r} />)
        )}
      </ScrollView>
    </View>
  );
}

function RecipeRow({ recipe }: { recipe: SportRecipe }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => router.push(`/sport-recipe/${recipe.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`Recette ${recipe.name}`}
    >
      <Image
        source={{ uri: recipe.photoUrl }}
        style={styles.cardImage}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,7,13,0.92)']}
        locations={[0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardOverlay}>
        <View style={styles.macroRow}>
          <Text style={styles.macroChip}>{Math.round(recipe.macros.calories)} kcal</Text>
          <Text style={styles.macroChip}>{Math.round(recipe.macros.protein)}g prot</Text>
          <Text style={styles.macroChip}>{recipe.prepTimeMin} min</Text>
        </View>
        <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{recipe.description}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
  },
  tagsRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  tagChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tagChipActive: {
    backgroundColor: colors.primary,
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  card: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  macroChip: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255,107,53,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  empty: {
    paddingTop: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
}));
