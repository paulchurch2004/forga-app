import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../src/store/userStore';
import { useScoreStore } from '../src/store/scoreStore';
import { useStreak } from '../src/hooks/useStreak';
import { useShareCard } from '../src/hooks/useShareCard';
import { ShareCard } from '../src/components/social/ShareCard';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import type { BadgeType } from '../src/types/user';

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { type, badgeType } = useLocalSearchParams<{ type: string; badgeType?: string }>();

  const score = useScoreStore((s) => s.currentScore);
  const badges = useUserStore((s) => s.badges);
  const { currentStreak, bestStreak } = useStreak();

  const { cardRef, share } = useShareCard();

  const badge = badgeType
    ? badges.find((b) => b.type === badgeType)
    : undefined;

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Partager</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Card preview */}
        <View ref={cardRef} collapsable={false} style={styles.cardWrapper}>
          {type === 'score' && (
            <ShareCard type="score" data={score} />
          )}
          {type === 'streak' && (
            <ShareCard type="streak" data={{ current: currentStreak, best: bestStreak }} />
          )}
          {type === 'badge' && badge && (
            <ShareCard type="badge" data={{ type: badge.type as BadgeType, unlockedAt: badge.unlockedAt }} />
          )}
        </View>

        {/* Share button */}
        <Pressable style={styles.shareBtn} onPress={share}>
          <Text style={styles.shareBtnText}>Partager</Text>
        </Pressable>

        <Text style={styles.hint}>
          La carte sera partagée en image PNG via ton appli préférée.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  shareBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  shareBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});
