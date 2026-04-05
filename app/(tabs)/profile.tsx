import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Platform,
  Switch,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { getScoreColor, getScoreLabel } from '../../src/theme/colors';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useUserStore } from '../../src/store/userStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
import { useWaterStore } from '../../src/store/waterStore';
import { useSettingsStore, type ThemeMode, type Locale } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { usePremium } from '../../src/hooks/usePremium';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { BADGE_INFO, type BadgeType } from '../../src/types/user';
import { BadgeCard } from '../../src/components/gamification/BadgeCard';
import { useNotifications } from '../../src/hooks/useNotifications';
import { events } from '../../src/services/analytics';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { t, locale } = useT();
  const styles = useStyles();

  const profile = useUserStore((s) => s.profile);
  const badges = useUserStore((s) => s.badges);
  const score = useScoreStore((s) => s.currentScore);
  const { currentStreak, bestStreak } = useStreak();
  const { isPremium, isTrialActive, isTrialExpired, daysLeft } = usePremium();
  const checkIns = useUserStore((s) => s.checkIns);
  const { isEnabled: notifEnabled, toggle: toggleNotif } = useNotifications();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const [exporting, setExporting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const lastAdjustment = [...checkIns]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find((c) => c.calorieAdjustment !== 0);

  const handleCopyCode = useCallback(async () => {
    const code = profile?.referralCode;
    if (!code) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCodeCopied(true);
      events.referralCodeShared('copy');
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {}
  }, [profile?.referralCode]);

  const handleShareCode = useCallback(async () => {
    const code = profile?.referralCode;
    if (!code) return;
    try {
      await Share.share({
        message: t('shareReferralMessage', { code }),
      });
      events.referralCodeShared('share');
    } catch {}
  }, [profile?.referralCode]);

  if (!profile) return null;

  const handleExportData = async () => {
    setExporting(true);
    try {
      const weightLog = useUserStore.getState().weightLog;
      const mealHistory = useMealStore.getState().mealHistory;
      const scoreHistory = useScoreStore.getState().history;
      const { id: _id, email: _email, referralCode: _ref, referredBy: _refBy, ...safeProfile } = profile;
      const data = {
        profile: safeProfile,
        badges,
        score,
        weightLog,
        checkIns,
        mealHistory,
        scoreHistory,
        exportedAt: new Date().toISOString(),
      };
      const json = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forga-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: json, title: 'Export FORGA' });
      }
    } catch {
      Alert.alert(t('error'), t('cannotExportData'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const userId = profile.id;
            await supabase.from('daily_meals').delete().eq('user_id', userId);
            await supabase.from('weekly_checkins').delete().eq('user_id', userId);
            await supabase.from('weight_log').delete().eq('user_id', userId);
            await supabase.from('badges').delete().eq('user_id', userId);
            await supabase.from('favorites').delete().eq('user_id', userId);
            await supabase.from('score_history').delete().eq('user_id', userId);
            await supabase.from('users').delete().eq('id', userId);
            await supabase.auth.signOut();
            useUserStore.getState().reset();
            useMealStore.getState().reset();
            useScoreStore.getState().reset();
            useAuthStore.getState().reset();
            useWaterStore.getState().reset();
          },
        },
      ],
    );
  };

  const handleManageSubscription = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      await Linking.openURL('https://play.google.com/store/account/subscriptions');
    } else {
      Alert.alert(
        t('manageSubscription'),
        t('contactSupport'),
      );
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    useUserStore.getState().reset();
    useMealStore.getState().reset();
    useScoreStore.getState().reset();
    useAuthStore.getState().reset();
    useWaterStore.getState().reset();
  };

  const objectiveLabels: Record<string, string> = {
    bulk: t('objectiveBulk'),
    cut: t('objectiveCut'),
    maintain: t('objectiveMaintain'),
    recomp: t('objectiveRecomp'),
  };

  const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: t('themeDark') },
    { value: 'light', label: t('themeLight') },
    { value: 'system', label: t('themeSystem') },
  ];

  const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
    { value: 'fr', label: t('languageFr') },
    { value: 'en', label: t('languageEn') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, maxWidth: contentMaxWidth }]}>
      {/* Back button */}
      <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={16} style={styles.backRow}>
        <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>
              {isTrialActive ? t('premiumTrialActive', { days: daysLeft }) : 'FORGA PRO'}
            </Text>
          </View>
        )}
      </View>

      {/* Score + Streak */}
      <View style={styles.statsRow}>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=score')}>
          <Text style={[styles.statValue, { color: getScoreColor(score.total) }]}>
            {score.total}
          </Text>
          <Text style={styles.statLabel}>{getScoreLabel(score.total, locale)}</Text>
          <Text style={styles.shareHint}>{t('share')}</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=streak')}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentStreak}
          </Text>
          <Text style={styles.statLabel}>{t('daysStreak')}</Text>
          <Text style={styles.shareHint}>{t('share')}</Text>
        </Pressable>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {bestStreak}
          </Text>
          <Text style={styles.statLabel}>{t('bestStreak')}</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('myBadges')}</Text>
        <View style={styles.badgeGrid}>
          {(Object.keys(BADGE_INFO) as BadgeType[]).map((type) => {
            const unlockedBadge = badges.find((b) => b.type === type);
            return (
              <View key={type}>
                <BadgeCard
                  type={type}
                  unlocked={!!unlockedBadge}
                  unlockedAt={unlockedBadge?.unlockedAt}
                />
                {unlockedBadge && (
                  <Pressable
                    style={styles.badgeShareBtn}
                    onPress={() => router.push(`/share?type=badge&badgeType=${type}`)}
                  >
                    <Text style={styles.badgeShareText}>{t('share')}</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Referral */}
      {profile.referralCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('referral')}</Text>
          <View style={styles.referralCard}>
            <Text style={styles.referralLabel}>{t('yourReferralCode')}</Text>
            <Text style={styles.referralCode}>{profile.referralCode}</Text>
            <Text style={styles.referralReward}>{t('referralReward')}</Text>
            <View style={styles.referralButtons}>
              <Pressable style={styles.referralCopyBtn} onPress={handleCopyCode}>
                <Text style={styles.referralCopyText}>
                  {codeCopied ? t('copied') : t('copy')}
                </Text>
              </Pressable>
              <Pressable style={styles.referralShareBtn} onPress={handleShareCode}>
                <Text style={styles.referralShareText}>{t('share')}</Text>
              </Pressable>
            </View>
            {(profile.referralCount ?? 0) > 0 && (
              <Text style={styles.referralStats}>
                {t('friendsReferred', { count: profile.referralCount ?? 0 })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Check-in + Progression */}
      <View style={styles.section}>
        <Pressable
          style={[styles.progressionButton, { marginBottom: spacing.sm }]}
          onPress={() => router.push('/checkin')}
        >
          <View style={styles.progressionLeft}>
            <Text style={styles.progressionIcon}>{'\uD83D\uDCCA'}</Text>
            <View>
              <Text style={styles.progressionTitle}>{t('weeklyCheckIn')}</Text>
              <Text style={styles.progressionSubtitle}>{t('checkInSubtitle')}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
        <Pressable
          style={styles.progressionButton}
          onPress={() => router.push('/progression')}
        >
          <View style={styles.progressionLeft}>
            <Text style={styles.progressionIcon}>{'\u2197'}</Text>
            <View>
              <Text style={styles.progressionTitle}>{t('myProgress')}</Text>
              <Text style={styles.progressionSubtitle}>{t('progressSubtitle')}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('myProfile')}</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={styles.editLink}>{t('edit')}</Text>
          </Pressable>
        </View>
        <ProfileRow label={t('objective')} value={objectiveLabels[profile.objective]} styles={styles} />
        <ProfileRow label={t('currentWeight')} value={`${profile.currentWeight} kg`} styles={styles} />
        <ProfileRow label={t('targetWeight')} value={`${profile.targetWeight} kg`} styles={styles} />
        <ProfileRow label={`${t('caloriesLabel')}/jour`} value={`${profile.dailyCalories} kcal`} styles={styles} />
        <ProfileRow label={t('proteinLabel')} value={`${profile.dailyProtein}g`} styles={styles} />
        <ProfileRow label={t('carbsLabel')} value={`${profile.dailyCarbs}g`} styles={styles} />
        <ProfileRow label={t('fatLabel')} value={`${profile.dailyFat}g`} styles={styles} />
        {lastAdjustment && (
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentIcon}>{'\u26A1'}</Text>
            <Text style={styles.adjustmentText}>
              {t('planAdjusted', { adjustment: `${lastAdjustment.calorieAdjustment > 0 ? '+' : ''}${lastAdjustment.calorieAdjustment}` })}
              {' '}({new Date(lastAdjustment.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })})
            </Text>
          </View>
        )}
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('appearance')}</Text>
        <View style={styles.chipRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.chip, themeMode === opt.value && styles.chipActive]}
              onPress={() => setThemeMode(opt.value)}
            >
              <Text style={[styles.chipText, themeMode === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.chipRow}>
          {LOCALE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.chip, locale === opt.value && styles.chipActive]}
              onPress={() => setLocale(opt.value)}
            >
              <Text style={[styles.chipText, locale === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        {!isPremium && (
          <Pressable style={styles.upgradeButton} onPress={() => router.push('/paywall')}>
            <Text style={styles.upgradeText}>{t('upgradeToForga')}</Text>
          </Pressable>
        )}

        {isPremium && (
          <Pressable style={styles.actionRow} onPress={handleManageSubscription}>
            <Text style={styles.actionText}>{t('manageSubscription')}</Text>
          </Pressable>
        )}

        {Platform.OS !== 'web' && (
          <View style={styles.actionRow}>
            <Text style={styles.actionText}>{t('notifications')}</Text>
            <Switch
              value={notifEnabled}
              onValueChange={() => toggleNotif(currentStreak)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        )}

        <Pressable style={styles.actionRow} onPress={() => router.push('/tdee-calculator')}>
          <Text style={styles.actionText}>{t('recalculateTDEE')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleExportData}>
          <Text style={styles.actionText}>{t('exportData')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleSignOut}>
          <Text style={styles.actionText}>{t('signOut')}</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleDeleteAccount}>
          <Text style={[styles.actionText, { color: colors.error }]}>
            {t('deleteAccount')}
          </Text>
        </Pressable>
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>{t('legalDisclaimer')}</Text>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.sm }]}>
            {t('privacyPolicy')}
          </Text>
        </Pressable>
        <Text style={[styles.legalText, { marginTop: spacing.lg }]}>
          FORGA v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

function ProfileRow({ label, value, styles }: { label: string; value: string; styles: any }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  backRow: {
    marginBottom: spacing.md,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  premiumText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  shareHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  badgeShareBtn: {
    alignSelf: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  badgeShareText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  profileValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  actionRow: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.sm,
  },
  adjustmentIcon: {
    fontSize: 14,
  },
  adjustmentText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    flex: 1,
  },
  legal: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legalText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  referralCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  referralLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  referralCode: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  referralReward: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  referralButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  referralCopyBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  referralCopyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  referralShareBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  referralShareText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.white,
  },
  referralStats: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  progressionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  progressionIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  progressionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  progressionSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressionArrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes['2xl'],
    color: colors.primary,
  },
}));
