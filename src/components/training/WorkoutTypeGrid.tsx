import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { getWorkoutTypeIcon, getWorkoutTypeKey } from '../../hooks/useTraining';
import type { WorkoutType } from '../../types/training';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WORKOUT_TYPES: WorkoutType[] = [
  'musculation', 'running', 'cycling', 'swimming', 'hiit',
  'sport_collectif', 'yoga_stretching', 'marche', 'autre',
];

interface Props {
  selectedType: WorkoutType | null;
  onSelect: (type: WorkoutType) => void;
}

function TypeButton({ type, selected, onSelect }: { type: WorkoutType; selected: boolean; onSelect: (t: WorkoutType) => void }) {
  const styles = useStyles();
  const { t } = useT();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => onSelect(type)}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[styles.typeBtn, selected && styles.typeBtnSelected, animatedStyle]}
    >
      <Text style={styles.typeIcon}>{getWorkoutTypeIcon(type)}</Text>
      <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]} numberOfLines={1}>
        {t(getWorkoutTypeKey(type) as any)}
      </Text>
    </AnimatedPressable>
  );
}

export function WorkoutTypeGrid({ selectedType, onSelect }: Props) {
  const styles = useStyles();
  const { t } = useT();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('pickWorkoutType')}</Text>
      <View style={styles.grid}>
        {WORKOUT_TYPES.map((type) => (
          <TypeButton
            key={type}
            type={type}
            selected={selectedType === type}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  typeBtn: {
    width: '31%' as any,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  typeBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  typeIcon: {
    fontSize: 24,
  },
  typeLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  typeLabelSelected: {
    color: colors.primary,
  },
}));
