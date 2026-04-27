import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';
import type { SelectedDayExercise } from './SelectedDayCard';

interface SessionPreviewSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  exercises: SelectedDayExercise[];
  onExercisePress?: (ex: SelectedDayExercise) => void;
}

export function SessionPreviewSheet({ open, onClose, title, exercises, onExercisePress }: SessionPreviewSheetProps) {
  return (
    <ProfileSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={`${exercises.length} exercices · tap pour remplacer`}
    >
      {exercises.map((ex, i) => (
        <Pressable
          key={ex.id}
          onPress={() => {
            onExercisePress?.(ex);
            onClose();
          }}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.index}>{String(i + 1).padStart(2, '0')}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{ex.name}</Text>
            {ex.restSec !== undefined && (
              <Text style={styles.meta}>
                Récup {Math.floor(ex.restSec / 60)}:{String(ex.restSec % 60).padStart(2, '0')}
              </Text>
            )}
          </View>
          <Text style={styles.target}>{ex.sets}×{ex.reps}</Text>
          <ChevronRightIcon />
        </Pressable>
      ))}
    </ProfileSheet>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.38)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  index: {
    fontFamily: fonts.data,
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '700',
    width: 24,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  meta: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  target: {
    fontFamily: fonts.data,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '600',
  },
});
