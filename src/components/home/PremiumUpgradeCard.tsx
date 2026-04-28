import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface PremiumUpgradeCardProps {
  onPress: () => void;
  /** Optional one-line override for the headline. */
  headline?: string;
}

export function PremiumUpgradeCard({ onPress, headline }: PremiumUpgradeCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.row}>
        <LinearGradient
          colors={['#FF8C40', '#CC5424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <SparkleIcon />
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>FORGA PRO</Text>
          <Text style={styles.headline}>
            {headline ?? 'Débloque ton coach IA illimité'}
          </Text>
          <Text style={styles.subtitle}>
            Coach + scan repas + programmes complets · 7 jours d'essai gratuit
          </Text>
        </View>

        <ChevronRightIcon />
      </View>
    </Pressable>
  );
}

function SparkleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.85)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.40)',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,107,53,0.30)',
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    lineHeight: 15,
  },
});
