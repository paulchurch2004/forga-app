import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Image,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { fonts, fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme/spacing';

type DeviceType = 'ios' | 'android' | 'desktop';

function detectDevice(): DeviceType {
  if (Platform.OS !== 'web') return 'ios';
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  return (
    (window as any).navigator?.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true
  );
}

// ──────────── TAP FINGER ANIMATION ────────────

function TapFinger({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  const tapStyles = useTapStyles();
  const scale = useRef(new RNAnimated.Value(0)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const ripple = useRef(new RNAnimated.Value(0)).current;
  const rippleOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      scale.setValue(0);
      opacity.setValue(0);
      ripple.setValue(0.5);
      rippleOpacity.setValue(0);

      RNAnimated.sequence([
        RNAnimated.delay(delay),
        // Finger appears
        RNAnimated.parallel([
          RNAnimated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        // Small pause
        RNAnimated.delay(200),
        // Tap press
        RNAnimated.timing(scale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        // Tap release + ripple
        RNAnimated.parallel([
          RNAnimated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
          RNAnimated.timing(rippleOpacity, { toValue: 0.5, duration: 100, useNativeDriver: true }),
          RNAnimated.timing(ripple, { toValue: 2.5, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        // Ripple fades
        RNAnimated.timing(rippleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        // Hold
        RNAnimated.delay(300),
        // Finger disappears
        RNAnimated.parallel([
          RNAnimated.timing(scale, { toValue: 0, duration: 200, useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    };

    animate();
    const interval = setInterval(animate, 4000);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <View style={[tapStyles.container, { left: x - 20, top: y - 20 }]} pointerEvents="none">
      {/* Ripple */}
      <RNAnimated.View
        style={[
          tapStyles.ripple,
          { transform: [{ scale: ripple }], opacity: rippleOpacity },
        ]}
      />
      {/* Finger dot */}
      <RNAnimated.View
        style={[
          tapStyles.finger,
          { transform: [{ scale }], opacity },
        ]}
      />
    </View>
  );
}

const useTapStyles = makeStyles((colors) => ({
  container: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  finger: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ripple: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
}));

// ──────────── PULSE RING ────────────

function PulseRing({ x, y, size = 40 }: { x: number; y: number; size?: number }) {
  const { colors } = useTheme();
  const scale = useRef(new RNAnimated.Value(1)).current;
  const opacity = useRef(new RNAnimated.Value(0.6)).current;

  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.parallel([
          RNAnimated.timing(scale, { toValue: 1.8, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        RNAnimated.parallel([
          RNAnimated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          RNAnimated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
        RNAnimated.delay(400),
      ]),
    ).start();
  }, []);

  return (
    <RNAnimated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: colors.primary,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

// ──────────── iOS SAFARI DEMO ────────────

function IOSDemo() {
  const demoStyles = useDemoStyles();
  const { colors } = useTheme();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const menuSlide = useRef(new RNAnimated.Value(200)).current;
  const menuOpacity = useRef(new RNAnimated.Value(0)).current;
  const iconScale = useRef(new RNAnimated.Value(0)).current;
  const checkScale = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const cycle = () => {
      // Reset
      menuSlide.setValue(200);
      menuOpacity.setValue(0);
      iconScale.setValue(0);
      checkScale.setValue(0);
      setStep(0);

      // Step 1: Show safari bar with share button (already visible)
      // After 2s, show menu sliding up (step 2)
      const t1 = setTimeout(() => {
        setStep(1);
        RNAnimated.parallel([
          RNAnimated.timing(menuSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.back(1)), useNativeDriver: true }),
          RNAnimated.timing(menuOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 2500);

      // Step 3: Show home screen icon after 5s
      const t2 = setTimeout(() => {
        setStep(2);
        RNAnimated.parallel([
          RNAnimated.timing(menuSlide, { toValue: 200, duration: 300, useNativeDriver: true }),
          RNAnimated.timing(menuOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
        RNAnimated.sequence([
          RNAnimated.delay(300),
          RNAnimated.spring(iconScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
          RNAnimated.delay(200),
          RNAnimated.spring(checkScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]).start();
      }, 5500);

      return [t1, t2];
    };

    const timers = cycle();
    const interval = setInterval(() => {
      cycle();
    }, 8500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={demoStyles.phone}>
      {/* Status bar */}
      <View style={demoStyles.statusBar}>
        <Text style={demoStyles.statusTime}>9:41</Text>
        <View style={demoStyles.statusIcons}>
          <Text style={demoStyles.statusIcon}>||||</Text>
          <Text style={demoStyles.statusIcon}>WiFi</Text>
          <Text style={demoStyles.statusIcon}>100%</Text>
        </View>
      </View>

      {/* Browser content area */}
      <View style={demoStyles.browserContent}>
        {/* URL bar */}
        <View style={demoStyles.urlBar}>
          <Text style={demoStyles.urlText}>forga-app.vercel.app</Text>
        </View>

        {/* Page content - FORGA logo */}
        <View style={demoStyles.pageContent}>
          <Image
            source={require('../assets/logo/logo_sans_fond.png')}
            style={demoStyles.forgaLogoImg}
            resizeMode="contain"
          />
          <Text style={demoStyles.pageTitleText}>FORGA</Text>

          {step === 2 && (
            <View style={demoStyles.homeScreenPreview}>
              <RNAnimated.View style={[demoStyles.appIcon, { transform: [{ scale: iconScale }] }]}>
                <Image
                  source={require('../assets/logo/logo_sans_fond.png')}
                  style={demoStyles.appIconImg}
                  resizeMode="contain"
                />
              </RNAnimated.View>
              <RNAnimated.View style={[demoStyles.checkBadge, { transform: [{ scale: checkScale }] }]}>
                <Text style={demoStyles.checkText}>OK</Text>
              </RNAnimated.View>
              <Text style={demoStyles.installedText}>{t("installed")}</Text>
            </View>
          )}
        </View>

        {/* Share sheet menu overlay */}
        {step >= 1 && step < 2 && (
          <RNAnimated.View
            style={[
              demoStyles.shareSheet,
              { transform: [{ translateY: menuSlide }], opacity: menuOpacity },
            ]}
          >
            <View style={demoStyles.shareSheetHandle} />
            <View style={demoStyles.menuRow}>
              <Text style={demoStyles.menuIcon}>+</Text>
              <Text style={demoStyles.menuText}>Copier</Text>
            </View>
            <View style={demoStyles.menuRow}>
              <Text style={demoStyles.menuIcon}>@</Text>
              <Text style={demoStyles.menuText}>Envoyer par mail</Text>
            </View>
            <View style={[demoStyles.menuRow, demoStyles.menuRowHighlight]}>
              <Text style={[demoStyles.menuIcon, { color: colors.primary }]}>+</Text>
              <Text style={[demoStyles.menuText, { color: colors.primary, fontWeight: '700' }]}>
                Sur l'ecran d'accueil
              </Text>
            </View>
            {step === 1 && <TapFinger x={130} y={95} delay={800} />}
            {step === 1 && <PulseRing x={130} y={95} size={50} />}
          </RNAnimated.View>
        )}
      </View>

      {/* Safari bottom bar */}
      <View style={demoStyles.safariBar}>
        <Text style={demoStyles.safariBtn}>{'\u25C0'}</Text>
        <Text style={demoStyles.safariBtn}>{'\u25B6'}</Text>
        <View style={demoStyles.shareBtn}>
          <Text style={demoStyles.shareBtnIcon}>{'\u2191'}</Text>
        </View>
        <Text style={demoStyles.safariBtn}>{'\u2261'}</Text>
        <Text style={demoStyles.safariBtn}>{'\u2750'}</Text>
      </View>

      {/* Tap indicator for step 0 - on share button */}
      {step === 0 && <TapFinger x={148} y={280} delay={500} />}
      {step === 0 && <PulseRing x={148} y={280} />}

      {/* Step indicator */}
      <View style={demoStyles.stepDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[demoStyles.dot, step === i && demoStyles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ──────────── ANDROID CHROME DEMO ────────────

function AndroidDemo() {
  const demoStyles = useDemoStyles();
  const { colors } = useTheme();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const menuSlide = useRef(new RNAnimated.Value(-100)).current;
  const menuOpacity = useRef(new RNAnimated.Value(0)).current;
  const iconScale = useRef(new RNAnimated.Value(0)).current;
  const checkScale = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const cycle = () => {
      menuSlide.setValue(-100);
      menuOpacity.setValue(0);
      iconScale.setValue(0);
      checkScale.setValue(0);
      setStep(0);

      const t1 = setTimeout(() => {
        setStep(1);
        RNAnimated.parallel([
          RNAnimated.timing(menuSlide, { toValue: 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          RNAnimated.timing(menuOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
      }, 2500);

      const t2 = setTimeout(() => {
        setStep(2);
        RNAnimated.parallel([
          RNAnimated.timing(menuSlide, { toValue: -100, duration: 200, useNativeDriver: true }),
          RNAnimated.timing(menuOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();
        RNAnimated.sequence([
          RNAnimated.delay(300),
          RNAnimated.spring(iconScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
          RNAnimated.delay(200),
          RNAnimated.spring(checkScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        ]).start();
      }, 5500);

      return [t1, t2];
    };

    const timers = cycle();
    const interval = setInterval(() => {
      cycle();
    }, 8500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={demoStyles.phone}>
      {/* Chrome top bar */}
      <View style={demoStyles.chromeBar}>
        <View style={demoStyles.chromeUrlBar}>
          <Text style={demoStyles.chromeUrl}>forga-app.vercel.app</Text>
        </View>
        <View style={demoStyles.chromeDotsBtn}>
          <View style={demoStyles.chromeDot} />
          <View style={demoStyles.chromeDot} />
          <View style={demoStyles.chromeDot} />
        </View>
      </View>

      {/* Browser content */}
      <View style={demoStyles.browserContent}>
        <View style={demoStyles.pageContent}>
          <Image
            source={require('../assets/logo/logo_sans_fond.png')}
            style={demoStyles.forgaLogoImg}
            resizeMode="contain"
          />
          <Text style={demoStyles.pageTitleText}>FORGA</Text>

          {step === 2 && (
            <View style={demoStyles.homeScreenPreview}>
              <RNAnimated.View style={[demoStyles.appIcon, { transform: [{ scale: iconScale }] }]}>
                <Image
                  source={require('../assets/logo/logo_sans_fond.png')}
                  style={demoStyles.appIconImg}
                  resizeMode="contain"
                />
              </RNAnimated.View>
              <RNAnimated.View style={[demoStyles.checkBadge, { transform: [{ scale: checkScale }] }]}>
                <Text style={demoStyles.checkText}>OK</Text>
              </RNAnimated.View>
              <Text style={demoStyles.installedText}>{t("installed")}</Text>
            </View>
          )}
        </View>

        {/* Chrome dropdown menu */}
        {step >= 1 && step < 2 && (
          <RNAnimated.View
            style={[
              demoStyles.chromeMenu,
              { transform: [{ translateY: menuSlide }], opacity: menuOpacity },
            ]}
          >
            <View style={demoStyles.menuRow}>
              <Text style={demoStyles.menuText}>Nouvel onglet</Text>
            </View>
            <View style={demoStyles.menuRow}>
              <Text style={demoStyles.menuText}>Partager...</Text>
            </View>
            <View style={[demoStyles.menuRow, demoStyles.menuRowHighlight]}>
              <Text style={[demoStyles.menuText, { color: colors.primary, fontWeight: '700' }]}>
                Ajouter a l'ecran d'accueil
              </Text>
            </View>
            <View style={demoStyles.menuRow}>
              <Text style={demoStyles.menuText}>Version ordinateur</Text>
            </View>
            {step === 1 && <TapFinger x={130} y={78} delay={800} />}
            {step === 1 && <PulseRing x={130} y={78} size={50} />}
          </RNAnimated.View>
        )}
      </View>

      {/* Tap indicator for step 0 - on 3-dot menu */}
      {step === 0 && <TapFinger x={262} y={22} delay={500} />}
      {step === 0 && <PulseRing x={262} y={22} />}

      {/* Step indicator */}
      <View style={demoStyles.stepDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[demoStyles.dot, step === i && demoStyles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ──────────── MAIN SCREEN ────────────

export default function InstallGuideScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const [device, setDevice] = useState<DeviceType>('ios');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(tabs)/home');
      return;
    }
    if (isStandalone()) {
      router.replace('/(tabs)/home');
      return;
    }
    const detected = detectDevice();
    if (detected === 'desktop') {
      router.replace('/(tabs)/home');
      return;
    }
    setDevice(detected);
  }, []);

  const steps = device === 'ios'
    ? [t('iosStep1'), t('iosStep2'), t('iosStep3')]
    : [t('androidStep1'), t('androidStep2'), t('androidStep3')];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.content}>
        {/* Logo + Title */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerSection}>
          <Image
            source={require('../assets/logo/logo_sans_fond.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t("installForga")}</Text>
          <Text style={styles.subtitle}>
            {t("installSubtitle")}
          </Text>
        </Animated.View>

        {/* Animated phone demo */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          {device === 'ios' ? <IOSDemo /> : <AndroidDemo />}
        </Animated.View>

        {/* Step text labels */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.stepsText}>
          {steps.map((text, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepBullet}>
                <Text style={styles.stepBulletText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepLabel}>{text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.buttonsContainer}>
          <Pressable style={styles.doneButton} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.doneButtonText}>{t("iosDone")}</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.skipButtonText}>{t("later")}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ──────────── DEMO STYLES ────────────

const useDemoStyles = makeStyles((colors) => ({
  phone: {
    width: 280,
    height: 310,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#3A3A3C',
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  // iOS status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    height: 28,
  },
  statusTime: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusIcon: {
    fontSize: 8,
    color: '#999',
  },
  // Chrome top bar
  chromeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  chromeUrlBar: {
    flex: 1,
    backgroundColor: '#3A3A3C',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chromeUrl: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#aaa',
  },
  chromeDotsBtn: {
    gap: 3,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chromeDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#999',
  },
  // Browser content
  browserContent: {
    flex: 1,
    position: 'relative',
  },
  urlBar: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 12,
    marginTop: 4,
  },
  urlText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  pageContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  forgaLogoImg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 6,
  },
  pageTitleText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  // Home screen result
  homeScreenPreview: {
    alignItems: 'center',
    marginTop: 16,
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appIconImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -22,
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  checkText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  installedText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  // Safari bottom bar
  safariBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
  },
  safariBtn: {
    fontSize: 16,
    color: '#666',
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnIcon: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  // Share sheet (iOS)
  shareSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2C2C2E',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingBottom: 8,
    paddingTop: 8,
  },
  shareSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginBottom: 8,
  },
  // Chrome dropdown menu (Android)
  chromeMenu: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 220,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  // Menu rows (shared)
  menuRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuRowHighlight: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  menuIcon: {
    fontSize: 14,
    color: '#888',
    width: 18,
    textAlign: 'center',
  },
  menuText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#ccc',
  },
  // Step dots
  stepDots: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A3C',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
}));

// ──────────── MAIN STYLES ────────────

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 48,
    height: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsText: {
    marginTop: spacing['3xl'],
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepBulletText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '800',
    color: colors.white,
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
}));
