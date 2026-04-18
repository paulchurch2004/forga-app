import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, MAX_CONTENT_WIDTH, shadows } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { useMealStore } from '../../src/store/mealStore';
import { useAuthStore } from '../../src/store/authStore';
import { MEAL_SLOT_LABELS, type MealSlot } from '../../src/types/meal';
import { syncMeal } from '../../src/services/userSync';
import { CelebrationOverlay } from '../../src/components/ui/CelebrationOverlay';

const SLOTS: MealSlot[] = [
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'dinner',
  'bedtime',
];

export default function CustomMealScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const params = useLocalSearchParams<{
    slot?: string;
    name?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  }>();
  const addValidatedMeal = useMealStore((s) => s.addValidatedMeal);
  const session = useAuthStore((s) => s.session);

  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationMessages = [t('celebration1'), t('celebration2'), t('celebration3'), t('celebration4'), t('celebration5')];
  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  const [selectedSlot, setSelectedSlot] = useState<MealSlot>(
    (params.slot as MealSlot) || 'lunch',
  );
  const [name, setName] = useState(params.name || '');
  const [calories, setCalories] = useState(params.calories || '');
  const [protein, setProtein] = useState(params.protein || '');
  const [carbs, setCarbs] = useState(params.carbs || '');
  const [fat, setFat] = useState(params.fat || '');

  const handleValidate = () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('customMealNameRequired'));
      return;
    }
    const cal = parseFloat(calories) || 0;
    const prot = parseFloat(protein) || 0;
    const carb = parseFloat(carbs) || 0;
    const lip = parseFloat(fat) || 0;

    if (cal === 0 && prot === 0 && carb === 0 && lip === 0) {
      Alert.alert(t('error'), t('customMealMacroRequired'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const meal = {
      id: `custom-${Date.now()}`,
      userId: session?.user?.id || 'demo-user',
      date: today,
      slot: selectedSlot,
      mealId: 'custom',
      customName: name.trim(),
      adjustedQuantities: {},
      actualMacros: {
        calories: Math.round(cal),
        protein: Math.round(prot),
        carbs: Math.round(carb),
        fat: Math.round(lip),
      },
      validatedAt: new Date().toISOString(),
    };
    addValidatedMeal(meal);
    syncMeal(meal);

    setShowCelebration(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>{'\u2190'} {t('back')}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('addCustomMeal')}</Text>
        <Text style={styles.subtitle}>
          {t('customMealSubtitle')}
        </Text>

        {/* Slot selector */}
        <Text style={styles.fieldLabel}>{t('mealSlotLabel')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.slotScroll}
          contentContainerStyle={styles.slotScrollContent}
        >
          {SLOTS.map((slot) => (
            <Pressable
              key={slot}
              style={[
                styles.slotChip,
                selectedSlot === slot && styles.slotChipActive,
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text
                style={[
                  styles.slotChipText,
                  selectedSlot === slot && styles.slotChipTextActive,
                ]}
              >
                {MEAL_SLOT_LABELS[slot]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Meal name */}
        <Text style={styles.fieldLabel}>{t('mealNameLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Kebab, Salade maison, Pizza..."
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        {/* Macros */}
        <Text style={styles.fieldLabel}>{t('macrosApprox')}</Text>
        <View style={styles.macroGrid}>
          <MacroInput
            label={t('caloriesLabel')}
            unit="kcal"
            value={calories}
            onChangeText={setCalories}
            color={colors.calories}
          />
          <MacroInput
            label={t('proteinLabel')}
            unit="g"
            value={protein}
            onChangeText={setProtein}
            color={colors.protein}
          />
          <MacroInput
            label={t('carbsLabel')}
            unit="g"
            value={carbs}
            onChangeText={setCarbs}
            color={colors.carbs}
          />
          <MacroInput
            label={t('fatLabel')}
            unit="g"
            value={fat}
            onChangeText={setFat}
            color={colors.fat}
          />
        </View>

        <Text style={styles.hint}>
          {t('macrosHint')}
        </Text>

        {/* Validate */}
        <Pressable style={styles.validateButton} onPress={handleValidate} accessibilityRole="button" accessibilityLabel={t('validateMeal')}>
          <Text style={styles.validateButtonText}>{t('validateMeal')}</Text>
        </Pressable>
      </ScrollView>
      <CelebrationOverlay
        visible={showCelebration}
        onDone={() => {
          setShowCelebration(false);
          router.back();
        }}
        message={randomMessage}
      />
    </KeyboardAvoidingView>
  );
}

function MacroInput({
  label,
  unit,
  value,
  onChangeText,
  color,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
  color: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.macroInputContainer}>
      <View style={[styles.macroColorDot, { backgroundColor: color }]} />
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroInputRow}>
        <TextInput
          style={styles.macroInput}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
        <Text style={styles.macroUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing['2xl'],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  slotScroll: {
    marginHorizontal: -spacing['2xl'],
  },
  slotScrollContent: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  slotChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  slotChipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  slotChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  macroInputContainer: {
    flexBasis: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  macroColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  macroInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  macroUnit: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  validateButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing['2xl'],
    ...shadows.button,
  },
  validateButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
}));
