import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface PrNearAlertProps {
  currentPrKg: number;
  targetKg: number; // suggested attempt
}

export function PrNearAlert({ currentPrKg, targetKg }: PrNearAlertProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <TrophyIcon />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.eyebrow}>RECORD PROCHE</Text>
        <Text style={styles.body}>
          PR actuel <Text style={styles.mono}>{currentPrKg}kg</Text> · tente{' '}
          <Text style={styles.mono}>{targetKg}kg</Text> ?
        </Text>
      </View>
    </View>
  );
}

function TrophyIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 4 H17 V8 A5 5 0 0 1 7 8 V4 Z M5 6 H7 V8 A2 2 0 0 1 5 8 V6 Z M17 6 H19 V8 A2 2 0 0 1 17 8 V6 Z M9 14 H15 V18 H9 Z M7 20 H17"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginTop: 14,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  mono: {
    fontFamily: fonts.data,
    fontWeight: '700',
  },
});
