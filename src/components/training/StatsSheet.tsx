import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';

interface StatsSheetProps {
  open: boolean;
  onClose: () => void;
  weeklyVolumeKg: number;
  weeklyVolumeTargetKg: number;
  weeklyCount: number;
  weeklyTarget: number;
  monthlyCount: number;
  totalDurationMin: number;
  currentStreak: number;
  bestStreak: number;
}

export function StatsSheet({
  open,
  onClose,
  weeklyVolumeKg,
  weeklyVolumeTargetKg,
  weeklyCount,
  weeklyTarget,
  monthlyCount,
  totalDurationMin,
  currentStreak,
  bestStreak,
}: StatsSheetProps) {
  const volumePct =
    weeklyVolumeTargetKg > 0 ? Math.round((weeklyVolumeKg / weeklyVolumeTargetKg) * 100) : 0;

  return (
    <ProfileSheet open={open} onClose={onClose} title="Statistiques de la semaine">
      <View style={styles.grid}>
        <StatTile
          label="Volume hebdo"
          value={weeklyVolumeKg >= 1000 ? (weeklyVolumeKg / 1000).toFixed(1) : String(weeklyVolumeKg)}
          unit={weeklyVolumeKg >= 1000 ? 'k kg' : 'kg'}
          hint={weeklyVolumeTargetKg > 0 ? `${volumePct}% obj.` : undefined}
        />
        <StatTile
          label="Séances"
          value={String(weeklyCount)}
          unit={`/${weeklyTarget}`}
          hint={weeklyCount >= weeklyTarget ? '✓ atteint' : `${weeklyTarget - weeklyCount} restantes`}
        />
        <StatTile label="Streak" value={String(currentStreak)} unit="j" hint={`Record ${bestStreak}`} />
        <StatTile label="Sur 30j" value={String(monthlyCount)} unit="séances" />
        <StatTile
          label="Durée totale"
          value={String(Math.floor(totalDurationMin / 60))}
          unit="h"
          hint={`${totalDurationMin} min`}
        />
      </View>
    </ProfileSheet>
  );
}

function StatTile({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label.toUpperCase()}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
  },
  tileLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 6,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    marginTop: 4,
  },
});
