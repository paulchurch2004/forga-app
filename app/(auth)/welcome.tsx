import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  Easing,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, shadows } from '../../src/theme/spacing';

/* ═══════════ CONSTANTES ═══════════ */

const LANDING_MAX_WIDTH = 900;

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  break1: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=80',
  break2: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80',
  break3: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80',
  cta: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1200&q=80',
};

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_SMOOTH = Easing.bezier(0.76, 0, 0.24, 1);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ═══════════ SVG ICONS ═══════════ */

function IconPlate() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" stroke={colors.primary} strokeWidth={1.8} />
    </Svg>
  );
}

function IconStar() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z" stroke={colors.primary} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function IconFlame() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22c4.97 0 8-3.58 8-8 0-3.5-2-6.5-4-8-.5-.4-1.2 0-1.1.6.3 1.4-.2 3.4-1.9 4.4 0-3-1.5-5.5-4-7.5-.5-.4-1.3 0-1.1.6C8.5 6.5 7 8 6 9.5 4.5 11.5 4 13.5 4 14c0 4.42 3.03 8 8 8Z" stroke={colors.primary} strokeWidth={1.8} />
    </Svg>
  );
}

function IconSliders() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-4h4m4 6h4" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function IconChart() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="m3 17 6-6 4 4 8-10" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconCheck() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* ═══════════ SCROLL ANIMATION COMPONENTS ═══════════ */

/**
 * ScrollReveal — wraps a section and animates it in when it enters the viewport.
 * Must be a direct child of the ScrollView content to get correct Y offset.
 * Effect: fade-in + slide-up + slight scale.
 */
