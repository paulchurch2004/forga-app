import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export type DayStatus = 'done' | 'today' | 'rest' | 'plan';

export interface WeekDayItem {
  letter: string; // "L", "M", etc.
  status: DayStatus;
}

interface WeeklyDaysGridProps {
  title?: string;
  days: WeekDayItem[];
}

const STATUS_COLOR: Record<DayStatus, string> = {
  done: '#00D4AA',
  today: '#FF6B35',
  rest: 'rgba(255,255,255,0.10)',
  plan: 'rgba(255,255,255,0.15)',
};

export function WeeklyDaysGrid({ title = 'CETTE SEMAINE', days }: WeeklyDaysGridProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {days.map((d, i) => (
          <View key={i} style={styles.col}>
            <Text style={styles.letter}>{d.letter}</Text>
            <View
              style={[
                styles.square,
                { backgroundColor: STATUS_COLOR[d.status] },
                d.status === 'today' && styles.squareToday,
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  letter: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 6,
  },
  square: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  squareToday: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
});
