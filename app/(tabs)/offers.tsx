// Tab "Offres" — offres promo des marques partenaires.
//
// Gating Premium :
//  - Tous les users (free + premium) voient TOUTES les offres et
//    leurs détails (brand, description, % de réduction).
//  - Le `discountCode` réservé Premium est CACHÉ aux free → ils voient
//    un placeholder "Débloque Pro" avec CTA paywall.
//  - Le `publicCode` (offre teaser) si défini reste visible pour tous.
//  - Le CTA "Profiter de l'offre" (lien externe) reste cliquable pour
//    tous — on ne bloque pas l'accès au site partenaire, juste le code.
//
// Cette logique pousse à l'upgrade SANS frustrer les free (ils ont
// quand même de la valeur via les codes publics).

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Copy to clipboard avec fallback : `expo-clipboard` n'est pas
 *  obligatoirement installé. On tente l'import dynamique, sinon on
 *  fall back sur navigator.clipboard (web) ou on log silencieusement.
 *  L'user voit toujours le "✓ Code copié" même si la copie a échoué
 *  — il peut lire le code à l'œil et le taper manuellement. */
async function copyToClipboard(text: string): Promise<void> {
  try {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(text);
    return;
  } catch {
    // expo-clipboard non installé — fallback web
  }
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }
}
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { fonts, fontSizes, fontWeights } from '../../src/theme/fonts';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { usePartnerOffers } from '../../src/hooks/usePartnerOffers';
import { usePremium } from '../../src/hooks/usePremium';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useResponsive } from '../../src/hooks/useResponsive';
import type { PartnerOffer } from '../../src/services/partnersOffers';
import { events } from '../../src/services/analytics';

