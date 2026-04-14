import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  FlatList,
  Share,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { useMealStore } from '../src/store/mealStore';
import { useWeeklyPlanStore } from '../src/store/weeklyPlanStore';
import { generateWeeklyPlan, getCurrentWeekStart } from '../src/engine/weeklyPlanner';
import { getMealById, getMealsBySlotAndBudget } from '../src/data/meals';
import { calculatePortions } from '../src/engine/portionCalculator';
import { useEngine } from '../src/hooks/useEngine';
import { MEAL_SLOT_LABELS, type MealSlot } from '../src/types/meal';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useT } from '../src/i18n';
import { EmptyState } from '../src/components/ui/EmptyState';
import { useResponsive } from '../src/hooks/useResponsive';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type TabKey = 'plan' | 'courses' | 'prep';

// -- Smart unit conversions --
// Maps ingredient IDs to approximate weight per natural unit
const UNIT_WEIGHTS: Record<string, { weight: number; label: string; plural: string }> = {
  banana: { weight: 120, label: 'banane', plural: 'bananes' },
  apple: { weight: 150, label: 'pomme', plural: 'pommes' },
  avocado: { weight: 150, label: 'avocat', plural: 'avocats' },
  tomato: { weight: 150, label: 'tomate', plural: 'tomates' },
  onion: { weight: 150, label: 'oignon', plural: 'oignons' },
  potato: { weight: 150, label: 'pomme de terre', plural: 'pommes de terre' },
  sweet_potato: { weight: 200, label: 'patate douce', plural: 'patates douces' },
  bell_pepper: { weight: 150, label: 'poivron', plural: 'poivrons' },
  red_pepper: { weight: 150, label: 'poivron rouge', plural: 'poivrons rouges' },
  zucchini: { weight: 200, label: 'courgette', plural: 'courgettes' },
  carrot: { weight: 100, label: 'carotte', plural: 'carottes' },
  eggplant: { weight: 250, label: 'aubergine', plural: 'aubergines' },
  orange: { weight: 150, label: 'orange', plural: 'oranges' },
  mango: { weight: 200, label: 'mangue', plural: 'mangues' },
  plantain: { weight: 200, label: 'plantain', plural: 'plantains' },
  cucumber: { weight: 300, label: 'concombre', plural: 'concombres' },
  ham_slice: { weight: 30, label: 'tranche', plural: 'tranches' },
  bread_whole: { weight: 30, label: 'tranche', plural: 'tranches' },
  bread_white: { weight: 30, label: 'tranche', plural: 'tranches' },
  wrap_tortilla: { weight: 60, label: 'tortilla', plural: 'tortillas' },
  mozzarella: { weight: 125, label: 'boule', plural: 'boules' },
  greek_yogurt_0: { weight: 125, label: 'pot', plural: 'pots' },
  skyr: { weight: 125, label: 'pot', plural: 'pots' },
  fromage_blanc_0: { weight: 125, label: 'pot', plural: 'pots' },
  soy_yogurt: { weight: 125, label: 'pot', plural: 'pots' },
  coconut_yogurt: { weight: 125, label: 'pot', plural: 'pots' },
};

interface ShoppingItem {
  ingredientId: string;
  name: string;
  totalQuantity: number;
  unit: 'g' | 'ml' | 'unit';
  roundTo: number;
}

function formatSmartQuantity(item: ShoppingItem): string {
  // Already unit-based
  if (item.unit === 'unit') {
    return `${Math.ceil(item.totalQuantity)}`;
  }

  // Check if we have a unit conversion for this ingredient
  const conv = UNIT_WEIGHTS[item.ingredientId];
  if (conv) {
    const units = Math.ceil(item.totalQuantity / conv.weight);
    return `${units} ${units > 1 ? conv.plural : conv.label}`;
  }

  // Liquids: use cl/L
  if (item.unit === 'ml') {
    if (item.totalQuantity >= 1000) {
      const liters = Math.round(item.totalQuantity / 100) / 10;
      return `${liters} L`;
    }
    if (item.totalQuantity >= 100) {
      return `${Math.round(item.totalQuantity / 10)} cl`;
    }
    return `${Math.round(item.totalQuantity)} ml`;
  }

  // Solids: use g/kg
  if (item.totalQuantity >= 1000) {
    const kg = Math.round(item.totalQuantity / 100) / 10;
    return `${kg} kg`;
  }
  return `${Math.round(item.totalQuantity)} g`;
}

