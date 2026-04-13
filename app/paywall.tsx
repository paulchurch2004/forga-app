import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme/spacing';
import { getOfferings, purchasePackage, restorePurchases } from '../src/services/revenueCat';
import { createCheckoutSession } from '../src/services/stripeWeb';
import { isDemoMode } from '../src/services/supabase';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { calculatePremiumUntil } from '../src/services/referrals';
import { events } from '../src/services/analytics';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const FEATURE_KEYS = [
  'premiumFeature1',
  'premiumFeature2',
  'premiumFeature3',
  'premiumFeature4',
  'premiumFeature5',
  'premiumFeature6',
  'premiumFeature7',
];

export default function PaywallScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'weekly'>('annual');
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    events.paywallShown('paywall_screen');
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      if (Platform.OS === 'web') {
        // On web, no RevenueCat packages needed — UI uses hardcoded plans
        setLoadingPackages(false);
        return;
      }
      const pkgs = await getOfferings();
      setPackages(pkgs);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handlePurchase = async () => {
    if (Platform.OS === 'web') {
      return handleWebPurchase();
    }

    const pkg = packages.find((p: any) =>
      selectedPlan === 'annual'
        ? p.packageType === 'ANNUAL'
        : p.packageType === 'WEEKLY'
    );

    if (!pkg) {
      showAlert(t('error'), 'RevenueCat not configured');
      return;
    }

    setLoading(true);
    events.purchaseStarted(selectedPlan);

    try {
      const customerInfo = await purchasePackage(pkg);
      if (customerInfo) {
        updateProfile({ isPremium: true });
        events.purchaseCompleted(selectedPlan);
        router.back();
      }
    } catch (error: any) {
      showAlert(t('error'), error.message ?? t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleWebPurchase = async () => {
    setLoading(true);
    events.purchaseStarted(selectedPlan);

    try {
      if (isDemoMode) {
        // Demo mode: simulate premium activation
        const weeks = selectedPlan === 'annual' ? 52 : 1;
        const premiumUntil = calculatePremiumUntil(undefined, weeks);
        updateProfile({ isPremium: true, premiumUntil });
        events.purchaseCompleted(selectedPlan);
        showAlert(t('demoMode'), t('demoPremiumActivated'));
        router.back();
        return;
      }

      const result = await createCheckoutSession(selectedPlan, user?.id ?? '');
      if (result?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        showAlert(t('error'), t('errorOccurred'));
      }
    } catch (error: any) {
      showAlert(t('error'), error.message ?? t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      showAlert(t('alreadySubscribed'), t('contactSupport'));
      return;
    }
    setLoading(true);
    try {
      const info = await restorePurchases();
      if (info?.entitlements?.active?.['premium']) {
        updateProfile({ isPremium: true });
        showAlert(t('restore'), t('restoreSuccess'));
        router.back();
      } else {
        showAlert(t('error'), t('noActiveSubscription'));
      }
    } catch (error: any) {
      showAlert(t('error'), error.message ?? t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <Pressable style={styles.closeButton} onPress={() => {
        events.paywallDismissed();
        router.back();
      }} hitSlop={16}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M18 6L6 18M6 6l12 12" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("youAreMissingOut")}</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURE_KEYS.map((key, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCross}>x</Text>
            <Text style={styles.featureText}>{t(key as any)}</Text>
          </View>
        ))}
      </View>

      {/* Plans */}
      <View style={styles.plans}>
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'annual' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('annual')}
        >
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{t("recommended")}</Text>
          </View>
          <Text style={styles.planPrice}>{t("annualPrice")}</Text>
          <Text style={styles.planDetail}>{t("annualDetail")}</Text>
        </Pressable>

        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'weekly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('weekly')}
        >
          <Text style={styles.planPrice}>{t("weeklyPrice")}</Text>
          <Text style={styles.planDetail}>{t("weeklyLabel")}</Text>
        </Pressable>
      </View>

      {/* CTA */}
      <Pressable
        style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
        onPress={handlePurchase}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.ctaText}>
            {t("startFreeTrial")}
          </Text>
        )}
      </Pressable>

      <Text style={styles.cancelText}>
        {t("cancelAnytime")}
      </Text>

      <Pressable onPress={handleRestore}>
        <Text style={styles.restoreText}>{t("restorePurchase")}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing['2xl'],
    paddingTop: 60,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: spacing['3xl'],
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: spacing['2xl'],
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing['3xl'],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureCross: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.error,
    width: 20,
    textAlign: 'center',
  },
  featureText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  plans: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  planBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  planBadgeText: {
    fontFamily: 'DMSans',
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  planPrice: {
    fontFamily: 'Outfit',
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  planDetail: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  cancelText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  restoreText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    textDecorationLine: 'underline',
  },
}));
