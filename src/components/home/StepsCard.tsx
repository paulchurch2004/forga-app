import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/fonts';

/**
 * Carte "pas du jour" affichée sur l'écran d'accueil quand l'user a
 * activé le compteur dans Settings. Volontairement plus grosse qu'une
 * MiniStat car c'est une métrique motivante qui change toute la
 * journée — elle mérite sa propre carte.
 *
 * Design : anneau de progression circulaire + chiffres en gros +
 * petit indicateur "bonus kcal" si la cible est dépassée.
 */

interface StepsCardProps {
  steps: number;
  target: number;
  /** Progression 0–1, clipée. */
  progress: number;
  /** Bonus kcal à afficher si l'user a dépassé sa cible. */
  bonusKcal: number;
  /** Tap → ouvre l'écran Settings → section Apple Health (TODO link). */
  onPress?: () => void;
}

const RING_SIZE = 88;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function StepsCard({ steps, target, progress, bonusKcal, onPress }: StepsCardProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  const reachedTarget = progress >= 1;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${steps} pas sur ${target}`}
    >
      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.contentRow}>
        {/* Anneau de progression */}
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Progression */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={reachedTarget ? '#00D4AA' : '#FF6B35'}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            {/* Ionicons plutôt qu'emoji Unicode 👟 — rendait monochrome
                sur certains Android, incohérent avec le reste du theme. */}
            <Ionicons name="footsteps-outline" size={26} color="#FFFFFF" />
          </View>
        </View>

        {/* Stats à droite */}
        <View style={styles.stats}>
          <Text style={styles.eyebrow}>PAS DU JOUR</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{steps.toLocaleString('fr-FR')}</Text>
            <Text style={styles.unit}>/ {target.toLocaleString('fr-FR')}</Text>
          </View>
          {reachedTarget && bonusKcal > 0 ? (
            <LinearGradient
              colors={['rgba(0,212,170,0.18)', 'rgba(0,212,170,0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bonusBadge}
            >
              <Text style={styles.bonusText}>+{bonusKcal} kcal bonus</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.subtitle}>
              {reachedTarget
                ? 'Cible atteinte 🎯'
                : `${(target - steps).toLocaleString('fr-FR')} pas restants`}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,107,53,0.12)',
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringIcon: {
    fontSize: 32,
  },
  stats: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: '#FF6B35',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
  },
  bonusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.40)',
  },
  bonusText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#00D4AA',
    letterSpacing: 0.3,
  },
});
