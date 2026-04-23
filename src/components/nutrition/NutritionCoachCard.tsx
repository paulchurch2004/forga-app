import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface NutritionCoachCardProps {
  timeLabel?: string;
  message: string;
  highlights?: string[];
}

export function NutritionCoachCard({ timeLabel, message, highlights }: NutritionCoachCardProps) {
  const renderMessage = () => {
    if (!highlights || highlights.length === 0) {
      return <Text style={styles.message}>{message}</Text>;
    }
    const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const parts = message.split(new RegExp(`(${escaped.join('|')})`, 'g'));
    return (
      <Text style={styles.message}>
        {parts.map((p, i) =>
          highlights.includes(p) ? (
            <Text key={i} style={styles.highlight}>
              {p}
            </Text>
          ) : (
            p
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.glow} pointerEvents="none" />
      <LinearGradient
        colors={['#FF8C40', '#CC5424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <SparkleIcon />
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>COACH{timeLabel ? ` · ${timeLabel}` : ''}</Text>
        {renderMessage()}
      </View>
    </View>
  );
}

function SparkleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
        fill="#FFFFFF"
      />
      <Path d="M19 16 L19.6 18 L21.5 18.5 L19.6 19 L19 21 L18.4 19 L16.5 18.5 L18.4 18 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,107,53,0.30)',
    opacity: 0.5,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 6,
    lineHeight: 19,
  },
  highlight: {
    fontFamily: fonts.data,
    color: '#FF6B35',
  },
});
