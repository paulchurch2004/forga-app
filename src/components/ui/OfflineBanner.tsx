import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { useConnectivity } from '../../hooks/useConnectivity';

export function OfflineBanner() {
  const { isOnline } = useConnectivity();
  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Mode hors-ligne</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.background,
  },
});
