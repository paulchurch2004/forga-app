import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';

const LOGO = require('../../../assets/logo/logo_sans_fond.png');

type Phase = 0 | 1 | 2;

export interface SessionForgeeStats {
  durationMin: number;
  volumeKg: number;
  prCount: number;
  prDetails?: { exercise: string; performance: string };
}

interface SessionForgeeProps {
  visible: boolean;
  userName?: string;
  stats: SessionForgeeStats;
  onClose: () => void;
}

export function SessionForgee({ visible, userName = 'Paul', stats, onClose }: SessionForgeeProps) {
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      return;
    }
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="overFullScreen" transparent>
      <View style={styles.root}>
        <AmbientHeat phase={phase} />

        <View style={styles.closeRow}>
          {phase === 2 && (
            <Pressable onPress={onClose} hitSlop={16} style={styles.closeButton}>
              <CloseIcon />
            </Pressable>
          )}
        </View>

        <View style={styles.content}>
          {phase === 0 && <PhaseHeat />}
          {phase === 1 && <PhaseStrike />}
          {phase === 2 && <PhaseReveal userName={userName} stats={stats} />}
        </View>
      </View>
    </Modal>
  );
}

/* ─── PHASES ─────────────────────────────────── */

function PhaseHeat() {
  const { t } = useT();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Text style={styles.phaseHint}>{t('sessionForgeeHeating')}</Text>
    </Animated.View>
  );
}

function PhaseStrike() {
  const scale = useSharedValue(0.95);
  const translateY = useSharedValue(-16);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withSequence(
      withTiming(1.08, { duration: 280, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200 })
    );
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Image source={LOGO} style={styles.anvilStrike} resizeMode="contain" />
    </Animated.View>
  );
}

function PhaseReveal({ userName, stats }: { userName: string; stats: SessionForgeeStats }) {
  const { t } = useT();
  const fade1 = useEntrance(100);
  const fade2 = useEntrance(250);
  const fade3 = useEntrance(400);
  const fade4 = useEntrance(550);

  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <View style={styles.revealCol}>
      <Animated.View style={[styles.anvilGlow, glowStyle]}>
        <Image source={LOGO} style={styles.anvilSmall} resizeMode="contain" />
      </Animated.View>

      <Animated.Text style={[styles.eyebrow, fade1]}>{t('sessionForgeeTitle')}</Animated.Text>
      <Animated.Text style={[styles.bigTitle, fade2]}>{t('sessionForgeeWellDone', { name: userName })}</Animated.Text>

      <Animated.View style={[styles.statsRow, fade3]}>
        <Stat value={stats.durationMin.toString()} unit={t('sessionForgeeDurationUnit')} label={t('sessionForgeeDuration')} />
        <Stat value={stats.volumeKg.toLocaleString('fr-FR')} unit={t('sessionForgeeVolumeUnit')} label={t('sessionForgeeVolume')} />
        <Stat value={`×${stats.prCount}`} unit="" label={t('sessionForgeePr')} />
      </Animated.View>

      {stats.prCount > 0 && stats.prDetails && (
        <Animated.View style={[styles.prCard, fade4]}>
          <LinearGradient
            colors={['#FFB870', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.prIconWrap}
          >
            <TrophyIcon />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.prLabel}>{t('sessionForgeeNewRecord')}</Text>
            <Text style={styles.prText}>
              {stats.prDetails.exercise} · <Text style={styles.prTextBold}>{stats.prDetails.performance}</Text>
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function Stat({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ─── BACKGROUND ─────────────────────────────────── */

function AmbientHeat({ phase }: { phase: Phase }) {
  const intensity = useSharedValue(0.25);

  useEffect(() => {
    intensity.value = withTiming(phase >= 1 ? 0.7 : 0.25, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [phase]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <SvgRadialGradient id="heat" cx="50%" cy="55%" rx="60%" ry="50%">
            <Stop offset="0%" stopColor="#FF8C28" stopOpacity={0.6} />
            <Stop offset="40%" stopColor="#FF5014" stopOpacity={0.3} />
            <Stop offset="100%" stopColor="#FF5014" stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#heat)" />
      </Svg>
    </View>
  );
}

/* ─── HELPERS ─────────────────────────────────── */

function useEntrance(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 L18 18 M18 6 L6 18" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function TrophyIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 4 H17 V8 A5 5 0 0 1 7 8 V4 Z M5 6 H7 V8 A2 2 0 0 1 5 8 V6 Z M17 6 H19 V8 A2 2 0 0 1 17 8 V6 Z M9 14 H15 V18 H9 Z M7 20 H17"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050508',
  },
  closeRow: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 80,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  phaseHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 3.3,
    color: 'rgba(255,200,160,0.7)',
    fontWeight: '600',
    textAlign: 'center',
  },
  anvilStrike: {
    width: 140,
    height: 140,
    tintColor: '#FF9544',
  },
  revealCol: {
    alignItems: 'center',
    width: '100%',
  },
  anvilGlow: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB870',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 24,
    shadowOpacity: 0.7,
    elevation: 14,
  },
  anvilSmall: {
    width: 72,
    height: 72,
    tintColor: '#FF6B35',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 3.3,
    color: '#FF6B35',
    fontWeight: '700',
    marginTop: 22,
  },
  bigTitle: {
    fontFamily: fonts.display,
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 42,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 32,
    width: '100%',
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,40,0.2)',
    borderRadius: 18,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFB870',
    letterSpacing: -0.4,
  },
  statUnit: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: 18,
    marginTop: 14,
    backgroundColor: 'rgba(255,140,40,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,140,40,0.4)',
    borderRadius: 18,
  },
  prIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C28',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  prLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FFB870',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  prText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 3,
  },
  prTextBold: {
    fontFamily: fonts.data,
    fontWeight: '700',
  },
});
