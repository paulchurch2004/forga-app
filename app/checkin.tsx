import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';
import { fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';
import { useUserStore } from '../src/store/userStore';
import { calculateAdaptiveAdjustment } from '../src/engine/adaptiveEngine';
import { calculateMacros } from '../src/engine/macros';
import { supabase } from '../src/services/supabase';
import { events } from '../src/services/analytics';
import type { AdaptiveInput } from '../src/types/engine';

type Rating = 1 | 2 | 3 | 4 | 5;
type SmallRating = 1 | 2 | 3 | 4;

export default function CheckInScreen() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const addCheckIn = useUserStore((s) => s.addCheckIn);
  const addWeightEntry = useUserStore((s) => s.addWeightEntry);

  const [weight, setWeight] = useState(profile?.currentWeight?.toString() ?? '');
  const [energy, setEnergy] = useState<Rating>(3);
  const [hunger, setHunger] = useState<Rating>(3);
  const [performance, setPerformance] = useState<SmallRating>(3);
  const [sleep, setSleep] = useState<SmallRating>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ adjustment: number; reason: string } | null>(null);

  if (!profile) return null;

  const handleSubmit = async () => {
    const weightNum = parseFloat(weight.replace(',', '.'));
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      Alert.alert('Erreur', 'Entre un poids valide.');
      return;
    }

    setLoading(true);

    // Calculate weight trend (simplified)
    const weightLog = useUserStore.getState().weightLog;
    let weightTrend = 0;
    if (weightLog.length > 0) {
      const lastWeight = weightLog[weightLog.length - 1].weight;
      weightTrend = weightNum - lastWeight; // Simplified weekly trend
    }

    // Adaptive adjustment
    const adaptiveInput: AdaptiveInput = {
      currentCalories: profile.dailyCalories,
      objective: profile.objective,
      weightTrendPerWeek: weightTrend,
      energy,
      hunger,
      performance,
      sleep,
    };

    const adaptive = calculateAdaptiveAdjustment(adaptiveInput);

    // Save check-in
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const checkIn = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      userId: profile.id,
      weekStart: weekStartStr,
      weight: weightNum,
      energy,
      hunger,
      performance,
      sleep,
      calorieAdjustment: adaptive.calorieAdjustment,
      adjustmentReason: adaptive.reason,
      createdAt: new Date().toISOString(),
    };

    addCheckIn(checkIn);
    addWeightEntry({
      id: crypto.randomUUID?.() ?? `${Date.now()}-w`,
      userId: profile.id,
      date: today,
      weight: weightNum,
      createdAt: new Date().toISOString(),
    });

    // Update profile with new calories if adjusted
    if (adaptive.calorieAdjustment !== 0) {
      const newMacros = calculateMacros({
        tdee: profile.tdee + adaptive.calorieAdjustment,
        weightKg: weightNum,
        objective: profile.objective,
      });

      updateProfile({
        currentWeight: weightNum,
        dailyCalories: newMacros.calories,
        dailyProtein: newMacros.protein,
        dailyCarbs: newMacros.carbs,
        dailyFat: newMacros.fat,
      });
    } else {
      updateProfile({ currentWeight: weightNum });
    }

    // Save to Supabase
    try {
      await supabase.from('weekly_checkins').upsert({
        user_id: profile.id,
        week_start: weekStartStr,
        weight: weightNum,
        energy,
        hunger,
        performance,
        sleep,
        calorie_adjustment: adaptive.calorieAdjustment,
        adjustment_reason: adaptive.reason,
      });
      await supabase.from('weight_log').upsert({
        user_id: profile.id,
        date: today,
        weight: weightNum,
      });
    } catch (e) {
      // Silent fail — data is saved locally
    }

    events.checkInCompleted();
    setResult({ adjustment: adaptive.calorieAdjustment, reason: adaptive.reason });
    setLoading(false);
  };

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Check-in terminé</Text>
          <Text style={styles.resultReason}>{result.reason}</Text>
          {result.adjustment !== 0 && (
            <View style={styles.adjustmentCard}>
              <Text style={styles.adjustmentLabel}>Ajustement</Text>
              <Text
                style={[
                  styles.adjustmentValue,
                  { color: result.adjustment > 0 ? colors.success : colors.primary },
                ]}
              >
                {result.adjustment > 0 ? '+' : ''}{result.adjustment} kcal/jour
              </Text>
            </View>
          )}
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Continuer</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Check-in hebdo</Text>
      <Text style={styles.subtitle}>30 secondes. C'est parti.</Text>

      {/* Weight */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Ton poids cette semaine</Text>
        <TextInput
          style={styles.weightInput}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="kg"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Energy */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Niveau d'énergie</Text>
        <RatingSelector
          value={energy}
          onChange={(v) => setEnergy(v as Rating)}
          max={5}
          labels={['Epuisé', 'Faible', 'Normal', 'Bien', 'Top']}
        />
      </View>

      {/* Hunger */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Niveau de faim</Text>
        <RatingSelector
          value={hunger}
          onChange={(v) => setHunger(v as Rating)}
          max={5}
          labels={['Aucune', 'Léger', 'Normal', 'Souvent', 'Tout le temps']}
        />
      </View>

      {/* Performance */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Performances en salle</Text>
        <RatingSelector
          value={performance}
          onChange={(v) => setPerformance(v as SmallRating)}
          max={4}
          labels={['En baisse', 'Stagnation', 'Stable', 'En hausse']}
        />
      </View>

      {/* Sleep */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Qualité du sommeil</Text>
        <RatingSelector
          value={sleep}
          onChange={(v) => setSleep(v as SmallRating)}
          max={4}
          labels={['Mauvais', 'Moyen', 'Bon', 'Excellent']}
        />
      </View>

      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? 'Analyse en cours...' : 'Valider le check-in'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function RatingSelector({
  value,
  onChange,
  max,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  labels: string[];
}) {
  return (
    <View style={styles.ratingRow}>
      {Array.from({ length: max }, (_, i) => i + 1).map((v) => (
        <Pressable
          key={v}
          style={[
            styles.ratingButton,
            value === v && styles.ratingButtonActive,
          ]}
          onPress={() => onChange(v)}
        >
          <Text
            style={[
              styles.ratingNumber,
              value === v && styles.ratingNumberActive,
            ]}
          >
            {v}
          </Text>
          <Text
            style={[
              styles.ratingLabel,
              value === v && styles.ratingLabelActive,
            ]}
          >
            {labels[v - 1]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  header: {
    paddingTop: 60,
    marginBottom: spacing.lg,
  },
  backText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  field: {
    marginBottom: spacing['2xl'],
  },
  fieldLabel: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  weightInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes['2xl'],
    color: colors.text,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  ratingButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHover,
  },
  ratingNumber: {
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  ratingNumberActive: {
    color: colors.primary,
  },
  ratingLabel: {
    fontFamily: 'DMSans',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  ratingLabelActive: {
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  resultTitle: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  resultReason: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 26,
  },
  adjustmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    width: '100%',
  },
  adjustmentLabel: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  adjustmentValue: {
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['4xl'],
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
});
