import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import { BADGE_INFO, type BadgeType } from '../../types/user';

const BADGE_ICONS: Record<BadgeType, string> = {
  first_meal: '\uD83C\uDF7D',
  first_week: '\uD83D\uDD25',
  first_kilo: '\u2696',
  forgeron: '\uD83D\uDD28',
  month_of_forge: '\uD83C\uDFC6',
};

interface BadgeUnlockToastProps {
  badgeType: BadgeType | null;
  onHide: () => void;
}

export function BadgeUnlockToast({ badgeType, onHide }: BadgeUnlockToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!badgeType) return;

    // Slide down + fade in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 3s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(onHide);
    }, 3000);

    return () => {
      clearTimeout(timer);
      translateY.setValue(-100);
      opacity.setValue(0);
    };
  }, [badgeType, translateY, opacity, onHide]);

  if (!badgeType) return null;

  const info = BADGE_INFO[badgeType];
  const icon = BADGE_ICONS[badgeType];

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title}>Badge debloque !</Text>
        <Text style={styles.name}>{info.name}</Text>
        <Text style={styles.desc}>{info.description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    zIndex: 9999,
    ...shadows.card,
  },
  icon: {
    fontSize: 32,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
