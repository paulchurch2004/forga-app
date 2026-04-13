import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, fonts, fontSizes, fontWeights, spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { supabase, isDemoMode } from '../src/services/supabase';
import { calculateTDEE } from '../src/engine/tdee';
import { calculateMacros } from '../src/engine/macros';
import { determineMealCount } from '../src/engine/mealPlanner';
import type { Sex, Objective, ActivityLevel, Budget, Restriction } from '../src/types/user';

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);

  const OBJECTIVE_OPTIONS: { value: Objective; label: string }[] = [
    { value: 'bulk', label: t('objectiveBulk') },
    { value: 'cut', label: t('objectiveCut') },
    { value: 'maintain', label: t('objectiveMaintain') },
    { value: 'recomp', label: t('objectiveRecomp') },
  ];

  const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
    { value: 'sedentary', label: t('activitySedentary') },
    { value: 'light', label: t('activityLight') },
    { value: 'moderate', label: t('activityModerate') },
    { value: 'active', label: t('activityActive') },
    { value: 'very_active', label: t('activityVeryActive') },
  ];

  const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
    { value: 'eco', label: t('budgetEco') },
    { value: 'premium', label: t('budgetPremium') },
    { value: 'both', label: t('budgetBoth') },
  ];

  const RESTRICTION_OPTIONS: { value: Restriction; label: string }[] = [
    { value: 'vegetarian', label: t('restrictionVegetarian') },
    { value: 'vegan', label: t('restrictionVegan') },
    { value: 'gluten_free', label: t('restrictionGlutenFree') },
    { value: 'lactose_free', label: t('restrictionLactoseFree') },
    { value: 'halal', label: t('restrictionHalal') },
    { value: 'pork_free', label: t('restrictionPorkFree') },
  ];

  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [age, setAge] = useState(String(profile?.age ?? 25));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? 175));
  const [currentWeight, setCurrentWeight] = useState(String(profile?.currentWeight ?? 75));
  const [targetWeight, setTargetWeight] = useState(String(profile?.targetWeight ?? 75));
  const [objective, setObjective] = useState<Objective>(profile?.objective ?? 'maintain');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel ?? 'moderate');
  const [budget, setBudget] = useState<Budget>(profile?.budget ?? 'both');
  const [restrictions, setRestrictions] = useState<Restriction[]>(profile?.restrictions ?? []);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState(new Set(['body', 'goals', 'preferences']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Real-time validation
  const ageVal = parseInt(age);
  const ageError = age.length > 0 && (isNaN(ageVal) || ageVal < 14 || ageVal > 65);
  const heightVal = parseInt(heightCm);
  const heightError = heightCm.length > 0 && (isNaN(heightVal) || heightVal < 120 || heightVal > 220);
  const weightVal = parseFloat(currentWeight);
  const weightError = currentWeight.length > 0 && (isNaN(weightVal) || weightVal < 30 || weightVal > 250);
  const targetVal = parseFloat(targetWeight);
  const targetError = targetWeight.length > 0 && (isNaN(targetVal) || targetVal < 30 || targetVal > 250);

  const computed = useMemo(() => {
    const ageNum = parseInt(age) || 25;
    const heightNum = parseInt(heightCm) || 175;
    const weightNum = parseFloat(currentWeight) || 75;

    const tdeeResult = calculateTDEE({
      sex,
      age: ageNum,
      heightCm: heightNum,
      weightKg: weightNum,
      activityLevel,
    });

    const macros = calculateMacros({
      tdee: tdeeResult.tdee,
      weightKg: weightNum,
      objective,
    });

    const mealsPerDay = determineMealCount({
      objective,
      dailyCalories: macros.calories,
    });

    return { tdee: tdeeResult.tdee, ...macros, mealsPerDay };
  }, [sex, age, heightCm, currentWeight, objective, activityLevel]);

  const toggleRestriction = (r: Restriction) => {
    setRestrictions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleSave = async () => {
    const ageNum = parseInt(age);
    const heightNum = parseInt(heightCm);
    const weightNum = parseFloat(currentWeight);
    const targetNum = parseFloat(targetWeight);

    if (!ageNum || ageNum < 14 || ageNum > 65) {
      showMessage(t('error'), 'Age entre 14 et 65 ans.');
      return;
    }
    if (!heightNum || heightNum < 120 || heightNum > 220) {
      showMessage(t('error'), 'Taille entre 120 et 220 cm.');
      return;
    }
    if (!weightNum || weightNum < 30 || weightNum > 250) {
      showMessage(t('error'), 'Poids entre 30 et 250 kg.');
      return;
    }
    if (!targetNum || targetNum < 30 || targetNum > 250) {
      showMessage(t('error'), 'Poids cible entre 30 et 250 kg.');
      return;
    }

    setSaving(true);
    try {
      const userId = user?.id ?? profile?.id;
      if (!userId) throw new Error('Utilisateur non connecte.');

      const now = new Date().toISOString();

      if (!isDemoMode) {
        const { error } = await supabase
          .from('users')
          .update({
            sex,
            age: ageNum,
            height_cm: heightNum,
            current_weight: weightNum,
            target_weight: targetNum,
            objective,
            activity_level: activityLevel,
            budget,
            restrictions,
            tdee: computed.tdee,
            daily_calories: computed.calories,
            daily_protein: computed.protein,
            daily_carbs: computed.carbs,
            daily_fat: computed.fat,
            meals_per_day: computed.mealsPerDay,
          })
          .eq('id', userId);

        if (error) throw error;
      }

      if (profile) {
        setProfile({
          ...profile,
          sex,
          age: ageNum,
          heightCm: heightNum,
          currentWeight: weightNum,
          targetWeight: targetNum,
          objective,
          activityLevel,
          budget,
          restrictions,
          tdee: computed.tdee,
          dailyCalories: computed.calories,
          dailyProtein: computed.protein,
          dailyCarbs: computed.carbs,
          dailyFat: computed.fat,
          mealsPerDay: computed.mealsPerDay,
          updatedAt: now,
        });
      }

      router.back();
    } catch (err: any) {
      showMessage(t('error'), err?.message ?? t('errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>{'\u2190'} {t('back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MORPHOLOGIE ── */}
        <Pressable onPress={() => toggleSection('body')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionBody' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('body') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('body') && (
          <>
            <Text style={styles.sectionTitle}>{t('sex')}</Text>
            <View style={styles.chipRow}>
              {(['male', 'female'] as Sex[]).map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, sex === s && styles.chipActive]}
                  onPress={() => setSex(s)}
                >
                  <Text style={[styles.chipText, sex === s && styles.chipTextActive]}>
                    {s === 'male' ? t('male') : t('female')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('age')}</Text>
            <TextInput
              style={[styles.input, ageError && styles.inputError]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor={colors.textMuted}
            />
            {ageError && <Text style={styles.validationHint}>{t('validationAgeError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('height')}</Text>
            <TextInput
              style={[styles.input, heightError && styles.inputError]}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="175"
              placeholderTextColor={colors.textMuted}
            />
            {heightError && <Text style={styles.validationHint}>{t('validationHeightError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('currentWeight')}</Text>
            <TextInput
              style={[styles.input, weightError && styles.inputError]}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="decimal-pad"
              placeholder="75"
              placeholderTextColor={colors.textMuted}
            />
            {weightError && <Text style={styles.validationHint}>{t('validationWeightError' as any)}</Text>}

            <Text style={styles.sectionTitle}>{t('targetWeight')}</Text>
            <TextInput
              style={[styles.input, targetError && styles.inputError]}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="decimal-pad"
              placeholder="70"
              placeholderTextColor={colors.textMuted}
            />
            {targetError && <Text style={styles.validationHint}>{t('validationWeightError' as any)}</Text>}
          </>
        )}

        <View style={styles.rule} />

        {/* ── OBJECTIFS ── */}
        <Pressable onPress={() => toggleSection('goals')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionGoals' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('goals') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('goals') && (
          <>
            <Text style={styles.sectionTitle}>{t('objective')}</Text>
            <View style={styles.chipRow}>
              {OBJECTIVE_OPTIONS.map((o) => (
                <Pressable
                  key={o.value}
                  style={[styles.chip, objective === o.value && styles.chipActive]}
                  onPress={() => setObjective(o.value)}
                >
                  <Text style={[styles.chipText, objective === o.value && styles.chipTextActive]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('activityLevel')}</Text>
            <View style={styles.chipRow}>
              {ACTIVITY_OPTIONS.map((a) => (
                <Pressable
                  key={a.value}
                  style={[styles.chip, activityLevel === a.value && styles.chipActive]}
                  onPress={() => setActivityLevel(a.value)}
                >
                  <Text style={[styles.chipText, activityLevel === a.value && styles.chipTextActive]}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.rule} />

        {/* ── PREFERENCES ── */}
        <Pressable onPress={() => toggleSection('preferences')} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{t('sectionPreferences' as any)}</Text>
          <Text style={styles.groupChevron}>{openSections.has('preferences') ? '\u2212' : '+'}</Text>
        </Pressable>
        {openSections.has('preferences') && (
          <>
            <Text style={styles.sectionTitle}>{t('budget')}</Text>
            <View style={styles.chipRow}>
              {BUDGET_OPTIONS.map((b) => (
                <Pressable
                  key={b.value}
                  style={[styles.chip, budget === b.value && styles.chipActive]}
                  onPress={() => setBudget(b.value)}
                >
                  <Text style={[styles.chipText, budget === b.value && styles.chipTextActive]}>
                    {b.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('dietaryRestrictions')}</Text>
            <View style={styles.chipRow}>
              {RESTRICTION_OPTIONS.map((r) => (
                <Pressable
                  key={r.value}
                  style={[styles.chip, restrictions.includes(r.value) && styles.chipActive]}
                  onPress={() => toggleRestriction(r.value)}
                >
                  <Text style={[styles.chipText, restrictions.includes(r.value) && styles.chipTextActive]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Preview macros */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>{t('yourNewPlan')}</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('caloriesLabel')}</Text>
            <Text style={styles.previewValue}>{computed.calories} kcal</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('proteinLabel')}</Text>
            <Text style={styles.previewValue}>{computed.protein}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('carbsLabel')}</Text>
            <Text style={styles.previewValue}>{computed.carbs}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('fatLabel')}</Text>
            <Text style={styles.previewValue}>{computed.fat}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>{t('mealsPerDay')}</Text>
            <Text style={styles.previewValue}>{computed.mealsPerDay}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonLoading]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  validationHint: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  groupChevron: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.white,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginTop: spacing['2xl'],
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  previewValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  bottomBar: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonLoading: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
}));
