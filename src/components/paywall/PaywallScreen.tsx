// PaywallScreen is implemented directly in app/paywall.tsx
// This file provides a reusable paywall trigger component

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { fontSizes } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';

interface PaywallTriggerProps {
  feature: string;
  trigger: string;
}

/**
 * Inline paywall trigger — shows a locked feature with CTA to open paywall
 */
export function PaywallTrigger({ feature, trigger }: PaywallTriggerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.lock}>PRO</Text>
      <Text style={styles.text}>{feature}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/paywall')}
      >
        <Text style={styles.buttonText}>Débloquer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  lock: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  text: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  buttonText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.white,
  },
});
