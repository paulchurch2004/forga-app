import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { useWeightPrompt } from '../../src/hooks/useWeightPrompt';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { WeightPromptModal } from '../../src/components/ui/WeightPromptModal';
import { SkeletonScreen } from '../../src/components/ui/Skeleton';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { BigTileCard } from '../../src/components/home/BigTileCard';
import { ReferralPromptModal } from '../../src/components/social/ReferralPromptModal';
import { useReferralPrompt } from '../../src/hooks/useReferralPrompt';
import { WeeklyFormCard } from '../../src/components/home/WeeklyFormCard';
import { PremiumUpgradeCard } from '../../src/components/home/PremiumUpgradeCard';
import { usePremium } from '../../src/hooks/usePremium';
import { CoachingTooltip } from '../../src/components/coach/CoachingTooltip';
import { MiniStatsGrid } from '../../src/components/home/MiniStatsGrid';
import { StepsCard } from '../../src/components/home/StepsCard';
import { SportRecipeOfTheDay } from '../../src/components/home/SportRecipeOfTheDay';
import { useSteps } from '../../src/hooks/useSteps';
import { useMealStore } from '../../src/store/mealStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useTrainingStore } from '../../src/store/trainingStore';
import { todayLocalIso } from '../../src/utils/date';
import { estimateSessionMinutes } from '../../src/utils/sessionDuration';
import { useEngine } from '../../src/hooks/useEngine';
import { useWater } from '../../src/hooks/useWater';
import { useProgram } from '../../src/hooks/useProgram';

// ──────────── CARD DATA ────────────

// Note : le carrousel 3D `CARDS` + `CarouselCard` + `DotIndicator` + `DotItem`
// a été retiré (mai 2026 — Home restructuré avec BigTileCard à la place).
// ~135 lignes de code mort supprimées. Si tu veux le ré-introduire en
// v1.1, l'historique git le contient.

