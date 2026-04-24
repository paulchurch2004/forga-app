import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';

export interface SubstituteOption {
  id: string;
  name: string;
  sets: number;
  reps: string;
  /** 0–100 match score */
  match: number;
}

interface ReplaceExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  /** Name of the exercise being replaced */
  originalName?: string;
  substitutes: SubstituteOption[];
  onPick: (substitute: SubstituteOption) => void;
}

export function ReplaceExerciseSheet({ open, onClose, originalName, substitutes, onPick }: ReplaceExerciseSheetProps) {
  return (
    <ProfileSheet
      open={open}
      onClose={onClose}
      title="Remplacer cet exercice"
      subtitle={originalName ? `À la place de "${originalName}"` : 'Choisis un substitut'}
    >
      {substitutes.length === 0 ? (
        <Text style={styles.empty}>Aucun substitut suggéré pour cet exercice.</Text>
      ) : (
        substitutes.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => {
              onPick(s);
              onClose();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={[styles.matchBadge, { backgroundColor: matchColor(s.match) }]}>
              <Text style={styles.matchText}>{s.match}%</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{s.name}</Text>
              <Text style={styles.target}>{s.sets} × {s.reps}</Text>
            </View>
            <ChevronRightIcon />
          </Pressable>
        ))
      )}
    </ProfileSheet>
  );
}

function matchColor(match: number): string {
  if (match >= 90) return 'rgba(0,212,170,0.20)';
  if (match >= 75) return 'rgba(255,201,77,0.20)';
  return 'rgba(255,107,53,0.15)';
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.38)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    paddingVertical: 28,
  },
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
  matchBadge: {
    width: 44,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchText: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  target: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 3,
  },
});
