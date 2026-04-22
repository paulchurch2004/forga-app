// AnimatedSplash — Ember Ignite cinematic splash (3s)
// Spiral embers converge → ignition flash → logo + wordmark reveal → fade to app
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, Platform } from 'react-native';
import { fonts } from '../../theme';

const { width: SW, height: SH } = Dimensions.get('window');
const CX = SW / 2;
const CY = SH * 0.38; // center point for logo/particles
const DURATION = 3000;
const IGNITE = 1550;
const WORDMARK_START = 1880;
const TAGLINE_START = 2300;

const ORANGE = '#FF6B35';
const ORANGE_DEEP = '#E04A1C';
const BG = '#0B0B14';
const WARM = '#FFC488';
const TEXT_COLOR = '#F4F2EE';

const LOGO = require('../../../assets/logo/logo_sans_fond.png');

interface Props {
  onFinish: () => void;
}

// ─── Radial Glow (simulates CSS radial-gradient with concentric circles) ────
// Original CSS: radial-gradient(circle at 50% 43%,
//   rgba(255,107,53, intensity) 0%,
//   rgba(224,74,28, intensity*0.45) 25%,
//   transparent 58%)
function RadialGlow({ intensity }: { intensity: number }) {
  if (intensity <= 0.01) return null;
  const maxR = Math.max(SW, SH) * 0.58;
  return (
    <>
      <View style={{ position: 'absolute', left: CX - maxR, top: CY - maxR, width: maxR * 2, height: maxR * 2, borderRadius: maxR, backgroundColor: ORANGE_DEEP, opacity: intensity * 0.04 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.7, top: CY - maxR * 0.7, width: maxR * 1.4, height: maxR * 1.4, borderRadius: maxR * 0.7, backgroundColor: ORANGE_DEEP, opacity: intensity * 0.12 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.5, top: CY - maxR * 0.5, width: maxR, height: maxR, borderRadius: maxR * 0.5, backgroundColor: ORANGE_DEEP, opacity: intensity * 0.25 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.35, top: CY - maxR * 0.35, width: maxR * 0.7, height: maxR * 0.7, borderRadius: maxR * 0.35, backgroundColor: ORANGE, opacity: intensity * 0.45 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.2, top: CY - maxR * 0.2, width: maxR * 0.4, height: maxR * 0.4, borderRadius: maxR * 0.2, backgroundColor: ORANGE, opacity: intensity * 0.7 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.08, top: CY - maxR * 0.08, width: maxR * 0.16, height: maxR * 0.16, borderRadius: maxR * 0.08, backgroundColor: ORANGE, opacity: intensity }} />
    </>
  );
}

// ─── Ignite Flash (radial white-warm burst) ─────────────────────
function IgniteFlash({ intensity }: { intensity: number }) {
  if (intensity <= 0) return null;
  const maxR = Math.max(SW, SH) * 0.5;
  return (
    <>
      <View style={{ position: 'absolute', left: CX - maxR * 0.5, top: CY - maxR * 0.5, width: maxR, height: maxR, borderRadius: maxR * 0.5, backgroundColor: WARM, opacity: intensity * 0.08 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.35, top: CY - maxR * 0.35, width: maxR * 0.7, height: maxR * 0.7, borderRadius: maxR * 0.35, backgroundColor: WARM, opacity: intensity * 0.2 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.2, top: CY - maxR * 0.2, width: maxR * 0.4, height: maxR * 0.4, borderRadius: maxR * 0.2, backgroundColor: '#FFC488', opacity: intensity * 0.5 }} />
      <View style={{ position: 'absolute', left: CX - maxR * 0.08, top: CY - maxR * 0.08, width: maxR * 0.16, height: maxR * 0.16, borderRadius: maxR * 0.08, backgroundColor: '#FFF6EC', opacity: intensity * 0.9 }} />
    </>
  );
}

// ─── Ember Particle ─────────────────────────────────────────────
interface EmberData {
  startAngle: number;
  startDist: number;
  spiralTurns: number;
  size: number;
  delay: number;
  dur: number;
  color: string;
  wobbleSeed: number;
  isWhite: boolean;
}

function generateEmbers(count: number): EmberData[] {
  const arr: EmberData[] = [];
  for (let i = 0; i < count; i++) {
    const isWhite = Math.random() < 0.25;
    arr.push({
      startAngle: Math.random() * Math.PI * 2,
      startDist: Math.min(SW, SH) * 0.55 + Math.random() * Math.min(SW, SH) * 0.35,
      spiralTurns: 0.6 + Math.random() * 0.8,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 900,
      dur: 1000 + Math.random() * 350,
      color: isWhite ? WARM : ORANGE,
      wobbleSeed: Math.random() * Math.PI * 2,
      isWhite,
    });
  }
  return arr;
}

