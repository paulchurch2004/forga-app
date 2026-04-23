import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import type { Archetype } from '../../types/user';

const ARCHETYPE_LABEL: Record<Archetype, string> = {
  warrior: 'Guerrier',
  craftsman: 'Artisan',
  explorer: 'Explorateur',
};

interface ProfileHeroProps {
  name: string;
  archetype?: Archetype;
  cycleLabel?: string; // e.g. "Jour 14 · Cycle consolidation"
  streak: number;
  formScore: number;
  weight: number;
}

export function ProfileHero({ name, archetype, cycleLabel, streak, formScore, weight }: ProfileHeroProps) {
  const initial = name.trim().charAt(0).toUpperCase() || 'F';
  const archetypeLabel = archetype ? ARCHETYPE_LABEL[archetype] : null;

  return (
    <View style={styles.card}>
      <View style={styles.glowWrap} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <SvgRadialGradient id="profileGlow" cx="100%" cy="0%" rx="60%" ry="60%">
              <Stop offset="0%" stopColor="#FF6B35" stopOpacity={0.45} />
              <Stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
            </SvgRadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileGlow)" />
        </Svg>
      </View>

      <View style={styles.headerRow}>
        <LinearGradient
          colors={['#FF6B35', '#CC5424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          {archetypeLabel && <Text style={styles.eyebrow}>ARCHÉTYPE · {archetypeLabel.toUpperCase()}</Text>}
          <Text style={styles.name}>{name}</Text>
          {cycleLabel && <Text style={styles.cycle}>{cycleLabel}</Text>}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat label="Streak" value={streak.toString()} unit="j" />
        <Stat label="Forme" value={formScore.toString()} color="#00D4AA" />
        <Stat label="Poids" value={weight.toString()} />
      </View>
    </View>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <View style={styles.statCol}>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 22,
    overflow: 'hidden',
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  cycle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 4,
  },
  divider: {
    marginTop: 18,
    marginBottom: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginLeft: 3,
  },
});
