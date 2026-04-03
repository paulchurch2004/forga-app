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
import type { Objective } from '../../src/types/user';

const STEP = 3;
const TOTAL_STEPS = 7;

interface ObjectiveOption {
  value: Objective;
  label: string;
  description: string;
  icon: string;
}

interface ObjectiveOptionDef {
  value: Objective;
  labelKey: string;
  descKey: string;
  icon: string;
}

const OBJECTIVES_DEFS: ObjectiveOptionDef[] = [
  { value: 'bulk', labelKey: 'objectiveBulk', descKey: 'objectiveBulkDesc', icon: '\u{1F4AA}' },
  { value: 'cut', labelKey: 'objectiveCut', descKey: 'objectiveCutDesc', icon: '\u{1F525}' },
  { value: 'maintain', labelKey: 'objectiveMaintain', descKey: 'objectiveMaintainDesc', icon: '\u{2696}\u{FE0F}' },
  { value: 'recomp', labelKey: 'objectiveRecomp', descKey: 'objectiveRecompDesc', icon: '\u{1F504}' },
];

export default function Step3Objective() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [objective, setObjective] = useState<Objective | undefined>(
    onboardingData.objective
  );

  const canContinue = objective !== undefined;

  const handleSelect = useCallback((value: Objective) => {
    triggerHaptic('medium');
    setObjective(value);
  }, []);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({ objective });
    router.push('/(onboarding)/step4-target');
  }, [canContinue, objective, setOnboardingData, router]);

  return (
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
      >
        {/* Title */}
        <Text style={styles.title}>{t('onboardingStep3Title')}</Text>
        <Text style={styles.subtitle}>
          {t('onboardingStep3Subtitle')}
        </Text>

        {/* Objective cards */}
        <View style={styles.cardsContainer}>
          {OBJECTIVES_DEFS.map((item) => {
            const isSelected = objective === item.value;
            const label = t(item.labelKey as any);
            const desc = t(item.descKey as any);
            return (
              <Pressable
                key={item.value}
                style={[
                  styles.objectiveCard,
                  isSelected && styles.objectiveCardSelected,
                ]}
                onPress={() => handleSelect(item.value)}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${desc}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.objectiveIcon}>{item.icon}</Text>
                <View style={styles.objectiveTextContainer}>
                  <Text
                    style={[
                      styles.objectiveLabel,
                      isSelected && styles.objectiveLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text style={styles.objectiveDescription}>
                    {desc}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
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
          accessibilityLabel={t('next')}
          accessibilityState={{ disabled: !canContinue }}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
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
  objectiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  objectiveCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
  },
  objectiveIcon: {
    fontSize: 32,
  },
  objectiveTextContainer: {
    flex: 1,
  },
  objectiveLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  objectiveLabelSelected: {
    color: colors.primary,
  },
  objectiveDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
