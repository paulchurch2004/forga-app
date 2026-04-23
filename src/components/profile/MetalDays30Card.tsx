import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export type MetalKey = 'plomb' | 'bronze' | 'fer' | 'acier' | 'or' | 'repos';

const METAL_COLOR: Record<MetalKey, string> = {
  plomb: '#7A8290',
  bronze: '#CD7F32',
  fer: '#A8A8A8',
  acier: '#E8E8EE',
  or: '#FFB347',
  repos: '#3A3A48',
};

interface MetalDays30CardProps {
  days: MetalKey[]; // 30 entries (one per day)
}

export function MetalDays30Card({ days }: MetalDays30CardProps) {
  // Pad to 30 with 'repos' if shorter
  const padded = days.length >= 30 ? days.slice(0, 30) : [...days, ...Array(30 - days.length).fill('repos' as MetalKey)];
  const solidCount = padded.filter((d) => d !== 'repos' && d !== 'plomb').length;

  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        {padded.map((m, i) => (
          <View
            key={i}
            style={[
              styles.cell,
              {
                backgroundColor: METAL_COLOR[m],
                opacity: m === 'repos' ? 0.5 : 1,
                shadowColor: METAL_COLOR[m],
                shadowOpacity: m === 'repos' ? 0 : 0.4,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.legend}>
          {(['or', 'acier', 'fer', 'bronze'] as MetalKey[]).map((k) => (
            <View key={k} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: METAL_COLOR[k] }]} />
              <Text style={styles.legendLabel}>{LEGEND_LABEL[k]}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.solidLabel}>{solidCount}/30 solides</Text>
      </View>
    </View>
  );
}

const LEGEND_LABEL: Record<string, string> = {
  or: 'Or',
  acier: 'Acier',
  fer: 'Fer',
  bronze: 'Bronze',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: '6.0%',
    aspectRatio: 1,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    elevation: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  legend: {
    flexDirection: 'row',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.6,
  },
  solidLabel: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
  },
});
