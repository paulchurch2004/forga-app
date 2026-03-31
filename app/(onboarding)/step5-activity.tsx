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
import type { ActivityLevel } from '../../src/types/user';

const STEP = 5;
const TOTAL_STEPS = 7;

interface ActivityOption {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentaire',
    description: 'Bureau, peu de sport',
    multiplier: 'x1.2',
  },
  {
    value: 'light',
    label: 'Leger',
    description: 'Sport 1-3x/semaine',
    multiplier: 'x1.375',
  },
  {
    value: 'moderate',
    label: 'Modere',
    description: 'Sport 3-5x/semaine',
    multiplier: 'x1.55',
  },
  {
    value: 'active',
    label: 'Actif',
    description: 'Sport 6-7x/semaine',
    multiplier: 'x1.725',
  },
  {
    value: 'very_active',
    label: 'Tres actif',
    description: 'Sport intense + travail physique',
    multiplier: 'x1.9',
  },
];

export default function Step5Activity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(
    onboardingData.activityLevel
  );

  const canContinue = activityLevel !== undefined;

  const handleSelect = useCallback((value: ActivityLevel) => {
    triggerHaptic('medium');
    setActivityLevel(value);
  }, []);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({ activityLevel });
    router.push('/(onboarding)/step6-preferences');
  }, [canContinue, activityLevel, setOnboardingData, router]);

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
        <Text style={styles.title}>Ton niveau d'activite.</Text>
        <Text style={styles.subtitle}>
          Sois honnete. On calcule tes calories la-dessus.
        </Text>

        {/* Activity cards */}
        <View style={styles.cardsContainer}>
          {ACTIVITY_OPTIONS.map((item, index) => {
            const isSelected = activityLevel === item.value;
            return (
              <Pressable
                key={item.value}
                style={[
                  styles.activityCard,
                  isSelected && styles.activityCardSelected,
                ]}
                onPress={() => handleSelect(item.value)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}: ${item.description}`}
                accessibilityState={{ selected: isSelected }}
              >
                {/* Level indicator */}
                <View style={styles.levelIndicator}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.levelDot,
                        i <= index && styles.levelDotFilled,
                        isSelected && i <= index && styles.levelDotSelected,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.activityTextContainer}>
                  <Text
                    style={[
                      styles.activityLabel,
                      isSelected && styles.activityLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.activityDescription}>
                    {item.description}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.multiplierText,
                    isSelected && styles.multiplierTextSelected,
                  ]}
                >
                  {item.multiplier}
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
  cardsContainer: {
    gap: spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  activityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  levelIndicator: {
    flexDirection: 'column',
    gap: 3,
    alignItems: 'center',
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  levelDotFilled: {
    backgroundColor: colors.textSecondary,
  },
  levelDotSelected: {
    backgroundColor: colors.primary,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  activityLabelSelected: {
    color: colors.primary,
  },
  activityDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  multiplierText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  multiplierTextSelected: {
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
