import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export interface MiniStatItem {
  label: string;
  value: string;
  unit: string;
  progress: number;
  color: string;
}

interface MiniStatsGridProps {
  items: MiniStatItem[];
}

export function MiniStatsGrid({ items }: MiniStatsGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item, i) => (
        <View key={item.label} style={styles.cell}>
          <MiniStat item={item} delay={i * 80} />
        </View>
      ))}
    </View>
  );
}

function MiniStat({ item, delay }: { item: MiniStatItem; delay: number }) {
  const done = item.progress >= 1;
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withDelay(
      delay,
      withTiming(Math.min(1, item.progress), {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [item.progress, delay]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.card, done && { borderColor: `${item.color}66` }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{item.label}</Text>
        {done && (
          <View style={[styles.checkBadge, { backgroundColor: item.color, shadowColor: item.color }]}>
            <CheckIcon />
          </View>
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, done && { color: item.color }]}>{item.value}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
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

function CheckIcon() {
  return (
    <Svg width={8} height={8} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#000" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  checkBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 8,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  barTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
});
