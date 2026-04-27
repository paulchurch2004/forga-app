import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface ExerciseHeaderProps {
  /** 1-based index of the current exercise */
  index: number;
  /** Total number of exercises in the session */
  total: number;
  /** Localized exercise name */
  name: string;
  /** Last performance line, e.g. "Dernière fois : 80kg × 8 · Il y a 4j" */
  lastPerformance?: string;
  /** Trend delta in kg (positive = improvement). Renders the green pill if > 0. */
  trendKg?: number;
}

export function ExerciseHeader({ index, total, name, lastPerformance, trendKg }: ExerciseHeaderProps) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>
        EXERCICE <Text style={styles.eyebrowMono}>{pad(index)}/{pad(total)}</Text>
      </Text>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.metaRow}>
        {lastPerformance ? <Text style={styles.lastPerf}>{lastPerformance}</Text> : null}
        {trendKg !== undefined && trendKg > 0 ? (
          <View style={styles.trendRow}>
            <TrendingIcon />
            <Text style={styles.trendText}>+{trendKg}kg</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TrendingIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 17 L9 11 L13 15 L21 7 M15 7 H21 V13"
        stroke="#00D4AA"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eyebrowMono: {
    fontFamily: fonts.data,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  lastPerf: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: '#00D4AA',
    fontWeight: '600',
  },
});
