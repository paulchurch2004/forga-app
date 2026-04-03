import React, { useState, useCallback } from 'react';
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

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    const s = style === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(s);
  }).catch(() => {});
};
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';

const STEP = 2;
const TOTAL_STEPS = 7;

const HEIGHT_MIN = 120;
const HEIGHT_MAX = 220;
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 250;

export default function Step2Body() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [height, setHeight] = useState<string>(
    onboardingData.heightCm ? String(onboardingData.heightCm) : ''
  );
  const [weight, setWeight] = useState<string>(
    onboardingData.currentWeight ? String(onboardingData.currentWeight) : ''
  );

  const parsedHeight = parseInt(height, 10);
  const parsedWeight = parseFloat(weight);

  const isHeightValid =
    !isNaN(parsedHeight) && parsedHeight >= HEIGHT_MIN && parsedHeight <= HEIGHT_MAX;
  const isWeightValid =
    !isNaN(parsedWeight) && parsedWeight >= WEIGHT_MIN && parsedWeight <= WEIGHT_MAX;
  const canContinue = isHeightValid && isWeightValid;

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({
      heightCm: parsedHeight,
      currentWeight: parsedWeight,
    });
    router.push('/(onboarding)/step3-objective');
  }, [canContinue, parsedHeight, parsedWeight, setOnboardingData, router]);

  const getBMICategory = (): string | null => {
    if (!isHeightValid || !isWeightValid) return null;
    const heightM = parsedHeight / 100;
    const bmi = parsedWeight / (heightM * heightM);
    if (bmi < 18.5) return t('bmiUnderweight');
    if (bmi < 25) return t('bmiNormal');
    if (bmi < 30) return t('bmiOverweight');
    return t('bmiObese');
  };

  const getBMIValue = (): string | null => {
    if (!isHeightValid || !isWeightValid) return null;
    const heightM = parsedHeight / 100;
    const bmi = parsedWeight / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const bmiCategory = getBMICategory();
  const bmiValue = getBMIValue();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel={t('back')}>
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
          <Text style={styles.title}>{t('onboardingStep2Title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboardingStep2Subtitle')}
          </Text>

          {/* Height input */}
          <Text style={styles.sectionLabel}>{t('heightLabel')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numericInput}
              value={height}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length <= 3) setHeight(cleaned);
              }}
              placeholder="175"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
              returnKeyType="next"
              accessibilityLabel={t('heightLabel')}
            />
            <Text style={styles.inputUnit}>cm</Text>
          </View>
          {height.length > 0 && !isHeightValid && (
            <Text style={styles.errorText}>
              {t('betweenRange', { min: String(HEIGHT_MIN), max: String(HEIGHT_MAX), unit: 'cm' })}
            </Text>
          )}

          {/* Weight input */}
          <Text style={[styles.sectionLabel, { marginTop: spacing['2xl'] }]}>
            {t("currentWeightLabel")}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numericInput}
              value={weight}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                // Prevent multiple dots
                const parts = cleaned.split('.');
                const sanitized =
                  parts.length > 2
                    ? parts[0] + '.' + parts.slice(1).join('')
                    : cleaned;
                // Max 1 decimal
                if (parts.length === 2 && parts[1].length > 1) return;
                if (sanitized.length <= 5) setWeight(sanitized);
              }}
              placeholder="75"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={5}
              returnKeyType="done"
              accessibilityLabel={t('currentWeightLabel')}
            />
            <Text style={styles.inputUnit}>kg</Text>
          </View>
          {weight.length > 0 && !isWeightValid && (
            <Text style={styles.errorText}>
              {t('betweenRange', { min: String(WEIGHT_MIN), max: String(WEIGHT_MAX), unit: 'kg' })}
            </Text>
          )}

          {/* BMI feedback */}
          {bmiValue && bmiCategory && (
            <View style={styles.bmiCard}>
              <View style={styles.bmiRow}>
                <Text style={styles.bmiLabel}>{t('bmiLabel')}</Text>
                <Text style={styles.bmiValue}>{bmiValue}</Text>
              </View>
              <Text style={styles.bmiCategory}>{bmiCategory}</Text>
              <Text style={styles.bmiDisclaimer}>
                {t('bmiDisclaimer')}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom button */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityLabel={t('next')}
            accessibilityState={{ disabled: !canContinue }}
          >
            <Text style={styles.nextButtonText}>{t('next')}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
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
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },
  bmiCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing['2xl'],
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bmiLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  bmiValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  bmiCategory: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bmiDisclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: fontSizes.xs * 1.4,
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
}));
