import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../src/theme/colors';
import { fonts, fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../src/theme/spacing';

const INSTALL_GUIDE_KEY = 'forga_install_guide_shown';

type DeviceType = 'ios' | 'android' | 'desktop';

function detectDevice(): DeviceType {
  if (Platform.OS !== 'web') return 'ios'; // fallback, shouldn't happen
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

// ──────────── SVG ICONS ────────────

function ShareIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 3v12M12 3l-4 4M12 3l4 4"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={4}
        stroke={colors.primary}
        strokeWidth={2}
      />
      <Line
        x1={12}
        y1={8}
        x2={12}
        y2={16}
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={8}
        y1={12}
        x2={16}
        y2={12}
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke={colors.success} strokeWidth={2} />
      <Path
        d="M8 12l3 3 5-5"
        stroke={colors.success}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MenuDotsIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={5} r={2} fill={colors.primary} />
      <Circle cx={12} cy={12} r={2} fill={colors.primary} />
      <Circle cx={12} cy={19} r={2} fill={colors.primary} />
    </Svg>
  );
}

function InstallDesktopIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 4v12M12 16l-4-4M12 16l4-4"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 20h16"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ──────────── STEP CARD ────────────

interface StepData {
  number: number;
  icon: React.ReactNode;
  text: string;
}

function StepCard({ step, index }: { step: StepData; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 150).duration(400)}
      style={styles.stepCard}
    >
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{step.number}</Text>
      </View>
      <View style={styles.stepIconContainer}>{step.icon}</View>
      <Text style={styles.stepText}>{step.text}</Text>
    </Animated.View>
  );
}

// ──────────── STEPS DATA ────────────

function getSteps(device: DeviceType): StepData[] {
  if (device === 'ios') {
    return [
      {
        number: 1,
        icon: <ShareIcon />,
        text: "Tape sur l'icone Partager en bas de Safari",
      },
      {
        number: 2,
        icon: <PlusIcon />,
        text: "Fais defiler et tape\n\"Sur l'ecran d'accueil\"",
      },
      {
        number: 3,
        icon: <CheckIcon />,
        text: "Tape \"Ajouter\" et c'est bon !",
      },
    ];
  }

  if (device === 'android') {
    return [
      {
        number: 1,
        icon: <MenuDotsIcon />,
        text: 'Tape sur les 3 points en haut a droite de Chrome',
      },
      {
        number: 2,
        icon: <PlusIcon />,
        text: "Tape \"Ajouter a l'ecran d'accueil\"",
      },
      {
        number: 3,
        icon: <CheckIcon />,
        text: "Confirme et c'est bon !",
      },
    ];
  }

  // Desktop
  return [
    {
      number: 1,
      icon: <InstallDesktopIcon />,
      text: "Clique sur l'icone d'installation dans la barre d'adresse",
    },
    {
      number: 2,
      icon: <CheckIcon />,
      text: "Clique \"Installer\" et c'est bon !",
    },
  ];
}

// ──────────── MAIN SCREEN ────────────

export default function InstallGuideScreen() {
  const insets = useSafeAreaInsets();
  const [device, setDevice] = useState<DeviceType>('ios');

  useEffect(() => {
    // Skip on native
    if (Platform.OS !== 'web') {
      router.replace('/(tabs)/home');
      return;
    }

    // Skip if already in standalone mode (PWA already installed)
    if (isStandalone()) {
      router.replace('/(tabs)/home');
      return;
    }

    const detected = detectDevice();

    // Skip on desktop — guide is only useful on mobile
    if (detected === 'desktop') {
      router.replace('/(tabs)/home');
      return;
    }

    setDevice(detected);

    // Mark as shown
    AsyncStorage.setItem(INSTALL_GUIDE_KEY, 'true').catch(() => {});
  }, []);

  const steps = getSteps(device);

  const handleDone = () => {
    router.replace('/(tabs)/home');
  };

  const deviceLabel =
    device === 'ios'
      ? 'Safari'
      : device === 'android'
        ? 'Chrome'
        : 'ton navigateur';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing['3xl'], paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.logoContainer}>
          <Image
            source={require('../assets/logo/logo_sans_fond.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.title}>Installe FORGA</Text>
          <Text style={styles.subtitle}>
            Accede a FORGA en un tap depuis ton ecran d'accueil, comme une vraie app.
            Ouvre {deviceLabel} et suis ces etapes :
          </Text>
        </Animated.View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(400)}
          style={styles.buttonsContainer}
        >
          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>C'est fait !</Text>
          </Pressable>
          <Pressable style={styles.skipButton} onPress={handleDone}>
            <Text style={styles.skipButtonText}>Plus tard</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

// ──────────── STYLES ────────────

const styles = StyleSheet.create({
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['3xl'],
  },
  stepsContainer: {
    gap: spacing.lg,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800',
    color: colors.white,
  },
  stepIconContainer: {
    flexShrink: 0,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
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
});