function ScrollReveal({
  children,
  scrollY,
  windowHeight,
  style,
}: {
  children: React.ReactNode;
  scrollY: SharedValue<number>;
  windowHeight: number;
  style?: any;
}) {
  const offsetY = useSharedValue(99999);

  const handleLayout = (e: any) => {
    offsetY.value = e.nativeEvent.layout.y;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const start = offsetY.value - windowHeight + 80;
    const end = start + 220;
    return {
      opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [start, end], [50, 0], Extrapolation.CLAMP) },
        { scale: interpolate(scrollY.value, [start, end], [0.93, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View onLayout={handleLayout} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedCounter — counts up from 0 to target when it enters viewport.
 */
function AnimatedCounter({
  target,
  suffix,
  scrollY,
  triggerOffset,
  windowHeight,
  style,
}: {
  target: number;
  suffix: string;
  scrollY: SharedValue<number>;
  triggerOffset: number;
  windowHeight: number;
  style?: any;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasTriggered = useSharedValue(false);
  const animValue = useSharedValue(0);

  const triggerCount = (shouldTrigger: boolean) => {
    if (shouldTrigger && !hasTriggered.value) {
      hasTriggered.value = true;
      animValue.value = withTiming(target, { duration: 1400, easing: EASE_OUT });
    }
  };

  useDerivedValue(() => {
    const visible = scrollY.value + windowHeight > triggerOffset;
    runOnJS(triggerCount)(visible);
    return visible;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(Math.round(animValue.value));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={style}>
      {displayValue}{suffix}
    </Text>
  );
}

/* ═══════════ ENTRANCE HOOK (mount-based for hero) ═══════════ */

function useEntrance(delay: number = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE_OUT }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 700, easing: EASE_OUT }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return style;
}

/* ═══════════ MAIN COMPONENT ═══════════ */

export default function WelcomeScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWide = windowWidth >= 600;
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  /* Floating navbar — appears after scrolling past hero */
  const navStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [300, 450], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [300, 450], [-60, 0], Extrapolation.CLAMP) },
    ],
  }));

  /* Hero dissolve — content fades out + moves up as you scroll past */
  const heroDissolveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, windowHeight * 0.45], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, windowHeight * 0.5], [0, -60], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [0, windowHeight * 0.5], [1, 0.92], Extrapolation.CLAMP) },
    ],
  }));

  /* Hero entrance animations */
  const logoStyle = useEntrance(0);
  const taglineStyle = useEntrance(200);
  const subtitleStyle = useEntrance(400);
  const ctaStyle = useEntrance(600);
  const socialStyle = useEntrance(800);

  return (
    <View style={styles.root}>
      {/* ═══ FLOATING NAV ═══ */}
      <Animated.View style={[styles.floatingNav, navStyle]}>
        <View style={[styles.floatingNavInner, { maxWidth: LANDING_MAX_WIDTH }]}>
          <Image source={require('../../assets/logo/logo_sans_fond.png')} style={styles.floatingNavLogo} resizeMode="contain" />
          <Pressable
            style={styles.floatingNavButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.floatingNavButtonText}>Commencer</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* ═══════════ HERO ═══════════ */}
        <View style={[styles.heroSection, { minHeight: windowHeight * 0.92 }]}>
          <Image source={{ uri: IMAGES.hero }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(255,107,53,0.06)', 'transparent']}
            locations={[0, 0.4]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['transparent', 'rgba(11,11,20,0.4)', 'rgba(11,11,20,0.85)', '#0B0B14']}
            locations={[0, 0.3, 0.65, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Hero content dissolves on scroll */}
          <Animated.View style={[styles.heroContent, { maxWidth: LANDING_MAX_WIDTH }, heroDissolveStyle]}>
            <Animated.Image source={require('../../assets/logo/logo_sans_fond.png')} style={[styles.logo, isWide && styles.logoWide, logoStyle]} resizeMode="contain" />
            <Animated.Text style={[styles.heroTagline, isWide && styles.heroTaglineWide, taglineStyle]}>
              FORGE TON CORPS.
            </Animated.Text>
            <Animated.Text style={[styles.heroSubtitle, subtitleStyle]}>
              L'app nutrition qui te donne un plan, pas des excuses.
            </Animated.Text>

            <Animated.View style={[styles.heroCTAs, ctaStyle]}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={styles.ghostButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.ghostButtonText}>J'ai deja un compte</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.socialProof, isWide && styles.socialProofWide, socialStyle]}>
              <SocialStat value="70+" label="recettes" />
              <View style={styles.socialDivider} />
              <SocialStat value="6" label="repas/jour" />
              <View style={styles.socialDivider} />
              <SocialStat value="100%" label="personnalise" />
            </Animated.View>
          </Animated.View>
        </View>

        {/* ═══════════ IMAGE BREAK 1 ═══════════ */}
        <ImageBreak
          imageUri={IMAGES.break1}
          label="LA DISCIPLINE"
          quote="Chaque repas est une repetition."
          height={isWide ? 380 : 280}
          scrollY={scrollY}
          offset={windowHeight * 0.9}
          windowHeight={windowHeight}
        />

        {/* ═══════════ PROBLEME ═══════════ */}
        <ScrollReveal scrollY={scrollY} windowHeight={windowHeight} style={styles.section}>
          <View style={[styles.sectionInner, { maxWidth: LANDING_MAX_WIDTH }]}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionLabel}>LE PROBLEME</Text>
            <Text style={[styles.sectionTitle, isWide && styles.sectionTitleWide]}>
              Tu veux changer, mais...
            </Text>

            <View style={[styles.painGrid, isWide && styles.painGridWide]}>
              <PainCard
                icon="question"
                title="Tu sais pas quoi manger"
                description="Tu perds du temps a chercher des recettes qui correspondent a tes objectifs et ton budget."
              />
              <PainCard
                icon="timer"
                title="Tu laches au bout d'1 semaine"
                description="Sans suivi ni motivation, tu abandonnes tes objectifs avant de voir les premiers resultats."
              />
              <PainCard
                icon="gear"
                title="Les apps sont trop compliquees"
                description="Scanner chaque aliment, peser au gramme pres... Tu veux manger, pas devenir comptable."
              />
            </View>
          </View>
        </ScrollReveal>

        {/* ═══════════ IMAGE BREAK 2 ═══════════ */}
        <ImageBreak
          imageUri={IMAGES.break2}
          label=""
          quote="Et si c'etait plus simple ?"
          height={isWide ? 320 : 240}
          scrollY={scrollY}
          offset={windowHeight * 2}
          windowHeight={windowHeight}
        />

        {/* ═══════════ SOLUTION ═══════════ */}
        <ScrollReveal scrollY={scrollY} windowHeight={windowHeight} style={[styles.section, styles.sectionDark]}>
          <View style={[styles.sectionInner, { maxWidth: LANDING_MAX_WIDTH }]}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionLabel}>LA SOLUTION</Text>
            <Text style={[styles.sectionTitle, isWide && styles.sectionTitleWide]}>
              FORGA fait le travail pour toi
            </Text>

            <View style={[styles.stepsContainer, isWide && styles.stepsContainerWide]}>
              <StepCard number="1" title="Dis-nous ton objectif" description="Prise de masse, seche, maintien ou recomp. On s'adapte a toi, ton budget et tes restrictions." />
              <StepCard number="2" title="On te forge un plan" description="Repas personnalises avec les bonnes quantites. Chaque grammage est calcule pour toi." />
              <StepCard number="3" title="Tu suis, tu progresses" description="Score FORGA, streak, ajustements automatiques chaque semaine. Tu vois tes resultats." />
            </View>
          </View>
        </ScrollReveal>

        {/* ═══════════ FEATURES ═══════════ */}
        <ScrollReveal scrollY={scrollY} windowHeight={windowHeight} style={styles.section}>
          <View style={[styles.sectionInner, { maxWidth: LANDING_MAX_WIDTH }]}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionLabel}>FONCTIONNALITES</Text>
            <Text style={[styles.sectionTitle, isWide && styles.sectionTitleWide]}>
              Tout ce qu'il te faut
            </Text>

            <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
              <FeatureCard icon={<IconPlate />} title="Repas personnalises" description="70+ recettes eco ou premium, adaptees a chaque moment de la journee." wide={isWide} />
              <FeatureCard icon={<IconStar />} title="Score FORGA" description="Un score de 0 a 100 qui mesure ta nutrition, constance, progression et discipline." wide={isWide} />
              <FeatureCard icon={<IconFlame />} title="Streak & gamification" description="Garde ta motivation avec les streaks quotidiens et les badges a debloquer." wide={isWide} />
              <FeatureCard icon={<IconSliders />} title="Ajustement automatique" description="Chaque semaine, tes macros s'adaptent selon tes ressentis et ta progression." wide={isWide} />
              <FeatureCard icon={<IconChart />} title="Graphiques de progression" description="Suis ta courbe de poids et l'evolution de ton score au fil du temps." wide={isWide} />
              <FeatureCard icon={<IconCheck />} title="Toutes restrictions" description="Vegetarien, vegan, sans gluten, sans lactose, halal, sans porc." wide={isWide} />
              <FeatureCard icon={<IconChart />} title="Calculateur TDEE" description="Calcule tes besoins caloriques et ta repartition en macros gratuitement." wide={isWide} />
            </View>

            <Pressable
              style={styles.tdeeLink}
              onPress={() => router.push('/tdee-calculator')}
            >
              <Text style={styles.tdeeLinkText}>
                Essayer le calculateur TDEE gratuit {'\u2192'}
              </Text>
            </Pressable>
          </View>
        </ScrollReveal>

        {/* ═══════════ IMAGE BREAK 3 — with animated counter ═══════════ */}
        <ImageBreakWithCounter
          imageUri={IMAGES.break3}
          height={isWide ? 360 : 260}
          scrollY={scrollY}
          offset={windowHeight * 4}
          windowHeight={windowHeight}
        />

        {/* ═══════════ PRICING ═══════════ */}
        <ScrollReveal scrollY={scrollY} windowHeight={windowHeight} style={[styles.section, styles.sectionDark]}>
          <View style={[styles.sectionInner, { maxWidth: LANDING_MAX_WIDTH }]}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionLabel}>TARIFS</Text>
            <Text style={[styles.sectionTitle, isWide && styles.sectionTitleWide]}>
              Commence gratuitement
            </Text>

            <View style={[styles.pricingGrid, isWide && styles.pricingGridWide]}>
              {/* Free */}
              <View style={styles.pricingCard}>
                <Text style={styles.pricingPlan}>Gratuit</Text>
                <Text style={styles.pricingPrice}>0{'\u20AC'}</Text>
                <Text style={styles.pricingPeriod}>pour toujours</Text>
                <View style={styles.pricingFeatures}>
                  <PricingFeature text="2 suggestions de repas par slot" />
                  <PricingFeature text="Macros personnalisees" />
                  <PricingFeature text="Streak et score FORGA" />
                  <PricingFeature text="Check-in hebdomadaire" />
                  <PricingFeature text="Ajustements automatiques" />
                </View>
                <Pressable
                  style={styles.pricingButtonFree}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text style={styles.pricingButtonFreeText}>Commencer</Text>
                </Pressable>
              </View>

              {/* PRO */}
              <View style={[styles.pricingCard, styles.pricingCardPro]}>
                <ProBadge />
                <Text style={styles.pricingPlan}>FORGA PRO</Text>
                <Text style={[styles.pricingPrice, { color: colors.primary }]}>
                  4,99{'\u20AC'}
                </Text>
                <Text style={styles.pricingPeriod}>par mois</Text>
                <View style={styles.pricingFeatures}>
                  <PricingFeature text="Catalogue complet (70+ repas)" highlight />
                  <PricingFeature text="Photos et recettes detaillees" highlight />
                  <PricingFeature text="Streak Freeze (1x/semaine)" highlight />
                  <PricingFeature text="Tout le plan gratuit inclus" />
                  <PricingFeature text="Support prioritaire" />
                </View>
                <Pressable
                  style={styles.pricingButtonPro}
                  onPress={() => router.push('/(auth)/register')}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.pricingButtonProText}>Essayer FORGA PRO</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollReveal>

        {/* ═══════════ CTA FINAL ═══════════ */}
        <ScrollReveal scrollY={scrollY} windowHeight={windowHeight} style={[styles.ctaSection, { minHeight: isWide ? 520 : 440 }]}>
          <Image source={{ uri: IMAGES.cta }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <LinearGradient
            colors={['#0B0B14', 'rgba(11,11,20,0.45)', 'rgba(11,11,20,0.45)', '#0B0B14']}
            locations={[0, 0.25, 0.75, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.ctaContent}>
            <Text style={[styles.ctaTitle, isWide && styles.ctaTitleWide]}>
              Pret a forger ton corps ?
            </Text>
            <Text style={styles.ctaSubtitle}>
              Rejoins FORGA et commence ta transformation des aujourd'hui.
            </Text>
            <GlowButton onPress={() => router.push('/(auth)/register')} />
          </View>
        </ScrollReveal>

        {/* ═══════════ FOOTER ═══════════ */}
        <View style={styles.footer}>
          <View style={[styles.sectionInner, { maxWidth: LANDING_MAX_WIDTH }]}>
            <Image source={require('../../assets/logo/logo_sans_fond.png')} style={styles.footerLogo} resizeMode="contain" />
            <View style={styles.footerDivider} />
            <Text style={styles.footerDisclaimer}>
              FORGA est un outil educatif et informatif. Il ne remplace en aucun cas
              l'avis d'un medecin, nutritionniste ou professionnel de sante.
              Consulte un professionnel avant tout changement alimentaire significatif.
            </Text>
            <View style={styles.footerLinks}>
              <Pressable>
                <Text style={styles.footerLink}>Conditions d'utilisation</Text>
              </Pressable>
              <Text style={styles.footerDot}>{'\u00B7'}</Text>
              <Pressable>
                <Text style={styles.footerLink}>Politique de confidentialite</Text>
              </Pressable>
            </View>
            <Text style={styles.footerVersion}>FORGA v1.0.0</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

/* ═══════════ SUB-COMPONENTS ═══════════ */

function SocialStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.socialStatContainer}>
      <Text style={styles.socialStatValue}>{value}</Text>
      <Text style={styles.socialStatLabel}>{label}</Text>
    </View>
  );
}

