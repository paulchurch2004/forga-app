import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export type MetalDay = 'lead' | 'bronze' | 'iron' | 'steel' | 'gold' | 'rest';

const METAL_COLOR: Record<MetalDay, string> = {
  lead: '#6b6b7a',
  bronze: '#cd7f32',
  iron: '#8a9099',
  steel: '#b4c0d0',
  gold: '#ffc94d',
  rest: 'rgba(255,255,255,0.06)',
};

interface MetalFriseProps {
  title?: string;
  days: MetalDay[]; // chronological — oldest first
  columns?: number;
}

export function MetalFrise({ title = '30 DERNIERS JOURS', days, columns = 15 }: MetalFriseProps) {
  return (
    <View>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.card}>
        <View style={[styles.grid, { gap: 4 }]}>
          {days.map((day, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                {
                  width: `${100 / columns}%`,
                  backgroundColor: METAL_COLOR[day],
                  shadowColor: day !== 'rest' ? METAL_COLOR[day] : 'transparent',
                  shadowOpacity: day !== 'rest' ? 0.4 : 0,
                  opacity: day === 'rest' ? 0.5 : 1,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.legendRow}>
          {(['lead', 'bronze', 'iron', 'steel', 'gold'] as const).map((m) => (
            <View key={m} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: METAL_COLOR[m] }]} />
              <Text style={styles.legendLabel}>{labelOf(m)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function labelOf(m: Exclude<MetalDay, 'rest'>): string {
  switch (m) {
    case 'lead':
      return 'Plomb';
    case 'bronze':
      return 'Bronze';
    case 'iron':
      return 'Fer';
    case 'steel':
      return 'Acier';
    case 'gold':
      return 'Or';
  }
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
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
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
  },
});
