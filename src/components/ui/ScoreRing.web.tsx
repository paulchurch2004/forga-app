// Version WEB de ScoreRing — anneau SVG statique (rempli à la valeur finale),
// sans reanimated (évite les soucis animatedProps+SVG sur web). + halo Glow.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import { Glow } from './Glow';

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

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Glow color="#FF6B35" size={size * 1.35} intensity={0.4} style={styles.glow} />
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="scoreGradWeb" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8C40" />
            <Stop offset="1" stopColor="#FFD27A" />
          </LinearGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke="url(#scoreGradWeb)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped / 100)}
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
