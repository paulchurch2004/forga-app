import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestPermissions,
  scheduleMealReminder,
  scheduleWeeklyCheckIn,
} from '../../src/services/notifications';
import type { MealSlot } from '../../src/types/meal';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../src/store/userStore';
import { todayLocalIso } from '../../src/utils/date';
import { useTrackOnboardingStep } from '../../src/hooks/useTrackOnboardingStep';
import { useOnboardingBack } from '../../src/hooks/useOnboardingBack';
import { useAuthStore } from '../../src/store/authStore';
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { calculateTDEE } from '../../src/engine/tdee';
import { calculateMacros } from '../../src/engine/macros';
import { determineMealCount } from '../../src/engine/mealPlanner';
import { supabase, isDemoMode } from '../../src/services/supabase';
import { generateReferralCode, lookupReferralCode, applyReferral, applyRefereeBonus, calculatePremiumUntil } from '../../src/services/referrals';
import { events } from '../../src/services/analytics';
import type { Objective, ActivityLevel } from '../../src/types/user';
import { LinearGradient } from 'expo-linear-gradient';

const triggerHaptic = (type: 'light' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }).catch(() => {});
};

const STEP = 8;
const TOTAL_STEPS = 8;

const OBJECTIVE_LABEL_KEYS: Record<Objective, string> = {
  bulk: 'objectiveBulk',
  cut: 'objectiveCut',
  maintain: 'objectiveMaintain',
  recomp: 'objectiveRecomp',
};

const ACTIVITY_LABEL_KEYS: Record<ActivityLevel, string> = {
  sedentary: 'activitySedentary',
  light: 'activityLight',
  moderate: 'activityModerate',
  active: 'activityActive',
  very_active: 'activityVeryActive',
};

const BUDGET_LABEL_KEYS: Record<string, string> = {
  eco: 'budgetEco',
  premium: 'budgetPremium',
  both: 'budgetBoth',
};

const RESTRICTION_LABEL_KEYS: Record<string, string> = {
  vegetarian: 'restrictionVegetarian',
  vegan: 'restrictionVegan',
  gluten_free: 'restrictionGlutenFree',
  lactose_free: 'restrictionLactoseFree',
  halal: 'restrictionHalal',
  pork_free: 'restrictionPorkFree',
};

