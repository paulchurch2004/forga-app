import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../src/i18n';
import { fonts } from '../src/theme/fonts';
import { getOfferings, purchasePackage, restorePurchases } from '../src/services/revenueCat';
import { createCheckoutSession } from '../src/services/stripeWeb';
import { isDemoMode } from '../src/services/supabase';
import { useUserStore } from '../src/store/userStore';
import { useAuthStore } from '../src/store/authStore';
import { events } from '../src/services/analytics';
import { VideoMontage } from '../src/components/paywall/VideoMontage';
import { FeatureHighlights } from '../src/components/paywall/FeatureHighlights';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// V3 — Transformation theme tokens
const TH = {
  bg: '#0A0A0C',
  surface: '#16161A',
  surfaceAlt: '#1C1C22',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.12)',
  text: '#F5F5F7',
  textMuted: '#8E8E93',
  textDim: '#48484A',
  primary: '#FF6B2C',
  primaryDeep: '#E04A0A',
  primaryLight: '#FFB347',
  primarySoft: 'rgba(255,107,44,0.10)',
  primaryLine: 'rgba(255,107,44,0.32)',
  green: '#34D399',
  greenSoft: 'rgba(52,211,153,0.12)',
  red: '#FF3B30',
};

interface FeatureRow {
  name: string;
  free: string | false;
  pro: string;
}

// ⚠️ Honnêteté App Store : on ne dit PAS "illimité" pour le Coach IA et
// les scans, car ils ont un cap serveur (50 msg/jour, 10 scans/jour) pour
// maîtriser les coûts LLM/vision. Apple peut rejeter un claim "illimité"
// qui ne l'est pas vraiment. "50/jour" reste largement au-dessus de tout
// usage normal → l'argument de vente tient sans mentir.
const FEATURES: FeatureRow[] = [
  { name: '500+ recettes',            free: '5 recettes',         pro: 'Les 500+' },
  { name: 'Recettes étape par étape', free: 'Liste seulement',    pro: 'Vidéo + pas' },
  { name: 'Coach IA',                 free: '5 messages / jour',  pro: '50 messages / jour' },
  { name: "Programmes d'entraînement", free: '1 programme',       pro: 'Tous les programmes' },
  { name: 'Scan code-barre & photo',  free: '3 scans / jour',     pro: '10 scans / jour' },
];

