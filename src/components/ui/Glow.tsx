// Halo radial doux réutilisable (Skia GPU) — pour faire "rayonner" un
// élément (score, badge, bouton, carte). À poser en absolute DERRIÈRE le
// contenu, avec pointerEvents="none".
//
//   <Glow color="#FF6B35" size={180} intensity={0.5}
//         style={{ position:'absolute', top:-30, alignSelf:'center' }} />
//
// Version web légère : Glow.web.tsx (pas de CanvasKit/WASM).

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Glow({
  color = '#FF6B35',
  size = 160,
  intensity = 0.45,
  style,
}: {
  color?: string;
  size?: number;
  /** Opacité au centre du halo (0–1). Le bord est toujours transparent. */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const r = size / 2;
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle cx={r} cy={r} r={r}>
          <RadialGradient
            c={vec(r, r)}
            r={r}
            colors={[hexToRgba(color, intensity), hexToRgba(color, 0)]}
          />
        </Circle>
      </Canvas>
    </View>
  );
}
