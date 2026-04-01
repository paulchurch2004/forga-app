import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { fonts, fontSizes, fontWeights } from '../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme/spacing';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { supabase, isDemoMode } from '../src/services/supabase';
import { calculateTDEE } from '../src/engine/tdee';
import { calculateMacros } from '../src/engine/macros';
import { determineMealCount } from '../src/engine/mealPlanner';
import type { Sex, Objective, ActivityLevel, Budget, Restriction } from '../src/types/user';

const OBJECTIVE_OPTIONS: { value: Objective; label: string }[] = [
  { value: 'bulk', label: 'Prise de masse' },
  { value: 'cut', label: 'Seche' },
  { value: 'maintain', label: 'Maintien' },
  { value: 'recomp', label: 'Recomposition' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentaire' },
  { value: 'light', label: 'Leger' },
  { value: 'moderate', label: 'Modere' },
  { value: 'active', label: 'Actif' },
  { value: 'very_active', label: 'Tres actif' },
];

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: 'eco', label: 'Eco' },
  { value: 'premium', label: 'Premium' },
  { value: 'both', label: 'Les deux' },
];

const RESTRICTION_OPTIONS: { value: Restriction; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Sans gluten' },
  { value: 'lactose_free', label: 'Sans lactose' },
  { value: 'halal', label: 'Halal' },
  { value: 'pork_free', label: 'Sans porc' },
];

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);

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
      showMessage('Erreur', 'Age entre 14 et 65 ans.');
      return;
    }
    if (!heightNum || heightNum < 120 || heightNum > 220) {
      showMessage('Erreur', 'Taille entre 120 et 220 cm.');
      return;
    }
    if (!weightNum || weightNum < 30 || weightNum > 250) {
      showMessage('Erreur', 'Poids entre 30 et 250 kg.');
      return;
    }
    if (!targetNum || targetNum < 30 || targetNum > 250) {
      showMessage('Erreur', 'Poids cible entre 30 et 250 kg.');
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
      showMessage('Erreur', err?.message ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backText}>{'\u2190'} Retour</Text>
        </Pressable>
        <Text style={styles.title}>Reglages</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sexe */}
        <Text style={styles.sectionTitle}>Sexe</Text>
        <View style={styles.chipRow}>
          {(['male', 'female'] as Sex[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, sex === s && styles.chipActive]}
              onPress={() => setSex(s)}
            >
              <Text style={[styles.chipText, sex === s && styles.chipTextActive]}>
                {s === 'male' ? 'Homme' : 'Femme'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Age */}
        <Text style={styles.sectionTitle}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="25"
          placeholderTextColor={colors.textMuted}
        />

        {/* Taille */}
        <Text style={styles.sectionTitle}>Taille (cm)</Text>
        <TextInput
          style={styles.input}
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="numeric"
          placeholder="175"
          placeholderTextColor={colors.textMuted}
        />

        {/* Poids actuel */}
        <Text style={styles.sectionTitle}>Poids actuel (kg)</Text>
        <TextInput
          style={styles.input}
          value={currentWeight}
          onChangeText={setCurrentWeight}
          keyboardType="decimal-pad"
          placeholder="75"
          placeholderTextColor={colors.textMuted}
        />

        {/* Poids cible */}
        <Text style={styles.sectionTitle}>Poids cible (kg)</Text>
        <TextInput
          style={styles.input}
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="decimal-pad"
          placeholder="70"
          placeholderTextColor={colors.textMuted}
        />

        {/* Objectif */}
        <Text style={styles.sectionTitle}>Objectif</Text>
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

        {/* Activite */}
        <Text style={styles.sectionTitle}>Niveau d'activite</Text>
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

        {/* Budget */}
        <Text style={styles.sectionTitle}>Budget</Text>
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

        {/* Restrictions */}
        <Text style={styles.sectionTitle}>Restrictions alimentaires</Text>
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

        {/* Preview macros */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Ton nouveau plan</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Calories</Text>
            <Text style={styles.previewValue}>{computed.calories} kcal</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Proteines</Text>
            <Text style={styles.previewValue}>{computed.protein}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Glucides</Text>
            <Text style={styles.previewValue}>{computed.carbs}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Lipides</Text>
            <Text style={styles.previewValue}>{computed.fat}g</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Repas/jour</Text>
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
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
