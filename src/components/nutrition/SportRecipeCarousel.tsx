// Carrousel "Recettes sport" — section dédiée affichée sur la page
// nutrition, scrollable horizontalement. Chaque card mène à
// /sport-recipe/[id]. Les recettes sport sont ISOLÉES des suggestions
// par slot (cf forga_recettes_completes.md spec).

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { SPORT_RECIPES, type SportRecipe } from '../../data/meals/sport';

interface Props {
  /** Filtre optionnel par tag (ex 'post-workout'). Par défaut : toutes. */
  filterTag?: string;
  /** Limite de recettes affichées. Par défaut : 12. */
  limit?: number;
  /** Titre custom (défaut "Recettes sport"). */
  title?: string;
}

export function SportRecipeCarousel({ filterTag, limit = 12, title = 'Recettes sport' }: Props) {
  const styles = useStyles();

  const recipes = React.useMemo(() => {
    let list: SportRecipe[] = SPORT_RECIPES;
    if (filterTag) {
      list = list.filter((r) => r.tags.includes(filterTag));
    }
    return list.slice(0, limit);
  }, [filterTag, limit]);

  if (recipes.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BIBLIOTHÈQUE SPORT</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={() => router.push('/sport-recipes')}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.seeAll}>Tout voir →</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={216} // card 200 + gap 16 (cohérent avec styles.card width + scrollContent gap)
        snapToAlignment="start"
      >
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </ScrollView>
    </View>
  );
}

function RecipeCard({ recipe }: { recipe: SportRecipe }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => router.push(`/sport-recipe/${recipe.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
      accessibilityRole="button"
      accessibilityLabel={`Recette ${recipe.name}`}
    >
      <Image
        source={{ uri: recipe.photoUrl }}
        style={styles.cardImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
      />
      <LinearGradient
        colors={['transparent', 'rgba(7,7,13,0.92)']}
        locations={[0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardOverlay}>
        <View style={styles.macroRow}>
          <Text style={styles.macroChip}>{Math.round(recipe.macros.calories)} kcal</Text>
          <Text style={styles.macroChip}>{Math.round(recipe.macros.protein)}g prot</Text>
        </View>
        <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {recipe.prepTimeMin} min · {recipe.servings.replace(/^Pour /, '')}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    marginTop: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    width: 200,
    height: 280,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
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
    letterSpacing: 0.3,
    overflow: 'hidden',
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 19,
    marginBottom: 4,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
}));
