import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import type { ExerciseSet, WorkoutExercise } from '../../types/training';

interface Props {
  exercise: WorkoutExercise;
  autoFillHint: boolean;
  onUpdateSets: (sets: ExerciseSet[]) => void;
  onRemoveExercise: () => void;
}

export function ExerciseRow({ exercise, autoFillHint, onUpdateSets, onRemoveExercise }: Props) {
  const styles = useStyles();
  const { t } = useT();

  const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
    const num = parseInt(value, 10) || 0;
    const newSets = exercise.sets.map((s, i) =>
      i === index ? { ...s, [field]: num } : s
    );
    onUpdateSets(newSets);
  };

  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      reps: lastSet?.reps ?? 10,
      weight: lastSet?.weight ?? 0,
    };
    onUpdateSets([...exercise.sets, newSet]);
  };

  const removeSet = (index: number) => {
    onUpdateSets(exercise.sets.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Pressable onPress={onRemoveExercise} hitSlop={8}>
          <Text style={styles.removeBtn}>{'\u2715'}</Text>
        </Pressable>
      </View>

      {autoFillHint && (
        <Text style={styles.autoFillHint}>{t('autoFilled')}</Text>
      )}

      {/* Header row */}
      <View style={styles.setHeader}>
        <Text style={[styles.setHeaderLabel, { flex: 0.5 }]}>#</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>{t('reps')}</Text>
        <Text style={[styles.setHeaderLabel, { flex: 1 }]}>{t('weightKg')}</Text>
        <View style={{ width: 28 }} />
      </View>

      {exercise.sets.map((set, i) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={[styles.setNum, { flex: 0.5 }]}>{i + 1}</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={set.reps > 0 ? String(set.reps) : ''}
            onChangeText={(v) => updateSet(i, 'reps', v)}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="#555"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={set.weight > 0 ? String(set.weight) : ''}
            onChangeText={(v) => updateSet(i, 'weight', v)}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#555"
          />
          <Pressable onPress={() => removeSet(i)} hitSlop={4} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>{'\u2212'}</Text>
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addSetBtn} onPress={addSet}>
        <Text style={styles.addSetText}>{t('addSet')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
    color: colors.text,
  },
  removeBtn: {
    fontSize: fontSizes.md,
    color: colors.error,
    fontWeight: '600' as const,
  },
  autoFillHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontStyle: 'italic' as const,
  },
  setHeader: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  setHeaderLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '600' as const,
  },
  setRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  setNum: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.text,
    textAlign: 'center' as const,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.error}20`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: fontSizes.md,
    fontWeight: '700' as const,
  },
  addSetBtn: {
    alignSelf: 'flex-start' as const,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addSetText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.primary,
  },
}));
