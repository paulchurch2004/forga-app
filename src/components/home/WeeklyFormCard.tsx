import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';
import { ScoreRing } from '../ui/ScoreRing';

const LOGO = require('../../../assets/logo/logo_sans_fond.png');

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface WeeklyFormCardProps {
  score: number;
  delta?: number;
  breakdown?: BreakdownItem[];
}

export function WeeklyFormCard({ score, delta = 0, breakdown }: WeeklyFormCardProps) {
  const { t } = useT();
  const items: BreakdownItem[] = breakdown ?? [
    { label: t('weeklyFormBreakdownNutrition'), value: 88, color: '#FF6B35' },
    { label: t('weeklyFormBreakdownConstance'), value: 92, color: '#5B8BFF' },
    { label: t('weeklyFormBreakdownDiscipline'), value: 72, color: '#00D4AA' },
  ];
  const deltaColor = delta > 0 ? '#00D4AA' : '#FF6B6B';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Anneau de score animé + halo (pièce maîtresse) */}
        <ScoreRing score={score} size={124} />

        <View style={styles.right}>
          <View style={styles.eyebrowRow}>
            <Image source={LOGO} style={styles.logoSm} resizeMode="contain" />
            <Text style={styles.eyebrow}>{t('weeklyFormEyebrow')}</Text>
            {delta !== 0 && (
              <View style={styles.deltaWrap}>
                <Text style={[styles.deltaIcon, { color: deltaColor }]}>{delta > 0 ? '↗' : '↘'}</Text>
                <Text style={[styles.deltaText, { color: deltaColor }]}>
                  {delta > 0 ? '+' : ''}
                  {delta}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.breakdownStack}>
            {items.map((item, i) => (
              <BreakdownBar key={item.label} item={item} delay={i * 120} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function BreakdownBar({ item, delay }: { item: BreakdownItem; delay: number }) {
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withDelay(
      delay,
      withTiming(item.value / 100, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [item.value, delay]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  return (
    <View style={styles.breakdownCol}>
      <View style={styles.breakdownLabelRow}>
        <Text style={styles.breakdownLabel}>{item.label}</Text>
        <Text style={[styles.breakdownValue, { color: item.color }]}>{item.value}</Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: item.color, shadowColor: item.color },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  right: {
    flex: 1,
    gap: 14,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoSm: {
    width: 20,
    height: 20,
    tintColor: '#FF6B35',
  },
  eyebrow: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  deltaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deltaIcon: {
    fontSize: 14,
  },
  deltaText: {
    fontFamily: fonts.data,
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownStack: {
    gap: 10,
  },
  breakdownCol: {
    width: '100%',
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  breakdownValue: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
  },
  barTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
