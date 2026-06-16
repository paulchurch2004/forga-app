// Anneau de score animé + halo — la pièce maîtresse visuelle de FORGA.
// L'arc se remplit (0 → score) avec un dégradé chaud (orange → doré) et un
// halo "Glow" derrière. Le score est affiché au centre.
//
// SVG (universel) + reanimated pour l'animation. Version web statique :
// ScoreRing.web.tsx (évite les soucis reanimated+SVG sur web).

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';
import { Glow } from './Glow';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ScoreRing({
  score,
  size = 124,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = (size - strokeWidth) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      150,
      withTiming(clamped / 100, { duration: 1100, easing: Easing.out(Easing.cubic) }),
    );
  }, [clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Glow color="#FF6B35" size={size * 1.35} intensity={0.4} style={styles.glow} />
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8C40" />
            <Stop offset="1" stopColor="#FFD27A" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={c}
          cy={c}
          r={r}
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.num}>{clamped}</Text>
        <Text style={styles.max}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  num: {
    fontFamily: fonts.data,
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  max: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    marginTop: 1,
  },
});
