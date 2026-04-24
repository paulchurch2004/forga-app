import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface WeekNavigatorProps {
  /** "Cette semaine" / "Il y a 1 sem." / "Dans 2 sem." */
  label: string;
  /** "20 — 26 avril" */
  rangeLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekNavigator({ label, rangeLabel, onPrev, onNext }: WeekNavigatorProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
        <ChevronLeftIcon />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.range}>{rangeLabel}</Text>
      </View>

      <Pressable onPress={onNext} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
        <ChevronRightIcon />
      </Pressable>
    </View>
  );
}

function ChevronLeftIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18 L9 12 L15 6" stroke="rgba(255,255,255,0.62)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.62)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  range: {
    fontFamily: fonts.data,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
});
