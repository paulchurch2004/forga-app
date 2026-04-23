import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export interface ExercisePreview {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

interface TodayWorkoutPreviewProps {
  type: string; // e.g. "Push · 60 min"
  title: string; // e.g. "Pectoraux & Épaules"
  intention?: string;
  exercises: ExercisePreview[];
  totalExercises: number;
  onStart: () => void;
}

export function TodayWorkoutPreview({
  type,
  title,
  intention,
  exercises,
  totalExercises,
  onStart,
}: TodayWorkoutPreviewProps) {
  const previewCount = Math.min(3, exercises.length);
  const remaining = Math.max(0, totalExercises - previewCount);
  const previewList = exercises.slice(0, previewCount);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{type.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.exoCountWrap}>
          <DumbbellIcon />
          <Text style={styles.exoCount}>{totalExercises} exos</Text>
        </View>
      </View>

      {intention && (
        <View style={styles.intentionBox}>
          <Text style={styles.intentionLabel}>OBJECTIF SÉANCE</Text>
          <Text style={styles.intentionText}>"{intention}"</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.exoList}>
        {previewList.map((e, i) => (
          <View key={e.id} style={styles.exoRow}>
            <Text style={styles.exoNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.exoName} numberOfLines={1}>{e.name}</Text>
            <Text style={styles.exoSets}>{e.sets}×{e.reps}</Text>
          </View>
        ))}
        {remaining > 0 && (
          <Text style={styles.moreLabel}>+ {remaining} autre{remaining > 1 ? 's' : ''}</Text>
        )}
      </View>

      <Pressable onPress={onStart} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
        <LinearGradient
          colors={['#FF6B35', '#FF5A1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}
        >
          <PlayIcon />
          <Text style={styles.ctaText}>Commencer la séance</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function DumbbellIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6.5 V17.5 M3 9 V15 M18 6.5 V17.5 M21 9 V15 M6 12 H18" stroke="rgba(255,255,255,0.62)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4 L20 12 L7 20 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.3,
  },
  exoCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  exoCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
  },
  intentionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B35',
    borderRadius: 8,
  },
  intentionLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: '#FF6B35',
    textTransform: 'uppercase',
  },
  intentionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },
  exoList: {
    marginBottom: 14,
  },
  exoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  exoNum: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    width: 20,
  },
  exoName: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
  },
  exoSets: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
  },
  moreLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
    paddingVertical: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
