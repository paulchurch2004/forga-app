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

const DEFAULT_BREAKDOWN: BreakdownItem[] = [
  { label: 'Nutrition', value: 88, color: '#FF6B35' },
  { label: 'Training', value: 92, color: '#5B8BFF' },
  { label: 'Récup', value: 72, color: '#00D4AA' },
];

export function WeeklyFormCard({ score, delta = 0, breakdown = DEFAULT_BREAKDOWN }: WeeklyFormCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>INDICE DE FORME · SEMAINE</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>
              {score}
              <Text style={styles.scoreMax}>/100</Text>
            </Text>
            {delta !== 0 && (
              <View style={styles.deltaWrap}>
                <Text style={styles.deltaIcon}>{delta > 0 ? '↗' : '↘'}</Text>
                <Text style={styles.deltaText}>
                  {delta > 0 ? '+' : ''}
                  {delta}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.breakdownRow}>
        {breakdown.map((item, i) => (
          <BreakdownBar key={item.label} item={item} delay={i * 120} />
        ))}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: '#FF6B35',
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 2,
  },
  scoreValue: {
    fontFamily: fonts.data,
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.9,
    lineHeight: 32,
  },
  scoreMax: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.38)',
  },
  deltaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deltaIcon: {
    color: '#00D4AA',
    fontSize: 12,
  },
  deltaText: {
    fontFamily: fonts.data,
    color: '#00D4AA',
    fontSize: 11,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  breakdownCol: {
    flex: 1,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
});
