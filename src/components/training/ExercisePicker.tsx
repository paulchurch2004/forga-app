import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { getExercisesByGroup, searchExercises } from '../../data/exercises';
import type { Exercise, MuscleGroup } from '../../types/training';

const GROUP_KEYS: Record<MuscleGroup, string> = {
  chest: 'groupChest',
  back: 'groupBack',
  shoulders: 'groupShoulders',
  arms: 'groupArms',
  legs: 'groupLegs',
  core: 'groupCore',
  cardio: 'groupCardio',
};

const GROUP_ORDER: MuscleGroup[] = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  alreadySelected: string[];
}

export function ExercisePicker({ visible, onClose, onSelect, alreadySelected }: Props) {
  const styles = useStyles();
  const { t } = useT();
  const [query, setQuery] = useState('');

  const getName = (key: string) => t(key as any);

  const grouped = useMemo(() => {
    if (query.trim()) {
      const results = searchExercises(query, getName);
      return { search: results };
    }
    return getExercisesByGroup();
  }, [query, t]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('pickExercises')}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeBtn}>{'\u2715'}</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchExercise')}
          placeholderTextColor="#666"
          autoCorrect={false}
        />

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {query.trim() ? (
            // Search results
            <>
              {(grouped as any).search?.map((ex: Exercise) => (
                <ExerciseItem
                  key={ex.id}
                  exercise={ex}
                  disabled={alreadySelected.includes(ex.id)}
                  onSelect={onSelect}
                  getName={getName}
                />
              ))}
              {(grouped as any).search?.length === 0 && (
                <Text style={styles.emptyText}>{t('noExercisesFound')}</Text>
              )}
            </>
          ) : (
            // Grouped by muscle
            GROUP_ORDER.map((group) => {
              const exercises = (grouped as Record<MuscleGroup, Exercise[]>)[group];
              if (!exercises || exercises.length === 0) return null;
              return (
                <View key={group}>
                  <Text style={styles.groupTitle}>{t(GROUP_KEYS[group] as any)}</Text>
                  {exercises.map((ex) => (
                    <ExerciseItem
                      key={ex.id}
                      exercise={ex}
                      disabled={alreadySelected.includes(ex.id)}
                      onSelect={onSelect}
                      getName={getName}
                    />
                  ))}
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function ExerciseItem({ exercise, disabled, onSelect, getName }: {
  exercise: Exercise;
  disabled: boolean;
  onSelect: (ex: Exercise) => void;
  getName: (key: string) => string;
}) {
  const styles = useStyles();

  return (
    <Pressable
      style={[styles.exerciseItem, disabled && styles.exerciseItemDisabled]}
      onPress={() => !disabled && onSelect(exercise)}
      disabled={disabled}
    >
      <Text style={[styles.exerciseName, disabled && styles.exerciseNameDisabled]}>
        {getName(exercise.nameKey)}
      </Text>
      {exercise.isCompound && <Text style={styles.compoundBadge}>C</Text>}
    </Pressable>
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
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700' as const,
    color: colors.text,
  },
  closeBtn: {
    fontSize: fontSizes.xl,
    color: colors.textSecondary,
  },
  searchInput: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.primary,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseItemDisabled: {
    opacity: 0.4,
  },
  exerciseName: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  exerciseNameDisabled: {
    color: colors.textMuted,
  },
  compoundBadge: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.primary,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden' as const,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: spacing['3xl'],
  },
}));
