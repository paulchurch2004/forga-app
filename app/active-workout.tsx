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
  Vibration,
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
import { syncWorkout, syncOneRepMax } from '../src/services/userSync';
import { pushWorkoutToHealth } from '../src/hooks/useAppleHealth';
import { useAuthStore } from '../src/store/authStore';
import { useProgramStore } from '../src/store/programStore';
import { useUserStore } from '../src/store/userStore';
import { getStartingWeightForExercise, estimateOneRMForExercise, workingWeightForReps } from '../src/services/strengthTest';
import { getRestConfig, formatRestTime as fmtRest } from '../src/engine/restEngine';
import { suggestNextWeight, type SessionRecord } from '../src/engine/oneRepMax';
import { RestCircleTimer } from '../src/components/training/RestCircleTimer';
import { SessionForgee } from '../src/components/training/SessionForgee';
import { PostWorkoutFeedback, type PostWorkoutFeedbackData } from '../src/components/training/PostWorkoutFeedback';
import { compareWorkouts, findPreviousWorkoutOfSameType, generatePostWorkoutCoachMessage, pickLiveCoachKind } from '../src/utils/workoutComparison';
import { usePremiumGate } from '../src/hooks/usePremiumGate';
import { useTrainingStreak } from '../src/hooks/useTrainingStreak';
import { LiveCoachIntervention, type LiveCoachKind } from '../src/components/coach/LiveCoachIntervention';
import { ReplaceExerciseSheet } from '../src/components/training/ReplaceExerciseSheet';
import { buildSubstitutesFor } from '../src/utils/exerciseSubstitutes';
import { DeloadBanner } from '../src/components/training/DeloadBanner';
import { preloadRestEndSound, playRestEndSound, unloadRestEndSound } from '../src/services/audioService';
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
  /** True when the engine detected a stagnation pattern and suggests a deload. */
  deloadSuggested?: boolean;
  /** Top weight of the last recorded session (kg). Used to revert if user dismisses deload. */
  previousTopWeight?: number;
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
    /** Multiplicateur de charge issu du PreWorkoutCheckInModal.
     *  0.85 = épuisé (plomb), 1.08 = en forme (or). Default 1.0 si
     *  l'user a skip le check-in ou si on arrive ici sans passer par
     *  la popup (ex: deep link, debug). */
    loadMultiplier?: string;
    /** ID du métal choisi par l'user pour traçabilité dans le workout. */
    metalId?: string;
  }>();

  // Parsed une fois pour toute. Clampé [0.6, 1.2] pour éviter qu'un
  // bug client passe un multiplicateur aberrant (genre 100) qui
  // pousserait l'user à mettre 200kg au curl biceps.
  const loadMultiplier = (() => {
    const raw = parseFloat(params.loadMultiplier ?? '1');
    if (!Number.isFinite(raw) || raw <= 0) return 1;
    return Math.min(1.2, Math.max(0.6, raw));
  })();

  const addWorkout = useTrainingStore((s) => s.addWorkout);
  const updateWorkoutFeedback = useTrainingStore((s) => s.updateWorkoutFeedback);
  const markDayCompleted = useProgramStore((s) => s.markDayCompleted);
  const getLastSession = useTrainingStore((s) => s.getLastSessionForExercise);
  const getExerciseHistory = useTrainingStore((s) => s.getExerciseHistory);
  const oneRepMaxByExercise = useTrainingStore((s) => s.oneRepMaxByExercise);
  const { checkWorkoutBadges, currentTrainingStreak, totalWorkouts } = useTrainingStreak();
  const userId = useAuthStore((s) => s.session?.user?.id);
  const objective = useUserStore((s) => s.profile?.objective ?? 'maintain');
  const { canUseLiveSwap, openPaywall } = usePremiumGate();
  const profile = useUserStore((s) => s.profile);
  const strengthTest = useUserStore((s) => s.strengthTest);

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
  const [showPostFeedback, setShowPostFeedback] = useState(false);
  const [postFeedbackPayload, setPostFeedbackPayload] = useState<{
    workoutId: string;
    date: string;
    comparisonSummary: string;
    coachMessage: string;
  } | null>(null);
  const [forgeeStats, setForgeeStats] = useState({ durationMin: 0, volumeKg: 0, prCount: 0 });
  const [liveCoach, setLiveCoach] = useState<LiveCoachKind | null>(null);
  const [liveSwapExIdx, setLiveSwapExIdx] = useState<number | null>(null);
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

  // Preload the rest-end sound (no-op if expo-audio not installed)
  useEffect(() => {
    preloadRestEndSound().catch(() => { /* silent */ });
    return () => {
      unloadRestEndSound().catch(() => { /* silent */ });
    };
  }, []);

  // ─── Persistance de la séance en cours ───
  // L'état d'une séance vit en useState et était PERDU si l'user kill
  // l'app au milieu d'un workout (téléphone qui crash, switch d'app et
  // OS qui kill en background, batterie morte). Sauvegarde après chaque
  // changement d'état, restore au mount si match programDay+date et
  // sauvegarde < 24h.
  const persistKey = `forga-active-workout:${params.programId}:${params.programDayId}:${params.date}`;
  const hasRestoredRef = useRef(false);

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
          // Multi-channel rest-end signal: short audio cue + vibration pattern
          // + double haptic. Audio is opt-in via Settings (default ON) and
          // silently skipped if expo-audio isn't installed yet.
          if (Platform.OS !== 'web') {
            Vibration.vibrate([0, 200, 100, 200]);
          }
          triggerHaptic('medium');
          setTimeout(() => triggerHaptic('success'), 250);
          playRestEndSound().catch(() => { /* ignore */ });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleAcceptDeload = useCallback((exIdx: number) => {
    // The engine already pre-filled sets with the deload weight. Just hide the banner.
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, deloadSuggested: false } : ex)),
    );
    triggerHaptic('medium');
  }, []);

  const handleDismissDeload = useCallback((exIdx: number) => {
    // Revert sets to the previous session's top weight (user wants to push through).
    setExercises((prev) => {
      const next = [...prev];
      const ex = next[exIdx];
      if (!ex) return prev;
      const original = ex.previousTopWeight ?? 0;
      next[exIdx] = {
        ...ex,
        deloadSuggested: false,
        weightTip: `Charge maintenue à ${original} kg`,
        sets: ex.sets.map((s) =>
          s.completed ? s : { ...s, weight: original > 0 ? String(original) : '' },
        ),
      };
      return next;
    });
  }, []);

  const handleLiveExerciseSwap = useCallback(
    (exIdx: number, newExerciseId: string) => {
      setExercises((prev) => {
        const next = [...prev];
        const oldEx = next[exIdx];
        const newDef = EXERCISES[newExerciseId];
        if (!oldEx || !newDef) return prev;
        // Keep completed sets (history), reset upcoming sets weight to user input
        next[exIdx] = {
          ...oldEx,
          exerciseId: newExerciseId,
          nameKey: newDef.nameKey,
          sets: oldEx.sets.map((s) =>
            s.completed ? s : { ...s, weight: '', actualReps: String(oldEx.adjustedReps) },
          ),
        };
        return next;
      });
      setLiveSwapExIdx(null);
      triggerHaptic('medium');
    },
    [],
  );

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

      // On RESPECTE le targetReps du programme tel quel — pas d'ajustement
      // par objectif. Avant : on faisait `pe.targetReps - 2` en bulk sur
      // les compounds, ce qui créait une incohérence entre le détail
      // affiché (7 reps) et la séance lancée (5 reps). En plus c'était
      // contre-productif : les programmes bulk ont déjà des rep ranges
      // calibrés (8-12 hypertrophie, 4-6 force) — pas besoin d'y toucher.
      // Le user voit maintenant les MÊMES reps partout.
      const adjustedReps = pe.targetReps;
      const isCompound = exercise?.isCompound ?? false;
      // Bas du corps = compound qui sollicite jambes/dos lourd → +2.5 kg
      // par séance (cf TRAINING_PROGRAMS_SPEC.md §A.3). Tout le reste
      // compound = haut du corps → +1.25 kg. La distinction se fait sur
      // muscleGroup, plus les exercices qui ont "deadlift" dans l'ID
      // (deadlift est techniquement back mais sollicite chaîne postérieure
      // entière donc +2.5 kg est légitime).
      const isLowerBody =
        exercise?.muscleGroup === 'legs' ||
        /deadlift|hip_thrust|romanian|good_morning/i.test(pe.exerciseId);

      // Smart weight suggestion via the v3 engine (handles +increment, deload, no-history fallback)
      let suggestedWeight = lastWeight;
      let weightTip = '';
      let deloadSuggested = false;
      let previousTopWeight = 0;

      // ─── 1RM connu ? On l'utilise (calibration test ou Epley) ───
      const programId = params.programId ?? '';
      const is531 = /531/i.test(programId);
      const oneRM = estimateOneRMForExercise(pe.exerciseId, strengthTest, oneRepMaxByExercise);

      const history = getExerciseHistory(pe.exerciseId);
      const sessionRecords: SessionRecord[] = history.map((h) => ({
        date: h.date,
        sets: h.sets,
      }));

      // 5/3/1 : recalcule la charge à chaque séance via la formule Wendler
      // (% du 1RM courant). C'est le principe même du programme : la
      // charge est INDEXÉE sur le 1RM, pas sur la progression linéaire
      // +2.5 kg/séance. Donc on shortcircuite suggestNextWeight ici.
      const force531Path = is531 && oneRM > 0;

      if (force531Path) {
        // 5/3/1 Wendler : top set = 85% TM = 76.5% 1RM. La charge est
        // INDEXÉE sur le 1RM courant, pas sur l'historique (le BBB et
        // le top set partagent le même exerciseId, donc l'historique
        // est ambigu pour cet exo).
        suggestedWeight = Math.max(20, Math.round(oneRM * 0.765 * 2) / 2);
        weightTip = `Calculé sur ton 1RM ${oneRM} kg (Wendler 85% TM)`;
      } else if (sessionRecords.length > 0) {
        // Progression linéaire : +increment si tous reps validés à la
        // dernière session, sinon même charge ou deload (cf §A.3 spec).
        const suggestion = suggestNextWeight(sessionRecords, isCompound, adjustedReps, isLowerBody);
        suggestedWeight = suggestion.weight;
        weightTip = suggestion.reason;
        deloadSuggested = suggestion.deloadSuggested;
        const lastSorted = [...sessionRecords].sort((a, b) => a.date.localeCompare(b.date));
        const lastSets = lastSorted[lastSorted.length - 1]?.sets ?? [];
        previousTopWeight = [...lastSets]
          .sort((a, b) => (b?.weight ?? 0) - (a?.weight ?? 0))[0]?.weight ?? 0;
      } else if (oneRM > 0) {
        // Pas d'historique de cet exo dans l'app mais 1RM connu (test
        // de calibration ou Epley d'un exo similaire). Dérive un working
        // weight précis pour les reps demandées via Epley inverse.
        // Avant : un user qui connaît son bench 1RM 95 kg voyait 62.5 kg
        // pour 10 reps (trop lourd → stagnation). Maintenant : 57 kg.
        const w = workingWeightForReps(oneRM, adjustedReps);
        if (w > 0) {
          suggestedWeight = Math.max(isCompound ? 20 : 1, w);
          const pct = Math.round((w / oneRM) * 100);
          weightTip = `${pct}% de ton 1RM ${oneRM} kg pour ${adjustedReps} reps`;
        }
      } else {
        // Aucun signal sur l'user pour cet exo → bodyweight fallback.
        let seed = getStartingWeightForExercise(
          pe.exerciseId,
          strengthTest?.startingWeights,
          {
            sex: profile?.sex,
            bodyweightKg: profile?.currentWeight,
            trainingLevel: profile?.trainingLevel,
          },
        );
        if (seed === 0 && profile?.currentWeight) {
          seed = getStartingWeightForExercise(
            pe.exerciseId,
            undefined,
            {
              sex: profile.sex,
              bodyweightKg: profile.currentWeight,
              trainingLevel: profile.trainingLevel,
            },
          );
        }
        if (seed > 0) {
          // Le seed du test est calibré pour ~5 reps. Si le programme
          // demande plus de reps, dérate via Epley pour rester juste
          // (un working_5 sur 10 reps = trop lourd, l'user stagne).
          if (strengthTest?.startingWeights && adjustedReps > 6) {
            // working_5 ≈ 1RM × 0.77 → 1RM ≈ working_5 / 0.77
            const derivedOneRM = seed / 0.77;
            const w = workingWeightForReps(derivedOneRM, adjustedReps);
            if (w > 0) seed = Math.max(isCompound ? 20 : 1, w);
          }
          suggestedWeight = seed;
          weightTip = strengthTest?.startingWeights
            ? `Calibré selon ton test (${adjustedReps} reps)`
            : 'Estimation selon ton poids — ajuste si nécessaire';
        } else {
          weightTip = isCompound
            ? t('weightTipCompound' as any)
            : t('weightTipIsolation' as any);
        }
      }

      // ─── Application du weightFactor programme (ex. 5/3/1 BBB 0.6) ───
      // Certains programmes ré-utilisent le même exerciseId à des
      // intensités différentes dans la même séance (5/3/1 : top set
      // 3×5 lourd PUIS 5×10 light BBB). Sans ce facteur, les deux blocs
      // héritaient de la même charge → cassé physiologiquement.
      if (suggestedWeight > 0 && pe.weightFactor && pe.weightFactor !== 1) {
        const factored = suggestedWeight * pe.weightFactor;
        suggestedWeight = Math.max(1, Math.round(factored * 2) / 2);
        const factorPct = Math.round(pe.weightFactor * 100);
        const factorTip = `Light volume set (${factorPct}% du top set)`;
        weightTip = weightTip ? `${weightTip} · ${factorTip}` : factorTip;
      }

      // ─── Application du loadMultiplier du check-in pré-séance ───
      // L'user a indiqué son état dans la popup (plomb → or). On
      // ajuste la charge proposée en conséquence. On snap au demi-kilo
      // pour rester cohérent avec les fractionnaires standard de
      // musculation. On ne descend pas en dessous de 1kg pour les
      // valeurs très faibles (isolation léger).
      let adjustedWeight = suggestedWeight;
      if (suggestedWeight > 0 && loadMultiplier !== 1) {
        const raw = suggestedWeight * loadMultiplier;
        adjustedWeight = Math.max(1, Math.round(raw * 2) / 2);
        // On enrichit le tip pour expliquer pourquoi la charge a bougé
        // (sinon l'user voit -5kg mystérieux et perd confiance).
        const deltaPct = Math.round((loadMultiplier - 1) * 100);
        if (deltaPct !== 0) {
          const sign = deltaPct > 0 ? '+' : '';
          weightTip = `${weightTip}${weightTip ? ' · ' : ''}Ajusté selon ton état (${sign}${deltaPct}%)`;
        }
      }

      const sets: ActiveSet[] = Array.from({ length: pe.targetSets }, (_, i) => ({
        id: `s_${pe.exerciseId}_${i}`,
        targetReps: adjustedReps,
        actualReps: String(adjustedReps),
        weight: adjustedWeight > 0 ? String(adjustedWeight) : '',
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
        deloadSuggested,
        previousTopWeight,
      };
    });
  });

  // Restore au mount : si on retrouve un état sauvegardé pour le même
  // programDay+date et < 24h, on le ré-applique. Sinon, on garde
  // l'init calculé à partir du programme.
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    AsyncStorage.getItem(persistKey).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as {
          exercises: ActiveExercise[];
          elapsedSeconds: number;
          savedAt: number;
        };
        const ageMs = Date.now() - (parsed.savedAt ?? 0);
        if (ageMs > 24 * 60 * 60 * 1000) {
          // Trop vieux — purge et ignore
          AsyncStorage.removeItem(persistKey).catch(() => {});
          return;
        }
        if (Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
          setExercises(parsed.exercises);
        }
        if (typeof parsed.elapsedSeconds === 'number' && parsed.elapsedSeconds > 0) {
          setElapsedSeconds(parsed.elapsedSeconds);
        }
      } catch {
        // Parse échoué → ignore, on garde l'init
      }
    });
  }, [persistKey]);

  // Save sur changement de state. Throttled à 1.5s pour éviter d'écrire
  // à chaque keystroke dans les inputs reps/poids.
  useEffect(() => {
    const handle = setTimeout(() => {
      const hasAnyProgress = exercises.some((ex) => ex.sets.some((s) => s.completed)) || elapsedSeconds > 5;
      if (!hasAnyProgress) return;
      AsyncStorage.setItem(
        persistKey,
        JSON.stringify({ exercises, elapsedSeconds, savedAt: Date.now() }),
      ).catch(() => {});
    }, 1500);
    return () => clearTimeout(handle);
  }, [exercises, elapsedSeconds, persistKey]);

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

        // Check for new Personal Record (by weight)
        const weight = parseFloat(set.weight || '0');
        const reps = parseInt(set.actualReps || '0', 10);
        const exerciseId = exercises[exIdx]?.exerciseId;
        if (weight > 0 && exerciseId) {
          const isNewPR = useTrainingStore.getState().isNewPR(exerciseId, weight);
          if (isNewPR) {
            triggerHaptic('success');
            setPrAlert(exerciseId);
            setTimeout(() => setPrAlert(null), 3000);
          }
          // Update estimated 1RM (Epley) — silent, just persists the new max
          // ET sync vers Supabase si nouveau PR (sinon perdu au logout).
          if (reps > 0) {
            const updateResult = useTrainingStore.getState().updateOneRepMax(exerciseId, weight, reps);
            if (updateResult.isNewOneRM) {
              const rec = useTrainingStore.getState().oneRepMaxByExercise[exerciseId];
              const uid = useUserStore.getState().profile?.id;
              if (rec && uid) {
                void syncOneRepMax(exerciseId, rec, uid);
              }
            }
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

        // Live coach intervention — fire once per exercise on the 2nd set,
        // picking the type based on actual perf vs target and last session.
        if (setIdx === 1 && !liveCoachShownRef.current.has(ex.exerciseId)) {
          liveCoachShownRef.current.add(ex.exerciseId);
          const lastSessionSets = useTrainingStore
            .getState()
            .getLastSessionForExercise(ex.exerciseId);
          const kind = pickLiveCoachKind({
            weight,
            reps,
            targetReps: ex.programExercise.targetReps,
            lastSessionSets,
          }) as LiveCoachKind;
          setTimeout(() => setLiveCoach(kind), 800);
        }
      }
    },
    [exercises, startRestTimer, objective]
  );

  // Back navigation with confirmation
  const hasProgress = exercises.some((ex) => ex.sets.some((s) => s.completed)) || elapsedSeconds > 30;
  const discardAndExit = useCallback(() => {
    // Discard explicite : on supprime le state sauvegardé pour ne pas
    // re-proposer la séance au prochain mount.
    AsyncStorage.removeItem(persistKey).catch(() => {});
    router.back();
  }, [persistKey, router]);
  const handleBack = useCallback(() => {
    if (!hasProgress) {
      router.back();
      return;
    }
    if (Platform.OS === 'web') {
      if (confirm(t('confirmLeaveWorkout'))) discardAndExit();
    } else {
      Alert.alert(t('confirmLeaveWorkout'), t('confirmLeaveWorkoutSub'), [
        { text: t('stay'), style: 'cancel' },
        { text: t('leave'), style: 'destructive', onPress: discardAndExit },
      ]);
    }
  }, [hasProgress, router, t, elapsedSeconds, discardAndExit]);

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

    // L'état pré-séance choisi via le PreWorkoutCheckInModal est
    // sauvegardé dans le note du workout — utile pour le coach IA qui
    // peut référer à "ta dernière séance où tu étais en plomb" et pour
    // l'historique. On note explicitement le métal + le multiplicateur.
    const checkInNote = params.metalId
      ? `État: ${params.metalId}${loadMultiplier !== 1 ? ` (charges ${Math.round((loadMultiplier - 1) * 100) > 0 ? '+' : ''}${Math.round((loadMultiplier - 1) * 100)}%)` : ''}`
      : undefined;

    if (isCardio && programDay?.cardio) {
      const workout: Workout = {
        id: workoutId,
        date,
        timestamp: new Date().toISOString(),
        type: CARDIO_TYPE_MAP[programDay.cardio.exerciseId] ?? 'autre',
        durationMinutes: Math.max(1, Math.ceil(elapsedSeconds / 60)),
        intensity: programDay.cardio.intensity,
        exercises: [],
        note: checkInNote,
      };
      addWorkout(workout);
      if (userId) syncWorkout(workout, userId);
      pushWorkoutToHealth(workout).catch(() => {});
      markDayCompleted(date, workoutId);
      AsyncStorage.removeItem(persistKey).catch(() => {});
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
        note: checkInNote,
      };

      addWorkout(workout);
      if (userId) syncWorkout(workout, userId);
      pushWorkoutToHealth(workout).catch(() => {});
      markDayCompleted(date, workoutId);
      AsyncStorage.removeItem(persistKey).catch(() => {});
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

      // Compare to previous workout of same type + generate coach message
      // (use a fresh snapshot of the store so the just-added workout is included)
      const allWorkouts = useTrainingStore.getState().workouts;
      const previous = findPreviousWorkoutOfSameType(workout, allWorkouts);
      const comparison = compareWorkouts(workout, previous);
      const coachMessage = generatePostWorkoutCoachMessage({
        firstName: profile?.name?.split(' ')[0],
        workout,
        comparison,
        prCount: 0,
        trainingStreak: currentTrainingStreak,
        totalWorkouts: totalWorkouts + 1, // +1 because the workout we just added
      });
      setPostFeedbackPayload({
        workoutId,
        date,
        comparisonSummary: comparison.summary,
        coachMessage,
      });

      // Unlock any newly-earned badges (first_workout, ten_workouts, streak, etc.)
      checkWorkoutBadges();

      // Ceremony first; finisher cardio comes after the user closes the modal
      setShowSessionForgee(true);
    },
    [exercises, elapsedSeconds, addWorkout, markDayCompleted, router, t, userId, profile?.name, currentTrainingStreak, totalWorkouts, checkWorkoutBadges]
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

              <View style={styles.exerciseActions}>
                <Pressable
                  style={styles.swapBtn}
                  onPress={() => {
                    triggerHaptic('light');
                    if (!canUseLiveSwap) {
                      openPaywall();
                      return;
                    }
                    setLiveSwapExIdx(exIdx);
                  }}
                  hitSlop={6}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M8 7h12M8 7l4-4M8 7l4 4M16 17H4M16 17l-4-4M16 17l-4 4" stroke="#FF6B35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.swapBtnText}>Remplacer{canUseLiveSwap ? '' : ' 🔒'}</Text>
                </Pressable>
              </View>

              {ex.deloadSuggested && (
                <DeloadBanner
                  exerciseName={t(ex.nameKey as any)}
                  currentWeight={ex.previousTopWeight ?? 0}
                  suggestedWeight={parseFloat(ex.sets[0]?.weight || '0') || 0}
                  onAccept={() => handleAcceptDeload(exIdx)}
                  onDismiss={() => handleDismissDeload(exIdx)}
                />
              )}

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

              {(() => {
                const oneRM = useTrainingStore.getState().getOneRepMax(ex.exerciseId);
                return ex.sets.map((set, setIdx) => {
                  const setState: SetCardState = set.completed
                    ? 'done'
                    : setIdx === currentSetIdx
                    ? 'current'
                    : 'upcoming';
                  const setWeight = parseFloat(set.weight || '0') || 0;
                  const pct = oneRM && oneRM.value > 0 && setWeight > 0
                    ? Math.round((setWeight / oneRM.value) * 100)
                    : 0;
                  return (
                    <SetCardV2
                      key={set.id}
                      index={setIdx + 1}
                      state={setState}
                      weight={set.weight}
                      reps={set.actualReps}
                      targetReps={set.targetReps}
                      percentOneRM={pct}
                      onChangeWeight={(v) => updateSet(exIdx, setIdx, 'weight', v.replace(/[^0-9.]/g, ''))}
                      onChangeReps={(v) => updateSet(exIdx, setIdx, 'actualReps', v.replace(/[^0-9]/g, ''))}
                      onValidate={() => toggleSet(exIdx, setIdx)}
                    />
                  );
                });
              })()}

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
          // If we have feedback payload, ask the user; else go straight to finisher
          if (postFeedbackPayload) {
            setShowPostFeedback(true);
          } else {
            setShowFinisherCardio(true);
          }
        }}
      />

      {/* Post-workout feedback: rating + RPE + free note + coach message + comparison */}
      {postFeedbackPayload && (
        <PostWorkoutFeedback
          visible={showPostFeedback}
          comparisonSummary={postFeedbackPayload.comparisonSummary}
          coachMessage={postFeedbackPayload.coachMessage}
          onSubmit={(feedback: PostWorkoutFeedbackData) => {
            updateWorkoutFeedback(postFeedbackPayload.date, postFeedbackPayload.workoutId, feedback);
            setShowPostFeedback(false);
            setPostFeedbackPayload(null);
            setShowFinisherCardio(true);
          }}
          onSkip={() => {
            setShowPostFeedback(false);
            setPostFeedbackPayload(null);
            setShowFinisherCardio(true);
          }}
        />
      )}

      {/* Live coach intervention — fires mid-workout */}
      {liveCoach && (
        <LiveCoachIntervention
          visible
          kind={liveCoach}
          onAccept={() => setLiveCoach(null)}
          onDismiss={() => setLiveCoach(null)}
        />
      )}

      {/* Live exercise swap — replace current exercise with a substitute */}
      <ReplaceExerciseSheet
        open={liveSwapExIdx !== null}
        onClose={() => setLiveSwapExIdx(null)}
        originalName={liveSwapExIdx !== null ? t(exercises[liveSwapExIdx]?.nameKey as any) : undefined}
        substitutes={
          liveSwapExIdx !== null
            ? buildSubstitutesFor({
                id: exercises[liveSwapExIdx]?.exerciseId ?? '',
                sets: exercises[liveSwapExIdx]?.adjustedSets ?? 3,
                reps: exercises[liveSwapExIdx]?.adjustedReps ?? 10,
              })
            : []
        }
        onPick={(sub) => {
          if (liveSwapExIdx === null) return;
          handleLiveExerciseSwap(liveSwapExIdx, sub.id);
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
  },
  swapBtnText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
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
