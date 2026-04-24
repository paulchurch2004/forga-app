import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export interface QuickStatItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  hintColor?: string;
}

interface QuickStatsRowProps {
  items: QuickStatItem[]; // typically 3
  onPress?: (id: string) => void;
}

export function QuickStatsRow({ items, onPress }: QuickStatsRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onPress?.(item.id)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Text style={styles.label}>{item.label.toUpperCase()}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{item.value}</Text>
            {item.unit ? <Text style={styles.unit}>{item.unit}</Text> : null}
          </View>
          {item.hint ? (
            <Text style={[styles.hint, item.hintColor && { color: item.hintColor }]}>{item.hint}</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  card: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
    marginTop: 3,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#FF6B35',
    marginTop: 2,
  },
});