function EmberParticle({ ember, elapsed }: { ember: EmberData; elapsed: number }) {
  const localT = Math.max(0, Math.min(1, (elapsed - ember.delay) / ember.dur));
  if (localT <= 0) return null;

  const eased = localT * localT * localT;
  const dist = ember.startDist * (1 - eased);
  const angle = ember.startAngle + ember.spiralTurns * Math.PI * 2 * eased;
  const wobble = Math.sin(elapsed / 333 + ember.wobbleSeed) * 8 * (1 - eased);
  const x = Math.cos(angle) * dist + wobble;
  const y = Math.sin(angle) * dist + wobble;

  let opacity: number;
  if (elapsed >= IGNITE) {
    opacity = Math.max(0, 1 - (elapsed - IGNITE) / 285);
  } else {
    opacity = Math.min(1, localT * 2.2);
  }

  const sz = ember.size;
  const scale = 0.4 + 1.8 * eased;

  return (
    <View
      style={{
        position: 'absolute',
        left: CX + x - sz / 2,
        top: CY + y - sz / 2,
        width: sz,
        height: sz,
        borderRadius: sz / 2,
        backgroundColor: ember.color,
        opacity,
        transform: [{ scale }],
        shadowColor: ember.color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: sz * (ember.isWhite ? 6 : 5),
        elevation: 3,
      }}
    />
  );
}

// ─── Post-Ignite Sparks ─────────────────────────────────────────
interface SparkData {
  x: number;
  vy: number;
  drift: number;
  size: number;
  life: number;
  sparkDelay: number;
  color: string;
}

function generateSparks(count: number): SparkData[] {
  const arr: SparkData[] = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: (Math.random() - 0.5) * SW * 0.5,
      vy: -0.12 - Math.random() * 0.18,
      drift: (Math.random() - 0.5) * 25,
      size: 2 + Math.random() * 3,
      life: 800 + Math.random() * 600,
      sparkDelay: Math.random() * 150,
      color: Math.random() < 0.3 ? WARM : ORANGE,
    });
  }
  return arr;
}

function SparkParticle({ spark, elapsed }: { spark: SparkData; elapsed: number }) {
  const dt = elapsed - IGNITE - spark.sparkDelay;
  if (dt < 0 || dt > spark.life) return null;

  const y = spark.vy * dt;
  const drift = Math.sin(dt / 500 + spark.x) * spark.drift;
  const opacity = Math.max(0, (1 - dt / spark.life) * 0.8);

  return (
    <View
      style={{
        position: 'absolute',
        left: CX + spark.x + drift - spark.size / 2,
        top: CY + y - spark.size / 2,
        width: spark.size,
        height: spark.size,
        borderRadius: spark.size / 2,
        backgroundColor: spark.color,
        opacity,
      }}
    />
  );
}

// ─── Wordmark letter-by-letter ──────────────────────────────────
const LETTER_SIZE = Math.min(SW * 0.1, 48);

function WordmarkLetter({ letter, index, elapsed }: { letter: string; index: number; elapsed: number }) {
  const letterStart = WORDMARK_START + index * 100;
  const t = Math.max(0, Math.min(1, (elapsed - letterStart) / 380));
  if (t <= 0) return null;

  const eased = 1 - Math.pow(1 - t, 3);
  const ty = (1 - eased) * 16;
  const sweep = t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;

  return (
    <Text
      style={{
        fontFamily: fonts.display,
        fontSize: LETTER_SIZE,
        fontWeight: '800',
        color: TEXT_COLOR,
        opacity: t,
        transform: [{ translateY: ty }],
        letterSpacing: 2,
        textShadowColor: sweep > 0 ? `rgba(255,107,53,${sweep * 0.7})` : 'transparent',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: sweep * 12,
      }}
    >
      {letter}
    </Text>
  );
}