const triggerHaptic = (style: 'light' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => {
    if (style === 'success') {
      H.notificationAsync(H.NotificationFeedbackType.Success);
    } else {
      H.impactAsync(H.ImpactFeedbackStyle.Light);
    }
  }).catch(() => {});
};

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { t, locale } = useT();
  const styles = useStyles();
  const { data: offers, isLoading, refetch, isRefetching } = usePartnerOffers();
  const { isPremium } = usePremium();

  const handleUnlock = useCallback(() => {
    triggerHaptic('light');
    // Track le tap "unlock" pour mesurer le taux de conversion paywall
    // depuis le tab Offres — sinon on optimise à l'aveugle.
    events.partnerOfferUnlockTapped?.();
    router.push('/paywall' as any);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const hasOffers = offers && offers.length > 0;

  return (
    <ScrollView
      style={[styles.container, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <Text style={styles.eyebrow}>{t('tabOffers' as any)}</Text>
      <Text style={styles.title}>{t('offersTitle' as any)}</Text>
      <Text style={styles.subtitle}>{t('offersSubtitle' as any)}</Text>

      {/* Bannière de teasing si user n'est pas Premium */}
      {!isPremium && (
        <Pressable onPress={handleUnlock} style={({ pressed }) => [styles.lockBanner, pressed && { opacity: 0.85 }]}>
          <LinearGradient
            colors={['rgba(255,107,53,0.18)', 'rgba(255,107,53,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lockBannerGradient}
          >
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lockTitle}>{t('offersPremiumLockTitle' as any)}</Text>
              <Text style={styles.lockBody}>{t('offersPremiumLockBody' as any)}</Text>
            </View>
            <View style={styles.lockCta}>
              <Text style={styles.lockCtaText}>{t('offersUnlockCta' as any)}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      )}

      {/* Liste des offres */}
      {hasOffers ? (
        <View style={styles.offersList}>
          {offers!.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isPremium={isPremium}
              onUnlock={handleUnlock}
              t={t}
              locale={locale}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon={'★'}
          title={t('offersEmptyTitle' as any)}
          subtitle={t('offersEmptySubtitle' as any)}
        />
      )}

      <View style={{ height: insets.bottom + 80 }} />
    </ScrollView>
  );
}

interface OfferCardProps {
  offer: PartnerOffer;
  isPremium: boolean;
  onUnlock: () => void;
  t: (key: string, params?: any) => string;
  locale: string;
}

function OfferCard({ offer, isPremium, onUnlock, t, locale }: OfferCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [justCopied, setJustCopied] = useState(false);

  const handleCopyCode = useCallback(async (code: string) => {
    triggerHaptic('success');
    await copyToClipboard(code);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
    events.partnerOfferCodeCopied?.(offer.id, offer.brand);
  }, [offer.id, offer.brand]);

  const handleVisit = useCallback(() => {
    triggerHaptic('light');
    events.partnerOfferOpened?.(offer.id, offer.brand);
    Linking.openURL(offer.partnerUrl).catch(() => {});
  }, [offer.id, offer.brand, offer.partnerUrl]);

  // Détermine quel code afficher : Pro (si Premium), public (si défini),
  // sinon nada → message "Pro members only".
  const displayCode = isPremium ? offer.discountCode : offer.publicCode;
  const isProCode = isPremium && !!offer.discountCode;

  // Partage natif : on construit un message contenant la marque + titre
  // + code (si dispo, Pro ou public) + lien. Fonctionne sur iOS et
  // Android via le sheet système. Sur web, on tombe sur navigator.share
  // si dispo, sinon no-op silencieux (pas de fallback texte qui spam).
  const handleShare = useCallback(async () => {
    triggerHaptic('light');
    const codePart = displayCode ? `\nCode : ${displayCode}` : '';
    const message = `${offer.brand} — ${offer.title}${codePart}\n${offer.partnerUrl}`;
    try {
      if (Platform.OS === 'web') {
        const navAny = (typeof navigator !== 'undefined' ? (navigator as any) : null);
        if (navAny?.share) {
          await navAny.share({ title: offer.brand, text: message, url: offer.partnerUrl });
        }
        return;
      }
      await Share.share({ message, url: offer.partnerUrl, title: offer.brand });
    } catch {
      // Annulation par l'user → no-op
    }
  }, [offer.brand, offer.title, offer.partnerUrl, displayCode]);

  return (
    <View style={styles.offerCard}>
      {/* Image hero / logo de la marque */}
      {offer.imageUrl ? (
        <View style={styles.brandImageWrap}>
          <Image
            source={{ uri: offer.imageUrl }}
            style={styles.brandImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>
      ) : (
        <View style={[styles.brandImageWrap, { backgroundColor: colors.surface }]}>
          <Text style={styles.brandFallback}>{offer.brand.charAt(0)}</Text>
        </View>
      )}

      {/* Header : brand + % */}
      <View style={styles.offerHeader}>
        <Text style={styles.offerBrand}>{offer.brand}</Text>
        {offer.discountPct ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{offer.discountPct}%</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.offerTitle}>{offer.title}</Text>
      <Text style={styles.offerDescription} numberOfLines={3}>{offer.description}</Text>

      {/* Bloc code promo */}
      {displayCode ? (
        <View style={styles.codeBlock}>
          <View style={{ flex: 1 }}>
            <Text style={styles.codeLabel}>
              {isProCode ? t('offersProCode' as any) : t('offersPublicCode' as any)}
            </Text>
            <Text style={styles.codeValue}>{displayCode}</Text>
          </View>
          <Pressable
            onPress={() => handleCopyCode(displayCode)}
            style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.85 }]}
            hitSlop={8}
          >
            <Ionicons
              name={justCopied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={justCopied ? colors.success : colors.primary}
            />
            <Text style={[styles.copyBtnText, justCopied && { color: colors.success }]}>
              {justCopied ? t('offersCodeCopied' as any) : t('offersCopyCode' as any)}
            </Text>
          </Pressable>
        </View>
      ) : (
        // Non-premium + pas de code public → carte verrouillée
        <Pressable
          onPress={onUnlock}
          style={({ pressed }) => [styles.codeBlockLocked, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name="lock-closed" size={18} color={colors.primary} />
          <Text style={styles.codeBlockLockedText}>
            {t('offersPremiumLockTitle' as any)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      )}

      {/* Visit + Share. Visit prend la largeur principale, Share est
          un bouton secondaire à côté pour partager l'offre + code. */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleVisit}
          style={({ pressed }) => [styles.visitBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.visitBtnText}>{t('offersVisitSite' as any)}</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={t('share' as any)}
          hitSlop={8}
        >
          <Ionicons name="share-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {offer.expiresAt ? (
        <Text style={styles.expiresText}>
          {t('offersExpiresOn' as any, {
            date: new Date(offer.expiresAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
              day: 'numeric',
              month: 'short',
            }),
          })}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: fontSizes.md * 1.4,
  },
  /** Bannière de teasing affichée aux users non-premium. CTA paywall. */
  lockBanner: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden' as const,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  lockBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  lockIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  lockBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSizes.sm * 1.35,
  },
  lockCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  lockCtaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
  },
  offersList: {
    gap: spacing.lg,
  },
  offerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: 'hidden' as const,
  },
  brandImageWrap: {
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  brandImage: {
    width: '100%',
    height: '100%',
  },
  brandFallback: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  offerBrand: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  discountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  discountBadgeText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
  },
  offerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: fontSizes.lg * 1.25,
  },
  offerDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.4,
    marginBottom: spacing.md,
  },
  codeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  codeLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  codeValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
    letterSpacing: 1,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  copyBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  codeBlockLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  codeBlockLockedText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  visitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  shareBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  visitBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
  expiresText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center' as const,
    marginTop: spacing.sm,
  },
}));
