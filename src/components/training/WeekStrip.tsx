import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export type DayStatus = 'done' | 'today' | 'rest' | 'plan';

export interface WeekDay {
  letter: string;
  status: DayStatus;
}

interface WeekStripProps {
  title?: string;
  days: WeekDay[];
}

const STATUS_COLOR: Record<DayStatus, string> = {
  done: '#00D4AA',
  today: '#FF6B35',
  rest: 'rgba(255,255,255,0.10)',
  plan: 'rgba(255,255,255,0.15)',
};

export function WeekStrip({ title = 'CETTE SEMAINE', days }: WeekStripProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {days.map((d, i) => (
          <View key={i} style={styles.col}>
            <Text style={styles.dayLetter}>{d.letter}</Text>
            <View
              style={[
                styles.dayBox,
                {
                  backgroundColor: STATUS_COLOR[d.status],
                  borderWidth: d.status === 'today' ? 2 : 0,
                  borderColor: '#FF6B35',
                  shadowOpacity: d.status === 'today' ? 0.5 : 0,
                },
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
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  dayLetter: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 6,
  },
  dayBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
});
