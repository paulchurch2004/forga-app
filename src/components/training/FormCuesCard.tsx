import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

interface FormCuesCardProps {
  cues: string[]; // 3 short execution tips
}

export function FormCuesCard({ cues }: FormCuesCardProps) {
  if (cues.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>POINTS CLÉS D'EXÉCUTION</Text>
      <View style={styles.list}>
        {cues.map((cue, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.index}>{i + 1}</Text>
            <Text style={styles.cue}>{cue}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '700',
    marginBottom: 8,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  index: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    minWidth: 14,
  },
  cue: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 16,
  },
});
