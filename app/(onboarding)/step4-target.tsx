import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/store/userStore';
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    const s = style === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(s);
  }).catch(() => {});
};

const STEP = 4;
const TOTAL_STEPS = 7;

type Timeline = '3' | '6' | '12';

const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: '3', label: '3 mois' },
  { value: '6', label: '6 mois' },
  { value: '12', label: '12 mois' },
];

function getDeadlineDate(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

export default function Step4Target() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const currentWeight = onboardingData.currentWeight ?? 75;
  const objective = onboardingData.objective;

  // Determine default target based on objective
  const defaultTarget = useMemo(() => {
    if (onboardingData.targetWeight) return String(onboardingData.targetWeight);
    switch (objective) {
      case 'bulk':
        return String(Math.round(currentWeight + 5));
      case 'cut':
        return String(Math.round(currentWeight - 5));
      case 'maintain':
        return String(currentWeight);
      case 'recomp':
        return String(currentWeight);
      default:
        return '';
    }
  }, [objective, currentWeight, onboardingData.targetWeight]);

  const [targetWeight, setTargetWeight] = useState<string>(defaultTarget);
  const [timeline, setTimeline] = useState<Timeline>(() => {
    if (onboardingData.targetDeadline) {
      const deadline = new Date(onboardingData.targetDeadline);
      const now = new Date();
      const diffMonths =
        (deadline.getFullYear() - now.getFullYear()) * 12 +
        (deadline.getMonth() - now.getMonth());
      if (diffMonths <= 4) return '3';
      if (diffMonths <= 8) return '6';
      return '12';
    }
    return '6';
  });

  const parsedTarget = parseFloat(targetWeight);
  const isTargetValid =
    !isNaN(parsedTarget) && parsedTarget >= 30 && parsedTarget <= 250;
  const canContinue = isTargetValid;

  const delta = isTargetValid ? parsedTarget - currentWeight : 0;
  const deltaAbs = Math.abs(delta);
  const weeklyRate = isTargetValid
    ? (deltaAbs / (parseInt(timeline, 10) * 4.33)).toFixed(2)
    : '0';

  const getDeltaLabel = (): string => {
    if (!isTargetValid) return '';
    if (delta > 0) return `+${delta.toFixed(1)} kg a prendre`;
    if (delta < 0) return `${delta.toFixed(1)} kg a perdre`;
    return 'Maintien du poids';
  };

  const getDeltaColor = (): string => {
    if (delta > 0) return colors.success;
    if (delta < 0) return colors.primary;
    return colors.textSecondary;
  };

  const isRateHealthy = (): boolean => {
    const rate = parseFloat(weeklyRate);
    // Healthy rate: lose/gain max ~0.7-1kg/week
    return rate <= 1.0;
  };

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({
      targetWeight: parsedTarget,
      targetDeadline: getDeadlineDate(parseInt(timeline, 10)),
    });
    router.push('/(onboarding)/step5-activity');
  }, [canContinue, parsedTarget, timeline, setOnboardingData, router]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={styles.title}>Ton objectif chiffre.</Text>
          <Text style={styles.subtitle}>
            Ou tu veux aller, et en combien de temps.
          </Text>

          {/* Current weight reminder */}
          <View style={styles.currentWeightRow}>
            <Text style={styles.currentWeightLabel}>Poids actuel</Text>
            <Text style={styles.currentWeightValue}>{currentWeight} kg</Text>
          </View>

          {/* Target weight input */}
          <Text style={styles.sectionLabel}>Poids cible</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numericInput}
              value={targetWeight}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const sanitized =
                  parts.length > 2
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : cleaned;
                if (parts.length === 2 && parts[1].length > 1) return;
                if (sanitized.length <= 5) setTargetWeight(sanitized);
              }}
              placeholder="70"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={5}
              returnKeyType="done"
              accessibilityLabel="Poids cible en kilogrammes"
            />
            <Text style={styles.inputUnit}>kg</Text>
          </View>

          {/* Delta display */}
          {isTargetValid && (
            <View style={styles.deltaCard}>
              <Text style={[styles.deltaText, { color: getDeltaColor() }]}>
                {getDeltaLabel()}
              </Text>
              {delta !== 0 && (
                <Text
                  style={[
                    styles.rateText,
                    !isRateHealthy() && styles.rateWarning,
                  ]}
                >
                  ~{weeklyRate} kg/semaine
                </Text>
              )}
              {!isRateHealthy() && delta !== 0 && (
                <Text style={styles.rateWarningText}>
                  Ce rythme est ambitieux. On te recommande d'allonger le delai.
                </Text>
              )}
            </View>
          )}

          {/* Timeline selector */}
          <Text style={[styles.sectionLabel, { marginTop: spacing['2xl'] }]}>
            Delai
          </Text>
          <View style={styles.timelineRow}>
            {TIMELINE_OPTIONS.map((option) => {
              const isSelected = timeline === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.timelineChip,
                    isSelected && styles.timelineChipSelected,
                  ]}
                  onPress={() => {
                    triggerHaptic('light');
                    setTimeline(option.value);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.timelineChipText,
                      isSelected && styles.timelineChipTextSelected,
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
    </KeyboardAvoidingView>
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
  currentWeightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  currentWeightLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  currentWeightValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    height: 64,
    gap: spacing.md,
  },
  numericInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
    height: '100%',
  },
  inputUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  deltaCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  deltaText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  rateText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  rateWarning: {
    color: colors.warning,
  },
  rateWarningText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineChipSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  timelineChipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  timelineChipTextSelected: {
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
