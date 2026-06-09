// FORGA — Popup périodique pour inciter les users Free à parrainer.
//
// Logique : tous les ~5 jours, à l'app foreground, on rappelle au user
// qu'il peut gagner 1 semaine de Premium par filleul qui crée un
// compte. Affiche son code de parrainage + un bouton de partage natif.
//
// Critères d'affichage (gérés dans useReferralPrompt) :
//   - User non Premium uniquement
//   - Au moins 2 jours d'usage de l'app (sinon on parle aux nouveaux
//     users qui n'ont rien à raconter à leurs amis)
//   - ≥ 5 jours depuis le dernier prompt
//
// L'user peut :
//   - "Partager" → ouvre la share sheet native avec le code + lien
//   - "Plus tard" → ferme le modal, on retentera dans 5 jours
//   - Tap hors modal → ferme

import React, { useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import { fonts, fontSizes, fontWeights } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';
import { events } from '../../services/analytics';
import { REFERRAL_TIERS, getNextTier } from '../../services/referrals';

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => {
    const s = style === 'medium'
      ? H.ImpactFeedbackStyle.Medium
      : H.ImpactFeedbackStyle.Light;
    H.impactAsync(s);
  }).catch(() => {});
};

interface Props {
  visible: boolean;
  /** Code de parrainage personnel de l'user (ex: FORGA-X8K2). */
  referralCode: string;
  /** Nombre de filleuls actuels (pour afficher la progression). */
  referralCount: number;
  /** Appelé quand l'user dismiss le modal (Plus tard OU tap hors zone). */
  onDismiss: () => void;
}

export function ReferralPromptModal({ visible, referralCode, referralCount, onDismiss }: Props) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = makeStyles(colors);

  const handleShare = useCallback(async () => {
    triggerHaptic('medium');
    try {
      const message = t('referralShareMessage' as any, { code: referralCode }) as string;
      await Share.share({
        message,
        // iOS supports title (Mail subject) ; Android l'ignore proprement
        title: t('referralShareTitle' as any) as string,
      });
      events.referralCodeShared('share');
    } catch {
      // User canceled or share dialog failed — pas de message d'erreur
    }
    // On dismiss après le partage (que ça réussisse ou pas)
    onDismiss();
  }, [referralCode, onDismiss, t]);

  const handleLater = useCallback(() => {
    triggerHaptic('light');
    onDismiss();
  }, [onDismiss]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      {/* SafeAreaView wrapping pour éviter que le card passe sous la
          Dynamic Island / notch sur iPhone 14+. edges=['top'] suffit :
          le card est déjà centré, juste besoin de garantir le top safe. */}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        {/* Container : Pressable pour avaler les taps qui ne doivent
            pas remonter au backdrop (dismiss). */}
        <Pressable style={styles.card} onPress={() => { /* swallow */ }}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="gift-outline" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>{t('referralPromptTitle' as any)}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.tagline}>
              {t('referralPromptTagline' as any)}
            </Text>

            {/* Progression vers le prochain palier — montre à l'user
                où il en est et ce qu'il gagne au prochain palier. C'est
                le moteur de gamification : "1 ami de plus → +1 mois". */}
            {(() => {
              const nextTier = getNextTier(referralCount);
              if (!nextTier) {
                // Tous les paliers atteints
                return (
                  <Text style={styles.countLine}>
                    {t('referralPromptAllTiersUnlocked' as any, { count: referralCount })}
                  </Text>
                );
              }
              const remaining = nextTier.atCount - referralCount;
              // Le palier précédent (ou 0) pour calculer le % progression
              const prevTier = REFERRAL_TIERS
                .filter((tt) => tt.atCount <= referralCount)
                .pop();
              const prevCount = prevTier?.atCount ?? 0;
              const progress = (referralCount - prevCount) / (nextTier.atCount - prevCount);
              return (
                <View style={styles.progressWrap}>
                  <Text style={styles.progressText}>
                    {t('referralPromptProgress' as any, {
                      remaining,
                      reward: t(`referralReward_${nextTier.labelKey}` as any) as string,
                    })}
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.max(6, progress * 100)}%` }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressLabelSmall}>{referralCount}</Text>
                    <Text style={styles.progressLabelSmall}>{nextTier.atCount}</Text>
                  </View>
                </View>
              );
            })()}

            {/* Liste compacte des paliers — donne envie d'aller loin */}
            <View style={styles.tiersList}>
              {REFERRAL_TIERS.map((tier) => {
                const unlocked = referralCount >= tier.atCount;
                return (
                  <View
                    key={tier.atCount}
                    style={[styles.tierRow, unlocked && styles.tierRowUnlocked]}
                  >
                    <View style={styles.tierBadge}>
                      <Text style={[styles.tierBadgeText, unlocked && styles.tierBadgeTextUnlocked]}>
                        {tier.atCount}
                      </Text>
                    </View>
                    <Text style={[styles.tierLabel, unlocked && styles.tierLabelUnlocked]}>
                      {t(`referralReward_${tier.labelKey}` as any)}
                    </Text>
                    {unlocked && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Code de parrainage en gros */}
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('referralPromptYourCode' as any)}</Text>
              <Text style={styles.codeValue} selectable>{referralCode.trim()}</Text>
            </View>

            {/* CTA principal : partager */}
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={t('referralPromptShareCta' as any) as string}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>{t('referralPromptShareCta' as any)}</Text>
            </Pressable>

            {/* CTA secondaire : dismiss */}
            <Pressable
              onPress={handleLater}
              style={({ pressed }) => [styles.laterBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.laterText}>{t('referralPromptLater' as any)}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    gradientHeader: {
      paddingVertical: spacing['2xl'],
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    headerTitle: {
      fontFamily: fonts.display,
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: '#FFFFFF',
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    body: {
      padding: spacing.xl,
    },
    tagline: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      color: colors.text,
      textAlign: 'center',
      lineHeight: fontSizes.md * 1.4,
      marginBottom: spacing.sm,
    },
    countLine: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    progressWrap: {
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    progressText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
      lineHeight: fontSizes.sm * 1.4,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    progressLabelSmall: {
      fontFamily: fonts.data,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '700' as any,
    },
    tiersList: {
      gap: spacing.xs,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    tierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: 'transparent',
    },
    tierRowUnlocked: {
      backgroundColor: 'rgba(255,107,53,0.08)',
    },
    tierBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tierBadgeText: {
      fontFamily: fonts.data,
      fontSize: 11,
      fontWeight: '700' as any,
      color: colors.textMuted,
    },
    tierBadgeTextUnlocked: {
      color: colors.primary,
    },
    tierLabel: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
    },
    tierLabelUnlocked: {
      color: colors.text,
      fontWeight: '600' as any,
    },
    codeBox: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      borderStyle: 'dashed',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    codeLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    codeValue: {
      fontFamily: fonts.data,
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: colors.text,
      letterSpacing: 1.2,
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
    },
    shareBtnText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold as any,
      color: '#FFFFFF',
    },
    laterBtn: {
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    laterText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
    },
  });
