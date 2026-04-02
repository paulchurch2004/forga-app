import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';

interface ShareStreakCardProps {
  streak: number;
  score: number;
}

function getSlogan(streak: number): string {
  if (streak >= 30) return '30 jours de forge.\nRien ne t\'arrete.';
  if (streak >= 14) return 'Deux semaines sans faillir.\nC\'est du serieux.';
  if (streak >= 7) return 'Une semaine de forge.\nTu tiens ta ligne.';
  if (streak >= 3) return `${streak} jours de suite.\nEn feu !`;
  return 'La forge commence ici.\nTu tiens bon.';
}

export const ShareStreakCard = forwardRef<View, ShareStreakCardProps>(
  ({ streak, score }, ref) => {
    const slogan = getSlogan(streak);

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        <LinearGradient
          colors={['#0B0B14', '#1a1a2e', '#0B0B14']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Top row: logo */}
          <View style={styles.topRow}>
            <Text style={styles.logo}>FORGA</Text>
            <Text style={styles.logoTagline}>forga.app</Text>
          </View>

          {/* Center: flame + streak */}
          <View style={styles.centerBlock}>
            <Text style={styles.flame}>{'\uD83D\uDD25'}</Text>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>jours de streak</Text>
          </View>

          {/* Slogan */}
          <Text style={styles.slogan}>{slogan}</Text>

          {/* Bottom: score */}
          <View style={styles.bottomRow}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreLabel}>SCORE FORGA</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.ctaText}>Rejoins-moi sur forga.app</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

ShareStreakCard.displayName = 'ShareStreakCard';

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 300,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 3,
  },
  logoTagline: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  flame: {
    fontSize: 48,
    lineHeight: 56,
  },
  streakNumber: {
    fontFamily: fonts.display,
    fontSize: 72,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 80,
  },
  streakLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  slogan: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scoreBadge: {
    alignItems: 'center',
  },
  scoreValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '900',
    color: colors.primary,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    flex: 1,
  },
});
