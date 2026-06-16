import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { FLOATING_TABBAR_HEIGHT } from '../../src/components/layout/CustomTabBar';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTraining } from '../../src/hooks/useTraining';
import { useStreak } from '../../src/hooks/useStreak';
import { useProgram } from '../../src/hooks/useProgram';
import { useProgramStore } from '../../src/store/programStore';
import { useTrainingStore } from '../../src/store/trainingStore';
import { useUserStore } from '../../src/store/userStore';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { ProgramSelector } from '../../src/components/training/ProgramSelector';
import { QuickStats } from '../../src/components/training/QuickStats';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SessionHistoryList, type SessionHistoryItem } from '../../src/components/training/SessionHistoryList';
import { TrainingHero } from '../../src/components/training/TrainingHero';
import { WeekNavigator } from '../../src/components/training/WeekNavigator';
import { WeekDayCalendar, type WeekCalendarDay, type WeekDayStatus } from '../../src/components/training/WeekDayCalendar';
import { QuickStatsRow } from '../../src/components/training/QuickStatsRow';
import { SelectedDayCard, type SelectedDayState, type SelectedDayExercise } from '../../src/components/training/SelectedDayCard';
import { ProgramSelectorSheet } from '../../src/components/training/ProgramSelectorSheet';
import { PreWorkoutCheckInModal, type PreWorkoutCheckInResult } from '../../src/components/training/PreWorkoutCheckInModal';
import { HistorySheet, type HistoryItem } from '../../src/components/training/HistorySheet';
import { ReplaceExerciseSheet, type SubstituteOption } from '../../src/components/training/ReplaceExerciseSheet';
import { buildSubstitutesFor as buildSubstitutesForId } from '../../src/utils/exerciseSubstitutes';
import { estimateSessionMinutes } from '../../src/utils/sessionDuration';
import { CycleCompleteCard } from '../../src/components/training/CycleCompleteCard';
import { TrainingSetupWizard } from '../../src/components/training/TrainingSetupWizard';
import { StatsSheet } from '../../src/components/training/StatsSheet';
import { SessionActionsSheet, type SessionAction } from '../../src/components/training/SessionActionsSheet';
import { SessionPreviewSheet } from '../../src/components/training/SessionPreviewSheet';
import { PROGRAMS, PROGRAM_IDS, getProgramDayById } from '../../src/data/programs';
import { EXERCISES } from '../../src/data/exercises';

