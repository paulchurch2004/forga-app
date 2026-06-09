// FORGA — Carte "Cycle terminé" affichée quand le programme de 4 semaines
// est fini (isPlanExpired). Remplace le bandeau brut "Programme terminé"
// par un BILAN valorisant + une reco du niveau suivant en 1 tap.
//
// Objectif produit : transformer la fin de cycle (moment de churn
// potentiel) en moment de fierté + relance immédiate.

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../theme';
import { useT } from '../../i18n';
import { useTrainingStore } from '../../store/trainingStore';
import { useProgramStore } from '../../store/programStore';
import { EXERCISES } from '../../data/exercises';
import { recommendNextProgram, computeCycleSummary, isAtMaxLevel } from '../../engine/cycleProgression';

interface Props {
  /** Appelé quand l'user accepte le programme recommandé. Le parent
   *  fait selectProgram + reset du cycle. */
  onStartNext: (programId: string) => void;
  /** Appelé pour "choisir un autre programme" (ouvre le picker). */
  onChooseOther: () => void;
}

export function CycleCompleteCard({ onStartNext, onChooseOther }: Props) {
  const { t } = useT();
  const styles = useStyles();
  const activePlan = useProgramStore((s) => s.activePlan);
  const workouts = useTrainingStore((s) => s.workouts);
  const oneRepMaxes = useTrainingStore((s) => s.oneRepMaxByExercise);

  const summary = useMemo(() => {
    if (!activePlan) return null;
    return computeCycleSummary(workouts, activePlan.startDate, activePlan.endDate, oneRepMaxes);
  }, [activePlan, workouts, oneRepMaxes]);

  const nextProgram = useMemo(() => {
    if (!activePlan) return null;
    return recommendNextProgram(activePlan.programId);
  }, [activePlan]);

  if (!activePlan || !summary) return null;

  const atMax = isAtMaxLevel(activePlan.programId);

  return (
    <View style={styles.card}>
      {/* Header — célébration */}
      <LinearGradient
        colors={['rgba(255,107,53,0.18)', 'rgba(255,107,53,0.04)']}
        style={styles.headerBox}
      >
        <Text style={styles.eyebrow}>CYCLE TERMINÉ 💪</Text>
        <Text style={styles.title}>4 semaines bouclées. Beau travail.</Text>
      </LinearGradient>

      {/* Stats du cycle */}
      <View style={styles.statsRow}>
        <Stat value={String(summary.sessionsCompleted)} label="séances" styles={styles} />
        <Stat value={`${Math.round(summary.totalVolumeKg / 1000)}t`} label="soulevé" styles={styles} />
        <Stat value={`${summary.totalMinutes}`} label="minutes" styles={styles} />
      </View>

      {/* Top PR gains (si présents) */}
      {summary.topPrGains.length > 0 && (
        <View style={styles.prBox}>
          <Text style={styles.prTitle}>Tes plus belles progressions</Text>
          {summary.topPrGains.map((g) => {
            const name = EXERCISES[g.exerciseId]?.nameKey
              ? (t(EXERCISES[g.exerciseId].nameKey as any) as string)
              : g.exerciseId;
            return (
              <View key={g.exerciseId} style={styles.prRow}>
                <Text style={styles.prName} numberOfLines={1}>{name}</Text>
                <Text style={styles.prGain}>+{g.gainKg} kg <Text style={styles.prCurrent}>→ {g.current} kg</Text></Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Reco du niveau suivant */}
      {nextProgram && (
        <View style={styles.nextBox}>
          <Text style={styles.nextEyebrow}>
            {atMax ? 'PROCHAIN CYCLE' : 'NIVEAU SUIVANT RECOMMANDÉ'}
          </Text>
          <Text style={styles.nextName}>{t(nextProgram.nameKey as any) as string}</Text>
          <Text style={styles.nextDesc}>
            {atMax
              ? 'Tu es au niveau avancé — relance un cycle pour continuer à progresser.'
              : 'On te propose le niveau au-dessus : plus de volume, plus d\'intensité, adapté à ta progression.'}
          </Text>
          <Pressable
            onPress={() => onStartNext(nextProgram.id)}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryBtnText}>
              {atMax ? 'Relancer ce cycle' : 'Démarrer le niveau suivant'}
            </Text>
          </Pressable>
          <Pressable onPress={onChooseOther} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Choisir un autre programme</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function Stat({ value, label, styles }: { value: string; label: string; styles: any }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  headerBox: {
    padding: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.6,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  prBox: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prTitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  prName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
  },
  prGain: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#00D4AA',
  },
  prCurrent: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nextBox: {
    padding: spacing.lg,
  },
  nextEyebrow: {
    fontFamily: fonts.data,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  nextName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  nextDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.4,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
}));
