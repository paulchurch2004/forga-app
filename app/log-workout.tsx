import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import { useTrainingStore } from '../src/store/trainingStore';
import { useAuthStore } from '../src/store/authStore';
import { syncWorkout } from '../src/services/userSync';
import { WorkoutTypeGrid } from '../src/components/training/WorkoutTypeGrid';
import { ExerciseRow } from '../src/components/training/ExerciseRow';
import { ExercisePicker } from '../src/components/training/ExercisePicker';
import { EXERCISES } from '../src/data/exercises';
import type { WorkoutType, Intensity, WorkoutExercise, ExerciseSet, Exercise } from '../src/types/training';

export default function LogWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { t } = useT();
  const styles = useStyles();
  const addWorkout = useTrainingStore((s) => s.addWorkout);
  const getLastSession = useTrainingStore((s) => s.getLastSessionForExercise);
  const userId = useAuthStore((s) => s.session?.user?.id);

  // State
  const [workoutType, setWorkoutType] = useState<WorkoutType | null>(null);
  const [duration, setDuration] = useState('45');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [note, setNote] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [autoFilledIds, setAutoFilledIds] = useState<Set<string>>(new Set());

  const handleSelectExercise = useCallback((ex: Exercise) => {
    const lastSets = getLastSession(ex.id);
    const defaultSet: ExerciseSet = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reps: lastSets?.[0]?.reps ?? 10,
      weight: lastSets?.[0]?.weight ?? 0,
    };

    const workoutEx: WorkoutExercise = {
      id: `we_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      exerciseId: ex.id,
      exerciseName: t(ex.nameKey as any),
      sets: [defaultSet],
    };

    setExercises((prev) => [...prev, workoutEx]);
    if (lastSets) {
      setAutoFilledIds((prev) => new Set(prev).add(workoutEx.id));
    }
    setShowPicker(false);
  }, [t, getLastSession]);

  const handleSave = () => {
    if (!workoutType) return;
    const dur = parseInt(duration, 10);
    if (!dur || dur <= 0) return;

    const today = new Date();
    const workout = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: today.toISOString().split('T')[0],
      timestamp: today.toISOString(),
      type: workoutType,
      durationMinutes: dur,
      intensity,
      exercises: workoutType === 'musculation' ? exercises : [],
      note: note.trim() || undefined,
    };

    addWorkout(workout);
    if (userId) syncWorkout(workout, userId);

    if (Platform.OS === 'web') {
      window.alert(t('workoutSaved'));
    } else {
      Alert.alert(t('workoutSaved'));
    }
    router.back();
  };

  const isMusculation = workoutType === 'musculation';
  const canSave = workoutType && parseInt(duration, 10) > 0 &&
    (!isMusculation || exercises.length > 0);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
          </Pressable>
        </View>
        <Text style={styles.pageTitle}>{t('logWorkout')}</Text>

        {/* Step 1: Workout Type */}
        <View style={styles.section}>
          <WorkoutTypeGrid selectedType={workoutType} onSelect={setWorkoutType} />
        </View>

        {workoutType && (
          <>
            {/* Duration */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('durationLabel')}</Text>
              <TextInput
                style={styles.durationInput}
                value={duration}
                onChangeText={setDuration}
                keyboardType="number-pad"
                placeholder="45"
                placeholderTextColor="#555"
              />
            </View>

            {/* Intensity (non-musculation) */}
            {!isMusculation && (
              <View style={styles.section}>
                <Text style={styles.label}>{t('intensity')}</Text>
                <View style={styles.intensityRow}>
                  {(['easy', 'moderate', 'intense'] as Intensity[]).map((level) => (
                    <Pressable
                      key={level}
                      style={[styles.intensityBtn, intensity === level && styles.intensityBtnActive]}
                      onPress={() => setIntensity(level)}
                    >
                      <Text style={[styles.intensityText, intensity === level && styles.intensityTextActive]}>
                        {t((`intensity${level.charAt(0).toUpperCase() + level.slice(1)}`) as any)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Exercises (musculation) */}
            {isMusculation && (
              <View style={styles.section}>
                <Text style={styles.label}>{t('pickExercises')}</Text>
                {exercises.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    autoFillHint={autoFilledIds.has(ex.id)}
                    onUpdateSets={(sets) =>
                      setExercises((prev) =>
                        prev.map((e) => (e.id === ex.id ? { ...e, sets } : e))
                      )
                    }
                    onRemoveExercise={() =>
                      setExercises((prev) => prev.filter((e) => e.id !== ex.id))
                    }
                  />
                ))}
                <Pressable style={styles.addExBtn} onPress={() => setShowPicker(true)}>
                  <Text style={styles.addExText}>{t('addExercise')}</Text>
                </Pressable>
              </View>
            )}

            {/* Note */}
            <View style={styles.section}>
              <Text style={styles.label}>{t('addNote')}</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder={t('notePlaceholder')}
                placeholderTextColor="#555"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save */}
            <Pressable
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={styles.saveBtnText}>{t('saveWorkout')}</Text>
            </Pressable>
          </>
        )}

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectExercise}
        alreadySelected={exercises.map((e) => e.exerciseId)}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center' as const,
    width: '100%' as any,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  durationInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    color: colors.text,
    width: 120,
    textAlign: 'center' as const,
  },
  intensityRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  intensityBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  intensityBtnActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  intensityText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  intensityTextActive: {
    color: colors.primary,
  },
  addExBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed' as const,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  addExText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    textAlignVertical: 'top' as const,
    minHeight: 80,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.white,
  },
}));
