import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
];

interface CalendarGridProps {
  currentMonth: Date;
  markedDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onChangeMonth: (delta: number) => void;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function CalendarGrid({
  currentMonth,
  markedDates,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: CalendarGridProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const todayKey = getTodayKey();

  // First day of the month (0=Sun, adjust to Mon=0)
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.header}>
        <Pressable onPress={() => onChangeMonth(-1)} hitSlop={12}>
          <Text style={styles.arrow}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_LABELS[month]} {year}
        </Text>
        <Pressable onPress={() => onChangeMonth(1)} hitSlop={12}>
          <Text style={styles.arrow}>{'\u2192'}</Text>
        </Pressable>
      </View>

      {/* Day-of-week header */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Date grid */}
      {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
        <View key={rowIdx} style={styles.weekRow}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            if (day === null) {
              return <View key={colIdx} style={styles.dayCell} />;
            }

            const dateKey = formatDateKey(year, month, day);
            const isSelected = selectedDate === dateKey;
            const isToday = dateKey === todayKey;
            const isMarked = markedDates.has(dateKey);

            return (
              <Pressable
                key={colIdx}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
                onPress={() => onSelectDate(dateKey)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {day}
                </Text>
                {isMarked && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arrow: {
    fontSize: 20,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  monthLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayNumber: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  dayNumberSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 4,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
});
