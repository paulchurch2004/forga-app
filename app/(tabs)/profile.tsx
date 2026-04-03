import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { colors } from '../../src/theme/colors';
import { fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useResponsive } from '../../src/hooks/useResponsive';
import { getScoreColor, getScoreLabel } from '../../src/theme/colors';
import { useUserStore } from '../../src/store/userStore';
import { useScoreStore } from '../../src/store/scoreStore';
import { useMealStore } from '../../src/store/mealStore';
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
  const profile = useUserStore((s) => s.profile);
  const badges = useUserStore((s) => s.badges);
  const score = useScoreStore((s) => s.currentScore);
  const { currentStreak, bestStreak } = useStreak();
  const { isPremium } = usePremium();
  const checkIns = useUserStore((s) => s.checkIns);
  const { isEnabled: notifEnabled, toggle: toggleNotif } = useNotifications();
  const [exporting, setExporting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Last non-zero calorie adjustment
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
        message: `Rejoins FORGA et commence ta transformation ! Utilise mon code parrain ${code} à l'inscription. Télécharge l'app : https://forga.fr`,
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
        // Download as file on web
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forga-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Share as text on native
        await Share.share({
          message: json,
          title: 'Export FORGA',
        });
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'exporter tes donnees.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer ton compte',
      'Cette action est irréversible. Toutes tes données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // Delete user data from Supabase
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
      // Web: redirect to Stripe customer portal or show info
      Alert.alert(
        'Abonnement',
        'Pour gérer ton abonnement, contacte-nous à support@forga.fr ou consulte ton email de confirmation.',
      );
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    useUserStore.getState().reset();
    useMealStore.getState().reset();
    useScoreStore.getState().reset();
    useAuthStore.getState().reset();
  };

  const objectiveLabels = {
    bulk: 'Prise de masse',
    cut: 'Sèche',
    maintain: 'Maintien',
    recomp: 'Recomposition',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, maxWidth: contentMaxWidth }]}>
      {/* Back button */}
      <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={16} style={styles.backRow}>
        <Text style={styles.backText}>{'\u2039'} Accueil</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>FORGA PRO</Text>
          </View>
        )}
      </View>

      {/* Score + Streak */}
      <View style={styles.statsRow}>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=score')}>
          <Text style={[styles.statValue, { color: getScoreColor(score.total) }]}>
            {score.total}
          </Text>
          <Text style={styles.statLabel}>{getScoreLabel(score.total)}</Text>
          <Text style={styles.shareHint}>Partager</Text>
        </Pressable>
        <Pressable style={styles.statCard} onPress={() => router.push('/share?type=streak')}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentStreak}
          </Text>
          <Text style={styles.statLabel}>jours de streak</Text>
          <Text style={styles.shareHint}>Partager</Text>
        </Pressable>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>
            {bestStreak}
          </Text>
          <Text style={styles.statLabel}>meilleur streak</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes badges</Text>
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
                    <Text style={styles.badgeShareText}>Partager</Text>
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
          <Text style={styles.sectionTitle}>Parrainage</Text>
          <View style={styles.referralCard}>
            <Text style={styles.referralLabel}>Ton code parrain</Text>
            <Text style={styles.referralCode}>{profile.referralCode}</Text>
            <Text style={styles.referralReward}>
              1 semaine offerte par ami invite
            </Text>
            <View style={styles.referralButtons}>
              <Pressable
                style={styles.referralCopyBtn}
                onPress={handleCopyCode}
              >
                <Text style={styles.referralCopyText}>
                  {codeCopied ? 'Copie !' : 'Copier'}
                </Text>
              </Pressable>
              <Pressable
                style={styles.referralShareBtn}
                onPress={handleShareCode}
              >
                <Text style={styles.referralShareText}>Partager</Text>
              </Pressable>
            </View>
            {(profile.referralCount ?? 0) > 0 && (
              <Text style={styles.referralStats}>
                {profile.referralCount} ami{(profile.referralCount ?? 0) > 1 ? 's' : ''} parraine{(profile.referralCount ?? 0) > 1 ? 's' : ''}
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
              <Text style={styles.progressionTitle}>Check-in hebdo</Text>
              <Text style={styles.progressionSubtitle}>
                Poids + ressentis → plan ajuste
              </Text>
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
              <Text style={styles.progressionTitle}>Ma progression</Text>
              <Text style={styles.progressionSubtitle}>
                Courbes de poids et score FORGA
              </Text>
            </View>
          </View>
          <Text style={styles.progressionArrow}>{'\u203A'}</Text>
        </Pressable>
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Mon profil</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={styles.editLink}>Modifier</Text>
          </Pressable>
        </View>
        <ProfileRow label="Objectif" value={objectiveLabels[profile.objective]} />
        <ProfileRow label="Poids actuel" value={`${profile.currentWeight} kg`} />
        <ProfileRow label="Poids cible" value={`${profile.targetWeight} kg`} />
        <ProfileRow label="Calories/jour" value={`${profile.dailyCalories} kcal`} />
        <ProfileRow label="Protéines" value={`${profile.dailyProtein}g`} />
        <ProfileRow label="Glucides" value={`${profile.dailyCarbs}g`} />
        <ProfileRow label="Lipides" value={`${profile.dailyFat}g`} />
        {lastAdjustment && (
          <View style={styles.adjustmentRow}>
            <Text style={styles.adjustmentIcon}>{'\u26A1'}</Text>
            <Text style={styles.adjustmentText}>
              Ajusté {lastAdjustment.calorieAdjustment > 0 ? '+' : ''}{lastAdjustment.calorieAdjustment} kcal
              {' '}(check-in du{' '}
              {new Date(lastAdjustment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })})
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        {!isPremium && (
          <Pressable
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeText}>Passer à FORGA PRO</Text>
          </Pressable>
        )}

        {isPremium && (
          <Pressable style={styles.actionRow} onPress={handleManageSubscription}>
            <Text style={styles.actionText}>Gérer mon abonnement</Text>
          </Pressable>
        )}

        {Platform.OS !== 'web' && (
          <View style={styles.actionRow}>
            <Text style={styles.actionText}>Notifications</Text>
            <Switch
              value={notifEnabled}
              onValueChange={() => toggleNotif(currentStreak)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        )}

        <Pressable style={styles.actionRow} onPress={() => router.push('/tdee-calculator')}>
          <Text style={styles.actionText}>Recalculer mes besoins (TDEE)</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleExportData}>
          <Text style={styles.actionText}>Exporter mes données (RGPD)</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleSignOut}>
          <Text style={styles.actionText}>Se déconnecter</Text>
        </Pressable>

        <Pressable style={styles.actionRow} onPress={handleDeleteAccount}>
          <Text style={[styles.actionText, { color: colors.error }]}>
            Supprimer mon compte
          </Text>
        </Pressable>
      </View>

      {/* Legal */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>
          FORGA est un outil éducatif et informatif. Il ne remplace en aucun cas l'avis
          d'un médecin, nutritionniste ou professionnel de santé. Consulte un professionnel
          avant tout changement alimentaire significatif.
        </Text>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={[styles.legalText, { color: colors.primary, marginTop: spacing.sm }]}>
            Politique de confidentialité
          </Text>
        </Pressable>
        <Text style={[styles.legalText, { marginTop: spacing.lg }]}>
          FORGA v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  name: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
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
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  shareHint: {
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontFamily: 'Outfit',
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
  badge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badgeDesc: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    flex: 2,
  },
  badgeCheck: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.success,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editLink: {
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  profileValue: {
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes.md,
    color: colors.text,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeText: {
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  referralCode: {
    fontFamily: 'JetBrainsMono',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  referralReward: {
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
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
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.white,
  },
  referralStats: {
    fontFamily: 'DMSans',
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
    fontFamily: 'Outfit',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  progressionSubtitle: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressionArrow: {
    fontFamily: 'DMSans',
    fontSize: fontSizes['2xl'],
    color: colors.primary,
  },
});
