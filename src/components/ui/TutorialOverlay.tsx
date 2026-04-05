import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/locales/fr';

interface TutorialStep {
  icon: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const STEPS: TutorialStep[] = [
  { icon: '\uD83C\uDFAF', titleKey: 'tutorialScoreTitle', bodyKey: 'tutorialScoreBody' },
  { icon: '\uD83C\uDF7D', titleKey: 'tutorialMealsTitle', bodyKey: 'tutorialMealsBody' },
  { icon: '\uD83D\uDCCA', titleKey: 'tutorialMacrosTitle', bodyKey: 'tutorialMacrosBody' },
  { icon: '\uD83D\uDCA7', titleKey: 'tutorialWaterTitle', bodyKey: 'tutorialWaterBody' },
  { icon: '\uD83E\uDD16', titleKey: 'tutorialCoachTitle', bodyKey: 'tutorialCoachBody' },
];

const TOTAL = STEPS.length;

interface TutorialOverlayProps {
  /** Which step to display (1-based). Pass 0 or -1 to hide. */
  step: number;
}

export function TutorialOverlay({ step }: TutorialOverlayProps) {
  const { t } = useT();
  const styles = useStyles();
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const { height } = useWindowDimensions();

  if (step <= 0 || step > TOTAL) return null;

  const current = STEPS[step - 1];
  const isLast = step === TOTAL;

  const handleNext = () => setTutorialStep(isLast ? -1 : step + 1);
  const handleSkip = () => setTutorialStep(-1);

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={[styles.overlay, { minHeight: height }]}
      pointerEvents="box-none"
    >
      <Pressable style={styles.backdrop} onPress={handleNext} />
      <Animated.View
        entering={FadeIn.duration(300).delay(100)}
        style={styles.card}
      >
        <Text style={styles.icon}>{current.icon}</Text>
        <Text style={styles.title}>{t(current.titleKey)}</Text>
        <Text style={styles.body}>{t(current.bodyKey)}</Text>

        <View style={styles.footer}>
          <Text style={styles.stepIndicator}>
            {t('tutorialStepOf', { current: step, total: TOTAL })}
          </Text>
          <View style={styles.actions}>
            {!isLast && (
              <Pressable onPress={handleSkip} hitSlop={12}>
                <Text style={styles.skipText}>{t('tutorialSkip')}</Text>
              </Pressable>
            )}
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {isLast ? t('tutorialFinish') : t('tutorialNext')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step - 1 && styles.dotActive]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    maxWidth: 360,
    width: '85%' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
  },
  stepIndicator: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  nextBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.white,
  },
  dots: {
    flexDirection: 'row' as const,
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
}));
