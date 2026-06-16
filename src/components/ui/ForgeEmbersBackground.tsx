// Fond animé "Braises de forge" (thème FORGA = forger son corps).
//
// Rendu GPU via Skia → fluide 60fps même avec ~18 particules floutées.
// Des braises orange/dorées montent lentement du bas, dérivent, scintillent
// (fondu entrée/sortie) puis disparaissent en haut. + un halo chaud en bas.
//
// Composant de FOND : à monter en absolute-fill DERRIÈRE le contenu, avec
// pointerEvents="none" pour ne jamais capter les touches.
//
// NB : une version web légère existe (ForgeEmbersBackground.web.tsx) que
// Metro choisit automatiquement → pas de CanvasKit/WASM chargé sur le PWA.

import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Canvas,
  Rect,
  Circle,
  BlurMask,
  RadialGradient,
  vec,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

const BASE = '#07070D';
const EMBER_COLORS = ['#FF6B35', '#FF8A3D', '#FFB347', '#FFD27A'];
const COUNT = 18;

type Seed = {
  x0: number;
  size: number;
  duration: number;
  phase: number;
  drift: number;
  color: string;
  maxOpacity: number;
};

function Ember({
  clock,
  seed,
  w,
  h,
}: {
  clock: SharedValue<number>;
  seed: Seed;
  w: number;
  h: number;
}) {
  // progress 0→1 en boucle (montée d'une braise).
  const progress = useDerivedValue(
    () => ((clock.value + seed.phase) % seed.duration) / seed.duration,
  );
  // dérive horizontale sinusoïdale.
  const cx = useDerivedValue(
    () => seed.x0 * w + Math.sin(progress.value * Math.PI * 2 + seed.phase) * seed.drift,
  );
  // monte du bas (h+20) vers le haut (-20).
  const cy = useDerivedValue(() => h + 20 - progress.value * (h + 40));
  // fondu : invisible aux extrémités, max au milieu.
  const opacity = useDerivedValue(() => Math.sin(progress.value * Math.PI) * seed.maxOpacity);

  return (
    <Circle cx={cx} cy={cy} r={seed.size} color={seed.color} opacity={opacity}>
      <BlurMask blur={seed.size * 1.8} style="normal" />
    </Circle>
  );
}

export function ForgeEmbersBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const seeds = useMemo<Seed[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        x0: Math.random(),
        size: 1.4 + Math.random() * 2.4,
        duration: 5000 + Math.random() * 6000,
        phase: Math.random() * 11000,
        drift: 8 + Math.random() * 22,
        color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
        maxOpacity: 0.35 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Base sombre */}
        <Rect x={0} y={0} width={width} height={height} color={BASE} />
        {/* Halo chaud en bas (lumière de la forge) */}
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width / 2, height * 0.98)}
            r={width * 0.95}
            colors={['rgba(255,107,53,0.20)', 'rgba(255,107,53,0.04)', 'rgba(7,7,13,0)']}
          />
        </Rect>
        {/* Braises */}
        {seeds.map((seed, i) => (
          <Ember key={i} clock={clock} seed={seed} w={width} h={height} />
        ))}
      </Canvas>
    </View>
  );
}
