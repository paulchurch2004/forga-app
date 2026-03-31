import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { IngredientRow } from './IngredientRow';
import { RecipeSteps } from './RecipeSteps';
import { Button } from '../ui/Button';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import { useResponsive } from '../../hooks/useResponsive';
import type { Meal, AdjustedIngredient } from '../../types/meal';
import type { MacroTarget } from '../../types/engine';

interface MacroBarData {
  label: string;
  value: number;
  target: number;
  color: string;
  unit: string;
}

interface MealDetailSheetProps {
  meal: Meal;
  adjustedIngredients: AdjustedIngredient[];
  adjustedMacros: MacroTarget;
  slotTargetMacros: MacroTarget;
  isPremium: boolean;
  isFavorite: boolean;
  onValidate: () => void;
  onGoBack: () => void;
  onToggleFavorite: () => void;
  onClose: () => void;
  onShowPaywall?: () => void;
  validating?: boolean;
}

function MacroBar({
  label,
  value,
  target,
  color,
  unit,
}: MacroBarData) {
  const percent = target > 0 ? Math.min(100, (value / target) * 100) : 0;

  return (
    <View style={macroBarStyles.container}>
      <View style={macroBarStyles.header}>
        <Text style={[macroBarStyles.label, { color }]}>{label}</Text>
        <Text style={macroBarStyles.values}>
          <Text style={[macroBarStyles.current, { color }]}>
            {Math.round(value)}
          </Text>
          <Text style={macroBarStyles.separator}> / </Text>
          <Text style={macroBarStyles.target}>
            {Math.round(target)}{unit}
          </Text>
        </Text>
      </View>
      <View style={macroBarStyles.track}>
        <View
          style={[
            macroBarStyles.fill,
            {
              width: `${percent}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function MealDetailSheet({
  meal,
  adjustedIngredients,
  adjustedMacros,
  slotTargetMacros,
  isPremium,
  isFavorite,
  onValidate,
  onGoBack,
  onToggleFavorite,
  onClose,
  onShowPaywall,
  validating = false,
}: MealDetailSheetProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { contentMaxWidth } = useResponsive();
  const contentWidth = Math.min(windowWidth, contentMaxWidth);
  const photoHeight = contentWidth * 0.55;

  const macroBars: MacroBarData[] = useMemo(
    () => [
      {
        label: 'Calories',
        value: adjustedMacros.calories,
        target: slotTargetMacros.calories,
        color: colors.calories,
        unit: 'kcal',
      },
      {
        label: 'Proteines',
        value: adjustedMacros.protein,
        target: slotTargetMacros.protein,
        color: colors.protein,
        unit: 'g',
      },
      {
        label: 'Glucides',
        value: adjustedMacros.carbs,
        target: slotTargetMacros.carbs,
        color: colors.carbs,
        unit: 'g',
      },
      {
        label: 'Lipides',
        value: adjustedMacros.fat,
        target: slotTargetMacros.fat,
        color: colors.fat,
        unit: 'g',
      },
    ],
    [adjustedMacros, slotTargetMacros]
  );

  const budgetLabel = meal.budget === 'eco' ? 'eco' : 'premium';
  const budgetColor = meal.budget === 'eco' ? colors.success : colors.fat;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={[styles.innerContent, { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' as const, width: '100%' }]}>
          {/* Photo */}
          <View style={[styles.photoContainer, { height: photoHeight }]}>
            <Image
              source={{ uri: meal.photoUrl }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.photoOverlay} />

            {/* Close button */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{'\u2715'}</Text>
            </Pressable>

            {/* Budget tag on photo */}
            <View style={[styles.photoBudgetTag, { backgroundColor: budgetColor }]}>
              <Text style={styles.photoBudgetText}>{budgetLabel}</Text>
            </View>

            {/* Favorite (premium) */}
            {isPremium && (
              <Pressable style={styles.favoriteButton} onPress={onToggleFavorite}>
                <Text style={styles.favoriteIcon}>
                  {isFavorite ? '\u2665' : '\u2661'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Meal name + description */}
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDescription}>{meal.description}</Text>

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  {meal.prepTimeMin} min
                </Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>
                  {meal.difficulty === 1
                    ? 'Facile'
                    : meal.difficulty === 2
                    ? 'Moyen'
                    : 'Avance'}
                </Text>
              </View>
            </View>

            {/* Macro bars */}
            <View style={styles.macroSection}>
              <Text style={styles.sectionTitle}>Macros personnalisees</Text>
              {macroBars.map((bar) => (
                <MacroBar key={bar.label} {...bar} />
              ))}
            </View>

            {/* Ingredients */}
            <View style={styles.ingredientSection}>
              <Text style={styles.sectionTitle}>
                Ingredients ({adjustedIngredients.length})
              </Text>
              {adjustedIngredients.map((ing, index) => (
                <IngredientRow
                  key={ing.ingredientId}
                  ingredient={ing}
                  showAdjusted={true}
                  index={index}
                />
              ))}
            </View>

            {/* Recipe Steps */}
            {isPremium ? (
              <RecipeSteps steps={meal.recipeSteps} />
            ) : (
              <View style={styles.paywallSection}>
                <Text style={styles.paywallTitle}>Recette detaillee</Text>
                <Text style={styles.paywallText}>
                  La recette etape par etape est disponible pour les membres FORGA PRO.
                </Text>
                <Button
                  title="Debloquer avec FORGA PRO"
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={onShowPaywall}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={[styles.bottomActions, { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' as const, width: '100%' }]}>
          <Pressable style={styles.secondaryAction} onPress={onGoBack}>
            <Text style={styles.secondaryActionText}>Voir un autre</Text>
          </Pressable>
          <View style={styles.primaryActionWrapper}>
            <Button
              title="Valider ce repas"
              variant="primary"
              size="lg"
              fullWidth
              loading={validating}
              onPress={onValidate}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const macroBarStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  values: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
  },
  current: {
    fontWeight: '700',
  },
  separator: {
    color: colors.textMuted,
  },
  target: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  innerContent: {},
  photoContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  closeButton: {
    position: 'absolute',
    top: spacing['3xl'],
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  photoBudgetTag: {
    position: 'absolute',
    top: spacing['3xl'],
    left: spacing.lg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  photoBudgetText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 22,
    color: colors.calories,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mealDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metaChip: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metaChipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  macroSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  ingredientSection: {
    marginBottom: spacing.lg,
  },
  paywallSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  paywallTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  paywallText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
    ...shadows.card,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  secondaryAction: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  secondaryActionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  primaryActionWrapper: {
    flex: 1,
  },
});

export default MealDetailSheet;
