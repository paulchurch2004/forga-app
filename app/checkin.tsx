import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { useUserStore } from '../src/store/userStore';
import { calculateAdaptiveAdjustment } from '../src/engine/adaptiveEngine';
import { calculateMacros } from '../src/engine/macros';
import { supabase } from '../src/services/supabase';
import { events } from '../src/services/analytics';
import type { AdaptiveInput } from '../src/types/engine';

type Rating = 1 | 2 | 3 | 4 | 5;
type SmallRating = 1 | 2 | 3 | 4;

export default function CheckInScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
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
      Alert.alert(t('error'), t('invalidWeight'));
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
      // Silent fail -- data is saved locally
    }

    events.checkInCompleted();
    setResult({ adjustment: adaptive.calorieAdjustment, reason: adaptive.reason });
    setLoading(false);
  };

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{t('checkinComplete')}</Text>
          <Text style={styles.resultReason}>{result.reason}</Text>
          {result.adjustment !== 0 && (
            <View style={styles.adjustmentCard}>
              <Text style={styles.adjustmentLabel}>{t('checkinAdjustment')}</Text>
              <Text
                style={[
                  styles.adjustmentValue,
                  { color: result.adjustment > 0 ? colors.success : colors.primary },
                ]}
              >
                {result.adjustment > 0 ? '+' : ''}{result.adjustment} {t('kcalPerDayUnit')}
              </Text>
            </View>
          )}
          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>{t('confirm')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>{t('back')}</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{t('weeklyCheckIn')}</Text>
      <Text style={styles.subtitle}>{t('checkinSubtitle')}</Text>

      {/* Weight */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('checkinWeightLabel')}</Text>
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
        <Text style={styles.fieldLabel}>{t('energy')}</Text>
        <RatingSelector
          value={energy}
          onChange={(v) => setEnergy(v as Rating)}
          max={5}
          labels={[t('poor'), t('low'), t('average'), t('good'), t('excellent')]}
        />
      </View>

      {/* Hunger */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('hunger')}</Text>
        <RatingSelector
          value={hunger}
          onChange={(v) => setHunger(v as Rating)}
          max={5}
          labels={[t('hungerNone'), t('low'), t('average'), t('hungerOften'), t('hungerAlways')]}
        />
      </View>

      {/* Performance */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('performance')}</Text>
        <RatingSelector
          value={performance}
          onChange={(v) => setPerformance(v as SmallRating)}
          max={4}
          labels={[t('perfDeclining'), t('perfStagnant'), t('perfStable'), t('perfImproving')]}
        />
      </View>

      {/* Sleep */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{t('sleep')}</Text>
        <RatingSelector
          value={sleep}
          onChange={(v) => setSleep(v as SmallRating)}
          max={4}
          labels={[t('poor'), t('average'), t('good'), t('excellent')]}
        />
      </View>

      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? t('loading') : t('send')}
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
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
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
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  field: {
    marginBottom: spacing['2xl'],
  },
  fieldLabel: {
    fontFamily: fonts.body,
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
    fontFamily: fonts.data,
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
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  ratingNumberActive: {
    color: colors.primary,
  },
  ratingLabel: {
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
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
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  resultReason: {
    fontFamily: fonts.body,
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
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  adjustmentValue: {
    fontFamily: fonts.data,
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
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
}));
