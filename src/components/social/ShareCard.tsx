import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { getScoreColor, getScoreLabel } from '../../theme/colors';
import { BADGE_INFO, type BadgeType } from '../../types/user';

const BADGE_EMOJIS: Record<BadgeType, string> = {
  first_meal: '\uD83C\uDF7D\uFE0F',
  first_week: '\uD83D\uDD25',
  first_kilo: '\u2696\uFE0F',
  forgeron: '\uD83D\uDD28',
  month_of_forge: '\uD83C\uDFC6',
};

interface ScoreData {
  total: number;
  nutrition: number;
  consistency: number;
  progression: number;
  discipline: number;
}

interface StreakData {
  current: number;
  best: number;
}

interface BadgeData {
  type: BadgeType;
  unlockedAt: string;
}

type ShareCardProps =
  | { type: 'score'; data: ScoreData }
  | { type: 'streak'; data: StreakData }
  | { type: 'badge'; data: BadgeData };

export function ShareCard(props: ShareCardProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#0B0B14', '#111128', '#0B0B14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top section */}
      <View style={styles.top}>
        <Text style={styles.logo}>FORGA</Text>
        <Text style={styles.tagline}>Forge ton corps. Pas de blabla.</Text>
      </View>

      {/* Content */}
      <View style={styles.body}>
        {props.type === 'score' && <ScoreContent data={props.data} />}
        {props.type === 'streak' && <StreakContent data={props.data} />}
        {props.type === 'badge' && <BadgeContent data={props.data} />}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>Rejoins-moi sur FORGA</Text>
        </View>
        <Text style={styles.footerUrl}>forga.fr</Text>
      </View>
    </View>
  );
}

function ScoreContent({ data }: { data: ScoreData }) {
  return (
    <>
      <Text style={[styles.bigNumber, { color: getScoreColor(data.total) }]}>
        {data.total}
      </Text>
      <Text style={styles.bigLabel}>{getScoreLabel(data.total)}</Text>
      <Text style={styles.motivText}>Mon score FORGA</Text>
      <View style={styles.scoreBars}>
        <ScoreBar label="Nutrition" value={data.nutrition} max={40} />
        <ScoreBar label="Régularité" value={data.consistency} max={30} />
        <ScoreBar label="Progression" value={data.progression} max={20} />
        <ScoreBar label="Discipline" value={data.discipline} max={10} />
      </View>
    </>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.barValue}>{value}/{max}</Text>
    </View>
  );
}

function StreakContent({ data }: { data: StreakData }) {
  return (
    <>
      <Text style={styles.streakEmoji}>{'\uD83D\uDD25'}</Text>
      <Text style={[styles.bigNumber, { color: colors.primary }]}>{data.current}</Text>
      <Text style={styles.bigLabel}>jours de streak</Text>
      <Text style={styles.motivText}>La régularité paie.</Text>
      <Text style={styles.subStat}>Record personnel : {data.best} jours</Text>
    </>
  );
}

function BadgeContent({ data }: { data: BadgeData }) {
  const info = BADGE_INFO[data.type];
  const emoji = BADGE_EMOJIS[data.type];
  const date = new Date(data.unlockedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={styles.badgeName}>{info.name}</Text>
      <Text style={styles.badgeDesc}>{info.description}</Text>
      <Text style={styles.motivText}>Badge débloqué !</Text>
      <Text style={styles.badgeDate}>Obtenu le {date}</Text>
    </>
  );
}

// 9:16 story format (360x640, exported at 3x = 1080x1920)
const styles = StyleSheet.create({
  card: {
    width: 360,
    height: 640,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  top: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: spacing.lg,
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  bigNumber: {
    fontFamily: fonts.data,
    fontSize: 96,
    fontWeight: '700',
    lineHeight: 104,
  },
  bigLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  motivText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  subStat: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  scoreBars: {
    width: '100%',
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  barValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    color: colors.text,
    width: 42,
    textAlign: 'right',
  },
  streakEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  badgeEmoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  badgeName: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  badgeDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  badgeDate: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.lg,
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: spacing['2xl'],
  },
  ctaBox: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
  footerUrl: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
});
