import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      <Text style={styles.logo}>FORGA</Text>

      {props.type === 'score' && <ScoreContent data={props.data} />}
      {props.type === 'streak' && <StreakContent data={props.data} />}
      {props.type === 'badge' && <BadgeContent data={props.data} />}

      <View style={styles.footer}>
        <Text style={styles.footerText}>forga.fr</Text>
      </View>
    </View>
  );
}

function ScoreContent({ data }: { data: ScoreData }) {
  return (
    <View style={styles.body}>
      <Text style={[styles.bigNumber, { color: getScoreColor(data.total) }]}>
        {data.total}
      </Text>
      <Text style={styles.bigLabel}>{getScoreLabel(data.total)}</Text>
      <View style={styles.scoreBars}>
        <ScoreBar label="Nutrition" value={data.nutrition} max={40} />
        <ScoreBar label="Regularite" value={data.consistency} max={30} />
        <ScoreBar label="Progression" value={data.progression} max={20} />
        <ScoreBar label="Discipline" value={data.discipline} max={10} />
      </View>
    </View>
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
    <View style={styles.body}>
      <Text style={styles.streakEmoji}>{'\uD83D\uDD25'}</Text>
      <Text style={[styles.bigNumber, { color: colors.primary }]}>{data.current}</Text>
      <Text style={styles.bigLabel}>jours de streak</Text>
      <Text style={styles.subStat}>Record : {data.best} jours</Text>
    </View>
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
    <View style={styles.body}>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <Text style={styles.badgeName}>{info.name}</Text>
      <Text style={styles.badgeDesc}>{info.description}</Text>
      <Text style={styles.badgeDate}>Obtenu le {date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.xl,
    width: 320,
    alignSelf: 'center',
  },
  logo: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  body: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  bigNumber: {
    fontFamily: fonts.data,
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  bigLabel: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  subStat: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  scoreBars: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  barValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.text,
    width: 36,
    textAlign: 'right',
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  badgeEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  badgeName: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  badgeDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badgeDate: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
