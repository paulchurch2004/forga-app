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
import { useTrackOnboardingStep } from '../../src/hooks/useTrackOnboardingStep';
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
import type { Sex, MenopauseStatus } from '../../src/types/user';

const STEP = 1;
const TOTAL_STEPS = 8;

export default function Step1Identity() {
  useTrackOnboardingStep(1);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, locale } = useT();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const [name, setName] = useState<string>(onboardingData.name ?? '');
  const [sex, setSex] = useState<Sex | undefined>(onboardingData.sex);
  const [age, setAge] = useState<string>(
    onboardingData.age ? String(onboardingData.age) : ''
  );
  // Statut ménopausique — uniquement demandé aux femmes 40+.
  // Modifier les besoins physiologiques (TDEE, prot, programme).
  const [menopauseStatus, setMenopauseStatus] = useState<MenopauseStatus | undefined>(
    onboardingData.menopauseStatus,
  );

  const parsedAge = parseInt(age, 10);
  const isAgeValid = !isNaN(parsedAge) && parsedAge >= 16 && parsedAge <= 65;
  const showMenopauseQuestion = sex === 'female' && isAgeValid && parsedAge >= 40;
  // Bloque "Continuer" tant que l'user n'a pas répondu à la question
  // ménopause si elle est concernée. `none` est une réponse valide
  // (signifie "pas concernée par les symptômes").
  const canContinue = sex !== undefined && isAgeValid &&
    (!showMenopauseQuestion || menopauseStatus !== undefined);

  const handleSexSelect = (value: Sex) => {
    triggerHaptic('medium');
    setSex(value);
  };

  const handleNext = () => {
    if (!canContinue) return;
    triggerHaptic('light');
    setOnboardingData({
      name: name.trim() || undefined,
      sex,
      age: parsedAge,
      // On stocke menopauseStatus uniquement si la question a été posée.
      // Sinon undefined — pas applicable.
      menopauseStatus: showMenopauseQuestion ? menopauseStatus : undefined,
    });
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
          <Text style={styles.title}>{t('onboardingStep1Title')}</Text>
          <Text style={styles.subtitle}>{t('onboardingStep1Subtitle')}</Text>

          {/* Prénom (optionnel mais évite le fallback email plus tard) */}
          <Text style={styles.sectionLabel}>{locale === 'en' ? 'First name' : 'Prénom'}</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={locale === 'en' ? 'Your first name' : 'Ton prénom'}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={30}
            accessibilityLabel={locale === 'en' ? 'First name' : 'Prénom'}
          />

          {/* Sex selection */}
          <Text style={styles.sectionLabel}>{t('yourSex')}</Text>
          <View style={styles.sexRow}>
            <Pressable
              style={[
                styles.sexCard,
                sex === 'male' && styles.sexCardSelected,
              ]}
              onPress={() => handleSexSelect('male')}
              accessibilityRole="button"
              accessibilityLabel={t('male')}
              accessibilityState={{ selected: sex === 'male' }}
            >
              {/* Symbole de Mars (♂) — universellement reconnu, neutre, et
                  surtout DIFFÉRENT de la femme (avant les deux montraient
                  un biceps 💪 → confusion totale UX). */}
              <Text style={[styles.sexEmoji, sex === 'male' && styles.sexEmojiSelected]}>
                {'♂'}
              </Text>
              <Text
                style={[
                  styles.sexLabel,
                  sex === 'male' && styles.sexLabelSelected,
                ]}
              >
                {t('male')}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.sexCard,
                sex === 'female' && styles.sexCardSelected,
              ]}
              onPress={() => handleSexSelect('female')}
              accessibilityRole="button"
              accessibilityLabel={t('female')}
              accessibilityState={{ selected: sex === 'female' }}
            >
              {/* Symbole de Vénus (♀) — pendant du Mars ci-dessus. */}
              <Text style={[styles.sexEmoji, sex === 'female' && styles.sexEmojiSelected]}>
                {'♀'}
              </Text>
              <Text
                style={[
                  styles.sexLabel,
                  sex === 'female' && styles.sexLabelSelected,
                ]}
              >
                {t('female')}
              </Text>
            </Pressable>
          </View>

          {/* Age input */}
          <Text style={styles.sectionLabel}>{t('yourAge')}</Text>
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
              accessibilityLabel={t('age')}
            />
            <Text style={styles.ageUnit}>{t('years')}</Text>
          </View>
          {age.length > 0 && !isAgeValid && (
            <Text style={styles.errorText}>
              {t('ageError')}
            </Text>
          )}

          {/* Question ménopause — conditionnelle (femmes 40+).
              Importante car la physiologie change significativement :
              TDEE réduit, protéines majorées, programmes priorisant
              la force pour anti-sarcopénie et anti-ostéoporose.
              Ton respectueux et factuel, non-stigmatisant. */}
          {showMenopauseQuestion && (
            <View style={styles.menopauseBlock}>
              <Text style={styles.sectionLabel}>Ménopause</Text>
              <Text style={styles.menopauseSubtitle}>
                On adapte tes besoins (protéines, force, récup) en fonction.
              </Text>
              <View style={styles.menopauseOptions}>
                {([
                  { value: 'none', label: 'Pas concernée' },
                  { value: 'peri', label: 'Périménopause' },
                  { value: 'post', label: 'Ménopause' },
                ] as const).map((opt) => {
                  const active = menopauseStatus === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        triggerHaptic('medium');
                        setMenopauseStatus(opt.value);
                      }}
                      style={[styles.menopauseBtn, active && styles.menopauseBtnActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.menopauseLabel,
                          active && styles.menopauseLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Health disclaimer — required for App Store Health & Fitness category */}
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Avant de commencer</Text>
            <Text style={styles.disclaimerBody}>
              FORGA n'est pas un substitut à un avis médical. Si tu as un doute sur ta santé, une
              blessure ou prends un traitement, consulte un médecin avant de modifier ton régime
              alimentaire ou ton entraînement. L'app est réservée aux personnes de 16 ans et plus.
            </Text>
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
            <Text style={[styles.nextButtonText, !canContinue && styles.nextButtonTextDisabled]}>
              {t('next')}
            </Text>
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
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    height: 56,
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.text,
    marginBottom: spacing['3xl'],
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
    // Force la couleur du texte sinon les glyphes Mars/Vénus sont
    // rendus en noir → invisibles sur fond sombre. `colors.text` =
    // blanc en dark mode, noir en light mode.
    color: colors.text,
    // Léger fontWeight pour que le symbole soit plus épais et plus
    // visible (sinon le glyph fin se fond avec le fond).
    fontWeight: '600',
  },
  /** Quand la card est sélectionnée, le symbole passe en orange pour
   *  matcher la border + le label en orange. Feedback visuel cohérent. */
  sexEmojiSelected: {
    color: colors.primary,
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
  /** Bloc ménopause — affiché uniquement femme 40+. Container léger
   *  pour ne pas alourdir l'écran, espacé après l'âge. */
  menopauseBlock: {
    marginTop: spacing.xl,
  },
  menopauseSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  menopauseOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menopauseBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  menopauseBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.10)',
  },
  menopauseLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menopauseLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  disclaimerCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing['2xl'],
  },
  disclaimerTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  disclaimerBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 19,
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
}));
