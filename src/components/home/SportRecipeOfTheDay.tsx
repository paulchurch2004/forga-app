// Card "Recette sport du jour" affichée sur le Home.
// La recette change quotidiennement (déterministe : jour de l'année %
// nombre de recettes). Tap → page détail /sport-recipe/[id].

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../theme';
import { getSportRecipeOfTheDay } from '../../data/meals/sport';

export function SportRecipeOfTheDay() {
  const styles = useStyles();

  // La recette dépend du jour de l'année (YYYY-MM-DD). On utilise cette
  // clé en deps pour que React re-mémoize quand le jour change — sans
  // ça, si l'app reste ouverte passé minuit, la recette ne changeait
  // jamais (useMemo([]) = figé pour la vie du composant).
  const todayKey = new Date().toISOString().slice(0, 10);
  const recipe = React.useMemo(() => getSportRecipeOfTheDay(), [todayKey]);

  return (
    <Pressable
      onPress={() => router.push(`/sport-recipe/${recipe.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
      accessibilityRole="button"
      accessibilityLabel={`Recette sport du jour : ${recipe.name}`}
    >
      <Image
        source={{ uri: recipe.photoUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
      <LinearGradient
        colors={['rgba(7,7,13,0.30)', 'rgba(7,7,13,0.95)']}
        locations={[0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>RECETTE SPORT DU JOUR</Text>
          <View style={styles.flameBadge}>
            <Text style={styles.flameText}>🍽️</Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={2}>{recipe.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>

        <View style={styles.macroRow}>
          <View style={styles.macroChip}>
            <Text style={styles.macroValue}>{Math.round(recipe.macros.calories)}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={styles.macroValue}>{Math.round(recipe.macros.protein)}</Text>
            <Text style={styles.macroLabel}>g prot</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={styles.macroValue}>{recipe.prepTimeMin}</Text>
            <Text style={styles.macroLabel}>min</Text>
          </View>
        </View>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>Voir la recette →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  eyebrowRow: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.6,
    backgroundColor: 'rgba(255,107,53,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  flameBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameText: {
    fontSize: 16,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  macroValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  macroLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  ctaRow: {
    marginTop: 2,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
}));
