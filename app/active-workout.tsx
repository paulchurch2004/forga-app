import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
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
  const [isResting, setIsResting] = useState(false);
  const [restReasonKey, setRestReasonKey] = useState('');
  const [isTransitionRest, setIsTransitionRest] = useState(false);
  const [prAlert, setPrAlert] = useState<string | null>(null);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRestTimer = useCallback((seconds: number) => {
    setRestSeconds(seconds);
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
        // Bulk: heavier, fewer reps for compounds
        adjustedReps = Math.max(4, pe.targetReps - 2);
      } else if (objective === 'cut') {
        // Cut: lighter, more reps for metabolic stress
        adjustedReps = pe.targetReps + 2;
      } else if (objective === 'recomp') {
        // Recomp: moderate, keep as-is
        adjustedReps = pe.targetReps;
      }
      // Maintain: keep program defaults

      const sets: ActiveSet[] = Array.from({ length: pe.targetSets }, (_, i) => ({
        id: `s_${pe.exerciseId}_${i}`,
        targetReps: adjustedReps,
        actualReps: String(adjustedReps),
        weight: lastWeight > 0 ? String(lastWeight) : '',
        completed: false,
      }));

      return {
        exerciseId: pe.exerciseId,
        nameKey: exercise?.nameKey ?? pe.exerciseId,
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
      router.back();
    },
    [exercises, elapsedSeconds, addWorkout, markDayCompleted, router, t, userId]
  );

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={styles.backBtn}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t(programDay.nameKey as any)}
        </Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerLabel}>{t('elapsedTime')}</Text>
          <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
        </View>
      </View>

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

        {/* Muscu exercises */}
        {exercises.map((ex, exIdx) => {
          const allSetsCompleted = ex.sets.every((s) => s.completed);
          const restConfig = getRestConfig(ex.exerciseId, ex.programExercise.targetReps, objective);
          return (
            <Animated.View
              key={ex.exerciseId}
              entering={FadeInDown.delay(exIdx * 80).duration(400)}
              style={[styles.exerciseCard, allSetsCompleted && styles.exerciseCardDone]}
            >
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{t(ex.nameKey as any)}</Text>
                {hasTutorial(ex.exerciseId) && (
                  <Pressable
                    onPress={() => {
                      triggerHaptic('light');
                      setTutorialExerciseId(ex.exerciseId);
                    }}
                    hitSlop={8}
                    style={styles.infoBtn}
                  >
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 5a1 1 0 110 2 1 1 0 010-2zm-1 4h2v6h-2v-6z"
                        fill={colors.textMuted}
                      />
                    </Svg>
                  </Pressable>
                )}
                <Text style={styles.exerciseTarget}>
                  {ex.programExercise.targetSets}x{ex.programExercise.targetReps}
                </Text>
              </View>

              {/* Rest time info */}
              <View style={styles.restInfoRow}>
                <Text style={styles.restInfoBadge}>
                  {fmtRest(restConfig.restSeconds)}
                </Text>
                <Text style={styles.restInfoText}>
                  {t(restConfig.reasonKey as any)}
                </Text>
              </View>

              {/* Sets table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, styles.colNum]}>#</Text>
                <Text style={[styles.colHeader, styles.colTarget]}>{t('targetLabel')}</Text>
                <Text style={[styles.colHeader, styles.colReps]}>{t('actualReps')}</Text>
                <Text style={[styles.colHeader, styles.colWeight]}>{t('weightInput')}</Text>
                <Text style={[styles.colHeader, styles.colCheck]}> </Text>
              </View>

              {/* Sets */}
              {ex.sets.map((set, setIdx) => (
                <View
                  key={set.id}
                  style={[styles.setRow, set.completed && styles.setRowDone]}
                >
                  <Text style={[styles.colCell, styles.colNum]}>{setIdx + 1}</Text>
                  <Text style={[styles.colCell, styles.colTarget, styles.colTargetText]}>
                    {set.targetReps}
                  </Text>
                  <TextInput
                    style={[styles.colInput, styles.colReps, set.completed && styles.colInputDone]}
                    value={set.actualReps}
                    onChangeText={(v) => {
                      const clean = v.replace(/[^0-9]/g, '');
                      updateSet(exIdx, setIdx, 'actualReps', clean);
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                  />
                  <TextInput
                    style={[styles.colInput, styles.colWeight, set.completed && styles.colInputDone]}
                    value={set.weight}
                    onChangeText={(v) => updateSet(exIdx, setIdx, 'weight', v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    maxLength={5}
                    placeholder="kg"
                    placeholderTextColor={colors.textMuted}
                    selectTextOnFocus
                  />
                  <Pressable
                    style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
                    onPress={() => toggleSet(exIdx, setIdx)}
                    hitSlop={8}
                  >
                    {set.completed ? (
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke={colors.white}
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    ) : (
                      <Text style={styles.checkText}>{t('markSetDone')}</Text>
                    )}
                  </Pressable>
                </View>
              ))}
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

      {/* Rest timer overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restLabel}>
            {isTransitionRest ? t('restTransition' as any) : t('restTimer')}
          </Text>
          <Text style={styles.restTime}>{formatTime(restSeconds)}</Text>
          {restReasonKey !== '' && (
            <Text style={styles.restReason}>{t(restReasonKey as any)}</Text>
          )}
          <Pressable style={styles.skipBtn} onPress={skipRest}>
            <Text style={styles.skipBtnText}>{t('skipRest')}</Text>
          </Pressable>
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
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  exerciseCardDone: {
    borderColor: colors.success,
    opacity: 0.85,
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
  exerciseTarget: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.primary,
    marginLeft: spacing.sm,
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
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}50`,
  },
  setRowDone: {
    backgroundColor: `${colors.success}10`,
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
    width: 44,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkBtnDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
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
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
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