export default function WeeklyPlanScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { t, locale } = useT();
  const { contentMaxWidth } = useResponsive();

  const profile = useUserStore((s) => s.profile);
  const engine = useEngine();
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);

  const { days, weekStart, setWeeklyPlan, swapMeal } = useWeeklyPlanStore();

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('plan');
  const [swapModal, setSwapModal] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!profile) return;
    const newDays = generateWeeklyPlan({
      objective: profile.objective,
      dailyCalories: profile.dailyCalories,
      budget: profile.budget,
      restrictions: profile.restrictions,
      likedMeals,
      dislikedMeals,
    });
    const ws = getCurrentWeekStart();
    setWeeklyPlan(ws, newDays);
  }, [profile, likedMeals, dislikedMeals, setWeeklyPlan]);

  const selectedDay = days[selectedDayIdx] ?? null;

  const swapCandidates = useMemo(() => {
    if (!swapModal || !profile) return [];
    const budgetParam: 'eco' | 'premium' | 'both' = profile.budget === 'both' ? 'both' : profile.budget;
    return getMealsBySlotAndBudget(swapModal.slot, budgetParam)
      .filter((m) => !dislikedMeals.includes(m.id))
      .filter((m) => {
        if (profile.restrictions.length === 0) return true;
        if (m.restrictions.length === 0) return true;
        return profile.restrictions.every((r) => m.restrictions.includes(r));
      })
      .slice(0, 20);
  }, [swapModal, profile, dislikedMeals]);

  // -- Shopping list: aggregate all 7 days --
  const shoppingItems = useMemo(() => {
    if (days.length === 0 || !engine) return [];
    const map = new Map<string, ShoppingItem>();

    for (const day of days) {
      for (const m of day.meals) {
        const meal = getMealById(m.mealId);
        if (!meal) continue;

        const slotTarget = engine.getSlotMacros(m.slot);
        const portionResult = calculatePortions(slotTarget, meal.baseMacros, meal.ingredients);

        for (const ing of meal.ingredients) {
          const adjusted = portionResult.adjustedIngredients.find(
            (a) => a.ingredientId === ing.ingredientId
          );
          const qty = adjusted?.roundedQuantity ?? ing.baseQuantityG;
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
    }

    // Round totals
    const result = Array.from(map.values());
    for (const item of result) {
      item.totalQuantity = Math.round(item.totalQuantity / item.roundTo) * item.roundTo;
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [days, engine]);

  const handleSwap = (mealId: string, mealName: string) => {
    if (!swapModal) return;
    swapMeal(swapModal.date, swapModal.slot, mealId, mealName);
    setSwapModal(null);
  };

  const buildTextList = () => {
    return shoppingItems.map((i) => `- ${i.name}: ${formatSmartQuantity(i)}`).join('\n');
  };

  const handleShare = async () => {
    const text = buildTextList();
    const title = t('shoppingList');

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

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>Profil non configure</Text>
      </View>
    );
  }

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
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('planAndShopping')}</Text>
          <Pressable onPress={handleGenerate} hitSlop={12}>
            <Text style={styles.regenerateText}>{days.length > 0 ? 'Refaire' : t('generatePlan')}</Text>
          </Pressable>
        </View>

        {/* Tab bar */}
        {days.length > 0 && (
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tab, activeTab === 'plan' && styles.tabActive]}
              onPress={() => setActiveTab('plan')}
            >
              <Text style={[styles.tabText, activeTab === 'plan' && styles.tabTextActive]}>
                {t('planTab')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'courses' && styles.tabActive]}
              onPress={() => setActiveTab('courses')}
            >
              <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
                {t('shoppingTab')} ({shoppingItems.length})
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'prep' && styles.tabActive]}
              onPress={() => setActiveTab('prep')}
            >
              <Text style={[styles.tabText, activeTab === 'prep' && styles.tabTextActive]}>
                PREP
              </Text>
            </Pressable>
          </View>
        )}

        {days.length === 0 ? (
          <EmptyState icon={'\uD83D\uDCCB'} title={t('emptyPlanTitle')} subtitle={t('emptyPlanSubtitle')} actionLabel={t('generatePlan')} onAction={handleGenerate} />
        ) : activeTab === 'plan' ? (
          <>
            {/* Day selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daySelector}
            >
              {days.map((day, idx) => (
                <Pressable
                  key={day.date}
                  style={[
                    styles.dayChip,
                    selectedDayIdx === idx && styles.dayChipActive,
                  ]}
                  onPress={() => setSelectedDayIdx(idx)}
                >
                  <Text
                    style={[
                      styles.dayChipLabel,
                      selectedDayIdx === idx && styles.dayChipLabelActive,
                    ]}
                  >
                    {DAY_LABELS[idx]}
                  </Text>
                  <Text
                    style={[
                      styles.dayChipDate,
                      selectedDayIdx === idx && styles.dayChipDateActive,
                    ]}
                  >
                    {day.date.split('-')[2]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Selected day meals */}
            {selectedDay && (
              <View style={styles.mealsSection}>
                {selectedDay.meals.map((m) => {
                  const meal = getMealById(m.mealId);
                  const slotTarget = engine?.getSlotMacros(m.slot);
                  const adjusted = meal && slotTarget
                    ? calculatePortions(slotTarget, meal.baseMacros, meal.ingredients)
                    : null;
                  const macros = adjusted?.adjustedMacros ?? meal?.baseMacros;
                  return (
                    <View key={m.slot} style={styles.mealCard}>
                      <View style={styles.mealCardTop}>
                        <Text style={styles.slotLabel}>{MEAL_SLOT_LABELS[m.slot]}</Text>
                        <Pressable
                          hitSlop={8}
                          onPress={() => setSwapModal({ date: selectedDay.date, slot: m.slot })}
                        >
                          <Text style={styles.swapText}>{t('swapMeal')}</Text>
                        </Pressable>
                      </View>
                      <Pressable onPress={() => router.push(`/meal/${m.mealId}`)}>
                        <Text style={styles.mealName}>{m.mealName}</Text>
                        {macros && (
                          <Text style={styles.mealMacros}>
                            {macros.calories} kcal {'\u00B7'} {macros.protein}g P {'\u00B7'} {macros.carbs}g G {'\u00B7'} {macros.fat}g L
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  );
                })}

                {/* Daily total */}
                {engine && (() => {
                  const dayTotal = { calories: 0, protein: 0, carbs: 0, fat: 0 };
                  for (const m of selectedDay.meals) {
                    const meal = getMealById(m.mealId);
                    const slotTarget = engine.getSlotMacros(m.slot);
                    if (meal && slotTarget) {
                      const adj = calculatePortions(slotTarget, meal.baseMacros, meal.ingredients);
                      dayTotal.calories += adj.adjustedMacros.calories;
                      dayTotal.protein += adj.adjustedMacros.protein;
                      dayTotal.carbs += adj.adjustedMacros.carbs;
                      dayTotal.fat += adj.adjustedMacros.fat;
                    }
                  }
                  return (
                    <View style={styles.dayTotalCard}>
                      <Text style={styles.dayTotalLabel}>Total du jour</Text>
                      <Text style={styles.dayTotalValue}>
                        {dayTotal.calories} kcal {'\u00B7'} {dayTotal.protein}g P {'\u00B7'} {dayTotal.carbs}g G {'\u00B7'} {dayTotal.fat}g L
                      </Text>
                      <Text style={styles.dayTotalTarget}>
                        {t('objective')} : {engine.dailyMacros.calories} kcal
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}
          </>
        ) : activeTab === 'courses' ? (
          /* -- Shopping list tab -- */
          <View style={styles.shoppingSection}>
            <Text style={styles.shoppingIntro}>
              {shoppingItems.length} ingredient{shoppingItems.length > 1 ? 's' : ''} pour la semaine
            </Text>

            {shoppingItems.map((item) => (
              <View key={item.ingredientId} style={styles.shoppingItem}>
                <Text style={styles.shoppingName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.shoppingQty}>{formatSmartQuantity(item)}</Text>
              </View>
            ))}

            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>
                {copied ? t('listCopied') : t('shareList')}
              </Text>
            </Pressable>
          </View>
        ) : activeTab === 'prep' ? (
          /* -- Meal prep tab -- */
          <View style={styles.shoppingSection}>
            <Text style={styles.prepTitle}>
              {locale === 'en' ? 'MEAL PREP GUIDE' : 'GUIDE DE MEAL PREP'}
            </Text>
            <Text style={styles.prepIntro}>
              {locale === 'en'
                ? 'Save time by batch cooking on the weekend. Here are your tips for the week:'
                : 'Gagne du temps en cuisinant en batch le week-end. Voici tes conseils pour la semaine :'}
            </Text>

            {[
              {
                titleFr: '1. PROTEINES EN BATCH',
                titleEn: '1. BATCH COOK PROTEINS',
                textFr: 'Cuis toutes tes proteines en une fois : poulet, boeuf, oeufs durs. Stocke au frigo (3-4 jours) ou congelateur.',
                textEn: 'Cook all your proteins at once: chicken, beef, hard-boiled eggs. Store in fridge (3-4 days) or freezer.',
              },
              {
                titleFr: '2. FECULENTS EN AVANCE',
                titleEn: '2. PREP STARCHES AHEAD',
                textFr: 'Riz, pates, patates douces : cuis de grosses quantites. Ca se conserve 4-5 jours au frigo.',
                textEn: 'Rice, pasta, sweet potatoes: cook large batches. They keep 4-5 days in the fridge.',
              },
              {
                titleFr: '3. LEGUMES PREPARES',
                titleEn: '3. PREP VEGETABLES',
                textFr: 'Lave et coupe tes legumes le dimanche. Stocke dans des contenants hermetiques avec un sopalin humide.',
                textEn: 'Wash and chop veggies on Sunday. Store in airtight containers with a damp paper towel.',
              },
              {
                titleFr: '4. PORTIONS INDIVIDUELLES',
                titleEn: '4. PORTION CONTAINERS',
                textFr: 'Repartis dans des boites par repas. Etiquette avec le jour et le slot. Tu n\'as plus qu\'a rechauffer.',
                textEn: 'Divide into containers per meal. Label with day and slot. Just reheat and eat.',
              },
              {
                titleFr: '5. SAUCES & ASSAISONNEMENTS',
                titleEn: '5. SAUCES & SEASONINGS',
                textFr: 'Prepare 2-3 sauces differentes pour varier les gouts sans refaire la cuisine : vinaigrette, sauce soja-miel, tahini.',
                textEn: 'Prepare 2-3 different sauces to vary flavors without cooking again: vinaigrette, soy-honey, tahini.',
              },
            ].map((tip, i) => (
              <View key={i} style={styles.prepCard}>
                <Text style={styles.prepCardTitle}>{locale === 'en' ? tip.titleEn : tip.titleFr}</Text>
                <Text style={styles.prepCardText}>{locale === 'en' ? tip.textEn : tip.textFr}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* Swap modal */}
      <Modal
        visible={swapModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSwapModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {swapModal ? MEAL_SLOT_LABELS[swapModal.slot] : ''}
              </Text>
              <Pressable onPress={() => setSwapModal(null)} hitSlop={12}>
                <Text style={styles.modalClose}>{t('close')}</Text>
              </Pressable>
            </View>
            <FlatList
              data={swapCandidates}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
              renderItem={({ item }) => {
                const slotTarget = swapModal && engine ? engine.getSlotMacros(swapModal.slot) : null;
                const adj = slotTarget
                  ? calculatePortions(slotTarget, item.baseMacros, item.ingredients)
                  : null;
                const cal = adj ? adj.adjustedMacros.calories : item.baseMacros.calories;
                return (
                  <Pressable
                    style={styles.swapItem}
                    onPress={() => handleSwap(item.id, item.name)}
                  >
                    <Text style={styles.swapItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.swapItemCal}>{cal} kcal</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
    marginBottom: spacing.lg,
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
  regenerateText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },

  // Day selector
  daySelector: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  dayChip: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayChipLabelActive: {
    color: colors.white,
  },
  dayChipDate: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  dayChipDateActive: {
    color: colors.white,
  },

  // Meals
  mealsSection: {
    gap: spacing.sm,
  },
  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  mealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swapText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealMacros: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // Empty state
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },

  // Day total
  dayTotalCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    padding: spacing.lg,
    alignItems: 'center',
  },
  dayTotalLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayTotalValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dayTotalTarget: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // Shopping list
  shoppingSection: {
    gap: 0,
  },
  shoppingIntro: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  shoppingItem: {
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
  shoppingName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  shoppingQty: {
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
    marginTop: spacing.lg,
  },
  shareBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },

  // Prep guide
  prepTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  prepIntro: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  prepCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  prepCardTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  prepCardText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '60%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  modalList: {
    paddingHorizontal: spacing.lg,
  },
  swapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  swapItemName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  swapItemCal: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
}));
