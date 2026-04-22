import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface CoachFocusCardProps {
  message: string;
  highlight?: string;
  onPress: () => void;
}

export function CoachFocusCard({ message, highlight, onPress }: CoachFocusCardProps) {
  const parts = highlight && message.includes(highlight) ? message.split(highlight) : null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <LinearGradient
        colors={['#FF8C40', '#CC5424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <SparkleIcon />
      </LinearGradient>

      <View style={styles.textCol}>
        <Text style={styles.eyebrow}>COACH · À L'INSTANT</Text>
        <Text style={styles.message} numberOfLines={2}>
          {parts ? (
            <>
              {parts[0]}
              <Text style={styles.highlight}>{highlight}</Text>
              {parts[1]}
            </>
          ) : (
            message
          )}
        </Text>
      </View>

      <ChevronRight />
    </Pressable>
  );
}

function SparkleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
        fill="#FFFFFF"
      />
      <Path
        d="M19 16 L19.6 18 L21.5 18.5 L19.6 19 L19 21 L18.4 19 L16.5 18.5 L18.4 18 Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6 L15 12 L9 18"
        stroke="rgba(255,255,255,0.38)"
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.20)',
    borderRadius: 18,
  },
  cardPressed: {
    opacity: 0.8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  textCol: {
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
    marginTop: 3,
    lineHeight: 18,
  },
  highlight: {
    fontFamily: fonts.data,
    color: '#FF6B35',
  },
});