const TRAINING_HEADER_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Light)
  ).catch(() => {});
};

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { t } = useT();
  const styles = useStyles();
  const { colors } = useTheme();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  // Strength test : pour afficher la card "Calibre ta force" plus
  // proéminente quand pas encore fait, et discrète sinon.
  const strengthTest = useUserStore((s) => s.strengthTest);
  const {
    recentWorkouts,
    weeklyCount,
    monthlyCount,
    favoriteType,
  } = useTraining();
  const {
    hasActivePlan,
    activePlan,
    activeProgram,
    recommendedProgramId,
    currentWeek,
    todayPlan,
    todayProgramDay,
    weekDays,
    isPlanExpired,
    selectProgram,
    changeProgram,
  } = useProgram();

  const objective = profile?.objective ?? 'maintain';
  const markDaySkipped = useProgramStore((s) => s.markDaySkipped);
  const swapPlannedDays = useProgramStore((s) => s.swapPlannedDays);
  const replaceExerciseInDay = useProgramStore((s) => s.replaceExerciseInDay);
  const getProgramDayForDate = useProgramStore((s) => s.getProgramDayForDate);
  const lastWipedProgramId = useProgramStore((s) => s.lastWipedProgramId);
  const clearLastWipedProgram = useProgramStore((s) => s.clearLastWipedProgram);

  // Notification user du wipe migration : si un ancien plan a été
  // automatiquement nettoyé (programId disparu d'une mise à jour),
  // on prévient pour éviter qu'il croie que l'app a perdu ses données.
  useEffect(() => {
    if (lastWipedProgramId && !hasActivePlan) {
      Alert.alert(
        'Programme mis à jour',
        `Ton ancien programme n'est plus disponible dans cette version. Choisis-en un nouveau adapté à ton profil — tes séances passées restent dans ton historique.`,
        [{ text: 'Compris', onPress: clearLastWipedProgram }],
      );
    }
  }, [lastWipedProgramId, hasActivePlan, clearLastWipedProgram]);
  const duplicateWorkoutToDate = useTrainingStore((s) => s.duplicateWorkoutToDate);

  // ─── Week navigator + calendar state ─────────────────────────
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  // Fin de cycle : true quand l'user a tapé "choisir un autre programme"
  // sur la CycleCompleteCard → on révèle le sélecteur complet à la place.
  const [showFullSelector, setShowFullSelector] = useState(false);
  const [activeSheet, setActiveSheet] = useState<
    null | 'program' | 'history' | 'replace' | 'stats' | 'actions' | 'preview'
  >(null);
  const [replaceTarget, setReplaceTarget] = useState<SelectedDayExercise | null>(null);

  // Index ALL plan days by ISO date (the program week and the calendar week
  // don't necessarily align, so we can't restrict to weekDays).
  const completedDays = useProgramStore((s) => s.completedDays);
  const planByDate = useMemo(() => {
    const map: Record<string, typeof weekDays[number]> = {};
    if (!activePlan) return map;
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    for (const d of activePlan.days) {
      const completedId = completedDays[d.date] ?? d.workoutId;
      let status = d.status;
      if (completedId) status = 'completed';
      else if (d.date === todayIso && d.status !== 'rest') status = 'today';
      else if (d.date < todayIso && d.status === 'upcoming') status = 'skipped';
      map[d.date] = { ...d, status, workoutId: completedId ?? d.workoutId };
    }
    return map;
  }, [activePlan, completedDays]);

  // calendarCells = parallel array of ISO date + planDay reference for each cell.
  const calendarCells = useMemo(() => {
    const today = new Date();
    const todayDow = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayDow + weekOffset * 7);
    const letters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const planDay = planByDate[iso] ?? null;
      let status: WeekDayStatus = 'plan';
      if (planDay) {
        if (planDay.status === 'completed') status = 'done';
        else if (planDay.status === 'today') status = 'today';
        else if (planDay.status === 'rest') status = 'rest';
        else if (planDay.status === 'skipped') status = 'skipped';
      } else {
        const isToday = d.toDateString() === today.toDateString();
        if (isToday) status = 'today';
        else status = 'rest';
      }
      return {
        letter: letters[i],
        date: String(d.getDate()),
        iso,
        status,
        planDay,
      };
    });
  }, [planByDate, weekOffset]);

  const calendarDays = useMemo<WeekCalendarDay[]>(
    () => calendarCells.map(({ letter, date, status }) => ({ letter, date, status })),
    [calendarCells]
  );

  // Auto-select today when offset = 0 on first render
  React.useEffect(() => {
    if (selectedDayIndex !== null) return;
    const todayIdx = calendarDays.findIndex((d) => d.status === 'today');
    if (todayIdx >= 0) setSelectedDayIndex(todayIdx);
  }, [calendarDays, selectedDayIndex]);

  const weekRangeLabel = useMemo(() => {
    const today = new Date();
    const todayDow = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayDow + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'short' })}`;
    return `${monday.getDate()} — ${fmt(sunday)}`;
  }, [weekOffset]);

  const weekOffsetLabel = useMemo(() => {
    if (weekOffset === 0) return 'Cette semaine';
    if (weekOffset < 0) return `Il y a ${-weekOffset} sem.`;
    return `Dans ${weekOffset} sem.`;
  }, [weekOffset]);

  // ─── Stats for QuickStatsRow ──────────────────────────────────
  const { currentStreak, bestStreak } = useStreak();
  const weeklyVolumeKg = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return Math.round(
      recentWorkouts
        .filter((w) => new Date(w.date) >= cutoff)
        .reduce(
          (acc, w) =>
            acc +
            w.exercises.reduce(
              (s, ex) => s + ex.sets.reduce((ss, set) => ss + (set.weight ?? 0) * (set.reps ?? 0), 0),
              0
            ),
          0
        )
    );
  }, [recentWorkouts]);

  // ─── Selected day card data (driven by the SELECTED day, not today) ─
  const selectedCell = selectedDayIndex !== null ? calendarCells[selectedDayIndex] ?? null : null;
  const allWorkouts = useTrainingStore((s) => s.workouts);

  // Cible de volume hebdo = basée sur l'HISTORIQUE RÉEL de l'user, pas
  // une constante arbitraire (avant : daysPerWeek × 4500, qui ne tenait
  // compte ni du niveau, ni de la force réelle de l'user — un squatteur
  // à 130kg et un débutant à 40kg avaient la même cible).
  //
  // Logique "coach" :
  //  - Si l'user a un historique sur les 4 dernières semaines → on prend
  //    sa moyenne hebdo et on applique une surcharge progressive +5%
  //    ("tu as fait 18t la semaine dernière, vise ~19t").
  //  - Sinon (nouvel user) → fallback basé sur le NIVEAU × daysPerWeek,
  //    qui scale au moins avec l'expérience au lieu d'un chiffre fixe.
  const weeklyVolumeTargetKg = useMemo(() => {
    if (!activeProgram) return 0;

    // Somme du volume sur les 28 derniers jours
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28);
    let total = 0;
    let hasData = false;
    for (const [iso, list] of Object.entries(allWorkouts)) {
      if (new Date(iso) < cutoff) continue;
      for (const w of list ?? []) {
        for (const ex of w.exercises) {
          for (const set of ex.sets) {
            total += (set.weight ?? 0) * (set.reps ?? 0);
          }
        }
        hasData = true;
      }
    }

    if (hasData && total > 0) {
      const avgWeekly = total / 4;
      return Math.round(avgWeekly * 1.05); // surcharge progressive +5%
    }

    // Fallback nouvel user : baseline par niveau (kg/séance) × fréquence
    const perSessionByLevel: Record<string, number> = {
      beginner: 3000,
      intermediate: 4500,
      advanced: 6000,
      expert: 7000,
    };
    const base = perSessionByLevel[profile?.trainingLevel ?? 'intermediate'] ?? 4500;
    return activeProgram.daysPerWeek * base;
  }, [activeProgram, allWorkouts, profile?.trainingLevel]);

  // ProgramDay for the selected date — applies overrides from replaceExerciseInDay.
  // activePlan is in deps so swaps re-trigger this when overrides change.
  const selectedProgramDay = useMemo(() => {
    if (!selectedCell?.planDay?.programDayId || !activeProgram) return null;
    return (
      getProgramDayForDate(selectedCell.iso) ??
      getProgramDayById(activeProgram.id, selectedCell.planDay.programDayId)
    );
  }, [selectedCell, activeProgram, getProgramDayForDate, activePlan?.exerciseOverrides]);

  // Workout that completed the selected day (for "Voir le résumé" + volumeKg).
  const selectedDayWorkout = useMemo(() => {
    if (!selectedCell || selectedCell.status !== 'done') return null;
    const list = allWorkouts[selectedCell.iso] ?? [];
    const id = selectedCell.planDay?.workoutId;
    return id ? list.find((w) => w.id === id) ?? list[0] ?? null : list[0] ?? null;
  }, [selectedCell, allWorkouts]);

  const selectedDayCardData = useMemo(() => {
    const status = selectedCell?.status ?? 'plan';
    const isSelectedToday = status === 'today';
    const isSelectedDone = status === 'done';
    const isSelectedRest = status === 'rest';

    let state: SelectedDayState = 'plan';
    if (isSelectedRest) state = 'rest';
    else if (isSelectedDone) state = 'done';
    else if (isSelectedToday) state = 'today';

    const sectionLabel = isSelectedToday
      ? (t('trainingSectionToday' as any) as string)
      : isSelectedDone
      ? (t('trainingSectionDone' as any) as string)
      : isSelectedRest
      ? (t('trainingSectionRest' as any) as string)
      : (t('trainingSectionScheduled' as any) as string);

    const typeLabel = selectedProgramDay ? t(selectedProgramDay.nameKey as any) : '';
    const durationMin = selectedProgramDay
      ? estimateSessionMinutes(selectedProgramDay)
      : selectedDayWorkout?.durationMinutes ?? 0;

    let title = selectedProgramDay
      ? selectedProgramDay.muscleGroups.map((g) => t(`muscle_${g}` as any)).join(' & ')
      : typeLabel;
    if (isSelectedDone && !selectedProgramDay && selectedDayWorkout) {
      title = selectedDayWorkout.name ?? t('workoutLabel');
    }

    // Build exercise list. For cardio days, surface the cardio block as a single row
    // so the user always sees what the day contains.
    let exercisesPreview: SelectedDayExercise[] | undefined;
    if (selectedProgramDay) {
      if (selectedProgramDay.exercises.length > 0) {
        exercisesPreview = selectedProgramDay.exercises.map((e) => {
          const ex = EXERCISES[e.exerciseId];
          return {
            id: e.exerciseId,
            name: ex?.nameKey ? t(ex.nameKey as any) : e.exerciseId,
            sets: e.targetSets,
            reps: String(e.targetReps),
            restSec: e.restSeconds,
          };
        });
      } else if (selectedProgramDay.cardio) {
        const cardio = selectedProgramDay.cardio;
        exercisesPreview = [
          {
            id: cardio.exerciseId,
            name: t(EXERCISES[cardio.exerciseId]?.nameKey as any) || cardio.exerciseId,
            sets: 1,
            reps: `${cardio.durationMinutes} min`,
          },
        ];
      }
    }

    const volumeKg = selectedDayWorkout
      ? Math.round(
          selectedDayWorkout.exercises.reduce(
            (acc, ex) => acc + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0),
            0
          )
        )
      : undefined;

    return {
      state,
      sectionLabel,
      typeLabel,
      durationMin,
      title,
      intentionQuote: isSelectedToday
        ? `Consolider ta séance ${typeLabel.toLowerCase()}. On garde l'intensité, on soigne l'exécution.`
        : undefined,
      muscleChips: selectedProgramDay?.muscleGroups.map((g) => t(`muscle_${g}` as any)),
      muscleGroups: selectedProgramDay?.muscleGroups,
      exercisesPreview,
      totalExercises: selectedProgramDay?.exercises.length,
      volumeKg,
    };
  }, [selectedCell, selectedProgramDay, selectedDayWorkout, t]);

  // ─── Header data for the new TrainingHero ────────────────────
  const heroData = useMemo(() => {
    const date = new Date();
    const dateLabel = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const programName = activeProgram ? t(activeProgram.nameKey as any) : t('selectProgram' as any);
    // Durée réelle du plan (et non 8 hardcodé). generatePlan produit
    // 28 jours = 4 semaines ; afficher "/ 8" trompait l'user qui croyait
    // avoir 8 semaines puis voyait le programme finir à la semaine 4.
    // On dérive depuis le plan pour rester juste même si la durée change.
    const totalWeeks = activePlan ? Math.max(1, Math.ceil(activePlan.days.length / 7)) : 4;
    const weekLabel = hasActivePlan ? `Semaine ${currentWeek} / ${totalWeeks}` : '';
    const subtitle = todayProgramDay
      ? `${t(todayProgramDay.nameKey as any)} · ${estimateSessionMinutes(todayProgramDay)} min prévues`
      : todayPlan?.status === 'rest'
      ? 'Jour de repos'
      : 'Pas de séance';
    return { dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1), programName, weekLabel, subtitle };
  }, [activeProgram, currentWeek, hasActivePlan, todayPlan, todayProgramDay, t]);

  // Skip the SELECTED day (not just today). Falls back to today.
  const handleSkipDay = () => {
    const date = selectedCell?.iso ?? todayPlan?.date;
    if (!date) return;
    triggerHaptic();
    markDaySkipped(date);
  };

  // État du popup pré-séance — ouvert quand l'user tap "Commencer la
  // séance", fermé une fois qu'il a choisi son état (ou skip).
  const [showCheckIn, setShowCheckIn] = useState(false);

  const handleStartWorkout = () => {
    if (!todayPlan || !todayProgramDay) return;
    triggerHaptic();
    // Avant : on lançait direct la séance. Maintenant on demande
    // d'abord à l'user comment il se sent → ajustement charge.
    setShowCheckIn(true);
  };

  // Appelé par le popup quand l'user a confirmé son état (ou skip).
  // `loadMultiplier` : 0.85 (plomb) → 1.08 (or). Passé en query param
  // à active-workout qui ajustera les charges proposées.
  const handleCheckInConfirmed = (result: PreWorkoutCheckInResult) => {
    setShowCheckIn(false);
    if (!todayPlan || !todayProgramDay) return;
    router.push({
      pathname: '/active-workout',
      params: {
        programDayId: todayPlan.programDayId ?? '',
        date: todayPlan.date,
        programId: hasActivePlan ? (activeProgram?.id ?? '') : '',
        // Multiplicateur appliqué aux charges suggérées (1.0 = neutre)
        loadMultiplier: String(result.loadMultiplier),
        // État de forme pour log + contexte coach
        metalId: result.metalId,
      },
    });
  };

  // Move the selected planned day to today by swapping the two dates' content.
  const handleMoveUp = () => {
    if (!selectedCell || !todayPlan || selectedCell.iso === todayPlan.date) return;
    triggerHaptic();
    swapPlannedDays(todayPlan.date, selectedCell.iso);
    // After swap, jump the calendar selection to today so the user sees the moved session.
    const todayIdx = calendarCells.findIndex((c) => c.status === 'today');
    if (todayIdx >= 0) setSelectedDayIndex(todayIdx);
  };

  // Open workout-detail for the done session.
  const handleSeeSummary = () => {
    if (!selectedDayWorkout || !selectedCell) return;
    triggerHaptic();
    router.push({
      pathname: '/workout-detail',
      params: { workoutId: selectedDayWorkout.id, date: selectedCell.iso },
    });
  };

  // Duplicate the done session: clone the workout to today's date.
  const handleDuplicate = () => {
    if (!selectedDayWorkout) return;
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const performAction = () => {
      const newId = duplicateWorkoutToDate(selectedDayWorkout.id, todayIso);
      if (newId) {
        triggerHaptic();
        router.push({ pathname: '/workout-detail', params: { workoutId: newId, date: todayIso } });
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Dupliquer cette séance pour aujourd’hui ?')) performAction();
      return;
    }
    Alert.alert(
      'Dupliquer la séance ?',
      'Une copie identique sera enregistrée à la date d’aujourd’hui.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Dupliquer', style: 'default', onPress: performAction },
      ]
    );
  };

  const handleReplacePick = (pick: SubstituteOption) => {
    if (!replaceTarget || !selectedCell) return;
    triggerHaptic();
    replaceExerciseInDay(selectedCell.iso, replaceTarget.id, pick.id);
  };

  // Build the action sheet rows based on the selected day's state.
  const sessionActions: SessionAction[] = useMemo(() => {
    const acts: SessionAction[] = [];
    const status = selectedCell?.status ?? 'plan';

    if (status === 'today') {
      acts.push({
        id: 'preview',
        label: 'Voir tous les exercices',
        description: `${selectedProgramDay?.exercises.length ?? 0} exercices, tap pour remplacer`,
        icon: 'eye',
        onPress: () => setActiveSheet('preview'),
      });
      acts.push({
        id: 'skip',
        label: 'Sauter la séance',
        description: 'Marquer comme skippée — ne casse pas le streak',
        icon: 'skip',
        onPress: handleSkipDay,
      });
    } else if (status === 'plan') {
      acts.push({
        id: 'moveUp',
        label: 'Avancer à aujourd’hui',
        description: 'Échange le contenu avec la séance du jour',
        icon: 'up',
        disabled: !todayPlan,
        onPress: handleMoveUp,
      });
      acts.push({
        id: 'preview',
        label: 'Voir tous les exercices',
        description: `${selectedProgramDay?.exercises.length ?? 0} exercices`,
        icon: 'eye',
        onPress: () => setActiveSheet('preview'),
      });
      acts.push({
        id: 'skip',
        label: 'Sauter cette séance',
        description: 'Marquer comme skippée',
        icon: 'skip',
        onPress: handleSkipDay,
      });
    } else if (status === 'done' && selectedDayWorkout) {
      acts.push({
        id: 'summary',
        label: 'Voir le résumé',
        description: 'Détail des séries, volume, durée',
        icon: 'eye',
        onPress: handleSeeSummary,
      });
      acts.push({
        id: 'duplicate',
        label: 'Dupliquer pour aujourd’hui',
        description: 'Clone cette séance avec ses séries',
        icon: 'replace',
        onPress: handleDuplicate,
      });
    }
    return acts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, selectedProgramDay, selectedDayWorkout, todayPlan]);

  return (
    <View style={styles.container}>
      {/* New Hero v2 — full bleed image + program pill + history button + date block */}
      <TrainingHero
        weekLabel={heroData.weekLabel || (hasActivePlan ? '' : ' ')}
        dateLabel={heroData.dateLabel}
        subtitle={heroData.subtitle}
        programName={heroData.programName}
        onProgramPress={() => {
          triggerHaptic();
          setActiveSheet('program');
        }}
        onHistoryPress={() => {
          triggerHaptic();
          setActiveSheet('history');
        }}
      />

    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { maxWidth: contentMaxWidth, paddingBottom: insets.bottom + FLOATING_TABBAR_HEIGHT + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Week navigator + 7-day calendar (always shown when a plan exists) */}
      {hasActivePlan && !isPlanExpired && (
        <View style={{ paddingTop: 18 }}>
          <WeekNavigator
            label={weekOffsetLabel}
            rangeLabel={weekRangeLabel}
            onPrev={() => setWeekOffset((w) => w - 1)}
            onNext={() => setWeekOffset((w) => w + 1)}
          />
          <WeekDayCalendar
            days={calendarDays}
            selectedIndex={selectedDayIndex ?? 0}
            onSelect={(i) => setSelectedDayIndex(i)}
          />
        </View>
      )}

      {!hasActivePlan || isPlanExpired ? (
        /* ── Mode A: Program Selection ── */
        <Animated.View entering={FadeInDown.duration(400)}>
          {/* Fin de cycle : bilan valorisant + reco niveau suivant (1 tap).
              Remplace l'ancien bandeau brut "Programme terminé". */}
          {isPlanExpired && !showFullSelector && (
            <CycleCompleteCard
              onStartNext={(programId) => {
                triggerHaptic();
                selectProgram(programId, objective, profile?.sex);
              }}
              onChooseOther={() => setShowFullSelector(true)}
            />
          )}

          {/* New user with no training profile \u2192 guided 5-step wizard
              (objectif / niveau / dispo / lieu / calibration).
              Returning user OR after expired plan \u2192 direct program list.
              En fin de cycle, on N'AFFICHE le s\u00e9lecteur QUE si l'user a
              tap\u00e9 "choisir un autre" (sinon la CycleCompleteCard suffit). */}
          {(!isPlanExpired || showFullSelector) && (
          !profile?.trainingLevel && !isPlanExpired ? (
            <TrainingSetupWizard
              objective={objective}
              sex={profile?.sex ?? 'male'}
              age={profile?.age ?? 25}
              bodyweightKg={profile?.currentWeight}
              onConfirm={(programId, finalObjective, level, frequency, equipment, location, strengthTest) => {
                triggerHaptic();
                // Persist toutes les dimensions choisies dans le wizard.
                // L'objective peut avoir \u00e9t\u00e9 modifi\u00e9 par l'user \u00e0 l'\u00e9tape 1
                // (diff\u00e9rent de celui pos\u00e9 \u00e0 l'inscription).
                updateProfile({
                  objective: finalObjective,
                  trainingLevel: level,
                  trainingFrequency: frequency,
                  equipmentAccess: equipment,
                  trainingLocation: location,
                });
                // Si le test calibration a \u00e9t\u00e9 fait \u2192 sauvegarder dans
                // le profil pour alimenter estimateOneRMForExercise.
                if (strengthTest) {
                  useUserStore.getState().setStrengthTest(strengthTest);
                }
                selectProgram(programId, finalObjective);
              }}
              onBrowseAll={() => {
                triggerHaptic();
                // User skips le wizard \u2014 d\u00e9fauts conservateurs : d\u00e9butant
                // 3j salle. Au prochain visit, le wizard ne se relancera
                // pas car trainingLevel est set.
                updateProfile({
                  trainingLevel: 'beginner',
                  trainingFrequency: 3,
                  equipmentAccess: 'full_gym',
                  trainingLocation: 'gym',
                });
              }}
            />
          ) : (
            <ProgramSelector
              recommendedId={recommendedProgramId}
              objective={objective}
              onSelect={selectProgram}
            />
          ))}

          {/* Manual workout always accessible */}
          <Pressable
            style={styles.manualBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/log-workout');
            }}
          >
            <Text style={styles.manualBtnText}>
              {t('logManualWorkout')} {'\u2192'}
            </Text>
          </Pressable>
        </Animated.View>
      ) : (
        /* ── Mode B: Active Plan (V2 design) ── */
        <>
          {/* Quick stats row : 3 mini cards (Volume / Sessions / Streak) */}
          <QuickStatsRow
            onPress={() => {
              triggerHaptic();
              setActiveSheet('stats');
            }}
            items={[
              {
                id: 'volume',
                label: 'Volume',
                value: weeklyVolumeKg >= 1000 ? (weeklyVolumeKg / 1000).toFixed(1) : String(weeklyVolumeKg),
                unit: weeklyVolumeKg >= 1000 ? 'k' : 'kg',
                hint: weeklyVolumeTargetKg > 0 ? `${Math.round((weeklyVolumeKg / weeklyVolumeTargetKg) * 100)}% obj.` : undefined,
              },
              {
                id: 'sessions',
                label: 'Séances',
                value: String(weeklyCount),
                unit: hasActivePlan && activeProgram ? `/${activeProgram.daysPerWeek}` : undefined,
                hint: weeklyCount > 0 ? 'Sur les rails' : undefined,
                hintColor: 'rgba(255,255,255,0.38)',
              },
              {
                id: 'streak',
                label: 'Streak',
                value: String(currentStreak),
                unit: 'j',
                hint: currentStreak >= bestStreak && currentStreak > 0 ? 'Record ✦' : undefined,
                hintColor: 'rgba(255,255,255,0.38)',
              },
            ]}
          />

          {/* Section label for the selected-day card */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            {selectedDayCardData.sectionLabel}
          </Text>

          {/* Calibration force — proéminente si pas encore faite (CTA
              gros + couleur primary), discrète sinon (lien "Refaire le
              test"). Sans calibration, les poids proposés en séance
              sont des estimations grossières sur le poids du corps. */}
          {!strengthTest ? (
            <Pressable
              onPress={() => router.push('/calibration-test')}
              style={styles.calibrationCtaMain}
            >
              <View style={styles.calibrationIconWrap}>
                <Text style={styles.calibrationIcon}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calibrationTitle}>
                  {t('calibrationCtaTitle' as any)}
                </Text>
                <Text style={styles.calibrationSub}>
                  {t('calibrationCtaSub' as any)}
                </Text>
              </View>
              <Text style={styles.calibrationArrow}>›</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/calibration-test')}
              style={styles.calibrationCtaSecondary}
            >
              <Text style={styles.calibrationSecondaryText}>
                {t('calibrationCtaRedo' as any)}
              </Text>
            </Pressable>
          )}

          {/* Selected day card — switches between today / done / rest / plan */}
          <SelectedDayCard
            state={selectedDayCardData.state}
            typeLabel={selectedDayCardData.typeLabel}
            durationMin={selectedDayCardData.durationMin}
            title={selectedDayCardData.title}
            intentionQuote={selectedDayCardData.intentionQuote}
            muscleChips={selectedDayCardData.muscleChips}
            muscleGroups={selectedDayCardData.muscleGroups}
            exercisesPreview={selectedDayCardData.exercisesPreview}
            totalExercises={selectedDayCardData.totalExercises}
            volumeKg={selectedDayCardData.volumeKg}
            onStart={handleStartWorkout}
            onActions={() => {
              triggerHaptic();
              setActiveSheet('actions');
            }}
            onSeeAll={() => {
              triggerHaptic();
              setActiveSheet('preview');
            }}
            onMoveUp={handleMoveUp}
            onSkip={handleSkipDay}
            onSeeSummary={handleSeeSummary}
            onDuplicate={handleDuplicate}
            onForceWorkout={() => router.push('/log-workout')}
            onEmptyStateCta={() => {
              triggerHaptic();
              router.push('/log-workout');
            }}
            emptyStateCtaLabel="Logger une séance manuelle"
            onExercisePress={(ex) => {
              triggerHaptic();
              setReplaceTarget(ex);
              setActiveSheet('replace');
            }}
          />

          {/* Quick Stats (legacy — kept while history list lives below) */}
          {recentWorkouts.length > 0 && (
            <Animated.View >
              <QuickStats
                weeklyCount={weeklyCount}
                monthlyCount={monthlyCount}
                favoriteType={favoriteType}
              />
            </Animated.View>
          )}

          {/* Recent history — redesign list */}
          {recentWorkouts.length > 0 ? (
            <Animated.View  style={{ marginTop: spacing.md }}>
              <Text style={styles.sectionTitle}>{t('recentWorkouts')}</Text>
              <SessionHistoryList
                items={recentWorkouts.slice(0, 5).map<SessionHistoryItem>((w) => {
                  const date = new Date(w.date);
                  const today = new Date();
                  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  const dateLabel = diffDays === 0 ? 'Aujourd\'hui' : diffDays === 1 ? 'Hier' : diffDays === 2 ? 'Avant-hier' : `Il y a ${diffDays}j`;
                  const totalVol = w.exercises.reduce((acc, ex) => acc + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0), 0);
                  return {
                    id: w.id,
                    name: w.name ?? t('workoutLabel'),
                    dateLabel: `${dateLabel} · ${w.durationMinutes ?? '—'} min`,
                    volumeLabel: totalVol > 0 ? `${totalVol.toLocaleString('fr-FR')} kg vol` : '',
                    onPress: () => router.push({ pathname: '/workout-detail', params: { workoutId: w.id, date: w.date } }),
                  };
                })}
              />
            </Animated.View>
          ) : (
            <Animated.View >
              <EmptyState
                icon={'\uD83D\uDCAA'}
                title={t('noWorkoutsYet')}
                subtitle={t('noWorkoutsYetSub')}
                actionLabel={t('logManualWorkout')}
                onAction={() => router.push('/log-workout')}
              />
            </Animated.View>
          )}

          {/* Manual workout button */}
          <Animated.View >
            <Pressable
              style={styles.manualBtn}
              onPress={() => {
                triggerHaptic();
                router.push('/log-workout');
              }}
            >
              <Text style={styles.manualBtnText}>
                {t('logManualWorkout')} {'\u2192'}
              </Text>
            </Pressable>
          </Animated.View>
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>

    {/* ─── Sheets ───────────────────────────────────── */}
    <ProgramSelectorSheet
      open={activeSheet === 'program'}
      onClose={() => setActiveSheet(null)}
      programs={PROGRAM_IDS
        .map((id) => PROGRAMS[id])
        .filter((p) => {
          if (!p) return false;
          if (!p.sexVariant || p.sexVariant === 'unisex') return true;
          return p.sexVariant === profile?.sex;
        })}
      currentId={activeProgram?.id}
      recommendedId={recommendedProgramId}
      onSelect={(id) => {
        triggerHaptic();
        selectProgram(id, objective);
      }}
      t={t as unknown as (key: string) => string}
      userSex={profile?.sex}
    />

    <HistorySheet
      open={activeSheet === 'history'}
      onClose={() => setActiveSheet(null)}
      items={recentWorkouts.slice(0, 30).map<HistoryItem>((w) => {
        const date = new Date(w.date);
        const today = new Date();
        const diffDays = Math.round((today.getTime() - date.getTime()) / 86400000);
        const dateLabel =
          diffDays === 0 ? "Aujourd'hui"
          : diffDays === 1 ? 'Hier'
          : diffDays === 2 ? 'Avant-hier'
          : `Il y a ${diffDays}j`;
        const totalVol = w.exercises.reduce(
          (acc, ex) => acc + ex.sets.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0),
          0
        );
        return {
          id: w.id,
          name: w.name ?? t('workoutLabel'),
          dateLabel: `${dateLabel} · ${w.durationMinutes ?? '—'} min`,
          volumeLabel: totalVol > 0 ? `${totalVol.toLocaleString('fr-FR')} kg` : '',
          onPress: () => router.push({ pathname: '/workout-detail', params: { workoutId: w.id, date: w.date } }),
        };
      })}
    />

    <ReplaceExerciseSheet
      open={activeSheet === 'replace'}
      onClose={() => {
        setActiveSheet(null);
        setReplaceTarget(null);
      }}
      originalName={replaceTarget?.name}
      substitutes={replaceTarget ? buildSubstitutesFor(replaceTarget) : []}
      onPick={handleReplacePick}
    />

    <SessionActionsSheet
      open={activeSheet === 'actions'}
      onClose={() => setActiveSheet(null)}
      title={selectedDayCardData.title || 'Actions de séance'}
      subtitle={selectedDayCardData.sectionLabel}
      actions={sessionActions}
    />

    <SessionPreviewSheet
      open={activeSheet === 'preview'}
      onClose={() => setActiveSheet(null)}
      title={selectedDayCardData.title || 'Séance'}
      exercises={selectedDayCardData.exercisesPreview ?? []}
      onExercisePress={(ex) => {
        setReplaceTarget(ex);
        setActiveSheet('replace');
      }}
    />

    <StatsSheet
      open={activeSheet === 'stats'}
      onClose={() => setActiveSheet(null)}
      weeklyVolumeKg={weeklyVolumeKg}
      weeklyVolumeTargetKg={weeklyVolumeTargetKg}
      weeklyCount={weeklyCount}
      weeklyTarget={activeProgram?.daysPerWeek ?? 4}
      monthlyCount={monthlyCount}
      totalDurationMin={recentWorkouts.reduce((a, w) => a + (w.durationMinutes ?? 0), 0)}
      currentStreak={currentStreak}
      bestStreak={bestStreak}
    />

    {/* Popup pré-séance — capture l'état de l'user avant de lancer
        la séance pour adapter la charge (-15% si épuisé, +8% si en
        super forme). Remplace l'ancien Morning Ritual du Home. */}
    <PreWorkoutCheckInModal
      visible={showCheckIn}
      onClose={() => setShowCheckIn(false)}
      onConfirm={handleCheckInConfirmed}
    />
    </View>
  );
}

/** Wrapper around the shared substitutes util — adapts SelectedDayExercise to the util's input shape. */
function buildSubstitutesFor(target: SelectedDayExercise): SubstituteOption[] {
  return buildSubstitutesForId({ id: target.id, sets: target.sets, reps: target.reps });
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center' as const,
    width: '100%' as any,
  },
  headerBg: {
    width: '100%',
    height: 140,
    marginBottom: spacing.lg,
  },
  headerBgImage: {
    borderRadius: borderRadius.xl,
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.white,
  },
  weekBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 1,
  },
  expiredBanner: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  expiredTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  expiredSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  /** Calibration CTA gros — affiché quand l'user n'a pas encore fait
   *  le test. Card primaire avec dégradé subtil + icône éclair. */
  calibrationCtaMain: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  calibrationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  calibrationIcon: {
    fontSize: 22,
  },
  calibrationTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text,
  },
  calibrationSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSizes.sm * 1.35,
  },
  calibrationArrow: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  /** Variante discrète — affichée quand le test a déjà été fait.
   *  Simple lien pour permettre de refaire le test si l'user a
   *  progressé / régressé. */
  calibrationCtaSecondary: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
  },
  calibrationSecondaryText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },
  manualBtn: {
    alignSelf: 'center' as const,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  manualBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
}));
