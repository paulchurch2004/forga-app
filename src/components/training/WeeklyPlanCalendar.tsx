import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import type { PlannedDay } from '../../types/program';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface Props {
  weekDays: PlannedDay[];
}

export function WeeklyPlanCalendar({ weekDays }: Props) {
  const styles = useStyles();
  const { t } = useT();
  const { colors } = useTheme();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.container}>
      <Text style={styles.title}>{t('yourWeek')}</Text>
      <View style={styles.row}>
        {weekDays.map((day, idx) => {
          const isToday = day.date === todayStr;
          const isCompleted = day.status === 'completed';
          const isRest = day.status === 'rest';
          const isSkipped = day.status === 'skipped';
          const isCardio = day.programDayId?.startsWith('cardio_');

          return (
            <View key={day.date} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {DAY_LABELS[idx] ?? '?'}
              </Text>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isToday && !isCompleted && styles.circleToday,
                  isSkipped && styles.circleSkipped,
                  isRest && styles.circleRest,
                ]}
              >
                {isCompleted ? (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke={colors.white}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : isRest ? (
                  <Text style={styles.restIcon}>—</Text>
                ) : isSkipped ? (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M18 6L6 18M6 6l12 12"
                      stroke={colors.error}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                  </Svg>
                ) : isCardio ? (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke={isToday ? colors.primary : colors.textMuted}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                ) : (
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 5v14M18 5v14M6 12h12M4 5h4M4 19h4M16 5h4M16 19h4"
                      stroke={isToday ? colors.primary : colors.textMuted}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Svg>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  dayCol: {
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  dayLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '500' as const,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700' as const,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  circleCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  circleToday: {
    borderColor: colors.primary,
    borderStyle: 'dashed' as const,
  },
  circleSkipped: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}15`,
  },
  circleRest: {
    borderColor: colors.border,
    backgroundColor: `${colors.textMuted}10`,
  },
  restIcon: {
    fontFamily: fonts.data,
    fontSize: 14,
    color: colors.textMuted,
  },
}));
