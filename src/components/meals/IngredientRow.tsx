import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
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
  const name = ingredient?.name ?? baseIngredient?.name ?? '';
  let quantity: string;

  if (ingredient && showAdjusted) {
    quantity = ingredient.displayQuantity;
  } else if (ingredient) {
    quantity = formatBaseQuantity(ingredient.originalQuantity, ingredient.unit);
  } else if (baseIngredient) {
    quantity = formatBaseQuantity(baseIngredient.baseQuantityG, baseIngredient.unit);
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

function formatBaseQuantity(qty: number, unit: 'g' | 'ml' | 'unit'): string {
  if (unit === 'unit') {
    return `${Math.round(qty / 60)}`; // Each egg is ~60g
  }
  return `${Math.round(qty)}${unit}`;
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