function ImageBreak({
  imageUri,
  label,
  quote,
  height,
  scrollY,
  offset,
  windowHeight,
}: {
  imageUri: string;
  label: string;
  quote: string;
  height: number;
  scrollY: SharedValue<number>;
  offset: number;
  windowHeight: number;
}) {
  /* Parallax + zoom on image */
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [offset - 500, offset + 500],
          [-30, 30],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [offset - 400, offset + 400],
          [1.0, 1.12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  /* Text reveal — fades in as break enters viewport */
  const textStyle = useAnimatedStyle(() => {
    const start = offset - windowHeight + 100;
    const end = start + 250;
    return {
      opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [start, end], [25, 0], Extrapolation.CLAMP) },
        { scale: interpolate(scrollY.value, [start, end], [0.9, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={[styles.imageBreak, { height }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, imageStyle, { top: -40, bottom: -40 }]}>
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </Animated.View>
      <LinearGradient
        colors={['#0B0B14', 'rgba(11,11,20,0.2)', 'rgba(11,11,20,0.2)', '#0B0B14']}
        locations={[0, 0.18, 0.82, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.imageBreakContent, textStyle]}>
        <View style={styles.imageBreakLine} />
        {label ? <Text style={styles.imageBreakLabel}>{label}</Text> : null}
        <Text style={styles.imageBreakQuote}>{quote}</Text>
        <View style={styles.imageBreakLine} />
      </Animated.View>
    </View>
  );
}

/* Image break 3 — with animated counter "70+" */
function ImageBreakWithCounter({
  imageUri,
  height,
  scrollY,
  offset,
  windowHeight,
}: {
  imageUri: string;
  height: number;
  scrollY: SharedValue<number>;
  offset: number;
  windowHeight: number;
}) {
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [offset - 500, offset + 500],
          [-30, 30],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [offset - 400, offset + 400],
          [1.0, 1.12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const textStyle = useAnimatedStyle(() => {
    const start = offset - windowHeight + 100;
    const end = start + 250;
    return {
      opacity: interpolate(scrollY.value, [start, end], [0, 1], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [start, end], [25, 0], Extrapolation.CLAMP) },
        { scale: interpolate(scrollY.value, [start, end], [0.9, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <View style={[styles.imageBreak, { height }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, imageStyle, { top: -40, bottom: -40 }]}>
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </Animated.View>
      <LinearGradient
        colors={['#0B0B14', 'rgba(11,11,20,0.2)', 'rgba(11,11,20,0.2)', '#0B0B14']}
        locations={[0, 0.18, 0.82, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.imageBreakContent, textStyle]}>
        <View style={styles.imageBreakLine} />
        <Text style={styles.imageBreakLabel}>CATALOGUE</Text>
        <AnimatedCounter
          target={70}
          suffix="+"
          scrollY={scrollY}
          triggerOffset={offset}
          windowHeight={windowHeight}
          style={styles.counterText}
        />
        <Text style={styles.imageBreakSubQuote}>recettes forgees pour toi</Text>
        <View style={styles.imageBreakLine} />
      </Animated.View>
    </View>
  );
}

function PainCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    question: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm0-6v.01M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
    timer: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9ZM12 6v7l4 2M10 2h4" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
    gear: (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke={colors.primary} strokeWidth={1.8} />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke={colors.primary} strokeWidth={1.8} />
      </Svg>
    ),
  };

  return (
    <View style={styles.painCard}>
      <View style={styles.painAccentBar} />
      <View style={styles.painIconContainer}>
        {iconMap[icon]}
      </View>
      <Text style={styles.painTitle}>{title}</Text>
      <Text style={styles.painDescription}>{description}</Text>
    </View>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.stepCard}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.stepNumber}
      >
        <Text style={styles.stepNumberText}>{number}</Text>
      </LinearGradient>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  wide = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.featureCard, wide && styles.featureCardWide]}>
      <View style={styles.featureIconContainer}>
        {icon}
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function PricingFeature({
  text,
  highlight = false,
}: {
  text: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.pricingFeatureRow}>
      <Text style={[styles.pricingCheck, highlight && { color: colors.primary }]}>
        {'\u2713'}
      </Text>
      <Text style={[styles.pricingFeatureText, highlight && { color: colors.text }]}>
        {text}
      </Text>
    </View>
  );
}

function ProBadge() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.proBadge, animStyle]}>
      <Text style={styles.proBadgeText}>POPULAIRE</Text>
    </Animated.View>
  );
}

