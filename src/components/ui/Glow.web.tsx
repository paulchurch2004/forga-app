// Version WEB de Glow (Metro la choisit sur web) — sans Skia/CanvasKit.
// Un disque flouté via box-shadow coloré (mappé depuis shadow* en RN web).

import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

export function Glow({
  color = '#FF6B35',
  size = 160,
  intensity = 0.45,
  style,
}: {
  color?: string;
  size?: number;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size,
          backgroundColor: color,
          opacity: intensity * 0.6,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: size / 2,
        },
        style,
      ]}
    />
  );
}
