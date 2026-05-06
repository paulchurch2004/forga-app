import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { fonts } from '../../src/theme/fonts';

const LOGO = require('../../assets/logo/logo_sans_fond.png');
const WORDMARK = require('../../assets/wordmark.png');

type Phase = 0 | 1 | 2;

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 28 }]}>
      <LiquidGoo phase={phase} />
      <LogoStack phase={phase} />

      <View style={{ flex: 1 }} />

      <CTAStack
        visible={phase === 2}
        onStart={() => router.push('/(auth)/register')}
        onLogin={() => router.push('/(auth)/login')}
      />
    </View>
  );
}

function LiquidGoo({ phase }: { phase: Phase }) {
  const scale = useSharedValue(0.3);

  useEffect(() => {
    if (phase === 1) scale.value = withTiming(2.5, { duration: 1200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
    else if (phase === 2) scale.value = withTiming(1.4, { duration: 1200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [phase]);

  const gooStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.gooWrap, gooStyle]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="goo" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FF6B35" stopOpacity={0.9} />
            <Stop offset="40%" stopColor="#FF6B35" stopOpacity={0.2} />
            <Stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#goo)" />
      </Svg>
    </Animated.View>
  );
}

function LogoStack({ phase }: { phase: Phase }) {
  const logoScale = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    if (phase === 2) {
      logoScale.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.2, 1.5, 0.4, 1) });
      wordmarkOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
      taglineOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    }
  }, [phase]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoScale.value }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <View style={styles.logoWrap}>
      <Animated.View style={logoStyle}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={wordmarkStyle}>
        <Image source={WORDMARK} style={styles.wordmark} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.tagline, taglineStyle]}>NUTRITION · ENTRAINEMENT · PROGRES</Animated.Text>
      <Animated.View style={[styles.bullets, taglineStyle]}>
        <Text style={styles.bullet}>{'• Macros calcules pour ton objectif'}</Text>
        <Text style={styles.bullet}>{'• Plan d’entrainement adapte'}</Text>
        <Text style={styles.bullet}>{'• Coach IA qui te suit chaque jour'}</Text>
      </Animated.View>
    </View>
  );
}

function CTAStack({ visible, onStart, onLogin }: { visible: boolean; onStart: () => void; onLogin: () => void }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      opacity.value = withDelay(800, withTiming(1, { duration: 600 }));
      translateY.value = withDelay(800, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.ctaStack, animStyle]} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable onPress={onStart} style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
        <Text style={styles.btnPrimaryText}>Commencer  →</Text>
      </Pressable>
      <Pressable onPress={onLogin} style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}>
        <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 28,
  },
  gooWrap: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -150,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: '8%',
  },
  logo: {
    width: 120,
    height: 120,
  },
  wordmark: {
    width: 200,
    height: 40,
    marginTop: 16,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 14,
    letterSpacing: 1.4,
    fontWeight: '600',
  },
  bullets: {
    marginTop: 36,
    gap: 8,
  },
  bullet: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 18,
  },
  ctaStack: {
    gap: 10,
  },
  btnPrimary: {
    paddingVertical: 16,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  btnPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  btnSecondary: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.85,
  },
});