// ─── Main AnimatedSplash ────────────────────────────────────────
export function AnimatedSplash({ onFinish }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  const finished = useRef(false);

  const embers = useMemo(() => generateEmbers(45), []);
  const sparks = useMemo(() => generateSparks(14), []);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const now = Date.now() - startTime.current;
      setElapsed(now);
      if (now >= DURATION && !finished.current) {
        finished.current = true;
        onFinish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onFinish]);

  // Icon
  const iconOpacity = elapsed < IGNITE ? 0 : Math.min(1, (elapsed - IGNITE) / 280);
  const iconScale = elapsed < IGNITE
    ? 0.8
    : elapsed < IGNITE + 400
      ? 0.8 + 0.25 * (1 - Math.pow(1 - (elapsed - IGNITE) / 400, 3))
      : elapsed < IGNITE + 800
        ? 1.05 - 0.05 * ((elapsed - IGNITE - 400) / 400)
        : 1;

  // Glow pulse after ignite
  const glowPulse = elapsed >= IGNITE
    ? 0.5 + 0.5 * Math.sin((elapsed - IGNITE) / 400) * Math.exp(-(elapsed - IGNITE) / 1100)
    : 0;

  // Ignite flash
  const flashOpacity = elapsed >= IGNITE && elapsed < IGNITE + 300
    ? elapsed < IGNITE + 50
      ? (elapsed - IGNITE) / 50 * 0.7
      : 0.7 * (1 - (elapsed - IGNITE - 50) / 250)
    : 0;

  // Background glow — very subtle, small circle
  const bgGlowOpacity = elapsed < IGNITE
    ? Math.pow(elapsed / IGNITE, 2) * 0.15
    : 0.15 + glowPulse * 0.1;

  // Tagline
  const taglineT = Math.max(0, Math.min(1, (elapsed - TAGLINE_START) / 500));
  const taglineEased = 1 - Math.pow(1 - taglineT, 3);

  // Fade out (last 300ms)
  const fadeOutT = Math.max(0, Math.min(1, (elapsed - 2700) / 300));
  const splashOpacity = 1 - fadeOutT;

  // Status dots
  const statusOpacity = Math.max(0, Math.min(1, (elapsed - 400) / 600));
  const dots = Math.floor(((elapsed / 500) % 3)) + 1;

  const LOGO_SIZE = Math.min(SW * 0.22, 100);

  return (
    <View style={[styles.container, { opacity: splashOpacity }]}>
      {/* Background radial glow — concentric circles */}
      <RadialGlow intensity={bgGlowOpacity} />

      {/* Ember particles */}
      {embers.map((e, i) => (
        <EmberParticle key={i} ember={e} elapsed={elapsed} />
      ))}

      {/* Ignite flash — radial white-warm burst */}
      <IgniteFlash intensity={flashOpacity} />

      {/* Post-ignite sparks */}
      {elapsed >= IGNITE && elapsed < IGNITE + 1500 &&
        sparks.map((s, i) => (
          <SparkParticle key={i} spark={s} elapsed={elapsed} />
        ))
      }

      {/* Logo icon with cinematic glow */}
      <View
        style={{
          position: 'absolute',
          left: CX - LOGO_SIZE / 2,
          top: CY - LOGO_SIZE / 2,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          opacity: iconOpacity,
          transform: [{ scale: iconScale }],
          shadowColor: ORANGE,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5 + glowPulse * 0.4,
          shadowRadius: 20 + glowPulse * 50,
          elevation: 8,
        }}
      >
        <Image
          source={LOGO}
          style={{
            width: '100%',
            height: '100%',
            tintColor: '#FFFFFF',
          }}
          resizeMode="contain"
        />
      </View>

      {/* Wordmark "FORGA" */}
      <View style={[styles.wordmarkRow, { top: CY + LOGO_SIZE / 2 + 24 }]}>
        {'FORGA'.split('').map((l, i) => (
          <WordmarkLetter key={i} letter={l} index={i} elapsed={elapsed} />
        ))}
      </View>

      {/* Tagline */}
      {taglineT > 0 && (
        <Text
          style={[
            styles.tagline,
            {
              top: CY + LOGO_SIZE / 2 + 24 + LETTER_SIZE + 20,
              opacity: taglineT,
              transform: [{ translateY: (1 - taglineEased) * 10 }],
            },
          ]}
        >
          Forge tes <Text style={{ color: ORANGE }}>objectifs</Text>
        </Text>
      )}

      {/* Loading status */}
      {elapsed < 2700 && (
        <Text style={[styles.statusLine, { opacity: statusOpacity }]}>
          CHARGEMENT{'.'.repeat(dots)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  wordmarkRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontWeight: '500',
    fontSize: Math.min(SW * 0.035, 16),
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(244,242,238,0.7)',
  },
  statusLine: {
    position: 'absolute',
    bottom: SH * 0.06,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.data,
    fontSize: 11,
    letterSpacing: 5,
    color: 'rgba(244,242,238,0.2)',
  },
});
