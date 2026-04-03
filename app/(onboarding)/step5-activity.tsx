import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
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
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
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
  { value: 'sedentary', label: 'activitySedentary', description: 'activitySedentaryDesc', multiplier: 'x1.2' },
  { value: 'light', label: 'activityLight', description: 'activityLightDesc', multiplier: 'x1.375' },
  { value: 'moderate', label: 'activityModerate', description: 'activityModerateDesc', multiplier: 'x1.55' },
  { value: 'active', label: 'activityActive', description: 'activityActiveDesc', multiplier: 'x1.725' },
  { value: 'very_active', label: 'activityVeryActive', description: 'activityVeryActiveDesc', multiplier: 'x1.9' },
];

export default function Step5Activity() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
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
        <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel={t("back")}>
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
        <Text style={styles.title}>{t("onboardingStep5Title")}</Text>
        <Text style={styles.subtitle}>
          {t("onboardingStep5Subtitle")}
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
                accessibilityLabel={`${t(item.label as any)}: ${t(item.description as any)}`}
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
                    {t(item.label as any)}
                  </Text>
                  <Text style={styles.activityDescription}>
                    {t(item.description as any)}
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
          accessibilityLabel={t("next")}
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.nextButtonText}>{t("next")}</Text>
        </Pressable>
      </View>
    </View>
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
}));
