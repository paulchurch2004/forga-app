import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface DeloadBannerProps {
  exerciseName: string;
  currentWeight: number;
  /** Suggested deload weight (kg). */
  suggestedWeight: number;
  onAccept: () => void;
  onDismiss: () => void;
}

export function DeloadBanner({
  exerciseName,
  currentWeight,
  suggestedWeight,
  onAccept,
  onDismiss,
}: DeloadBannerProps) {
  return (
    <Animated.View entering={FadeInDown.duration(280)} style={styles.banner}>
      <View style={styles.iconWrap}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6"
            stroke="#C4923F"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Deload conseillé</Text>
        <Text style={styles.body}>
          Tu galères depuis 2 séances sur <Text style={styles.bold}>{exerciseName}</Text>. On baisse à{' '}
          <Text style={styles.weight}>{suggestedWeight} kg</Text> au lieu de {currentWeight} kg pour bien
          récupérer.
        </Text>
        <View style={styles.actions}>
          <Pressable style={styles.acceptBtn} onPress={onAccept} hitSlop={6}>
            <Text style={styles.acceptText}>OK, deload</Text>
          </Pressable>
          <Pressable style={styles.dismissBtn} onPress={onDismiss} hitSlop={6}>
            <Text style={styles.dismissText}>Garder {currentWeight} kg</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(196,146,63,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(196,146,63,0.40)',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(196,146,63,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#C4923F',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
    marginBottom: 10,
  },
  bold: { fontWeight: '700' },
  weight: { fontWeight: '700', color: '#FFD27A' },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: '#C4923F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  acceptText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dismissText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
