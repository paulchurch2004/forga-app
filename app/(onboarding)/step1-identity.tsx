import React, { useState } from 'react';
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
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import type { Sex } from '../../src/types/user';

const STEP = 1;
const TOTAL_STEPS = 7;

export default function Step1Identity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [sex, setSex] = useState<Sex | undefined>(onboardingData.sex);
  const [age, setAge] = useState<string>(
    onboardingData.age ? String(onboardingData.age) : ''
  );

  const parsedAge = parseInt(age, 10);
  const isAgeValid = !isNaN(parsedAge) && parsedAge >= 14 && parsedAge <= 65;
  const canContinue = sex !== undefined && isAgeValid;

  const handleSexSelect = (value: Sex) => {
    triggerHaptic('medium');
    setSex(value);
  };

  const handleNext = () => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({ sex, age: parsedAge });
    router.push('/(onboarding)/step2-body');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
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
          <Text style={styles.title}>On commence.</Text>
          <Text style={styles.subtitle}>Pas de blabla. Dis-nous qui tu es.</Text>

          {/* Sex selection */}
          <Text style={styles.sectionLabel}>Ton sexe</Text>
          <View style={styles.sexRow}>
            <Pressable
              style={[
                styles.sexCard,
                sex === 'male' && styles.sexCardSelected,
              ]}
              onPress={() => handleSexSelect('male')}
              accessibilityRole="button"
              accessibilityLabel="Homme"
              accessibilityState={{ selected: sex === 'male' }}
            >
              <Text style={styles.sexEmoji}>{'\u{1F4AA}'}</Text>
              <Text
                style={[
                  styles.sexLabel,
                  sex === 'male' && styles.sexLabelSelected,
                ]}
              >
                Homme
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.sexCard,
                sex === 'female' && styles.sexCardSelected,
              ]}
              onPress={() => handleSexSelect('female')}
              accessibilityRole="button"
              accessibilityLabel="Femme"
              accessibilityState={{ selected: sex === 'female' }}
            >
              <Text style={styles.sexEmoji}>{'\u{1F4AA}'}</Text>
              <Text
                style={[
                  styles.sexLabel,
                  sex === 'female' && styles.sexLabelSelected,
                ]}
              >
                Femme
              </Text>
            </Pressable>
          </View>

          {/* Age input */}
          <Text style={styles.sectionLabel}>Ton age</Text>
          <View style={styles.ageInputContainer}>
            <TextInput
              style={styles.ageInput}
              value={age}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length <= 2) setAge(cleaned);
              }}
              placeholder="25"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="done"
              accessibilityLabel="Age"
            />
            <Text style={styles.ageUnit}>ans</Text>
          </View>
          {age.length > 0 && !isAgeValid && (
            <Text style={styles.errorText}>
              L'age doit etre entre 14 et 65 ans.
            </Text>
          )}
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
            <Text style={[styles.nextButtonText, !canContinue && styles.nextButtonTextDisabled]}>
              Suivant
            </Text>
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
  sexRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing['3xl'],
  },
  sexCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  sexCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  sexEmoji: {
    fontSize: 48,
  },
  sexLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  sexLabelSelected: {
    color: colors.primary,
  },
  ageInputContainer: {
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
  ageInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
    height: '100%',
  },
  ageUnit: {
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
  nextButtonTextDisabled: {
    color: colors.white,
  },
});