function GlowButton({ onPress }: { onPress: () => void }) {
  const glowOpacity = useSharedValue(0.3);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <AnimatedPressable
      style={[styles.glowButton, buttonStyle]}
      onPress={onPress}
      onPressIn={() => { pressScale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { pressScale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientButtonLarge}
      >
        <Text style={styles.glowButtonText}>Creer mon compte gratuit</Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

/* ═══════════ STYLES ═══════════ */

const glassBackground = 'rgba(19,19,43,0.5)';
const glassBorder = 'rgba(255,255,255,0.06)';
const webBlur = Platform.select({
  web: { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any,
  default: {},
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* ── Floating Nav ── */
  floatingNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(11,11,20,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: glassBorder,
    ...webBlur,
  },
  floatingNavInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignSelf: 'center',
    width: '100%',
  },
  floatingNavLogo: {
    width: 36,
    height: 36,
  },
  floatingNavButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  floatingNavButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.white,
  },

  /* ── Hero ── */
  heroSection: {
    justifyContent: 'flex-end',
    paddingBottom: 50,
    paddingHorizontal: spacing['2xl'],
  },
  heroContent: {
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  logoWide: {
    width: 160,
    height: 160,
  },
  heroTagline: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
    letterSpacing: 3,
  },
  heroTaglineWide: {
    fontSize: fontSizes['5xl'],
  },
  heroSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xl,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    maxWidth: 500,
  },
  heroCTAs: {
    marginTop: spacing['3xl'],
    gap: spacing.md,
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.button,
  },
  gradientButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  gradientButtonLarge: {
    paddingVertical: 20,
    paddingHorizontal: spacing['5xl'],
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  primaryButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  ghostButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ghostButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },

  /* ── Social proof ── */
  socialProof: {
    flexDirection: 'row',
    marginTop: spacing['4xl'],
    backgroundColor: glassBackground,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: glassBorder,
    gap: spacing.lg,
    ...webBlur,
  },
  socialProofWide: {
    gap: spacing['3xl'],
    paddingHorizontal: spacing['3xl'],
  },
  socialStatContainer: {
    alignItems: 'center',
    flex: 1,
  },
  socialStatValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.primary,
  },
  socialStatLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  socialDivider: {
    width: 1,
    backgroundColor: glassBorder,
  },

  /* ── Image Breaks ── */
  imageBreak: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBreakContent: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    zIndex: 2,
  },
  imageBreakLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.primary,
    marginVertical: spacing.md,
  },
  imageBreakLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  imageBreakQuote: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 500,
  },
  imageBreakSubQuote: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  counterText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.score,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(255,107,53,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  /* ── Sections ── */
  section: {
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  sectionDark: {
    backgroundColor: 'rgba(19,19,43,0.3)',
  },
  sectionInner: {
    width: '100%',
    alignItems: 'center',
  },
  sectionAccentBar: {
    width: 24,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  sectionTitleWide: {
    fontSize: fontSizes['4xl'],
  },

  /* ── Pain cards ── */
  painGrid: {
    gap: spacing.lg,
    width: '100%',
  },
  painGridWide: {
    flexDirection: 'row',
  },
  painCard: {
    flex: 1,
    backgroundColor: glassBackground,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: glassBorder,
    overflow: 'hidden',
    ...webBlur,
  },
  painAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  painIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  painTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  painDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  /* ── Steps ── */
  stepsContainer: {
    gap: spacing.xl,
    width: '100%',
  },
  stepsContainerWide: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: glassBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: glassBorder,
    ...webBlur,
  },
  stepNumber: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  stepNumberText: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* ── Features ── */
  featureGrid: {
    gap: spacing.lg,
    width: '100%',
  },
  featureGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tdeeLink: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  tdeeLinkText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  featureCard: {
    backgroundColor: glassBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: glassBorder,
    ...webBlur,
  },
  featureCardWide: {
    flexBasis: '48%',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  /* ── Pricing ── */
  pricingGrid: {
    gap: spacing.lg,
    width: '100%',
    maxWidth: 700,
  },
  pricingGridWide: {
    flexDirection: 'row',
  },
  pricingCard: {
    flex: 1,
    backgroundColor: 'rgba(11,11,20,0.6)',
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: glassBorder,
  },
  pricingCardPro: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  proBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  proBadgeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  pricingPlan: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  pricingPrice: {
    fontFamily: fonts.data,
    fontSize: fontSizes['4xl'],
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  pricingPeriod: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  pricingFeatures: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pricingFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pricingCheck: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.success,
    fontWeight: '700',
  },
  pricingFeatureText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  pricingButtonFree: {
    backgroundColor: colors.surfaceHover,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  pricingButtonFreeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  pricingButtonPro: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.button,
  },
  pricingButtonProText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },

  /* ── CTA Final ── */
  ctaSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    overflow: 'hidden',
  },
  ctaContent: {
    alignItems: 'center',
    zIndex: 2,
    maxWidth: 600,
  },
  ctaTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ctaTitleWide: {
    fontSize: fontSizes['5xl'],
  },
  ctaSubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    maxWidth: 400,
  },
  glowButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  glowButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },

  /* ── Footer ── */
  footer: {
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: glassBorder,
    alignItems: 'center',
  },
  footerLogo: {
    width: 48,
    height: 48,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    marginVertical: spacing.xl,
  },
  footerDisclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 600,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  footerLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.primary,
  },
  footerDot: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
  },
  footerVersion: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
