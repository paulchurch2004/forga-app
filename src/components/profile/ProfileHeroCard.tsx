import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import type { Archetype } from '../../types/user';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/locales/fr';

interface ProfileHeroCardProps {
  name: string;
  archetype?: Archetype;
  cycleLabel?: string;
  streak: number;
  formScore: number;
  weight: number;
}

const ARCHETYPE_LABEL_KEY: Record<Archetype, TranslationKey> = {
  warrior: 'archetypeWarriorName',
  craftsman: 'archetypeCraftsmanName',
  explorer: 'archetypeExplorerName',
};

export function ProfileHeroCard({ name, archetype, cycleLabel, streak, formScore, weight }: ProfileHeroCardProps) {
  const { t } = useT();
  const initial = name.charAt(0).toUpperCase();
  const archetypeLabel = archetype ? t(ARCHETYPE_LABEL_KEY[archetype]) : t('profileArchetypeUnknown');

  return (
    <View style={styles.card}>
      <View style={styles.glow} pointerEvents="none" />
      <View style={styles.headerRow}>
        <LinearGradient
          colors={['#FF6B35', '#CC5424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarLetter}>{initial}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{t('profileArchetypeEyebrow', { name: archetypeLabel.toUpperCase() })}</Text>
          <Text style={styles.name}>{name}</Text>
          {cycleLabel && <Text style={styles.cycle}>{cycleLabel}</Text>}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat label={t('profileStreakLabel')} value={String(streak)} unit={t('profileStreakUnit')} />
        <Stat label={t('profileFormLabel')} value={String(formScore)} unit="" valueColor="#00D4AA" />
        <Stat label={t('profileWeightLabel')} value={weight.toFixed(1)} unit={t('profileWeightUnit')} small />
      </View>
    </View>
  );
}

function Stat({ label, value, unit, valueColor, small }: { label: string; value: string; unit: string; valueColor?: string; small?: boolean }) {
  return (
    <View style={styles.statCol}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, valueColor && { color: valueColor }, small && { fontSize: 20 }]}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 22,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,107,53,0.40)',
    opacity: 0.3,
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
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
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
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 18,
    marginBottom: 16,
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
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 4,
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
});
