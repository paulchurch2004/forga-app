import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../src/hooks/useResponsive';
import { useAuthStore } from '../src/store/authStore';
import { useUserStore } from '../src/store/userStore';
import { calculateTDEE } from '../src/engine/tdee';
import { calculateMacros } from '../src/engine/macros';
import { determineMealCount } from '../src/engine/mealPlanner';
import { CALORIE_ADJUSTMENTS } from '../src/engine/constants';
import { supabase, isDemoMode } from '../src/services/supabase';
import { makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { fonts, fontSizes, fontWeights } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';
import type { Sex, Objective, ActivityLevel } from '../src/types/user';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics')
    .then((H) => H.impactAsync(H.ImpactFeedbackStyle.Light))
    .catch(() => {});
};

const ACTIVITY_OPTIONS: { key: ActivityLevel; label: string; desc: string }[] = [
  { key: 'sedentary', label: 'activitySedentary', desc: 'activitySedentaryDesc' },
  { key: 'light', label: 'activityLight', desc: 'activityLightDesc' },
  { key: 'moderate', label: 'activityModerate', desc: 'activityModerateDesc' },
  { key: 'active', label: 'activityActive', desc: 'activityActiveDesc' },
  { key: 'very_active', label: 'activityVeryActive', desc: 'activityVeryActiveDesc' },
];

const OBJECTIVE_OPTIONS: { key: Objective; label: string; desc: string; adj: string }[] = [
  { key: 'bulk', label: 'objectiveBulk', desc: 'objectiveBulkDesc', adj: '+300 kcal' },
  { key: 'cut', label: 'objectiveCut', desc: 'objectiveCutDesc', adj: '-400 kcal' },
  { key: 'maintain', label: 'objectiveMaintain', desc: 'objectiveMaintainDesc', adj: '±0 kcal' },
  { key: 'recomp', label: 'objectiveRecomp', desc: 'objectiveRecompDesc', adj: '-100 kcal' },
];

