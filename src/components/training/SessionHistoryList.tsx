import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export interface SessionHistoryItem {
  id: string;
  name: string; // "Pull · Dos & Biceps"
  dateLabel: string; // "Hier · 58 min"
  volumeLabel: string; // "8 420 kg vol"
  onPress?: () => void;
}

interface SessionHistoryListProps {
  items: SessionHistoryItem[];
}

export function SessionHistoryList({ items }: SessionHistoryListProps) {
  return (
    <View style={styles.list}>
      {items.map((s) => (
        <Pressable
          key={s.id}
          onPress={s.onPress}
          disabled={!s.onPress}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{s.name}</Text>
            <Text style={styles.date}>{s.dateLabel}</Text>
          </View>
          <Text style={styles.volume}>{s.volumeLabel}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.85,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  volume: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: '#FF6B35',
  },
});
