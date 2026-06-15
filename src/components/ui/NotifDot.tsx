// Petit point rouge "à faire" (façon Instagram), réutilisable dans les
// écrans pour faire suivre le fil d'Ariane depuis la tab bar jusqu'à
// l'élément exact à actionner.

import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

export function NotifDot({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
});
