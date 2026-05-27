import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../src/store/userStore';
import { useTrackOnboardingStep } from '../../src/hooks/useTrackOnboardingStep';
import { useOnboardingBack } from '../../src/hooks/useOnboardingBack';
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
import type { Objective, Archetype } from '../../src/types/user';

// 3e étape du flow d'onboarding. L'archétype (Guerrier/Artisan/Explorateur)
// a été supprimé en tant qu'étape distincte car il faisait doublon avec
// l'objectif. On dérive désormais l'archétype automatiquement de
// l'objectif sélectionné pour rester compatible avec ProfileHero et
// les autres écrans qui l'affichent.
const STEP = 3;
const TOTAL_STEPS = 8;

interface ObjectiveOptionDef {
  value: Objective;
  labelKey: string;
  descKey: string;
  /** Image hero adaptée au sexe — homme par défaut, femme si l'user
   *  s'est identifié comme tel à l'étape précédente. Les visuels
   *  fitness ne sont pas neutres et l'user doit pouvoir se projeter. */
  imageMale: string;
  imageFemale: string;
  /** Archétype dérivé — alimente le store pour les écrans qui
   *  utilisent encore `archetype` (ex. ProfileHero). */
  derivedArchetype: Archetype;
}

/**
 * Images Unsplash libres de droits, sélectionnées pour matcher
 * visuellement chaque objectif × sexe. Le `cachePolicy="memory-disk"`
 * d'expo-image les met en cache après la 1ère vue → 0 réseau ensuite.
 */
const OBJECTIVES_DEFS: ObjectiveOptionDef[] = [
  {
    value: 'bulk',
    labelKey: 'objectiveBulk',
    descKey: 'objectiveBulkDesc',
    imageMale: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=80',
    imageFemale: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    derivedArchetype: 'warrior',
  },
  {
    value: 'cut',
    labelKey: 'objectiveCut',
    descKey: 'objectiveCutDesc',
    imageMale: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=1200&q=80',
    imageFemale: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=1200&q=80',
    derivedArchetype: 'warrior',
  },
  {
    value: 'recomp',
    labelKey: 'objectiveRecomp',
    descKey: 'objectiveRecompDesc',
    imageMale: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    imageFemale: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=1200&q=80',
    derivedArchetype: 'craftsman',
  },
  {
    value: 'maintain',
    labelKey: 'objectiveMaintain',
    descKey: 'objectiveMaintainDesc',
    imageMale: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1200&q=80',
    imageFemale: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1200&q=80',
    derivedArchetype: 'explorer',
  },
  {
    // Force (powerlifter) — charges lourdes + reps basses + long rest.
    // Surplus calorique modéré, cardio minimal pour éviter l'interférence
    // avec les adaptations neuro. Programmes type 5/3/1, Texas Method.
    value: 'force',
    labelKey: 'objectiveForce',
    descKey: 'objectiveForceDesc',
    imageMale: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=1200&q=80',
    imageFemale: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
    derivedArchetype: 'warrior',
  },
];

export default function Step3Objective() {
  useTrackOnboardingStep(3);
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

  // Sexe sélectionné à l'étape précédente — pilote le choix des
  // images. Si pour une raison X l'user arrive ici sans avoir
  // renseigné son sexe (deep link, restauration de session), on
  // tombe en fallback sur les visuels "male" pour éviter un rendu vide.
  const userSex = onboardingData.sex ?? 'male';

  const canContinue = objective !== undefined;

  const handleSelect = useCallback((value: Objective) => {
    triggerHaptic('medium');
    setObjective(value);
  }, []);

  const handleBack = useOnboardingBack('/(onboarding)/step2-body');

  const handleNext = useCallback(() => {
    if (!canContinue) return;
    triggerHaptic('light');
    const selectedDef = OBJECTIVES_DEFS.find((d) => d.value === objective);
    setOnboardingData({
      objective,
      // Dérive aussi l'archétype pour rester compatible avec les écrans
      // qui l'affichent (ProfileHero, badges, etc.).
      archetype: selectedDef?.derivedArchetype,
    });
    router.push('/(onboarding)/step4-target');
  }, [canContinue, objective, setOnboardingData, router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Pressable onPress={handleBack} hitSlop={12} accessibilityLabel={t('back')}>
          <Text style={styles.backArrow}>{'←'}</Text>
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

        {/* Objective cards — image en hero + titre clair + description */}
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
                {/* Image hero — sélectionnée selon le sexe de l'user
                    pour qu'il puisse se projeter dans le visuel. */}
                <View style={styles.imageWrap}>
                  <Image
                    source={{
                      uri: userSex === 'female' ? item.imageFemale : item.imageMale,
                    }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={180}
                  />
                  {/* Dégradé bas → haut pour faire ressortir le titre */}
                  <LinearGradient
                    colors={['transparent', 'rgba(7,7,13,0.85)']}
                    style={styles.gradient}
                  />
                  {/* Titre overlay sur l'image */}
                  <View style={styles.titleOverlay}>
                    <Text style={styles.objectiveLabel}>{label}</Text>
                  </View>
                  {/* Radio visuel coin haut droit */}
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
                {/* Description sous l'image */}
                <View style={styles.descBox}>
                  <Text style={styles.objectiveDescription}>{desc}</Text>
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
    gap: spacing.lg,
  },
  /** Card verticale : image hero + bloc description. Border radius
   *  global, overflow hidden pour que l'image colle aux coins arrondis. */
  objectiveCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden' as const,
  },
  objectiveCardSelected: {
    borderColor: colors.primary,
  },
  imageWrap: {
    width: '100%' as const,
    height: 160,
    position: 'relative' as const,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  gradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%' as const,
  },
  titleOverlay: {
    position: 'absolute' as const,
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
  },
  objectiveLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  descBox: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  objectiveDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  /** Radio en coin haut droit de l'image — toujours visible
   *  grâce au fond sombre semi-transparent. */
  radioOuter: {
    position: 'absolute' as const,
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
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