export default function Step7Summary() {
  useTrackOnboardingStep(8);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const onboardingData = useUserStore((s) => s.onboardingData);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);
  const setProfile = useUserStore((s) => s.setProfile);
  const user = useAuthStore((s) => s.user);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  const [isLoading, setIsLoading] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  // Compute TDEE and macros from onboarding data
  const computed = useMemo(() => {
    const sex = onboardingData.sex ?? 'male';
    const age = onboardingData.age ?? 25;
    const heightCm = onboardingData.heightCm ?? 175;
    const currentWeight = onboardingData.currentWeight ?? 75;
    const objective = onboardingData.objective ?? 'maintain';
    const activityLevel = onboardingData.activityLevel ?? 'moderate';

    const tdeeResult = calculateTDEE({
      sex,
      age,
      heightCm,
      weightKg: currentWeight,
      activityLevel,
    });

    const macros = calculateMacros({
      tdee: tdeeResult.tdee,
      weightKg: currentWeight,
      objective,
    });

    const mealsPerDay = determineMealCount({
      objective,
      dailyCalories: macros.calories,
    });

    return {
      tdee: tdeeResult.tdee,
      bmr: tdeeResult.bmr,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      mealsPerDay,
    };
  }, [onboardingData]);

  const handleBack = useOnboardingBack('/(onboarding)/step6-preferences');

  const handleFinish = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    triggerHaptic('success');

    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error(t('userNotConnected'));
      }

      const now = new Date().toISOString();

      // Generate a unique referral code for this user
      const myReferralCode = generateReferralCode();
      const referredByCode = onboardingData.referredByCode;

      // Resolve a non-empty name across all sign-up paths.
      // Apple often returns no name on subsequent sign-ins; the DB has a NOT NULL
      // constraint on `name`, so we fall back through every available source.
      const emailPrefix = user.email ? user.email.split('@')[0] : '';
      const resolvedName =
        onboardingData.name?.trim() ||
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        (user.user_metadata?.name as string | undefined)?.trim() ||
        emailPrefix ||
        'Utilisateur';

      const profileData = {
        id: userId,
        email: user.email ?? '',
        name: resolvedName,
        sex: onboardingData.sex ?? 'male' as const,
        age: onboardingData.age ?? 25,
        heightCm: onboardingData.heightCm ?? 175,
        currentWeight: onboardingData.currentWeight ?? 75,
        targetWeight: onboardingData.targetWeight ?? onboardingData.currentWeight ?? 75,
        targetDeadline: onboardingData.targetDeadline ?? new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        objective: onboardingData.objective ?? 'maintain' as const,
        activityLevel: onboardingData.activityLevel ?? 'moderate' as const,
        budget: onboardingData.budget ?? 'both' as const,
        restrictions: onboardingData.restrictions ?? [],
        tdee: computed.tdee,
        dailyCalories: computed.calories,
        dailyProtein: computed.protein,
        dailyCarbs: computed.carbs,
        dailyFat: computed.fat,
        mealsPerDay: computed.mealsPerDay,
        currentStreak: 0,
        bestStreak: 0,
        streakFreezeUsedThisWeek: false,
        forgaScore: 0,
        isPremium: true,
        // 7-day free trial — aligned with the paywall messaging "Commencer l'essai gratuit 7 jours".
        premiumUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        referralCode: myReferralCode,
        referralCount: 0,
        referredBy: referredByCode,
        // Profil cyclisme issu de l'étape vélo (step5b). Si l'user a
        // répondu non ou skip, on stocke quand même `enabled: false`
        // pour ne pas re-poser la question à la prochaine session.
        cycling: onboardingData.cycling,
        // Statut ménopausique (uniquement renseigné pour femmes 40+).
        menopauseStatus: onboardingData.menopauseStatus,
        createdAt: now,
        updatedAt: now,
      };

      // Save to Supabase (skip in demo mode)
      if (!isDemoMode) {
        const { error } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: user.email ?? '',
            name: resolvedName,
            sex: onboardingData.sex ?? null,
            age: onboardingData.age ?? null,
            height_cm: onboardingData.heightCm ?? null,
            current_weight: onboardingData.currentWeight ?? null,
            target_weight: onboardingData.targetWeight ?? null,
            target_deadline: onboardingData.targetDeadline ?? null,
            objective: onboardingData.objective ?? null,
            activity_level: onboardingData.activityLevel ?? null,
            budget: onboardingData.budget ?? 'both',
            restrictions: onboardingData.restrictions ?? [],
            tdee: computed.tdee,
            daily_calories: computed.calories,
            daily_protein: computed.protein,
            daily_carbs: computed.carbs,
            daily_fat: computed.fat,
            meals_per_day: computed.mealsPerDay,
            current_streak: 0,
            best_streak: 0,
            streak_freeze_used_this_week: false,
            forga_score: 0,
            is_premium: true,
            // 7-day free trial — DOIT être aligné avec ligne 194
            // (profile local) et avec le paywall messaging "essai
            // gratuit 7 jours". Avant : 30j ici vs 7j local = état
            // divergent qui se sync au cold start → user voit son
            // trial passer de 7j à 30j sans explication.
            premium_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            referral_code: myReferralCode,
            referral_count: 0,
            referred_by: referredByCode ?? null,
            // Profil cyclisme stocké à plat — TDEE intègre déjà le bonus,
            // mais ces colonnes permettent à un autre device de
            // reconstruire le profil au login + d'éditer dans Settings.
            cycling_enabled: onboardingData.cycling?.enabled ?? false,
            cycling_home_address: onboardingData.cycling?.homeAddress ?? null,
            cycling_destination_address: onboardingData.cycling?.destinationAddress ?? null,
            cycling_distance_km: onboardingData.cycling?.distanceKm ?? null,
            cycling_days_per_week: onboardingData.cycling?.daysPerWeek ?? 0,
            // Statut ménopausique — uniquement renseigné pour femmes 40+
            menopause_status: onboardingData.menopauseStatus ?? null,
          });

        if (error) {
          throw error;
        }

        // Apply referral reward to the referrer + bonus pour le filleul
        if (referredByCode) {
          const referrerId = await lookupReferralCode(referredByCode);
          if (referrerId) {
            await applyReferral(referrerId, userId, referredByCode);
            // Bonus filleul : +30 jours de Pro en plus du trial 7j auto.
            // Total = 37j gratuit pour qui s'inscrit via lien de
            // parrainage (vs 7j sans). Renforce la viralité.
            await applyRefereeBonus(userId);
            events.referralCodeUsed(referredByCode);
          }
        }
      } else if (referredByCode) {
        // Demo mode: just log the referral
        events.referralCodeUsed(referredByCode);
      }

      // Update local stores
      setProfile(profileData);
      setOnboarded(true);

      // Seed la 1re entrée de poids dans weightLog avec le poids saisi
      // à l'onboarding. SANS ça, weightLog reste vide → useWeightPrompt
      // déclenche le modal "pèse-toi" dès l'arrivée sur le Home, qui
      // RE-DEMANDE le poids que l'user vient de donner. Pire : ce modal
      // s'ouvre juste après le modal notifs → conflit "2 modals" iOS →
      // UI figée. Seeder le log corrige les deux symptômes d'un coup +
      // démarre l'historique de poids dès J1.
      const seedWeight = onboardingData.currentWeight ?? 75;
      const existingLog = useUserStore.getState().weightLog;
      if (existingLog.length === 0 && seedWeight > 0) {
        useUserStore.getState().addWeightEntry({
          id: `w_seed_${Date.now()}`,
          userId,
          date: todayLocalIso(),
          weight: seedWeight,
          createdAt: new Date().toISOString(),
        });
      }

      events.onboardingComplete();
      events.trialStarted();
      // Onboarding complete — clear the resume marker.
      useUserStore.getState().setOnboardingStep(0);

      // On native: show notification opt-in prompt
      // On web: navigate directly (notifications not supported)
      if (Platform.OS !== 'web') {
        setShowNotifPrompt(true);
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      // Erreur réseau/Supabase : on rend le message actionnable. Le
      // bouton se réactive via `finally` donc l'user peut retry, mais
      // sans contexte il pense que c'est cassé définitivement. On
      // détecte les patterns courants (network, 5xx) pour donner un
      // hint clair "vérifie ta connexion, retape le bouton".
      const rawMessage = err?.message ?? t('errorOccurred');
      const isNetwork = /network|fetch|timeout|5\d\d/i.test(rawMessage);
      const message = isNetwork
        ? `${t('errorNetwork') ?? 'Problème de connexion'}. ${t('retryHint') ?? 'Vérifie ton réseau puis appuie à nouveau sur Commencer.'}`
        : rawMessage;
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert(t('error'), message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user, onboardingData, computed, setProfile, setOnboarded, router]);

  // Ferme l'overlay notif puis navigue. L'overlay étant un simple View
  // absolu (et non un <Modal> natif), il se démonte instantanément avec
  // l'écran — pas de risque d'overlay natif fantôme qui fige l'app.
  const closeNotifThenGoHome = useCallback(() => {
    setShowNotifPrompt(false);
    router.replace('/');
  }, [router]);

  const handleEnableNotifs = useCallback(async () => {
    try {
      const granted = await requestPermissions();
      if (granted) {
        // Cap à 3 repas principaux par défaut (breakfast / lunch / dinner)
        // pour ne pas saturer l'user en notifs. Les snacks et bedtime
        // peuvent être activés à la main depuis Profil > Notifications
        // si l'user le souhaite. Sans ce cap, on schedule 6 notifs/jour
        // = désabonnement quasi certain dans les 72h.
        const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
        for (const slot of slots) {
          await scheduleMealReminder(slot);
        }
        await scheduleWeeklyCheckIn();
        await AsyncStorage.setItem('forga-notifications-enabled', 'true');
      }
    } catch {
      // Silent fail
    }
    closeNotifThenGoHome();
  }, [closeNotifThenGoHome]);

  const handleSkipNotifs = useCallback(() => {
    closeNotifThenGoHome();
  }, [closeNotifThenGoHome]);

  const objective = onboardingData.objective ?? 'maintain';
  const currentWeight = onboardingData.currentWeight ?? 75;
  const targetWeight = onboardingData.targetWeight ?? currentWeight;
  const delta = targetWeight - currentWeight;

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
        <Text style={styles.title}>{t("onboardingStep7Title")}</Text>
        <Text style={styles.subtitle}>
          {t("onboardingStep7Subtitle")}
        </Text>

        {/* Objective card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("objective")}</Text>
            <Text style={styles.summaryValue}>
              {t(OBJECTIVE_LABEL_KEYS[objective] as any)}
            </Text>
          </View>
          {delta !== 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t("variation")}</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: delta > 0 ? colors.success : colors.primary },
                ]}
              >
                {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("activity")}</Text>
            <Text style={styles.summaryValue}>
              {t(ACTIVITY_LABEL_KEYS[onboardingData.activityLevel ?? 'moderate'] as any)}
            </Text>
          </View>
        </View>

        {/* Calories card */}
        <View style={styles.caloriesCard}>
          <Text style={styles.caloriesTitle}>{t("dailyCalories")}</Text>
          <Text style={styles.caloriesValue}>{computed.calories}</Text>
          <Text style={styles.caloriesUnit}>{t("kcalPerDay")}</Text>

          <View style={styles.macroDivider} />

          {/* Macros breakdown */}
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
              <Text style={styles.macroValue}>{computed.protein}g</Text>
              <Text style={styles.macroLabel}>{t("proteinLabel")}</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
              <Text style={styles.macroValue}>{computed.carbs}g</Text>
              <Text style={styles.macroLabel}>{t("carbsLabel")}</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
              <Text style={styles.macroValue}>{computed.fat}g</Text>
              <Text style={styles.macroLabel}>{t("fatLabel")}</Text>
            </View>
          </View>
        </View>

        {/* Meals per day */}
        <View style={styles.mealsCard}>
          <Text style={styles.mealsLabel}>{t("mealsPerDayLabel")}</Text>
          <Text style={styles.mealsValue}>{computed.mealsPerDay}</Text>
        </View>

        {/* Preferences recap */}
        {(onboardingData.budget || (onboardingData.restrictions && onboardingData.restrictions.length > 0)) && (
          <View style={styles.summaryCard}>
            {onboardingData.budget && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("budget")}</Text>
                <Text style={styles.summaryValue}>
                  {t(BUDGET_LABEL_KEYS[onboardingData.budget!] as any) ?? onboardingData.budget}
                </Text>
              </View>
            )}
            {onboardingData.restrictions && onboardingData.restrictions.length > 0 && (
              <View style={styles.restrictionsRow}>
                <Text style={styles.summaryLabel}>{t("restrictions")}</Text>
                <View style={styles.restrictionChips}>
                  {onboardingData.restrictions.map((r) => (
                    <View key={r} style={styles.restrictionChip}>
                      <Text style={styles.restrictionChipText}>
                        {t(RESTRICTION_LABEL_KEYS[r] as any) ?? r}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Score FORGA intro */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>{t("scoreForga")}</Text>
          <Text style={styles.scoreBigNumber}>0</Text>
          <Text style={styles.scoreDescription}>
              {t("scoreIntroDesc")}
            </Text>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          {t("onboardingDisclaimer")}
        </Text>

        {/* Lien sources scientifiques (citations — Apple 1.4.1) */}
        <Pressable onPress={() => router.push('/sources')} hitSlop={8}>
          <Text style={styles.sourcesLink}>{t('sourcesLink' as any) as string}</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.startButton, isLoading && styles.startButtonLoading]}
          onPress={handleFinish}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={t("begin")}
          accessibilityState={{ disabled: isLoading, busy: isLoading }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.startButtonText}>{t("begin")}</Text>
          )}
        </Pressable>
      </View>

      {/* Notification opt-in — overlay ABSOLU (pas un <Modal> RN natif).
          Pourquoi : un <Modal> transparent dont l'écran parent est
          démonté pendant le dismiss (ici on navigue vers le Home juste
          après) laisse sur iOS un overlay natif invisible qui intercepte
          TOUS les touches → l'app paraît figée. Un overlay absolu se
          démonte proprement avec l'écran, zéro modal natif = zéro freeze. */}
      {showNotifPrompt && (
        <View style={[styles.modalOverlay, StyleSheet.absoluteFill]} pointerEvents="auto">
          <View style={styles.modalCard}>
            <View style={styles.modalGlow} pointerEvents="none" />
            <Text style={styles.modalEyebrow}>RAPPELS QUOTIDIENS</Text>
            <Text style={styles.modalTitle}>{t("notifPromptTitle")}</Text>
            <Text style={styles.modalBody}>{t("notifPromptBody")}</Text>
            <Pressable style={styles.modalBtnPrimaryWrap} onPress={handleEnableNotifs}>
              <LinearGradient
                colors={['#FF8C40', '#FF5A1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnPrimaryText}>{t("enable")}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={styles.modalBtnSecondary} onPress={handleSkipNotifs}>
              <Text style={styles.modalBtnSecondaryText}>{t("later")}</Text>
            </Pressable>
          </View>
        </View>
      )}
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
    marginBottom: spacing['2xl'],
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  caloriesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  caloriesTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  caloriesValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.primary,
  },
  caloriesUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  macroDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: spacing.lg,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  macroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  mealsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealsLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  mealsValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  restrictionsRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  restrictionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  restrictionChip: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  restrictionChipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  scoreTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scoreBigNumber: {
    fontFamily: fonts.data,
    fontSize: fontSizes.score,
    fontWeight: fontWeights.extrabold,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  scoreDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: fontSizes.xs * 1.6,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sourcesLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
  bottomBar: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonLoading: {
    opacity: 0.7,
  },
  startButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: '#0E0E14',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  modalGlow: {
    position: 'absolute',
    top: -60,
    left: '50%',
    width: 240,
    height: 160,
    borderRadius: 120,
    backgroundColor: 'rgba(255,107,53,0.20)',
    opacity: 0.6,
    transform: [{ translateX: -120 }],
  },
  modalEyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  modalBtnPrimaryWrap: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalBtnPrimary: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalBtnSecondary: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  modalBtnSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
}));
