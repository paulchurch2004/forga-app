// FORGA — Visual lock badge to mark a feature as Premium-only.
// Renders a small orange pill with a lock glyph + label. Pressing it opens
// the paywall via the parent's onPress handler.

import React from 'react';
import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { fonts } from '../../theme/fonts';

interface PremiumLockProps {
  /** Tap handler — typically routes to /paywall. */
  onPress?: () => void;
  /** Optional label, defaults to "Premium". */
  label?: string;
  /** Layout variant: "pill" (compact badge) or "banner" (full-width row). */
  variant?: 'pill' | 'banner';
  /** Subtitle shown only in banner variant. */
  subtitle?: string;
  style?: ViewStyle;
}

export function PremiumLock({
  onPress,
  label = 'Premium',
  variant = 'pill',
  subtitle,
  style,
}: PremiumLockProps) {
  if (variant === 'banner') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.banner,
          pressed && { opacity: 0.85 },
          style,
        ]}
      >
        <View style={styles.bannerIcon}>
          <Text style={styles.lockGlyph}>{'🔒'}</Text>
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>{label}</Text>
          {subtitle ? <Text style={styles.bannerSubtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.bannerCta}>Debloquer  {'→'}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={styles.pillLock}>{'🔒'}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.45)',
    alignSelf: 'flex-start',
  },
  pillLock: {
    fontSize: 10,
  },
  pillLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 53, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.40)',
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 53, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGlyph: {
    fontSize: 18,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  bannerCta: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
  },
});
