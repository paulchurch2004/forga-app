// Page détail d'une recette sport — accessible via /sport-recipe/[id]
// Hero image + macros + ingrédients + étapes + alternatives.

import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useResponsive } from '../../src/hooks/useResponsive';
import { getSportRecipeById } from '../../src/data/meals/sport';
import { useMealStore } from '../../src/store/mealStore';
import { useAuthStore } from '../../src/store/authStore';
import { syncMeal } from '../../src/services/userSync';
import { events } from '../../src/services/analytics';
import { useUserStore } from '../../src/store/userStore';
import { todayLocalIso } from '../../src/utils/date';
import { MEAL_SLOT_LABELS, type MealSlot } from '../../src/types/meal';
import type { DailyMeal } from '../../src/types/meal';

export default function SportRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const styles = useStyles();

  const recipe = useMemo(() => (id ? getSportRecipeById(id) : null), [id]);
  const addValidatedMeal = useMealStore((s) => s.addValidatedMeal);
  const [added, setAdded] = useState(false);

  // Ajoute la recette sport à la journée (DailyMeal flaggé isSportRecipe).
  // On laisse l'user choisir le créneau via un menu natif — sa recette
  // sport peut être un snack pré/post-séance, un petit-déj, etc.
  const handleAddToDay = useCallback(() => {
    if (!recipe || added) return;
    const slots: MealSlot[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'bedtime'];
    const buttons = slots.map((slot) => ({
      text: MEAL_SLOT_LABELS[slot],
      onPress: () => {
        const userId = useUserStore.getState().profile?.id ?? 'local';
        const meal: DailyMeal = {
          id: `sport_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId,
          date: todayLocalIso(),
          slot,
          mealId: recipe.id,
          customName: recipe.name,
          adjustedQuantities: {},
          actualMacros: {
            calories: Math.round(recipe.macros.calories),
            protein: Math.round(recipe.macros.protein),
            carbs: Math.round(recipe.macros.carbs),
            fat: Math.round(recipe.macros.fat),
          },
          validatedAt: new Date().toISOString(),
          isSportRecipe: true,
        };
        addValidatedMeal(meal);
        syncMeal(meal);
        const { hasLoggedFirstMeal, markFirstMealLogged } = useUserStore.getState();
        if (!hasLoggedFirstMeal) {
          events.firstMealLogged(slot, 'recipe');
          markFirstMealLogged();
        }
        setAdded(true);
      },
    }));
    buttons.push({ text: 'Annuler', onPress: () => {}, style: 'cancel' } as any);
    Alert.alert('Ajouter à quel repas ?', recipe.name, buttons as any, { cancelable: true });
  }, [recipe, added, addValidatedMeal]);

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <BackArrow color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Retour</Text>
        </Pressable>
        <Text style={styles.notFound}>Recette introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image avec overlay */}
      <View style={styles.heroWrap}>
        <Image
          source={{ uri: recipe.photoUrl }}
          style={styles.heroImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
        <LinearGradient
          colors={['rgba(7,7,13,0.55)', 'transparent', 'rgba(7,7,13,0.95)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={() => router.back()}
          style={[styles.backFloating, { top: insets.top + spacing.sm }]}
          hitSlop={16}
        >
          <BackArrow color="#FFFFFF" />
        </Pressable>
        <View style={styles.heroBottom}>
          <Text style={styles.eyebrow}>RECETTE SPORT</Text>
          <Text style={styles.name}>{recipe.name}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>
      </View>

      {/* Meta : portions / temps / difficulté */}
      <View style={styles.metaRow}>
        <MetaItem label="Portions" value={recipe.servings} />
        <MetaItem label="Préparation" value={`${recipe.prepTimeMin} min`} />
        <MetaItem label="Difficulté" value={'⚡'.repeat(recipe.difficulty)} />
      </View>

      {/* Macros */}
      <View style={styles.macrosCard}>
        <Text style={styles.sectionLabel}>MACROS / PORTION</Text>
        <View style={styles.macrosGrid}>
          <MacroCell value={recipe.macros.calories} unit="kcal" label="Calories" color="#FF6B35" />
          <MacroCell value={recipe.macros.protein} unit="g" label="Protéines" color="#5B8BFF" />
          <MacroCell value={recipe.macros.carbs} unit="g" label="Glucides" color="#00D4AA" />
          <MacroCell value={recipe.macros.fat} unit="g" label="Lipides" color="#FFC857" />
        </View>
      </View>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {recipe.tags.filter((t) => t !== 'sport').map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{formatTag(tag)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Ingrédients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingrédients</Text>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <View style={styles.bullet} />
            <Text style={styles.ingredientText}>{ing}</Text>
          </View>
        ))}
      </View>

      {/* Préparation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préparation</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Alternatives */}
      {recipe.alternatives && (
        <View style={styles.altCard}>
          <Text style={styles.altLabel}>ALTERNATIVES</Text>
          <Text style={styles.altText}>{recipe.alternatives}</Text>
        </View>
      )}

      {/* CTA — Ajouter à ma journée. Logue la recette sport comme un
          DailyMeal avec le flag isSportRecipe pour la distinguer. */}
      <Pressable
        onPress={handleAddToDay}
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#FF8C40', '#FF5A1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addBtnGradient}
        >
          <Text style={styles.addBtnText}>{added ? '✓ Ajouté à ta journée' : '+ Ajouter à ma journée'}</Text>
        </LinearGradient>
      </Pressable>

      <View style={{ height: insets.bottom + spacing['2xl'] }} />
    </ScrollView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MacroCell({ value, unit, label, color }: { value: number; unit: string; label: string; color: string }) {
  const styles = useStyles();
  return (
    <View style={styles.macroCell}>
      <Text style={[styles.macroValue, { color }]}>
        {value}<Text style={styles.macroUnit}>{unit}</Text>
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function BackArrow({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12l6-6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function formatTag(tag: string): string {
  const labels: Record<string, string> = {
    'high-protein': '💪 Protéiné',
    'vegan': '🌿 Vegan',
    'vegetarian': '🌱 Végé',
    'gluten-free': '🌾 Sans gluten',
    'pre-workout': '⚡ Pré-workout',
    'post-workout': '🔥 Post-workout',
    'recovery': '🌙 Récup',
    'bulk': '📈 Prise de masse',
    'cut': '🔻 Sèche',
  };
  return labels[tag] ?? tag;
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['2xl'],
    alignSelf: 'center',
    width: '100%',
  },
  heroWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    maxHeight: 420,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backFloating: {
    position: 'absolute',
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  notFound: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  metaItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
  },
  macrosCard: {
    margin: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.4,
    marginBottom: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroCell: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  macroUnit: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  macroLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
  },
  tagText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 9,
  },
  ingredientText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 23,
  },
  altCard: {
    margin: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: 'rgba(0,212,170,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.25)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  altLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#00D4AA',
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  altText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  addBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  addBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
}));
