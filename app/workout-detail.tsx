import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';
import { useTrainingStore } from '../src/store/trainingStore';
import { getWorkoutTypeIcon, getWorkoutTypeKey, getIntensityKey } from '../src/hooks/useTraining';

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { t } = useT();
  const styles = useStyles();
  const { workoutId, date } = useLocalSearchParams<{ workoutId: string; date: string }>();
  const workouts = useTrainingStore((s) => s.getWorkoutsForDate(date ?? ''));
  const removeWorkout = useTrainingStore((s) => s.removeWorkout);

  const workout = workouts.find((w) => w.id === workoutId);

  if (!workout) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.headerRow}>
          <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    const doDelete = () => {
      removeWorkout(workout.date, workout.id);
      router.back();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('deleteWorkoutConfirm'))) doDelete();
    } else {
      Alert.alert(t('deleteWorkoutConfirm'), '', [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.wrapper, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={16} style={styles.headerRow}>
        <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
      </Pressable>

      <Text style={styles.pageTitle}>{t('workoutDetail')}</Text>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryIcon}>{getWorkoutTypeIcon(workout.type)}</Text>
        <Text style={styles.summaryType}>{t(getWorkoutTypeKey(workout.type) as any)}</Text>
        <View style={styles.summaryMeta}>
          <Text style={styles.metaItem}>{workout.date}</Text>
          <Text style={styles.metaDot}>{'\u00B7'}</Text>
          <Text style={styles.metaItem}>{t('durationMinutes', { count: workout.durationMinutes })}</Text>
          <Text style={styles.metaDot}>{'\u00B7'}</Text>
          <Text style={styles.metaItem}>{t(getIntensityKey(workout.intensity) as any)}</Text>
        </View>
      </View>

      {/* Exercises */}
      {workout.exercises.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sets')}</Text>
          {workout.exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/exercise-progress',
                      params: { exerciseId: ex.exerciseId, exerciseName: ex.exerciseName },
                    })
                  }
                >
                  <Text style={styles.progressLink}>{t('seeProgression')}</Text>
                </Pressable>
              </View>
              {ex.sets.map((set, i) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNum}>#{i + 1}</Text>
                  <Text style={styles.setDetail}>{set.reps} reps</Text>
                  <Text style={styles.setDetail}>{set.weight} kg</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Note */}
      {workout.note && (
        <View style={styles.section}>
          <Text style={styles.noteLabel}>{t('addNote')}</Text>
          <Text style={styles.noteText}>{workout.note}</Text>
        </View>
      )}

      {/* Delete */}
      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>{t('deleteWorkout')}</Text>
      </Pressable>

      <View style={{ height: spacing['5xl'] }} />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  summaryIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  summaryType: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  metaItem: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
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
  progressLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  setRow: {
    flexDirection: 'row' as const,
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  setNum: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    width: 30,
  },
  setDetail: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  noteLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    marginTop: spacing.lg,
  },
  deleteBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.error,
  },
}));
