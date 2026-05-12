import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useT } from '../../i18n';
import { formatIngredientQuantity } from '../../data/ingredientUnits';
import type { AdjustedIngredient, MealIngredient } from '../../types/meal';

interface IngredientRowProps {
  /** Use AdjustedIngredient when portion-adjusted data is available */
  ingredient?: AdjustedIngredient;
  /** Fallback: use base MealIngredient when no adjusted data */
  baseIngredient?: MealIngredient;
  /** Whether to show the adjusted/personalized quantity */
  showAdjusted?: boolean;
  /** Index number for visual ordering */
  index?: number;
}

export function IngredientRow({
  ingredient,
  baseIngredient,
  showAdjusted = true,
  index,
}: IngredientRowProps) {
  const styles = useStyles();
  const { locale } = useT();
  const lang: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr';
  const name = ingredient?.name ?? baseIngredient?.name ?? '';
  const ingredientId = ingredient?.ingredientId ?? baseIngredient?.ingredientId ?? '';
  let quantity: string;

  if (ingredient && showAdjusted) {
    // Prefer recomputing here over `displayQuantity` so countable ingredients
    // ("2 bananes") get the natural-unit treatment even when the engine
    // pre-formatted in grams.
    quantity = formatIngredientQuantity(ingredientId, ingredient.roundedQuantity, ingredient.unit, lang);
  } else if (ingredient) {
    quantity = formatIngredientQuantity(ingredientId, ingredient.originalQuantity, ingredient.unit, lang);
  } else if (baseIngredient) {
    quantity = formatIngredientQuantity(ingredientId, baseIngredient.baseQuantityG, baseIngredient.unit, lang);
  } else {
    quantity = '';
  }

  return (
    <View style={styles.row}>
      <View style={styles.nameContainer}>
        {index !== undefined && (
          <View style={styles.bullet} />
        )}
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <Text style={styles.quantity}>{quantity}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  quantity: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
}));

export default IngredientRow;