export default function TDEECalculator() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const { contentMaxWidth } = useResponsive();
  const session = useAuthStore((s) => s.session);
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);

  // Form state — pre-fill from profile if logged in
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [ageStr, setAgeStr] = useState(profile?.age?.toString() ?? '');
  const [heightStr, setHeightStr] = useState(profile?.heightCm?.toString() ?? '');
  const [weightStr, setWeightStr] = useState(profile?.currentWeight?.toString() ?? '');
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [objective, setObjective] = useState<Objective>(profile?.objective ?? 'maintain');
  const [applied, setApplied] = useState(false);

  const age = parseInt(ageStr, 10);
  const heightCm = parseInt(heightStr, 10);
  const weightKg = parseFloat(weightStr);

  const isFormValid =
    !isNaN(age) && age >= 14 && age <= 65 &&
    !isNaN(heightCm) && heightCm >= 120 && heightCm <= 220 &&
    !isNaN(weightKg) && weightKg >= 30 && weightKg <= 250;

  // Calculate results
  const results = useMemo(() => {
    if (!isFormValid) return null;

    const tdeeResult = calculateTDEE({ sex, age, heightCm, weightKg, activityLevel: activity });
    const macros = calculateMacros({ tdee: tdeeResult.tdee, weightKg, objective });
    const mealsPerDay = determineMealCount({ objective, dailyCalories: macros.calories });
    const adjustment = CALORIE_ADJUSTMENTS[objective];

    return {
      bmr: tdeeResult.bmr,
      tdee: tdeeResult.tdee,
      adjustment,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      mealsPerDay,
    };
  }, [isFormValid, sex, age, heightCm, weightKg, activity, objective]);

  // Apply to profile (logged-in users)
  const handleApply = useCallback(async () => {
    if (!results || !session?.user?.id) return;
    triggerHaptic();

    const updates = {
      sex,
      age,
      heightCm,
      currentWeight: weightKg,
      activityLevel: activity,
      objective,
      tdee: results.tdee,
      dailyCalories: results.calories,
      dailyProtein: results.protein,
      dailyCarbs: results.carbs,
      dailyFat: results.fat,
      mealsPerDay: results.mealsPerDay,
      updatedAt: new Date().toISOString(),
    };

    // Update local store
    updateProfile(updates);

    // Sync to Supabase
    if (!isDemoMode) {
      try {
        await supabase.from('users').update({
          sex,
          age,
          height_cm: heightCm,
          current_weight: weightKg,
          activity_level: activity,
          objective,
          tdee: results.tdee,
          daily_calories: results.calories,
          daily_protein: results.protein,
          daily_carbs: results.carbs,
          daily_fat: results.fat,
          meals_per_day: results.mealsPerDay,
        }).eq('id', session.user.id);
      } catch {
        // Silent — local store already updated
      }
    }

    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  }, [results, session, sex, age, heightCm, weightKg, activity, objective, updateProfile]);

  const handleCTA = useCallback(() => {
    triggerHaptic();
    if (session) {
      handleApply();
    } else {
      router.push('/(auth)/register');
    }
  }, [session, handleApply]);

  // Macro bar widths
  const maxMacroG = results ? Math.max(results.protein, results.carbs, results.fat, 1) : 1;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>{'←'} {t("back")}</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <Text style={styles.h1}>{t("tdeeCalculator")}</Text>
        <Text style={styles.subtitle}>
          {t("tdeeSubtitle")}
        </Text>

        {/* ──── FORM ──── */}

        {/* Sex */}
        <Text style={styles.label}>{t("sex")}</Text>
        <View style={styles.rowTwo}>
          {(['male', 'female'] as Sex[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.choiceCard, sex === s && styles.choiceCardActive]}
              onPress={() => { triggerHaptic(); setSex(s); }}
            >
              <Text style={[styles.choiceLabel, sex === s && styles.choiceLabelActive]}>
                {s === 'male' ? t('male') : t('female')}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Age, Height, Weight */}
        <View style={styles.rowThree}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("age")}</Text>
            <TextInput
              style={styles.textInput}
              value={ageStr}
              onChangeText={setAgeStr}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="25"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("height")}</Text>
            <TextInput
              style={styles.textInput}
              value={heightStr}
              onChangeText={setHeightStr}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="175"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("currentWeight")}</Text>
            <TextInput
              style={styles.textInput}
              value={weightStr}
              onChangeText={setWeightStr}
              keyboardType="decimal-pad"
              maxLength={5}
              placeholder="75"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Activity */}
        <Text style={styles.label}>{t("activityLevel")}</Text>
        <View style={styles.optionList}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.optionCard, activity === opt.key && styles.optionCardActive]}
              onPress={() => { triggerHaptic(); setActivity(opt.key); }}
            >
              <Text style={[styles.optionLabel, activity === opt.key && styles.optionLabelActive]}>
                {t(opt.label as any)}
              </Text>
              <Text style={styles.optionDesc}>{t(opt.desc as any)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Objective */}
        <Text style={styles.label}>{t("objective")}</Text>
        <View style={styles.optionList}>
          {OBJECTIVE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[styles.optionCard, objective === opt.key && styles.optionCardActive]}
              onPress={() => { triggerHaptic(); setObjective(opt.key); }}
            >
              <View style={styles.optionRow}>
                <View style={styles.optionTextCol}>
                  <Text style={[styles.optionLabel, objective === opt.key && styles.optionLabelActive]}>
                    {t(opt.label as any)}
                  </Text>
                  <Text style={styles.optionDesc}>{t(opt.desc as any)}</Text>
                </View>
                <Text style={[styles.adjBadge, objective === opt.key && styles.adjBadgeActive]}>
                  {opt.adj}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ──── RESULTS ──── */}
        {results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>{t("yourResults")}</Text>

            {/* BMR & TDEE */}
            <View style={styles.resultRow}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t("bmrLabel")}</Text>
                <Text style={styles.resultValue}>{results.bmr}</Text>
                <Text style={styles.resultUnit}>{t("kcalPerDay")}</Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>{t("tdeeLabel")}</Text>
                <Text style={styles.resultValue}>{results.tdee}</Text>
                <Text style={styles.resultUnit}>{t("kcalPerDay")}</Text>
              </View>
            </View>

            {/* Adjusted Calories */}
            <View style={styles.caloriesCard}>
              <Text style={styles.caloriesTitle}>{t("dailyCalories")}</Text>
              <Text style={styles.caloriesValue}>{results.calories}</Text>
              <Text style={styles.caloriesUnit}>{t("kcalPerDay")}</Text>
              {results.adjustment !== 0 && (
                <Text style={styles.adjustmentNote}>
                  TDEE {results.adjustment > 0 ? '+' : ''}{results.adjustment} kcal ({
                    results.adjustment > 0 ? t('surplus') : t('deficit')
                  })
                </Text>
              )}
            </View>

            {/* Macros */}
            <View style={styles.macrosCard}>
              <Text style={styles.macrosTitle}>{t("macroDistribution")}</Text>

              {/* Protein */}
              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
                  <Text style={styles.macroName}>{t("proteinLabel")}</Text>
                </View>
                <Text style={styles.macroGrams}>{results.protein}g</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(results.protein / maxMacroG) * 100}%`, backgroundColor: colors.protein },
                  ]}
                />
              </View>

              {/* Carbs */}
              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
                  <Text style={styles.macroName}>{t("carbsLabel")}</Text>
                </View>
                <Text style={styles.macroGrams}>{results.carbs}g</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(results.carbs / maxMacroG) * 100}%`, backgroundColor: colors.carbs },
                  ]}
                />
              </View>

              {/* Fat */}
              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
                  <Text style={styles.macroName}>{t("fatLabel")}</Text>
                </View>
                <Text style={styles.macroGrams}>{results.fat}g</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(results.fat / maxMacroG) * 100}%`, backgroundColor: colors.fat },
                  ]}
                />
              </View>
            </View>

            {/* Meals per day */}
            <View style={styles.mealsCard}>
              <Text style={styles.mealsLabel}>{t("recommendedMealsPerDay")}</Text>
              <Text style={styles.mealsValue}>{results.mealsPerDay}</Text>
            </View>

            {/* CTA */}
            <Pressable
              style={[styles.ctaBtn, applied && styles.ctaBtnApplied]}
              onPress={handleCTA}
            >
              <Text style={styles.ctaBtnText}>
                {applied
                  ? t('profileUpdated')
                  : session
                    ? t('applyToProfile')
                    : t('createNutritionPlan')}
              </Text>
            </Pressable>

            {!session && (
              <Text style={styles.ctaHint}>
                {t("signUpFreeHint")}
              </Text>
            )}
          </View>
        )}

        {/* ──── SEO CONTENT ──── */}
        <View style={styles.seoSection}>
          <Text style={styles.seoTitle}>{t("howItWorks")}</Text>
          <Text style={styles.seoText}>
            {t("tdeeSeoText1")}
          </Text>
          <Text style={styles.seoText}>
            {t("tdeeSeoText2")}
          </Text>
          <Text style={styles.seoText}>
            {t("tdeeSeoText3")}
          </Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {t("onboardingDisclaimer")}
        </Text>

        <View style={{ height: insets.bottom + spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: fontSizes.md * 1.5,
    marginBottom: spacing['2xl'],
  },

  // ── Form ──
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold as any,
    color: colors.textSecondary,
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowThree: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  inputGroup: {
    flex: 1,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  choiceCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  choiceLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textSecondary,
  },
  choiceLabelActive: {
    color: colors.primary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.text,
    textAlign: 'center',
  },
  optionList: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.textSecondary,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  adjBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  adjBadgeActive: {
    color: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },

  // ── Results ──
  resultsSection: {
    marginTop: spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing['2xl'],
  },
  resultsTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase' as any,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  resultValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.extrabold as any,
    color: colors.text,
  },
  resultUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },

  // Calories card
  caloriesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  caloriesTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase' as any,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  caloriesValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.extrabold as any,
    color: colors.primary,
  },
  caloriesUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  adjustmentNote: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },

  // Macros card
  macrosCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  macrosTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  macroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  macroGrams: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.text,
  },
  barBg: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Meals card
  mealsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealsLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    flex: 1,
  },
  mealsValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text,
  },

  // CTA
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnApplied: {
    backgroundColor: colors.success,
  },
  ctaBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.white,
  },
  ctaHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // SEO
  seoSection: {
    marginTop: spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing['2xl'],
  },
  seoTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  seoText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: fontSizes.md * 1.6,
    marginBottom: spacing.lg,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: fontSizes.xs * 1.6,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
}));
