import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/store/userStore';
import { useTrackOnboardingStep } from '../../src/hooks/useTrackOnboardingStep';
import { useOnboardingBack } from '../../src/hooks/useOnboardingBack';
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import {
  computeCommuteDistance,
  computeCommuteDistanceFromCoords,
  computeCyclingKcalPerDay,
  type AddressSuggestion,
} from '../../src/services/cyclingRouting';
import { AddressAutocomplete } from '../../src/components/onboarding/AddressAutocomplete';
import type { CyclingProfile } from '../../src/types/user';

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    const s = style === 'medium'
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(s);
  }).catch(() => {});
};

// Étape vélo (5.5) intercalée entre activité et préférences. Numérotée
// "6/8" dans la progress bar pour cohérence avec les autres étapes.
// IMPORTANT : on tracke comme step 6 dans le store (pas 5) pour que
// le redirect d'index.tsx puisse distinguer "user à step5-activity" et
// "user à step5b-cycling" lors d'une reprise d'onboarding.
const STEP = 6;
const TOTAL_STEPS = 8;

export default function Step5bCycling() {
  useTrackOnboardingStep(6);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  // Question principale : l'user se déplace à vélo ? Si non, on
  // saute directement à l'étape suivante. Si oui, on déroule les
  // inputs adresses + slider days/week.
  const [doesCycle, setDoesCycle] = useState<boolean | null>(
    onboardingData.cycling?.enabled ?? null,
  );
  const [homeAddress, setHomeAddress] = useState(
    onboardingData.cycling?.homeAddress ?? '',
  );
  const [destinationAddress, setDestinationAddress] = useState(
    onboardingData.cycling?.destinationAddress ?? '',
  );
  // Coords des suggestions sélectionnées via l'autocomplete. Quand
  // dispo, on les utilise directement pour OSRM (skip geocoding).
  const [homeCoords, setHomeCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [daysPerWeek, setDaysPerWeek] = useState(
    onboardingData.cycling?.daysPerWeek ?? 5,
  );

  // État du calcul de distance — async via API OSRM. Garde la dernière
  // distance computée pour affichage + l'erreur si l'API a foiré.
  const [computedDistance, setComputedDistance] = useState<number | null>(
    onboardingData.cycling?.distanceKm ?? null,
  );
  const [isComputing, setIsComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  // Fallback manuel : si l'OSRM/Nominatim sont down (offline, rate-limit,
  // DNS bloqué dans certains pays), l'user était bloqué sans pouvoir
  // continuer l'onboarding. Permet de saisir la distance manuellement.
  const [manualMode, setManualMode] = useState(false);
  const [manualDistanceInput, setManualDistanceInput] = useState('');

  const handleBack = useOnboardingBack('/(onboarding)/step5-activity');

  /** Geocode (si besoin) + route via OSRM. Si l'user a sélectionné les
   *  2 adresses dans l'autocomplete on a déjà les coords → on skip la
   *  partie geocoding (plus rapide, pas de souci de rate-limit). */
  const handleComputeDistance = useCallback(async () => {
    if (!homeAddress.trim() || !destinationAddress.trim()) return;
    triggerHaptic('light');
    setIsComputing(true);
    setComputeError(null);
    try {
      // Fast path : coords déjà résolues via autocomplete
      if (homeCoords && destCoords) {
        const fast = await computeCommuteDistanceFromCoords(homeCoords, destCoords);
        if (!fast) {
          setComputeError(t('cyclingErrCoords' as any));
          setComputedDistance(null);
        } else {
          setComputedDistance(fast.distanceKm);
        }
      } else {
        // Slow path : fallback geocoding (user a tapé sans suggestion)
        const result = await computeCommuteDistance(homeAddress, destinationAddress);
        if (!result) {
          setComputeError(t('cyclingErrAddress' as any));
          setComputedDistance(null);
        } else {
          setComputedDistance(result.distanceKm);
        }
      }
    } catch {
      setComputeError(t('cyclingErrNetwork' as any));
    } finally {
      setIsComputing(false);
    }
  }, [homeAddress, destinationAddress, homeCoords, destCoords, t]);

  // Handlers picks depuis l'autocomplete : on remplit l'adresse texte
  // ET on stocke les coords pour skip un appel Nominatim au calcul.
  // Reset la distance car l'adresse a changé.
  const handleHomePick = useCallback((s: AddressSuggestion) => {
    setHomeAddress(s.displayName);
    setHomeCoords({ lat: s.lat, lng: s.lng });
    setComputedDistance(null);
    setComputeError(null);
  }, []);
  const handleDestPick = useCallback((s: AddressSuggestion) => {
    setDestinationAddress(s.displayName);
    setDestCoords({ lat: s.lat, lng: s.lng });
    setComputedDistance(null);
    setComputeError(null);
  }, []);
  // Édition manuelle : on invalide les coords (l'user a modifié le
  // texte, donc la suggestion précédente n'est plus la sienne).
  const handleHomeChange = useCallback((text: string) => {
    setHomeAddress(text);
    setHomeCoords(null);
    setComputedDistance(null);
  }, []);
  const handleDestChange = useCallback((text: string) => {
    setDestinationAddress(text);
    setDestCoords(null);
    setComputedDistance(null);
  }, []);

  const handleNext = useCallback(() => {
    triggerHaptic('light');
    // Construit le CyclingProfile final qu'on persiste dans
    // OnboardingData. Sera reporté dans UserProfile à step7-summary.
    const cycling: CyclingProfile = doesCycle && computedDistance !== null
      ? {
          enabled: true,
          homeAddress: homeAddress.trim(),
          destinationAddress: destinationAddress.trim(),
          distanceKm: computedDistance,
          daysPerWeek,
        }
      : {
          enabled: false,
          daysPerWeek: 0,
        };
    setOnboardingData({ cycling });
    router.push('/(onboarding)/step6-preferences');
  }, [doesCycle, computedDistance, homeAddress, destinationAddress, daysPerWeek, setOnboardingData, router]);

  // Estimation kcal/jour quand on a tout. Affiché en bas pour donner
  // un retour immédiat à l'user ("avec ton trajet tu gagnes 250 kcal/j").
  const kcalPerDayEstimate = (() => {
    if (!doesCycle || !computedDistance) return null;
    const weight = onboardingData.currentWeight ?? 70;
    return computeCyclingKcalPerDay(computedDistance, daysPerWeek, weight);
  })();

  const canContinue = doesCycle === false
    || (doesCycle === true && computedDistance !== null);

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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('cyclingTitle' as any)}</Text>
        <Text style={styles.subtitle}>
          {t('cyclingSubtitle' as any)}
        </Text>

        {/* Question oui/non */}
        <View style={styles.yesNoRow}>
          <Pressable
            style={[styles.yesNoBtn, doesCycle === true && styles.yesNoBtnActive]}
            onPress={() => {
              triggerHaptic('medium');
              setDoesCycle(true);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: doesCycle === true }}
          >
            <Text style={styles.yesNoEmoji}>🚴</Text>
            <Text style={[styles.yesNoLabel, doesCycle === true && styles.yesNoLabelActive]}>
              {t('cyclingYes' as any)}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.yesNoBtn, doesCycle === false && styles.yesNoBtnActive]}
            onPress={() => {
              triggerHaptic('medium');
              setDoesCycle(false);
              setComputedDistance(null);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: doesCycle === false }}
          >
            <Text style={styles.yesNoEmoji}>🚗</Text>
            <Text style={[styles.yesNoLabel, doesCycle === false && styles.yesNoLabelActive]}>
              {t('cyclingNo' as any)}
            </Text>
          </Pressable>
        </View>

        {/* Bloc adresses + distance — affiché seulement si "oui" */}
        {doesCycle === true && (
          <View style={styles.cyclingDetails}>
            <AddressAutocomplete
              label={t('cyclingHomeLabel' as any)}
              placeholder={t('cyclingHomePlaceholder' as any)}
              value={homeAddress}
              onChangeText={handleHomeChange}
              onSelect={handleHomePick}
              isResolved={homeCoords !== null}
            />

            <AddressAutocomplete
              label={t('cyclingDestLabel' as any)}
              placeholder={t('cyclingDestPlaceholder' as any)}
              value={destinationAddress}
              onChangeText={handleDestChange}
              onSelect={handleDestPick}
              isResolved={destCoords !== null}
            />

            <Pressable
              style={[
                styles.computeBtn,
                (!homeAddress.trim() || !destinationAddress.trim() || isComputing) && styles.computeBtnDisabled,
              ]}
              onPress={handleComputeDistance}
              disabled={!homeAddress.trim() || !destinationAddress.trim() || isComputing}
            >
              {isComputing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.computeBtnText}>
                  {computedDistance !== null ? t('cyclingRecomputeBtn' as any) : t('cyclingComputeBtn' as any)}
                </Text>
              )}
            </Pressable>

            {computeError && (
              <Text style={styles.errorText}>{computeError}</Text>
            )}

            {/* Fallback manuel — toujours dispo, surtout utile si le
                calcul auto a échoué (offline / OSRM down). */}
            {!manualMode ? (
              <Pressable
                onPress={() => {
                  triggerHaptic('light');
                  setManualMode(true);
                }}
                style={styles.manualToggle}
                accessibilityRole="button"
              >
                <Text style={styles.manualToggleText}>
                  {t('cyclingManualToggle' as any)}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.manualBox}>
                <Text style={styles.fieldLabel}>
                  {t('cyclingManualLabel' as any)}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('cyclingManualPlaceholder' as any)}
                  placeholderTextColor={colors.textMuted}
                  value={manualDistanceInput}
                  onChangeText={(text) => {
                    // Accepte uniquement chiffres + un séparateur décimal
                    const cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                    setManualDistanceInput(cleaned);
                    const parsed = parseFloat(cleaned);
                    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 200) {
                      setComputedDistance(parsed);
                      setComputeError(null);
                    } else {
                      setComputedDistance(null);
                    }
                  }}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                />
              </View>
            )}

            {/* Résultat distance + slider jours/semaine — seulement
                quand on a une distance calculée. */}
            {computedDistance !== null && (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>{t('cyclingDistanceLabel' as any)}</Text>
                  <Text style={styles.resultValue}>
                    {computedDistance.toFixed(1)} km
                    <Text style={styles.resultUnit}>{t('cyclingDistanceUnit' as any)}</Text>
                  </Text>
                </View>

                <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>
                  {t('cyclingDaysQuestion' as any)}
                </Text>
                <View style={styles.daysRow}>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                    const active = daysPerWeek === d;
                    return (
                      <Pressable
                        key={d}
                        style={[styles.dayBtn, active && styles.dayBtnActive]}
                        onPress={() => {
                          triggerHaptic('light');
                          setDaysPerWeek(d);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t('cyclingDaysAria' as any, { n: d })}
                      >
                        <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {kcalPerDayEstimate !== null && (
                  <View style={styles.kcalBadge}>
                    <Text style={styles.kcalBadgeIcon}>⚡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.kcalBadgeTitle}>
                        {t('cyclingKcalBadgeTitle' as any, { kcal: kcalPerDayEstimate })}
                      </Text>
                      <Text style={styles.kcalBadgeSubtitle}>
                        {t('cyclingKcalBadgeSubtitle' as any)}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel={t('next')}
        >
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  flex: { flex: 1 },
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
  backArrow: { fontSize: 24, color: colors.text, paddingRight: spacing.sm },
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
  scrollContent: { paddingBottom: spacing['3xl'] },
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
    marginBottom: spacing['2xl'],
  },
  yesNoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  yesNoBtn: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 8,
  },
  yesNoBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  yesNoEmoji: { fontSize: 32 },
  yesNoLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  yesNoLabelActive: { color: colors.primary },
  manualToggle: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  manualToggleText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  manualBox: {
    marginTop: spacing.md,
  },
  cyclingDetails: { marginTop: spacing.xl },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  computeBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  computeBtnDisabled: { opacity: 0.4 },
  computeBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FF6B6B',
    marginTop: spacing.sm,
  },
  resultCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: colors.primary,
  },
  resultValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  resultUnit: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  dayBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  dayLabel: {
    fontFamily: fonts.data,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayLabelActive: { color: colors.primary },
  kcalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,212,170,0.10)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.30)',
  },
  kcalBadgeIcon: { fontSize: 28 },
  kcalBadgeTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4AA',
  },
  kcalBadgeSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
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
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
}));
