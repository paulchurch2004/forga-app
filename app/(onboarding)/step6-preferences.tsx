import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/store/userStore';

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    const s = style === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(s);
  }).catch(() => {});
};
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import type { Budget, Restriction } from '../../src/types/user';

const STEP = 6;
const TOTAL_STEPS = 7;

interface BudgetOption {
  value: Budget;
  label: string;
  description: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    value: 'eco',
    label: 'Eco',
    description: 'Courses a petit prix',
  },
  {
    value: 'premium',
    label: 'Premium',
    description: 'Qualite avant tout',
  },
  {
    value: 'both',
    label: 'Les deux',
    description: 'On s\'adapte',
  },
];

interface RestrictionOption {
  value: Restriction;
  label: string;
}

const RESTRICTION_OPTIONS: RestrictionOption[] = [
  { value: 'vegetarian', label: 'Vegetarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Sans gluten' },
  { value: 'lactose_free', label: 'Sans lactose' },
  { value: 'halal', label: 'Halal' },
  { value: 'pork_free', label: 'Sans porc' },
];

export default function Step6Preferences() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [budget, setBudget] = useState<Budget>(onboardingData.budget ?? 'both');
  const [restrictions, setRestrictions] = useState<Restriction[]>(
    onboardingData.restrictions ?? []
  );

  // Always can continue - all fields are optional (budget defaults to 'both')
  const canContinue = true;

  const handleBudgetSelect = useCallback((value: Budget) => {
    triggerHaptic('light');
    setBudget(value);
  }, []);

  const handleRestrictionToggle = useCallback((value: Restriction) => {
    triggerHaptic('light');
    setRestrictions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((r) => r !== value);
      }
      return [...prev, value];
    });
  }, []);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    triggerHaptic('light');
    setOnboardingData({ budget, restrictions });
    router.push('/(onboarding)/step7-summary');
  }, [budget, restrictions, setOnboardingData, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel="Retour">
          <Text style={styles.backArrow}>{'\u2190'}</Text>
        </Pressable>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(STEP / TOTAL_STEPS) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {STEP}/{TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Tes preferences.</Text>
        <Text style={styles.subtitle}>
          Optionnel, mais ca aide a personnaliser tes repas.
        </Text>

        {/* Budget selection */}
        <Text style={styles.sectionLabel}>Budget courses</Text>
        <View style={styles.budgetRow}>
          {BUDGET_OPTIONS.map((option) => {
            const isSelected = budget === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.budgetCard,
                  isSelected && styles.budgetCardSelected,
                ]}
                onPress={() => handleBudgetSelect(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`${option.label}: ${option.description}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.budgetLabel,
                    isSelected && styles.budgetLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.budgetDescription}>
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Restrictions */}
        <Text style={[styles.sectionLabel, { marginTop: spacing['3xl'] }]}>
          Restrictions alimentaires
        </Text>
        <Text style={styles.restrictionHint}>
          Selectionne si besoin. Rien n'est obligatoire.
        </Text>
        <View style={styles.chipsContainer}>
          {RESTRICTION_OPTIONS.map((option) => {
            const isSelected = restrictions.includes(option.value);
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                onPress={() => handleRestrictionToggle(option.value)}
                accessibilityRole="checkbox"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isSelected }}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Suivant"
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  backArrow: {
    fontSize: 24,
    color: colors.text,
    paddingRight: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing['3xl'],
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  budgetRow: {
    gap: spacing.md,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  budgetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  budgetLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  budgetLabelSelected: {
    color: colors.primary,
  },
  budgetDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  restrictionHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.primary,
  },
  bottomBar: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
});
