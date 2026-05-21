import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface MacroItem {
  label: string;
  value: number;
  goal: number;
  color: string;
}

interface MacroRingsCardProps {
  title?: string;
  macros: MacroItem[];
}

const RING_SIZE = 72;
const RING_RADIUS = 28;
const RING_STROKE = 4;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function MacroRingsCard({ title = 'SCORE NUTRITIONNEL DU JOUR', macros }: MacroRingsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.ringsRow}>
        {macros.map((m, i) => (
          <Ring key={m.label} item={m} delay={i * 120} />
        ))}
      </View>
    </View>
  );
}

function Ring({ item, delay }: { item: MacroItem; delay: number }) {
  const progress = useSharedValue(0);
  const target = Math.min(1, item.goal > 0 ? item.value / item.goal : 0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [target, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${CIRCUMFERENCE * progress.value} ${CIRCUMFERENCE}`,
  }));

  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringInner}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={RING_STROKE}
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={item.color}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
        <View style={styles.ringValueWrap} pointerEvents="none">
          <Text style={styles.ringValue}>{item.value}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{item.label}</Text>
      <Text style={styles.ringGoal}>/ {item.goal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 22,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  ringWrap: {
    flex: 1,
    alignItems: 'center',
  },
  ringInner: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
  },
  ringSvg: {
    transform: [{ rotateZ: '-90deg' }],
  },
  ringValueWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontFamily: fonts.data,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  ringLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
  },
  ringGoal: {
    fontFamily: fonts.data,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
});
