import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { getProgramDayById } from '../src/data/programs';
import { EXERCISES } from '../src/data/exercises';
import { hasTutorial } from '../src/data/exerciseTips';
import { ExerciseTutorialModal } from '../src/components/training/ExerciseTutorialModal';
import { useTrainingStore } from '../src/store/trainingStore';
import { syncWorkout } from '../src/services/userSync';
import { useAuthStore } from '../src/store/authStore';
import { useProgramStore } from '../src/store/programStore';
import { useUserStore } from '../src/store/userStore';
import { getRestConfig, formatRestTime as fmtRest } from '../src/engine/restEngine';
import { RestCircleTimer } from '../src/components/training/RestCircleTimer';
import { SessionForgee } from '../src/components/training/SessionForgee';
import { LiveCoachIntervention, type LiveCoachKind } from '../src/components/coach/LiveCoachIntervention';
import { WorkoutTopBar } from '../src/components/training/WorkoutTopBar';
import { ExerciseHeader } from '../src/components/training/ExerciseHeader';
import { ExerciseDemoCard } from '../src/components/training/ExerciseDemoCard';
import { FormCuesCard } from '../src/components/training/FormCuesCard';
import { SetCardV2, type SetCardState } from '../src/components/training/SetCardV2';
import { PrNearAlert } from '../src/components/training/PrNearAlert';
import type { ProgramExercise } from '../src/types/program';
import type { Workout, WorkoutExercise, ExerciseSet, WorkoutType } from '../src/types/training';
import Svg, { Path } from 'react-native-svg';

const CARDIO_TYPE_MAP: Record<string, WorkoutType> = {
  cycling: 'cycling',
  hiit: 'hiit',
  running: 'running',
  swimming: 'swimming',
  marche: 'marche',
};

// Form cues per exercise — 3 short execution tips
const FORM_CUES: Record<string, string[]> = {
  bench_press: [
    'Dos plaqué, omoplates serrées',
    'Pieds ancrés, fessiers contractés',
    'Descente contrôlée · 2 sec',
  ],
  squat: [
    'Pieds largeur épaules, légèrement ouverts',
    'Genoux dans l\'axe des pieds',
    'Descends jusqu\'à parallèle',
  ],
  deadlift: [
    'Dos neutre, gainage activé',
    'Barre proche du tibia, pousse le sol',
    'Hanches et épaules montent ensemble',
  ],
  overhead_press: [
    'Coudes légèrement en avant',
    'Pousse à la verticale, pas vers l\'avant',
    'Gainage ferme, fesses contractées',
  ],
  barbell_rows: [
    'Dos parallèle au sol',
    'Tire vers le bas du sternum',
    'Coudes près du corps',
  ],
  pull_ups: [
    'Démarre bras tendus, contrôle la descente',
    'Tire en serrant les omoplates',
    'Menton au-dessus de la barre',
  ],
  hip_thrust: [
    'Talons sous les genoux',
    'Pousse par les talons, contracte les fessiers en haut',
    'Descente contrôlée · 2 sec',
  ],
  romanian_deadlift: [
    'Genoux légèrement fléchis, fixes',
    'Hanches en arrière, dos neutre',
    'Sentir l\'étirement des ischios',
  ],
};

const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => {
    if (style === 'success') {
      H.notificationAsync(H.NotificationFeedbackType.Success);
    } else {
      const s = style === 'medium'
        ? H.ImpactFeedbackStyle.Medium
        : H.ImpactFeedbackStyle.Light;
      H.impactAsync(s);
    }
  }).catch(() => {});
};

interface ActiveSet {
  id: string;
  targetReps: number;
  actualReps: string;
  weight: string;
  completed: boolean;
}

interface ActiveExercise {
  exerciseId: string;
  nameKey: string;
  programExercise: ProgramExercise;
  sets: ActiveSet[];
  weightTip?: string;
  adjustedReps: number;
  adjustedSets: number;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const params = useLocalSearchParams<{
    programDayId: string;
    date: string;
    programId: string;
  }>();