// ──────────── MAIN SCREEN ────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const profile = useUserStore((s) => s.profile);
  const { currentStreak, isTodayValidated } = useStreak();
  // Compteur de pas via Apple Health (Premium opt-in dans Settings).
  // Renvoie tout à 0 si l'user n'a pas activé `stepsEnabled` ou si
  // HealthKit refuse — on n'affiche alors pas la carte (cf. JSX plus bas).
  const stepData = useSteps();
  const tutorialStep = useSettingsStore((s) => s.tutorialStep);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const { shouldPrompt, daysSinceLastWeighIn } = useWeightPrompt();
  const [showWeightModal, setShowWeightModal] = useState(false);
  // Popup périodique pour les Free users : rappel parrainage (1 sem
  // Premium par filleul). Logique de timing dans le hook.
  const referralPrompt = useReferralPrompt();
  const { isPremium } = usePremium();
  const styles = useStyles();
  const { t } = useT();

  // Real macros / score / next slot for the redesign cards
  const todayMeals = useMealStore((s) => s.todayMeals);
  const engine = useEngine();
  const currentScore = useScoreStore((s) => s.currentScore);
  const weeklyChange = useScoreStore((s) => s.weeklyChange);
  const { todayTotal: waterMl, dailyTarget: waterGoal } = useWater();
  const { todayProgramDay, hasActivePlan } = useProgram();

  const consumed = useMemo(() => {
    return todayMeals.reduce(
      (a, m) => ({
        calories: a.calories + m.actualMacros.calories,
        protein: a.protein + m.actualMacros.protein,
        carbs: a.carbs + m.actualMacros.carbs,
        fat: a.fat + m.actualMacros.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  const targets = engine?.dailyMacros ?? { calories: 2000, protein: 120, carbs: 220, fat: 60 };

  // Tile progress rings.
  // Nutrition = ratio of consumed kcal to target (capped at 1).
  // Séance   = 1 once today has at least one logged workout, else 0.
  // (We could get fancier with "fraction of exercises completed" mid-session,
  //  but the workouts list is only updated on session completion, so the
  //  binary today-done flag is the honest signal here.)
  const nutritionProgress = targets.calories
    ? Math.min(1, consumed.calories / targets.calories)
    : 0;
  // Important: return a primitive (boolean) from the selector — returning
  // `s.workouts[date] ?? []` would create a fresh empty array each render
  // and trigger an infinite re-render loop (Zustand uses Object.is).
  const hasWorkoutToday = useTrainingStore(
    (s) => (s.workouts[todayLocalIso()]?.length ?? 0) > 0,
  );
  const seanceProgress = hasActivePlan && todayProgramDay
    ? (hasWorkoutToday ? 1 : 0)
    : 1; // rest day or no plan → ring is "complete" (no action expected)

  // Weekly form score breakdown — derived from currentScore (each subscore
  // normalised to /100 so the bars are comparable on the card).
  const formBreakdown = useMemo(() => {
    const nutritionPct = currentScore ? Math.round((currentScore.nutrition / 40) * 100) : 0;
    const consistencyPct = currentScore ? Math.round((currentScore.consistency / 30) * 100) : 0;
    const disciplinePct = currentScore ? Math.round((currentScore.discipline / 10) * 100) : 0;
    return [
      { label: t('nutritionLabel' as any) as string, value: nutritionPct, color: '#FF6B35' },
      { label: t('consistencyLabel' as any) as string, value: consistencyPct, color: '#5B8BFF' },
      { label: t('disciplineLabel' as any) as string, value: disciplinePct, color: '#00D4AA' },
    ];
  }, [currentScore, t]);

  // Note : scrollX / cardWidth / cardHeight / snapInterval / scrollHandler
  // ont été retirés avec le carrousel 3D (cf commentaire plus haut).

  useEffect(() => {
    if (profile && tutorialStep === 0) {
      const timer = setTimeout(() => setTutorialStep(1), 800);
      return () => clearTimeout(timer);
    }
  }, [profile, tutorialStep, setTutorialStep]);

  // Ask for tracking permission once, after onboarding is done and user is on
  // the home screen. Apple recommends asking AFTER showing value, not at launch.
  useEffect(() => {
    if (!profile) return;
    const t = setTimeout(() => {
      import('../../src/services/tracking').then((m) => m.requestATTIfNeeded());
    }, 2500);
    return () => clearTimeout(t);
  }, [profile]);

  useEffect(() => {
    if (shouldPrompt && profile && tutorialStep === -1) {
      const timer = setTimeout(() => setShowWeightModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPrompt, profile, tutorialStep]);

  if (!profile) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <SkeletonScreen />
      </View>
    );
  }

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = t('greetingMorning');
  else if (hour < 18) greeting = t('greetingAfternoon');
  else greeting = t('greetingEvening');

  // Null safety : profile.name peut être '' (DB null) ou undefined (store
  // re-hydraté avec un ancien shape) → split() crash sur undefined.
  const firstName = profile.name?.split(' ')[0] || 'Champion';

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.xl }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
      >
        {/* Header */}
        <View style={[styles.header, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg }]}>
          <View style={styles.greetingCol}>
            <Text style={styles.greeting}>
              {greeting}, {firstName}
            </Text>
            <Text style={styles.subtitle}>
              {isTodayValidated ? t('keepItUp') : t('readyToForge')}
            </Text>
          </View>
          <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
        </View>

        {/* Stack centrée — Home restructuré mai 2026.
            Ordre fixé par produit :
              1. CTA Premium (non-premium uniquement)
              2. 3 GROS tiles : Nutrition / Entraînement / Coach IA
              3. Score FORGA (WeeklyFormCard)
              4. Mini stats macros (en plus petit)
            Retiré : MorningRitual (déplacé en popup pré-workout),
                     CoachFocusCard (remplacé par la grosse tuile Coach),
                     QuickAccessRow (remplacé par BigTileCard ×3). */}
        <View style={{ maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md }}>
          {/* Premium upgrade CTA — visible only for non-premium users */}
          {!isPremium && (
            <PremiumUpgradeCard onPress={() => router.push('/paywall')} />
          )}

          {/* GROS TILE 1 — Nutrition / Plan du jour
              Couleur d'accent : ORANGE (= primary FORGA) pour la
              nutrition qui est la mission #1 de l'app. */}
          {/* Image : plat type meal-prep — URL stable Unsplash. */}
          <BigTileCard
            eyebrow={t('tileNutritionEyebrow')}
            title={t('tileNutritionTitle')}
            subtitle={t('tileNutritionSubtitle', {
              consumed: Math.round(consumed.calories),
              target: Math.round(targets.calories),
            })}
            imageUri="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80"
            accent
            progress={nutritionProgress}
            onPress={() => router.push('/nutrition')}
          />

          {/* GROS TILE 2 — Entraînement / Séance du jour
              Couleur d'accent : BLEU — couleur "fitness/sport" classique,
              code couleur distinct de la nutrition orange. */}
          {hasActivePlan && todayProgramDay ? (
            <BigTileCard
              eyebrow={t('tileSeanceEyebrow')}
              title={`${t(todayProgramDay.nameKey as any)} · ${estimateSessionMinutes(todayProgramDay)} ${t('tileSeanceMin')}`}
              subtitle={todayProgramDay.muscleGroups.map((g) => t(`muscle_${g}` as any)).join(' & ')}
              imageUri={
                profile?.sex === 'female'
                  ? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80'
                  : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80'
              }
              accentColor="#4A9EFF"
              progress={seanceProgress}
              onPress={() => router.push('/(tabs)/training')}
            />
          ) : (
            <BigTileCard
              eyebrow={t('tileSeanceEyebrow')}
              title={t('tileSeanceRestTitle')}
              subtitle={hasActivePlan ? t('tileSeanceRestSubNoToday') : t('tileSeanceRestSubNoPlan')}
              imageUri={
                profile?.sex === 'female'
                  ? 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80'
                  : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80'
              }
              accentColor="#4A9EFF"
              onPress={() => router.push('/(tabs)/training')}
            />
          )}

          {/* GROS TILE 3 — Coach IA
              Couleur d'accent : VERT — couleur "intelligence/conversation"
              (rappel des thumbs success dans le coach), bien distinct
              des 2 autres tuiles. */}
          <BigTileCard
            eyebrow={t('homeCoachEyebrow' as any)}
            title={t('homeCoachTitle' as any)}
            subtitle={t('homeCoachSubtitle' as any)}
            imageUri="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&q=80"
            accentColor="#00D4AA"
            onPress={() => router.push('/(tabs)/coach')}
          />

          {/* Indice de forme hebdo — Score FORGA (conservé) */}
          <WeeklyFormCard
            score={Math.round(currentScore?.total ?? 0)}
            delta={Math.round(weeklyChange ?? 0)}
            breakdown={formBreakdown}
          />

          {/* Recette sport du jour — change tous les jours.
              Tap → page détail /sport-recipe/[id]. */}
          <View style={{ marginTop: 16 }}>
            <SportRecipeOfTheDay />
          </View>

          {/* Compteur de pas — affiché uniquement si l'user a opt-in
              dans Settings ET que HealthKit a accordé la permission.
              Sinon section masquée, pas de carte vide. */}
          {stepData.isAvailable && (
            <View style={{ marginTop: 16 }}>
              <StepsCard
                steps={stepData.todaySteps}
                target={stepData.targetSteps}
                progress={stepData.progress}
                bonusKcal={stepData.bonusKcal}
                onPress={() => router.push('/(tabs)/profile')}
              />
            </View>
          )}

          {/* Mini stats — vraies données du jour */}
          <MiniStatsGrid
            items={[
              {
                label: t('miniStatCalories'),
                value: String(Math.round(consumed.calories)),
                unit: `/ ${Math.round(targets.calories)}`,
                progress: targets.calories ? consumed.calories / targets.calories : 0,
                color: '#FF6B35',
              },
              {
                label: t('miniStatProteins'),
                value: String(Math.round(consumed.protein)),
                unit: `g / ${Math.round(targets.protein)}`,
                progress: targets.protein ? consumed.protein / targets.protein : 0,
                color: '#5B8BFF',
              },
              {
                label: t('miniStatWater'),
                value: (waterMl / 1000).toFixed(1),
                unit: `L / ${(waterGoal / 1000).toFixed(1)}`,
                progress: waterGoal ? waterMl / waterGoal : 0,
                color: '#00D4AA',
              },
              {
                label: t('miniStatCarbs'),
                value: String(Math.round(consumed.carbs)),
                unit: `g / ${Math.round(targets.carbs)}`,
                progress: targets.carbs ? consumed.carbs / targets.carbs : 0,
                color: '#FFC94D',
              },
            ]}
          />
        </View>
      </Animated.ScrollView>

      {/* Tutorial overlay */}
      <TutorialOverlay step={tutorialStep} />

      {/* Tooltip Morning Ritual retiré : la feature a été déplacée dans
          le popup pré-séance (mai 2026). L'ancien body i18n parlait de
          "Touche un métal pour préciser ton état" — il n'y a plus de
          métaux sur Home. */}

      {/* Weight prompt modal */}
      <WeightPromptModal
        visible={showWeightModal}
        daysSinceLastWeighIn={daysSinceLastWeighIn}
        onClose={() => setShowWeightModal(false)}
      />

      {/* Referral prompt — rappel périodique aux Free users qu'ils
          gagnent 1 sem Premium par filleul. Modal géré par le hook
          useReferralPrompt qui décide quand l'afficher. */}
      <ReferralPromptModal
        visible={referralPrompt.shouldShow}
        referralCode={referralPrompt.referralCode}
        referralCount={referralPrompt.referralCount}
        onDismiss={referralPrompt.dismiss}
      />
    </View>
  );
}

// ──────────── STYLES ────────────

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  greetingCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },
  carouselCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  carouselImage: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  carouselImageInner: {
    borderRadius: borderRadius.xl,
  },
  carouselOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  carouselTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  carouselDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
