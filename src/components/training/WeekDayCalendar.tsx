import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

export type WeekDayStatus = 'done' | 'today' | 'rest' | 'plan' | 'skipped';

export interface WeekCalendarDay {
  letter: string; // L M M J V S D
  date: string; // "20"
  status: WeekDayStatus;
}

interface WeekDayCalendarProps {
  days: WeekCalendarDay[]; // exactly 7
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeekDayCalendar({ days, selectedIndex, onSelect }: WeekDayCalendarProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {days.map((d, i) => {
          const active = i === selectedIndex;
          const dotColor = STATUS_COLORS[d.status];
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(i)}
              style={[styles.cell, active && styles.cellActive]}
            >
              <Text style={[styles.letter, active && styles.letterActive]}>{d.letter}</Text>
              <Text style={[styles.date, active && styles.dateActive]}>{d.date}</Text>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor },
                  d.status === 'today' && styles.dotToday,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const STATUS_COLORS: Record<WeekDayStatus, string> = {
  done: '#00D4AA',
  today: '#FF6B35',
  rest: 'rgba(255,255,255,0.10)',
  plan: 'rgba(255,255,255,0.15)',
  skipped: '#FFC94D',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  cellActive: {
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderColor: 'rgba(255,107,53,0.40)',
  },
  letter: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 4,
  },
  letterActive: {
    color: '#FF6B35',
  },
  date: {
    fontFamily: fonts.data,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 8,
  },
  dateActive: {
    color: '#FFFFFF',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotToday: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
    elevation: 4,
  },
});