  const addWorkout = useTrainingStore((s) => s.addWorkout);
  const markDayCompleted = useProgramStore((s) => s.markDayCompleted);
  const getLastSession = useTrainingStore((s) => s.getLastSessionForExercise);
  const userId = useAuthStore((s) => s.session?.user?.id);
  const objective = useUserStore((s) => s.profile?.objective ?? 'maintain');
  const profile = useUserStore((s) => s.profile);

  const programDay = useMemo(
    () => getProgramDayById(params.programId, params.programDayId),
    [params.programId, params.programDayId]
  );

  const isCardio = programDay?.type === 'cardio';

  // Tutorial modal
  const [tutorialExerciseId, setTutorialExerciseId] = useState<string | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0);
  const [restTotalSeconds, setRestTotalSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restReasonKey, setRestReasonKey] = useState('');
  const [isTransitionRest, setIsTransitionRest] = useState(false);
  const [prAlert, setPrAlert] = useState<string | null>(null);
  const [showWorkoutGuide, setShowWorkoutGuide] = useState(false);
  const [showFinisherCardio, setShowFinisherCardio] = useState(false);
  const [showSessionForgee, setShowSessionForgee] = useState(false);
  const [forgeeStats, setForgeeStats] = useState({ durationMin: 0, volumeKg: 0, prCount: 0 });
  const [liveCoach, setLiveCoach] = useState<LiveCoachKind | null>(null);
  const liveCoachShownRef = useRef<Set<string>>(new Set());
  const [finisherTimer, setFinisherTimer] = useState(0);
  const [finisherRunning, setFinisherRunning] = useState(false);
  const [finisherLevel, setFinisherLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const finisherRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const FINISHER_LEVELS = {
    beginner: { minutes: 10, labelKey: 'finisherBeginner', descKey: 'finisherBeginnerDesc' },
    intermediate: { minutes: 15, labelKey: 'finisherIntermediate', descKey: 'finisherIntermediateDesc' },
    advanced: { minutes: 20, labelKey: 'finisherAdvanced', descKey: 'finisherAdvancedDesc' },
  };

  // Show guide only on first ever workout
  useEffect(() => {
    AsyncStorage.getItem('forga-workout-guide-seen').then((seen) => {
      if (!seen) setShowWorkoutGuide(true);
    });
  }, []);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRestTimer = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    setRestTotalSeconds(seconds);
    setIsResting(true);
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current!);
          setIsResting(false);
          triggerHaptic('medium');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const skipRest = useCallback(() => {
    if (restRef.current) clearInterval(restRef.current);
    setIsResting(false);
    setRestSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, []);

  // Build active exercises from program day
  const [exercises, setExercises] = useState<ActiveExercise[]>(() => {
    if (!programDay || isCardio) return [];

    return programDay.exercises.map((pe) => {
      const exercise = EXERCISES[pe.exerciseId];
      const lastSession = getLastSession(pe.exerciseId);
      const lastWeight = lastSession?.[0]?.weight ?? 0;

      // Adjust reps based on user objective
      let adjustedReps = pe.targetReps;
      const isCompound = exercise?.isCompound ?? false;
      if (objective === 'bulk' && isCompound) {
        adjustedReps = Math.max(4, pe.targetReps - 2);
      } else if (objective === 'cut') {
        adjustedReps = pe.targetReps + 2;
      }

      // Smart weight suggestion
      let suggestedWeight = lastWeight;
      let weightTip = '';

      if (lastWeight > 0 && lastSession) {
        const allRepsHit = lastSession.every((s) => s.reps >= adjustedReps);
        if (allRepsHit) {
          const increment = isCompound ? 2.5 : 1;
          suggestedWeight = lastWeight + increment;
          weightTip = `+${increment}kg vs last`;
        } else {
          weightTip = t('weightTipSameWeight' as any);
        }
      } else {
        weightTip = isCompound
          ? t('weightTipCompound' as any)
          : t('weightTipIsolation' as any);
      }

      const sets: ActiveSet[] = Array.from({ length: pe.targetSets }, (_, i) => ({
        id: `s_${pe.exerciseId}_${i}`,
        targetReps: adjustedReps,
        actualReps: String(adjustedReps),
        weight: suggestedWeight > 0 ? String(suggestedWeight) : '',
        completed: false,
      }));

      return {
        exerciseId: pe.exerciseId,
        nameKey: exercise?.nameKey ?? pe.exerciseId,
        weightTip,
        adjustedReps,
        adjustedSets: pe.targetSets,
        programExercise: pe,
        sets,
      };
    });
  });

  const updateSet = useCallback(
    (exIdx: number, setIdx: number, field: 'actualReps' | 'weight', value: string) => {
      setExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
        ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: value };
        next[exIdx] = ex;
        return next;
      });
    },
    []
  );

  const toggleSet = useCallback(
    (exIdx: number, setIdx: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
        const set = ex.sets[setIdx];
        const wasCompleted = set.completed;

        // Block completing a set with 0 or empty reps
        if (!wasCompleted) {
          const reps = parseInt(set.actualReps || '0', 10);
          if (reps <= 0) return prev; // Don't complete
        }

        ex.sets[setIdx] = { ...set, completed: !wasCompleted };
        next[exIdx] = ex;
        return next;
      });

      const set = exercises[exIdx]?.sets[setIdx];
      if (set && !set.completed) {
        triggerHaptic('medium');

        // Check for new Personal Record
        const weight = parseFloat(set.weight || '0');
        const exerciseId = exercises[exIdx]?.exerciseId;
        if (weight > 0 && exerciseId) {
          const isNewPR = useTrainingStore.getState().isNewPR(exerciseId, weight);
          if (isNewPR) {
            triggerHaptic('success');
            setPrAlert(exerciseId);
            setTimeout(() => setPrAlert(null), 3000);
          }
        }

        const ex = exercises[exIdx];
        const config = getRestConfig(ex.exerciseId, ex.programExercise.targetReps, objective);

        // Check if all sets of this exercise are now done → transition rest
        const updatedSets = exercises[exIdx].sets.map((s, i) =>
          i === setIdx ? { ...s, completed: true } : s
        );
        const allSetsDone = updatedSets.every((s) => s.completed);
        const isLastExercise = exIdx === exercises.length - 1;

        if (allSetsDone && !isLastExercise) {
          // Transition rest between exercises
          setIsTransitionRest(true);
          setRestReasonKey('restTransition');
          startRestTimer(config.transitionSeconds);
        } else if (!allSetsDone) {
          // Normal set rest
          setIsTransitionRest(false);
          setRestReasonKey(config.reasonKey);
          startRestTimer(config.restSeconds);
        }

        // Live coach intervention — fire once per exercise on the 2nd set
        if (setIdx === 1 && !liveCoachShownRef.current.has(ex.exerciseId)) {
          liveCoachShownRef.current.add(ex.exerciseId);
          const kinds: LiveCoachKind[] = ['form', 'rest', 'push', 'swap'];
          const kind = kinds[Math.floor(Math.random() * kinds.length)];
          setTimeout(() => setLiveCoach(kind), 800);
        }
      }
    },
    [exercises, startRestTimer, objective]
  );

  // Back navigation with confirmation
  const hasProgress = exercises.some((ex) => ex.sets.some((s) => s.completed)) || elapsedSeconds > 30;
  const handleBack = useCallback(() => {
    if (!hasProgress) {
      router.back();
      return;
    }
    if (Platform.OS === 'web') {
      if (confirm(t('confirmLeaveWorkout'))) router.back();
    } else {
      Alert.alert(t('confirmLeaveWorkout'), t('confirmLeaveWorkoutSub'), [
        { text: t('stay'), style: 'cancel' },
        { text: t('leave'), style: 'destructive', onPress: () => router.back() },
      ]);
    }
  }, [hasProgress, router, t, elapsedSeconds]);

  // Progress
  const completedExercises = exercises.filter((ex) =>
    ex.sets.every((s) => s.completed)
  ).length;
  const totalExercises = exercises.length;
  const allDone = isCardio || completedExercises === totalExercises;

  // Finish workout
  const handleFinish = useCallback(() => {
    const date = params.date;
    const workoutId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (isCardio && programDay?.cardio) {
      const workout: Workout = {
        id: workoutId,
        date,
        timestamp: new Date().toISOString(),
        type: CARDIO_TYPE_MAP[programDay.cardio.exerciseId] ?? 'autre',
        durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
        intensity: programDay.cardio.intensity,
        exercises: [],
      };
      addWorkout(workout);
      if (userId) syncWorkout(workout, userId);
      markDayCompleted(date, workoutId);
      triggerHaptic('success');
      router.back();
      return;
    }

    // Check incomplete
    if (!allDone) {
      if (Platform.OS === 'web') {
        if (!confirm(t('confirmFinishIncomplete'))) return;
      } else {
        Alert.alert(t('confirmFinishWorkout'), t('confirmFinishIncomplete'), [
          { text: t('back'), style: 'cancel' },
          {
            text: t('finishWorkout'),
            onPress: () => doFinish(workoutId, date),
          },
        ]);
        return;
      }
    }

    doFinish(workoutId, date);
  }, [exercises, elapsedSeconds, params.date, isCardio, allDone, programDay]);

  const doFinish = useCallback(
    (workoutId: string, date: string) => {
      const workoutExercises: WorkoutExercise[] = exercises
        .filter((ex) => ex.sets.some((s) => s.completed))
        .map((ex) => ({
          id: `we_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          exerciseId: ex.exerciseId,
          exerciseName: t(ex.nameKey as any),
          sets: ex.sets
            .filter((s) => s.completed)
            .map((s) => ({
              id: s.id,
              reps: parseInt(s.actualReps, 10) || 0,
              weight: parseFloat(s.weight) || 0,
            })),
        }));

      const workout: Workout = {
        id: workoutId,
        date,
        timestamp: new Date().toISOString(),
        type: 'musculation',
        durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
        intensity: 'intense',
        exercises: workoutExercises,
      };

      addWorkout(workout);
      if (userId) syncWorkout(workout, userId);
      markDayCompleted(date, workoutId);
      triggerHaptic('success');

      // Compute Session Forgée stats from the workout
      const totalVol = workoutExercises.reduce(
        (acc, ex) => acc + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
        0
      );
      setForgeeStats({
        durationMin: Math.max(1, Math.ceil(elapsedSeconds / 60)),
        volumeKg: Math.round(totalVol),
        prCount: 0,
      });
      // Ceremony first; finisher cardio comes after the user closes the modal
      setShowSessionForgee(true);
    },
    [exercises, elapsedSeconds, addWorkout, markDayCompleted, router, t, userId]
  );

  // Finisher cardio timer
  const startFinisher = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    setFinisherLevel(level);
    setFinisherTimer(FINISHER_LEVELS[level].minutes * 60);
    setFinisherRunning(true);
    triggerHaptic('medium');
  }, []);

  useEffect(() => {
    if (!finisherRunning || finisherTimer <= 0) return;
    finisherRef.current = setInterval(() => {
      setFinisherTimer((prev) => {
        if (prev <= 1) {
          setFinisherRunning(false);
          if (finisherRef.current) clearInterval(finisherRef.current);
          triggerHaptic('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (finisherRef.current) clearInterval(finisherRef.current); };
  }, [finisherRunning]);

  if (!programDay) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={styles.backBtn}>{'\u2190'} {t('back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar — close + pulsing red dot + elapsed time + pause */}
      <WorkoutTopBar elapsedSeconds={elapsedSeconds} onClose={handleBack} />


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cardio mode */}
        {isCardio && programDay?.cardio && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.cardioCard}>
            <Text style={styles.exerciseName}>
              {t(EXERCISES[programDay.cardio.exerciseId]?.nameKey as any ?? 'cardio')}
            </Text>
            <Text style={styles.cardioMeta}>
              {programDay.cardio.durationMinutes} min · {programDay.cardio.intensity}
            </Text>
          </Animated.View>
        )}

        {/* Muscu exercises — V2 design : header + demo + cues + sets v2 + PR alert */}
        {exercises.map((ex, exIdx) => {
          const lastSession = useTrainingStore.getState().getLastSessionForExercise(ex.exerciseId);
          const pr = useTrainingStore.getState().getPersonalRecord(ex.exerciseId);

          // Build "Dernière fois" line + trend
          let lastPerfLabel: string | undefined;
          let trendKg: number | undefined;
          if (lastSession && lastSession.length > 0) {
            const top = [...lastSession].sort((a, b) => b.weight - a.weight)[0];
            lastPerfLabel = `Dernière fois : ${top.weight}kg × ${top.reps}`;
            const currentTop = ex.sets.reduce((max, s) => {
              const w = parseFloat(s.weight) || 0;
              return w > max ? w : max;
            }, 0);
            if (currentTop > 0 && currentTop > top.weight) {
              trendKg = Math.round((currentTop - top.weight) * 10) / 10;
            }
          }

          // Current set = first non-completed
          const currentSetIdx = ex.sets.findIndex((s) => !s.completed);

          // PR-near = any set's weight within 2kg of the PR (but not yet over)
          const heaviestEntered = ex.sets.reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0);
          const showPrAlert = !!pr && heaviestEntered > 0 && heaviestEntered >= pr.weight - 2 && heaviestEntered < pr.weight;

          return (
            <Animated.View key={ex.exerciseId} style={{ marginTop: exIdx === 0 ? 0 : 32 }}>
              <ExerciseHeader
                index={exIdx + 1}
                total={exercises.length}
                name={t(ex.nameKey as any)}
                lastPerformance={lastPerfLabel}
                trendKg={trendKg}
              />

              <ExerciseDemoCard
                imageUri={EXERCISES[ex.exerciseId]?.gifUrl}
                onPlayDemo={() => {
                  triggerHaptic('light');
                  setTutorialExerciseId(ex.exerciseId);
                }}
                onShowForm={() => triggerHaptic('light')}
              />

              <FormCuesCard cues={FORM_CUES[ex.exerciseId] ?? []} />

              <Text style={styles.sectionLabelV2}>SÉRIES</Text>

              {ex.sets.map((set, setIdx) => {
                const setState: SetCardState = set.completed
                  ? 'done'
                  : setIdx === currentSetIdx
                  ? 'current'
                  : 'upcoming';
                return (
                  <SetCardV2
                    key={set.id}
                    index={setIdx + 1}
                    state={setState}
                    weight={set.weight}
                    reps={set.actualReps}
                    targetReps={set.targetReps}
                    onChangeWeight={(v) => updateSet(exIdx, setIdx, 'weight', v.replace(/[^0-9.]/g, ''))}
                    onChangeReps={(v) => updateSet(exIdx, setIdx, 'actualReps', v.replace(/[^0-9]/g, ''))}
                    onValidate={() => toggleSet(exIdx, setIdx)}
                  />
                );
              })}

              {showPrAlert && pr && (
                <PrNearAlert currentPrKg={pr.weight} targetKg={pr.weight + 2} />
              )}
            </Animated.View>
          );
        })}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* PR Alert */}
      {prAlert && (
        <Animated.View style={styles.prBanner}>
          <Text style={styles.prEmoji}>{'\uD83C\uDFC6'}</Text>
          <Text style={styles.prText}>NOUVEAU RECORD !</Text>
        </Animated.View>
      )}

      {/* Rest timer overlay — redesign : circle SVG + accent orange */}
      {isResting && (
        <View style={styles.restOverlay}>
          <RestCircleTimer
            secondsLeft={restSeconds}
            totalSeconds={restTotalSeconds || 1}
            hint={
              restReasonKey !== ''
                ? t(restReasonKey as any)
                : isTransitionRest
                ? t('restTransition' as any)
                : 'Reconstitution phosphocréatine pour force max.'
            }
            onSkip={skipRest}
          />
        </View>
      )}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {!isCardio && (
          <Text style={styles.progressText}>
            {t('exercisesCompleted', {
              done: completedExercises,
              total: totalExercises,
            })}
          </Text>
        )}
        <Pressable
          style={[styles.finishBtn, !allDone && styles.finishBtnIncomplete]}
          onPress={handleFinish}
        >
          <Text style={styles.finishBtnText}>{t('finishWorkout')}</Text>
        </Pressable>
      </View>

      {/* Exercise tutorial modal */}
      <ExerciseTutorialModal
        visible={tutorialExerciseId !== null}
        exerciseId={tutorialExerciseId}
        onClose={() => setTutorialExerciseId(null)}
      />

      {/* Finisher Cardio */}
      <Modal visible={showFinisherCardio} animationType="slide" transparent>
        <View style={styles.guideOverlay}>
          <View style={styles.guideCard}>
            {!finisherLevel ? (
              <>
                <Text style={styles.guideEmoji}>{'\uD83C\uDFC3'}</Text>
                <Text style={styles.guideTitle}>{t('finisherTitle' as any)}</Text>
                <Text style={styles.finisherIntro}>{t('finisherIntro' as any)}</Text>

                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <Pressable
                    key={level}
                    style={styles.finisherOption}
                    onPress={() => startFinisher(level)}
                  >
                    <View style={styles.finisherOptionLeft}>
                      <Text style={styles.finisherOptionTitle}>{t(FINISHER_LEVELS[level].labelKey as any)}</Text>
                      <Text style={styles.finisherOptionDesc}>{t(FINISHER_LEVELS[level].descKey as any)}</Text>
                    </View>
                    <Text style={styles.finisherOptionTime}>{FINISHER_LEVELS[level].minutes} min</Text>
                  </Pressable>
                ))}

                <Pressable
                  style={styles.finisherSkip}
                  onPress={() => { setShowFinisherCardio(false); router.back(); }}
                >
                  <Text style={styles.finisherSkipText}>{t('skipDay')}</Text>
                </Pressable>
              </>
            ) : finisherTimer > 0 ? (
              <>
                <Text style={styles.guideEmoji}>{'\uD83C\uDFC3'}</Text>
                <Text style={styles.guideTitle}>{t(FINISHER_LEVELS[finisherLevel].labelKey as any)}</Text>
                <Text style={styles.finisherTimerText}>
                  {Math.floor(finisherTimer / 60)}:{String(finisherTimer % 60).padStart(2, '0')}
                </Text>
                <Text style={styles.finisherIntro}>{t('finisherKeepGoing' as any)}</Text>
                <Pressable
                  style={styles.finisherSkip}
                  onPress={() => {
                    setFinisherRunning(false);
                    if (finisherRef.current) clearInterval(finisherRef.current);
                    setFinisherTimer(0);
                  }}
                >
                  <Text style={styles.finisherSkipText}>{t('finisherStop' as any)}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.guideEmoji}>{'\uD83D\uDD25'}</Text>
                <Text style={styles.guideTitle}>{t('finisherDone' as any)}</Text>
                <Text style={styles.finisherIntro}>{t('finisherDoneDesc' as any)}</Text>
                <Pressable
                  style={styles.guideBtn}
                  onPress={() => { setShowFinisherCardio(false); router.back(); }}
                >
                  <Text style={styles.guideBtnText}>{t('finisherFinish' as any)}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* First workout guide */}
      <Modal visible={showWorkoutGuide} animationType="fade" transparent>
        <View style={styles.guideOverlay}>
          <View style={styles.guideCard}>
            <Text style={styles.guideEmoji}>{'\uD83C\uDFCB'}</Text>
            <Text style={styles.guideTitle}>{t('workoutGuideTitle' as any)}</Text>

            <View style={styles.guideStep}>
              <Text style={styles.guideStepNum}>1</Text>
              <Text style={styles.guideStepText}>{t('workoutGuideStep1' as any)}</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.guideStepNum}>2</Text>
              <Text style={styles.guideStepText}>{t('workoutGuideStep2' as any)}</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.guideStepNum}>3</Text>
              <Text style={styles.guideStepText}>{t('workoutGuideStep3' as any)}</Text>
            </View>
            <View style={styles.guideStep}>
              <Text style={styles.guideStepNum}>4</Text>
              <Text style={styles.guideStepText}>{t('workoutGuideStep4' as any)}</Text>
            </View>

            <Pressable
              style={styles.guideBtn}
              onPress={() => {
                setShowWorkoutGuide(false);
                AsyncStorage.setItem('forga-workout-guide-seen', 'true');
              }}
            >
              <Text style={styles.guideBtnText}>{t('letsGo' as any)}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Session Forgée — ceremony after a completed muscu workout */}
      <SessionForgee
        visible={showSessionForgee}
        userName={profile?.name?.split(' ')[0] ?? 'Forgeron'}
        stats={forgeeStats}
        onClose={() => {
          setShowSessionForgee(false);
          setShowFinisherCardio(true);
        }}
      />

      {/* Live coach intervention — fires mid-workout */}
      {liveCoach && (
        <LiveCoachIntervention
          visible
          kind={liveCoach}
          onAccept={() => setLiveCoach(null)}
          onDismiss={() => setLiveCoach(null)}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionLabelV2: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.4,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    marginTop: 22,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backBtn: {
    fontSize: 22,
    color: colors.text,
    paddingRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
  },
  timerBox: {
    alignItems: 'center' as const,
  },
  timerLabel: {
    fontFamily: fonts.display,
    fontSize: 9,
    fontWeight: '600' as const,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  timerValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  cardioCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center' as const,
  },
  cardioMeta: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    marginBottom: 12,
  },
  exerciseCardDone: {
    borderColor: 'rgba(0,212,170,0.25)',
    backgroundColor: 'rgba(0,212,170,0.04)',
  },
  exerciseHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 0.5,
    flex: 1,
  },
  infoBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  exerciseTargetRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginLeft: 'auto' as const,
  },
  exerciseTarget: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  exerciseRestBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  restInfoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  restInfoBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.primary,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden' as const,
  },
  restInfoText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  colHeader: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  colNum: { width: 24, textAlign: 'center' as const },
  colTarget: { width: 40, textAlign: 'center' as const },
  colReps: { flex: 1, textAlign: 'center' as const },
  colWeight: { flex: 1, textAlign: 'center' as const },
  colCheck: { width: 44 },
  setRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  setRowDone: {
    backgroundColor: 'rgba(0,212,170,0.08)',
    borderColor: 'rgba(0,212,170,0.25)',
  },
  colCell: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  colTargetText: {
    color: colors.textMuted,
  },
  colInput: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.border}30`,
    marginHorizontal: 2,
  },
  // First workout guide
  guideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    width: '100%' as any,
    maxWidth: 360,
    alignItems: 'center' as const,
  },
  guideEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  guideTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  guideStep: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: '100%' as any,
  },
  guideStepNum: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    textAlign: 'center' as const,
    lineHeight: 28,
  },
  guideStepText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
  guideBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    marginTop: spacing.md,
  },
  guideBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.white,
  },
  // Finisher cardio
  finisherIntro: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  finisherOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    width: '100%' as any,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finisherOptionLeft: {
    flex: 1,
  },
  finisherOptionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text,
  },
  finisherOptionDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  finisherOptionTime: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  finisherSkip: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  finisherSkipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center' as const,
  },
  finisherTimerText: {
    fontFamily: fonts.data,
    fontSize: 64,
    fontWeight: '700' as const,
    color: colors.primary,
    textAlign: 'center' as const,
    marginVertical: spacing.xl,
  },
  gifContainer: {
    alignItems: 'center' as const,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    backgroundColor: `${colors.border}20`,
  },
  exerciseGif: {
    width: '100%' as any,
    height: 180,
  },
  gifHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center' as const,
    paddingVertical: spacing.xs,
  },
  weightTip: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontStyle: 'italic' as const,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  prBanner: {
    position: 'absolute' as const,
    top: 100,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: '#FFD700',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  prEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  prText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800' as const,
    color: '#1a1a2e',
    letterSpacing: 2,
  },
  colInputDone: {
    backgroundColor: `${colors.success}15`,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  checkBtn: {
    width: 40,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.35)',
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkBtnDone: {
    borderColor: '#00D4AA',
    backgroundColor: '#00D4AA',
  },
  checkText: {
    fontFamily: fonts.display,
    fontSize: 9,
    fontWeight: '700' as const,
    color: colors.textMuted,
  },
  restOverlay: {
    position: 'absolute' as const,
    bottom: 100,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center' as const,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  restLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  restTime: {
    fontFamily: fonts.data,
    fontSize: fontSizes['4xl'],
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  restReason: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  skipBtn: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  skipBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  progressText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  finishBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center' as const,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  finishBtnIncomplete: {
    opacity: 0.6,
  },
  finishBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800' as const,
    color: colors.white,
    letterSpacing: 1,
  },
}));
