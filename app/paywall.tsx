import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';
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

const FEATURES = [
  'Photos des plats + 12 choix par repas',
  'Grammages personnalisés au gramme',
  'Recettes détaillées pas-à-pas',
  'Streak Freeze (protège ta série)',
  'Score FORGA détaillé',
  'Ajustement automatique de ton plan',
  'Zéro pub',
];

export default function PaywallScreen() {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
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
        : p.packageType === 'MONTHLY'
    );

    if (!pkg) {
      showAlert('RevenueCat non configuré', 'Configure tes produits dans RevenueCat pour activer les achats.');
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
      showAlert('Erreur', error.message ?? 'Erreur lors de l\'achat.');
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
        const weeks = selectedPlan === 'annual' ? 52 : 4;
        const premiumUntil = calculatePremiumUntil(undefined, weeks);
        updateProfile({ isPremium: true, premiumUntil });
        events.purchaseCompleted(selectedPlan);
        showAlert('Mode Démo', 'Premium activé en mode démo !');
        router.back();
        return;
      }

      const result = await createCheckoutSession(selectedPlan, user?.id ?? '');
      if (result?.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        showAlert('Erreur', 'Impossible de créer la session de paiement.');
      }
    } catch (error: any) {
      showAlert('Erreur', error.message ?? 'Erreur lors du paiement.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      showAlert('Déjà abonné ?', 'Contacte le support à support@forga.fr pour restaurer ton abonnement web.');
      return;
    }
    setLoading(true);
    try {
      const info = await restorePurchases();
      if (info?.entitlements?.active?.['premium']) {
        updateProfile({ isPremium: true });
        showAlert('Restauré', 'Ton abonnement a été restauré.');
        router.back();
      } else {
        showAlert('Aucun achat', 'Aucun abonnement actif trouvé.');
      }
    } catch (error: any) {
      showAlert('Erreur', error.message ?? 'Erreur lors de la restauration.');
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
      }}>
        <Text style={styles.closeText}>Non merci</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tu passes à côté de :</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCross}>x</Text>
            <Text style={styles.featureText}>{feature}</Text>
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
            <Text style={styles.planBadgeText}>RECOMMANDÉ</Text>
          </View>
          <Text style={styles.planPrice}>14,99€/an</Text>
          <Text style={styles.planDetail}>1,25€/mois</Text>
        </Pressable>

        <Pressable
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <Text style={styles.planPrice}>2,99€/mois</Text>
          <Text style={styles.planDetail}>Mensuel</Text>
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
            Commencer l'essai gratuit 7 jours
          </Text>
        )}
      </Pressable>

      <Text style={styles.cancelText}>
        Annule quand tu veux. Aucun engagement.
      </Text>

      <Pressable onPress={handleRestore}>
        <Text style={styles.restoreText}>Restaurer un achat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  closeText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textMuted,
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
});
