// Version WEB de ForgeEmbersBackground (Metro choisit ce fichier sur web).
//
// On évite Skia/CanvasKit (WASM lourd pour un PWA) : un simple dégradé chaud
// statique en bas suffit pour garder l'ambiance "forge" sans plomber le web.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE = '#07070D';

export function ForgeEmbersBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: BASE }, style]} pointerEvents="none">
      <LinearGradient
        colors={['rgba(7,7,13,0)', 'rgba(255,107,53,0.10)']}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
