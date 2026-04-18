import React, { useState, useCallback, useMemo } from 'react';
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
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { LineChart, type DataPoint } from '../../src/components/charts/LineChart';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useNotifications } from '../../src/hooks/useNotifications';
import { events } from '../../src/services/analytics';
import appJson from '../../app.json';

const APP_VERSION = appJson.expo.version;
const PROFILE_HEADER_IMAGE =
  'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=60';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { t, locale } = useT();
  const styles = useStyles();

  const profile = useUserStore((s) => s.profile);
  const badges = useUserStore((s) => s.badges);
  const score = useScoreStore((s) => s.currentScore);
  const { currentStreak, bestStreak, streakFreezeUsedThisWeek } = useStreak();
  const { isPremium, isTrialActive, isTrialExpired, daysLeft } = usePremium();
  const checkIns = useUserStore((s) => s.checkIns);
  const weightLog = useUserStore((s) => s.weightLog);
  const { isEnabled: notifEnabled, toggle: toggleNotif } = useNotifications();
  const { width: screenWidth } = useWindowDimensions();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const [exporting, setExporting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const chartWidth = Math.min(screenWidth - spacing['2xl'] * 2, contentMaxWidth) - spacing.md * 2;

  const weightChartData: DataPoint[] = useMemo(() => {
    if (weightLog.length === 0) return [];
    const sorted = [...weightLog].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    // Last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const recent = sorted.filter((e) => new Date(e.date) >= cutoff);
    const data = recent.length >= 2 ? recent : sorted.slice(-10);
    return data.map((e) => ({ date: e.date, value: e.weight }));
  }, [weightLog]);

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
    } catch (error) {
      if (__DEV__) console.warn('[Profile] Copy referral code failed:', error);
    }
  }, [profile?.referralCode]);

  const handleShareCode = useCallback(async () => {
    const code = profile?.referralCode;
    if (!code) return;
    try {
      await Share.share({
        message: t('shareReferralMessage', { code }),
      });
      events.referralCodeShared('share');
    } catch (error) {
      if (__DEV__) console.warn('[Profile] Share referral code failed:', error);
    }
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
            try {
              const userId = profile.id;
              const tables = [
                { table: 'daily_meals', col: 'user_id' },
                { table: 'weekly_checkins', col: 'user_id' },
                { table: 'weight_log', col: 'user_id' },
                { table: 'badges', col: 'user_id' },
                { table: 'favorites', col: 'user_id' },
                { table: 'score_history', col: 'user_id' },
                { table: 'users', col: 'id' },
              ];
              for (const { table, col } of tables) {
                const { error } = await supabase.from(table).delete().eq(col, userId);
                if (error) {
                  console.error(`[DeleteAccount] Failed to delete from ${table}:`, error.message);
                }
              }
              await supabase.auth.signOut();
              useUserStore.getState().reset();
              useMealStore.getState().reset();
              useScoreStore.getState().reset();
              useAuthStore.getState().reset();
              useWaterStore.getState().reset();
            } catch (error: any) {
              Alert.alert(t('error'), t('errorOccurred'));
            }
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
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      {/* Hero Header */}
      <ImageBackground
        source={{ uri: PROFILE_HEADER_IMAGE }}
        style={styles.heroImage}
        imageStyle={styles.heroImageInner}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
          style={styles.heroOverlay}
        >
          <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backRow}>
            <Text style={styles.backText}>{'\u2039'} {t('home')}</Text>
          </Pressable>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>
                {isTrialActive ? t('premiumTrialActive', { days: daysLeft }) : 'FORGA PRO'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </ImageBackground>

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
          {isPremium && (
            <Text style={[styles.freezeHint, { color: streakFreezeUsedThisWeek ? colors.textMuted : colors.success }]}>
              {streakFreezeUsedThisWeek ? t('streakFreezeUsed') : t('streakFreezeAvailable')}
            </Text>
          )}
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
            // Badge progress for locked badges
            let progress: string | undefined;
            if (!unlockedBadge) {
              if (type === 'first_week') progress = `${Math.min(currentStreak, 7)}/7`;
              else if (type === 'month_of_forge') progress = `${Math.min(currentStreak, 30)}/30`;
              else if (type === 'forgeron') progress = `${Math.min(score.total, 70)}/70`;
              else if (type === 'first_kilo' && weightLog.length > 0) {
                const latest = [...weightLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const delta = Math.abs(profile.currentWeight - latest.weight);
                progress = `${Math.min(delta, 1).toFixed(1)}/1 kg`;
              }
            }
            return (
              <View key={type}>
                <BadgeCard
                  type={type}
                  unlocked={!!unlockedBadge}
                  unlockedAt={unlockedBadge?.unlockedAt}
                  progress={progress}
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
        <Pressable
          style={[styles.progressionButton, { marginTop: spacing.sm }]}
          onPress={() => router.push('/measurements')}
        >
          <View style={styles.progressionLeft}>
            <Text style={styles.progressionIcon}>{'\uD83D\uDCCF'}</Text>
            <View>
              <Text style={styles.progressionTitle}>{locale === 'en' ? 'Measurements' : 'Mensurations'}</Text>
              <Text style={styles.progressionSubtitle}>{locale === 'en' ? 'Waist, chest, arms...' : 'Taille, poitrine, bras...'}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Progress photos */}
      <View style={styles.section}>
        <Pressable
          style={styles.progressionButton}
          onPress={() => router.push('/progress-photos')}
        >
          <View style={styles.progressionLeft}>
            <Text style={styles.progressionIcon}>{'\uD83D\uDCF7'}</Text>
            <View>
              <Text style={styles.progressionTitle}>{locale === 'en' ? 'Progress Photos' : 'Photos de progression'}</Text>
              <Text style={styles.progressionSubtitle}>{locale === 'en' ? 'Track your visual transformation' : 'Suis ta transformation visuelle'}</Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Weight chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('weightEvolution')}</Text>
        {weightChartData.length >= 2 ? (
          <>
            <LineChart
              data={weightChartData}
              width={chartWidth}
              height={160}
              unit=" kg"
              formatValue={(v) => v.toFixed(1)}
            />
            <Pressable
              style={styles.seeAllBtn}
              onPress={() => router.push('/progression')}
            >
              <Text style={styles.seeAllText}>{t('weightSeeAll')} {'\u2192'}</Text>
            </Pressable>
          </>
        ) : (
          <EmptyState
            icon={'\u2696'}
            title={t('weightFirstEntry')}
            subtitle={t('startCheckInForChart')}
            actionLabel={t('weeklyCheckIn')}
            onAction={() => router.push('/checkin')}
          />
        )}
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
        <Pressable onPress={() => router.push('/terms')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.xs }]}>
            {locale === 'en' ? 'Terms of Service' : "Conditions d'utilisation"}
          </Text>
        </Pressable>
        <Text style={[styles.legalText, { marginTop: spacing.lg }]}>
          FORGA v{APP_VERSION}
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
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: 180,
    marginBottom: spacing.xl,
  },
  heroImageInner: {
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.white,
    fontWeight: '600',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
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
    paddingHorizontal: spacing['2xl'],
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
  freezeHint: {
    fontFamily: fonts.data,
    fontSize: 9,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
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
    marginBottom: spacing['3xl'],
    paddingHorizontal: spacing['2xl'],
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
    borderBottomColor: `${colors.border}80`,
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
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chipActive: {
    borderWidth: 1,
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
    borderBottomColor: `${colors.border}80`,
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
    paddingHorizontal: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: `${colors.border}80`,
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
  seeAllBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  seeAllText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
