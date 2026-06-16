// Ligne "action en attente" qui SCINTILLE doucement (respiration) pour
// attirer l'œil — utilisée dans les encarts "à compléter" (fil d'Ariane).
//
// Animation : bordure + halo orange qui pulsent en boucle, + le point
// rouge qui bat légèrement. reanimated (déjà natif dans l'app).

import React, { useEffect } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { fonts, fontSizes, spacing } from '../../theme';
import { NotifDot } from './NotifDot';

const ACCENT = '#FF6B35';

export function PendingActionRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    // 0 → 1 → 0 en boucle (respiration lente).
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      pulse.value,
      [0, 1],
      ['rgba(255,107,53,0.22)', 'rgba(255,107,53,0.8)'],
    ),
    shadowOpacity: 0.12 + pulse.value * 0.4,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.35 }],
    opacity: 0.7 + pulse.value * 0.3,
  }));

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
      <Animated.View style={[styles.card, { backgroundColor: colors.surface }, cardStyle]}>
        <Animated.View style={dotStyle}>
          <NotifDot />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'›'}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    elevation: 6,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  arrow: {
    fontSize: 22,
    fontWeight: '300',
  },
});