export default function PaywallScreen() {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [view, setView] = useState<'free' | 'pro'>('pro');
  const [loading, setLoading] = useState(false);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const user = useAuthStore((s) => s.session?.user);


  useEffect(() => {
    events.paywallShown('paywall_screen');
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    if (Platform.OS === 'web') return;
    try {
      const pkgs = await getOfferings();
      setPackages(pkgs);
    } catch {
      /* ignore */
    }
  };

  const handlePurchase = async () => {
    if (Platform.OS === 'web') return handleWebPurchase();

    const pkg = packages.find((p: any) =>
      selectedPlan === 'annual' ? p.packageType === 'ANNUAL' : p.packageType === 'MONTHLY'
    );
    if (!pkg) {
      showAlert(t('error'), t('subscriptionUnavailable'));
      return;
    }
    setLoading(true);
    events.purchaseStarted(selectedPlan);
    try {
      const customerInfo = await purchasePackage(pkg);
      if (customerInfo) {
        updateProfile({ isPremium: true });
        events.purchaseCompleted(selectedPlan);
        // La feuille d'achat StoreKit est un modal NATIF iOS. Si on pop le
        // paywall tout de suite, la navigation se joue pendant que iOS
        // termine de fermer la feuille → un overlay natif résiduel reste
        // au-dessus et capture les touches = app "figée". On laisse la
        // fermeture native se terminer avant de quitter l'écran (et on
        // garde le spinner pendant ce court délai pour éviter un re-tap).
        setTimeout(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/home');
        }, 500);
        return;
      }
      // Achat annulé (customerInfo null) → on réactive le bouton.
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      showAlert(t('error'), error.message ?? t('errorOccurred'));
    }
  };

  const handleWebPurchase = async () => {
    setLoading(true);
    events.purchaseStarted(selectedPlan);
    try {
      if (isDemoMode) {
        showAlert(t('error'), t('subscriptionUnavailable'));
        return;
      }
      const result = await createCheckoutSession(selectedPlan, user?.id ?? '');
      if (result?.url && typeof window !== 'undefined') {
        (window as any).location.href = result.url;
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
        // Idem achat : laisser un éventuel flux natif (Apple ID) se fermer
        // avant de quitter l'écran, sinon overlay résiduel → app figée.
        setTimeout(() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/home');
        }, 500);
      } else {
        showAlert(t('error'), t('noActiveSubscription'));
      }
    } catch (error: any) {
      showAlert(t('error'), error.message ?? t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  // Prix affichés : tirés de l'offering RevenueCat (localisés par devise /
  // région), avec fallback EUR si l'offering n'est pas chargé (web, mode
  // démo, offline). Évite d'afficher un prix EUR figé à un user hors zone €.
  const annualPkg = packages.find((p: any) => p.packageType === 'ANNUAL');
  const monthlyPkg = packages.find((p: any) => p.packageType === 'MONTHLY');
  const annualTotalStr = annualPkg?.product?.priceString ?? '119,88€';
  const annualPerMonthStr = annualPkg?.product?.pricePerMonthString ?? '9,99€';
  const monthlyStr = monthlyPkg?.product?.priceString ?? '14,99€';
  const currencyCode = annualPkg?.product?.currencyCode ?? monthlyPkg?.product?.currencyCode ?? 'EUR';
  const isEur = currencyCode === 'EUR';
  // Remise réelle annuel vs mensuel, calculée (pas figée à −33% : varie
  // selon les prix réels configurés par palier dans App Store Connect).
  const annualPerMonthNum = annualPkg?.product?.pricePerMonth;
  const monthlyNum = monthlyPkg?.product?.price;
  const discountPct = annualPerMonthNum && monthlyNum && monthlyNum > 0
    ? Math.round((1 - annualPerMonthNum / monthlyNum) * 100)
    : 33;
  const annualBadge = discountPct > 0 ? `−${discountPct}%` : undefined;
  // Sur natif, tant que l'offering n'est pas chargé, on n'autorise pas le
  // tap (évite un CTA "mort" qui tombe sur subscriptionUnavailable).
  const nativeNoPackage = Platform.OS !== 'web' && packages.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: TH.bg }}>
      {/* Ambient glows */}
      <View pointerEvents="none" style={{
        position: 'absolute', top: insets.top - 100, left: -60, width: 320, height: 320, borderRadius: 160,
        backgroundColor: 'rgba(255,107,44,0.18)', opacity: 0.7,
      }} />
      <View pointerEvents="none" style={{
        position: 'absolute', top: insets.top - 80, right: -80, width: 280, height: 280, borderRadius: 140,
        backgroundColor: 'rgba(167,139,250,0.12)', opacity: 0.7,
      }} />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar : wordmark + close */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{
            fontFamily: fonts.display, color: TH.text,
            fontSize: 11, fontWeight: '800', letterSpacing: 5,
          }}>FORGA</Text>
          <Pressable
            onPress={() => { events.paywallDismissed(); router.back(); }}
            hitSlop={12}
            style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
              <Path d="M3 3L11 11M11 3L3 11" stroke={TH.textMuted} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <View style={{ width: 16, height: 1, backgroundColor: TH.primary }} />
            <Text style={{
              fontFamily: fonts.data, fontSize: 9.5, color: TH.primary,
              letterSpacing: 2.4, textTransform: 'uppercase', fontWeight: '600',
            }}>PROGRAMME 90 JOURS</Text>
          </View>
          <Text style={{
            fontFamily: fonts.display, fontSize: 38, lineHeight: 44, fontWeight: '500',
            color: TH.text, letterSpacing: -1,
          }}>
            De{' '}
            <Text style={{ fontStyle: 'italic', color: TH.textMuted, fontWeight: '400' }}>qui tu es</Text>
          </Text>
          <Text style={{
            fontFamily: fonts.display, fontSize: 38, lineHeight: 44, fontWeight: '500',
            color: TH.text, letterSpacing: -1,
          }}>
            à <HeroGradientText>qui tu peux devenir.</HeroGradientText>
          </Text>
        </View>

        {/* Video — gradient border, nothing else */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <VideoPlaceholder />
        </View>

        {/* Proposition de valeur — factuelle, non chiffrée (pas de
            compteur d'utilisateurs inventé, conforme Apple 2.3.1). */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            paddingHorizontal: 14, paddingVertical: 10,
            backgroundColor: TH.surface, borderWidth: 1, borderColor: TH.border, borderRadius: 12,
          }}>
            <View style={{ flexDirection: 'row' }}>
              {[TH.primary, TH.green, TH.text].map((c, i) => (
                <View key={i} style={{
                  width: 22, height: 22, borderRadius: 11, backgroundColor: c,
                  borderWidth: 2, borderColor: TH.bg,
                  marginLeft: i === 0 ? 0 : -8,
                }} />
              ))}
            </View>
            <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 11.5, color: TH.text, lineHeight: 16 }}>
              <Text style={{ fontWeight: '700', color: TH.primary }}>3 coachs en 1</Text>
              <Text> — nutrition, training et IA, synchronisés sur ton objectif.</Text>
            </Text>
          </View>
        </View>

        {/* Bloc de valeur — bénéfices produit factuels et non attribués
            (pas de faux témoignages, conforme Apple 2.3.1). */}
        <FeatureHighlights />

        {/* Toggle Free / Pro */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <View style={{
            flexDirection: 'row', backgroundColor: TH.surface, borderRadius: 10, padding: 3,
            borderWidth: 1, borderColor: TH.border, position: 'relative',
          }}>
            <ToggleButton
              label="Sans Pro"
              active={view === 'free'}
              onPress={() => setView('free')}
              activeBg={TH.surfaceAlt}
              gradient={false}
            />
            <ToggleButton
              label="Avec FORGA Pro"
              active={view === 'pro'}
              onPress={() => setView('pro')}
              activeBg={TH.primary}
              gradient
            />
          </View>
        </View>

        {/* Features list */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          {FEATURES.map((f, i) => {
            const isPro = view === 'pro';
            const value = isPro ? f.pro : f.free;
            const isLocked = !isPro && f.free === false;
            const tickBg = isLocked ? TH.surfaceAlt : (isPro ? TH.greenSoft : 'rgba(255,255,255,0.06)');
            const tickColor = isPro ? TH.green : TH.textMuted;
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0,
                  borderBottomColor: TH.border,
                  opacity: isLocked ? 0.45 : 1,
                }}
              >
                <View style={{
                  width: 18, height: 18, borderRadius: 9, backgroundColor: tickBg,
                  borderWidth: isPro && !isLocked ? 1 : 0,
                  borderColor: isPro && !isLocked ? `${TH.green}40` : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {isLocked ? (
                    <Svg width={9} height={9} viewBox="0 0 16 16" fill="none">
                      <Path d="M4 4L12 12M12 4L4 12" stroke={TH.textDim} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                  ) : (
                    <Svg width={10} height={10} viewBox="0 0 16 16" fill="none">
                      <Path d="M3 8.5L6.5 12L13 4.5" stroke={tickColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
                <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 13, color: TH.text, fontWeight: '500' }}>
                  {f.name}
                </Text>
                <Text style={{
                  fontFamily: fonts.data, fontSize: 9.5,
                  color: isPro ? TH.green : TH.textMuted, letterSpacing: 0.4,
                }}>
                  {typeof value === 'string' ? value : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Pricing — 2 cards */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PriceCard
              selected={selectedPlan === 'annual'}
              onPress={() => setSelectedPlan('annual')}
              badge={annualBadge}
              label="Annuel"
              strikePrice={monthlyStr}
              priceMain={annualPerMonthStr}
              priceSuffix="/mois"
              detail={`${annualTotalStr}/an · 7j gratuits`}
            />
            <PriceCard
              selected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
              label="Mensuel"
              priceMain={monthlyStr}
              priceSuffix="/mois"
              detail="Sans engagement"
            />
          </View>
          {/* Ancrage de prix : recadre 9,99€/mois en coût hebdo dérisoire
              pour dédramatiser ("c'est pas grand-chose"). */}
          {isEur && (
            <Text style={{
              textAlign: 'center', marginTop: 10,
              fontFamily: fonts.body, fontSize: 11.5, color: TH.textMuted,
            }}>
              {selectedPlan === 'annual'
                ? 'Soit ~2,30€/semaine — moins qu’un café.'
                : 'Le prix de 2 cafés par semaine.'}
            </Text>
          )}
        </View>

        {/* Timeline d'essai — tue la peur n°1 de l'user ("je vais oublier
            d'annuler et être débité sans le vouloir"). Montrer le déroulé
            de l'essai augmente nettement la conversion. */}
        <TrialTimeline />

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
          <Pressable onPress={handlePurchase} disabled={loading || nativeNoPackage} style={({ pressed }) => [
            { borderRadius: 12, overflow: 'hidden' },
            nativeNoPackage && { opacity: 0.5 },
            pressed && { opacity: 0.92 },
          ]}>
            <LinearGradient
              colors={[TH.primaryLight, TH.primary, TH.primaryDeep]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
                shadowColor: TH.primary, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 10 },
                elevation: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontFamily: fonts.body, fontSize: 15, fontWeight: '800',
                    color: '#FFFFFF', letterSpacing: -0.2,
                  }}>
                    Essayer 7 jours gratuitement
                  </Text>
                  <Text style={{
                    fontFamily: fonts.body, fontSize: 11, fontWeight: '500',
                    color: 'rgba(255,255,255,0.9)', marginTop: 2,
                  }}>
                    Sans frais aujourd'hui · puis {selectedPlan === 'annual' ? `${annualTotalStr}/an` : `${monthlyStr}/mois`}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
          {/* Ligne de réassurance. "Sans CB" RETIRÉ car FAUX : Apple exige
              un moyen de paiement (Apple ID) pour démarrer un essai avec
              abonnement auto-renouvelable. On reste honnête : 0€ aujourd'hui,
              rappel avant débit, annulation facile. */}
          <Text style={{
            textAlign: 'center', marginTop: 10,
            fontFamily: fonts.body, fontSize: 10.5, color: TH.textMuted, lineHeight: 15,
          }}>
            Annule quand tu veux dans les Réglages · Rappel avant le 1er débit{'\n'}
            <Text onPress={handleRestore} style={{ textDecorationLine: 'underline', color: TH.textMuted }}>
              {t('restorePurchase')}
            </Text>
            {'\n'}
            <Text onPress={() => router.push('/terms')} style={{ textDecorationLine: 'underline', color: TH.textMuted }}>
              Conditions d'utilisation
            </Text>
            {'  ·  '}
            <Text onPress={() => router.push('/privacy')} style={{ textDecorationLine: 'underline', color: TH.textMuted }}>
              Politique de confidentialité
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────

/** Déroulé visuel de l'essai gratuit 7 jours. Réduit l'anxiété
 *  "je vais être débité sans m'en rendre compte" → +conversion. */
function TrialTimeline() {
  const steps = [
    {
      day: "Aujourd'hui",
      title: 'Accès Pro complet',
      desc: 'Tout débloqué, 0€ débité.',
      color: TH.primary,
    },
    {
      day: 'Jour 5',
      title: 'Petit rappel',
      desc: 'On te prévient : 2 jours avant la fin.',
      color: TH.primaryLight,
    },
    {
      day: 'Jour 7',
      title: 'Début de l\'abonnement',
      desc: 'Sauf si tu as annulé avant (1 tap).',
      color: TH.green,
    },
  ];
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
      <View style={{
        backgroundColor: TH.surface, borderWidth: 1, borderColor: TH.border,
        borderRadius: 14, padding: 16,
      }}>
        <Text style={{
          fontFamily: fonts.data, fontSize: 9.5, color: TH.primary,
          letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: '600',
          marginBottom: 14,
        }}>
          Comment marche ton essai
        </Text>
        {steps.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            {/* Rail vertical + point */}
            <View style={{ alignItems: 'center', width: 14 }}>
              <View style={{
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: s.color, marginTop: 2,
              }} />
              {i < steps.length - 1 && (
                <View style={{ width: 2, flex: 1, backgroundColor: TH.border, marginVertical: 2 }} />
              )}
            </View>
            <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>
              <Text style={{ fontFamily: fonts.data, fontSize: 10, color: s.color, fontWeight: '700', letterSpacing: 0.4 }}>
                {s.day.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: TH.text, fontWeight: '700', marginTop: 1 }}>
                {s.title}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: TH.textMuted, marginTop: 1 }}>
                {s.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function HeroGradientText({ children }: { children: React.ReactNode }) {
  // Fake gradient text via tinted overlay — RN doesn't support text gradient natively without MaskedView.
  return (
    <Text style={{ fontStyle: 'italic', fontWeight: '700', color: TH.primary }}>
      {children}
    </Text>
  );
}

function ToggleButton({
  label, active, onPress, activeBg, gradient,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeBg: string;
  gradient: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, position: 'relative' }}>
      {active && gradient ? (
        <LinearGradient
          colors={[TH.primaryLight, TH.primary, TH.primaryDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
            borderRadius: 8,
            shadowColor: TH.primary, shadowOpacity: 0.32, shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
          }}
        />
      ) : active ? (
        <View style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: activeBg, borderRadius: 8,
        }} />
      ) : null}
      <Text style={{
        textAlign: 'center', paddingVertical: 8,
        fontFamily: fonts.body, fontSize: 11.5, fontWeight: '600',
        color: active ? '#FFFFFF' : TH.textMuted,
        letterSpacing: -0.1,
      }}>{label}</Text>
    </Pressable>
  );
}

function PriceCard({
  selected, onPress, badge, label, priceMain, priceSuffix, detail, strikePrice,
}: {
  selected: boolean;
  onPress: () => void;
  badge?: string;
  label: string;
  priceMain: string;
  priceSuffix: string;
  detail: string;
  /** Prix barré affiché à côté du prix principal (ex: "14,99€" sur le
   *  plan annuel pour matérialiser l'économie vs mensuel). Si absent,
   *  pas de prix barré rendu. */
  strikePrice?: string;
}) {
  return (
    <Pressable onPress={onPress} style={{
      flex: 1, position: 'relative',
      backgroundColor: selected ? TH.primarySoft : TH.surface,
      borderWidth: 1.5, borderColor: selected ? TH.primary : TH.border,
      borderRadius: 14, padding: 12,
      shadowColor: selected ? TH.primary : 'transparent',
      shadowOpacity: selected ? 0.32 : 0,
      shadowRadius: selected ? 16 : 0,
      shadowOffset: { width: 0, height: 8 },
      elevation: selected ? 6 : 0,
    }}>
      {badge && (
        <View style={{ position: 'absolute', top: -8, right: 10, borderRadius: 5, overflow: 'hidden' }}>
          <LinearGradient
            colors={[TH.primaryLight, TH.primary, TH.primaryDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 7, paddingVertical: 3 }}
          >
            <Text style={{
              fontFamily: fonts.data, fontSize: 8.5, fontWeight: '800',
              letterSpacing: 1.4, color: '#FFFFFF', textTransform: 'uppercase',
            }}>{badge}</Text>
          </LinearGradient>
        </View>
      )}
      <Text style={{ fontFamily: fonts.body, fontSize: 10, color: TH.textMuted, marginBottom: 3 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6 }}>
        {strikePrice && (
          <Text style={{
            fontFamily: fonts.display, fontSize: 14, fontWeight: '500',
            color: TH.textMuted, letterSpacing: -0.2,
            textDecorationLine: 'line-through',
          }}>
            {strikePrice}
          </Text>
        )}
        <Text style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: '700', color: TH.text, letterSpacing: -0.4 }}>
          {priceMain}
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: TH.textMuted, fontWeight: '400' }}>
          {priceSuffix}
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.data, fontSize: 9.5, color: TH.textMuted, marginTop: 3 }}>{detail}</Text>
    </Pressable>
  );
}

function VideoPlaceholder() {
  // Gradient border via outer LinearGradient + inner inset to expose the gradient.
  return (
    <LinearGradient
      colors={['#FF8A3D', '#FF6B2C', '#D8420E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 18, padding: 1.5 }}
    >
      <View style={{
        height: 180,
        borderRadius: 16.5,
        overflow: 'hidden',
        backgroundColor: '#000',
      }}>
        <VideoMontage />
      </View>
    </LinearGradient>
  );
}
