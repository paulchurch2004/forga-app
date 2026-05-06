import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';
import { useWeeklyMuscleVolume, getMuscleLabel } from '../../hooks/useWeeklyMuscleVolume';
import { usePremiumGate } from '../../hooks/usePremiumGate';
import { PremiumLock } from '../ui/PremiumLock';
import { useT } from '../../i18n';

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

  const muscleVolume = useWeeklyMuscleVolume();
  const topVolume = muscleVolume.length > 0 ? muscleVolume[0].volumeKg : 0;
  const { canSeeMuscleVolume, openPaywall } = usePremiumGate();
  const { t } = useT();

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

      {muscleVolume.length > 0 && !canSeeMuscleVolume && (
        <View style={{ marginTop: 24 }}>
          <PremiumLock
            variant="banner"
            label={t('premiumFeature')}
            subtitle={t('premiumMuscleVolumeSubtitle')}
            onPress={() => {
              onClose();
              setTimeout(openPaywall, 250);
            }}
          />
        </View>
      )}

      {muscleVolume.length > 0 && canSeeMuscleVolume && (
        <View style={styles.muscleSection}>
          <Text style={styles.sectionTitle}>VOLUME PAR MUSCLE · 7J</Text>
          <View style={styles.muscleList}>
            {muscleVolume.map((m) => {
              const widthPct = topVolume > 0 ? (m.volumeKg / topVolume) * 100 : 0;
              return (
                <View key={m.muscle} style={styles.muscleRow}>
                  <View style={styles.muscleHeader}>
                    <Text style={styles.muscleName}>{getMuscleLabel(m.muscle)}</Text>
                    <Text style={styles.muscleStats}>
                      {m.volumeKg >= 1000 ? `${(m.volumeKg / 1000).toFixed(1)}k` : m.volumeKg} kg
                      <Text style={styles.muscleSubStats}>  ·  {m.sets} séries  ·  {m.pctOfTotal}%</Text>
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${widthPct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
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
  muscleSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  muscleList: {
    gap: 12,
  },
  muscleRow: {
    gap: 6,
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  muscleName: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  muscleStats: {
    fontFamily: fonts.data,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  muscleSubStats: {
    fontFamily: fonts.body,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
});
