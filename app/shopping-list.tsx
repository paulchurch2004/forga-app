import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealStore } from '../src/store/mealStore';
import { getMealById } from '../src/data/meals';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';

interface ShoppingItem {
  ingredientId: string;
  name: string;
  totalQuantity: number;
  unit: 'g' | 'ml' | 'unit';
  roundTo: number;
}

export default function ShoppingListScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const [copied, setCopied] = useState(false);

  const todayMeals = useMealStore((s) => s.todayMeals);
  const dayPlan = useMealStore((s) => s.dayPlan);

  const items = useMemo(() => {
    const map = new Map<string, ShoppingItem>();

    // Collect all meal IDs with their adjusted quantities
    const mealsToProcess: { mealId: string; quantities: Record<string, number> }[] = [];

    // From dayPlan slots (planned meals)
    if (dayPlan) {
      for (const slotData of dayPlan.slots) {
        if (slotData.meal) {
          mealsToProcess.push({
            mealId: slotData.meal.mealId,
            quantities: slotData.meal.adjustedQuantities,
          });
        }
      }
    }

    // From validated meals not already in dayPlan
    for (const dm of todayMeals) {
      if (!mealsToProcess.some((m) => m.mealId === dm.mealId)) {
        mealsToProcess.push({
          mealId: dm.mealId,
          quantities: dm.adjustedQuantities,
        });
      }
    }

    // Aggregate ingredients
    for (const { mealId, quantities } of mealsToProcess) {
      const meal = getMealById(mealId);
      if (!meal) continue;

      for (const ing of meal.ingredients) {
        const qty = quantities[ing.ingredientId] ?? ing.baseQuantityG;
        const existing = map.get(ing.ingredientId);
        if (existing) {
          existing.totalQuantity += qty;
        } else {
          map.set(ing.ingredientId, {
            ingredientId: ing.ingredientId,
            name: ing.name,
            totalQuantity: qty,
            unit: ing.unit,
            roundTo: ing.roundTo,
          });
        }
      }
    }

    // Round and sort
    const result = Array.from(map.values());
    for (const item of result) {
      item.totalQuantity = Math.round(item.totalQuantity / item.roundTo) * item.roundTo;
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [todayMeals, dayPlan]);

  const formatQuantity = (item: ShoppingItem) => {
    if (item.unit === 'unit') return `${item.totalQuantity}`;
    return `${item.totalQuantity} ${item.unit}`;
  };

  const buildTextList = () => {
    return items.map((i) => `- ${i.name}: ${formatQuantity(i)}`).join('\n');
  };

  const handleShare = async () => {
    const text = buildTextList();
    const title = 'Liste de courses FORGA';

    if (Platform.OS === 'web') {
      try {
        if (navigator.share) {
          await navigator.share({ title, text });
        } else {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        // User cancelled
      }
    } else {
      await Share.share({ message: `${title}\n\n${text}`, title });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Liste de courses</Text>
          <View style={{ width: 50 }} />
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Aucun repas prevu</Text>
            <Text style={styles.emptySubtitle}>
              Valide ou planifie des repas pour generer ta liste de courses.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>
              {items.length} ingredient{items.length > 1 ? 's' : ''}
            </Text>

            {items.map((item) => (
              <View key={item.ingredientId} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQuantity}>{formatQuantity(item)}</Text>
              </View>
            ))}

            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>
                {copied ? 'Copie !' : 'Partager la liste'}
              </Text>
            </Pressable>
          </>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  countText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  itemQuantity: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  shareBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
