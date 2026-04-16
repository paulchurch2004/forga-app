import React, { useEffect, useMemo } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { fonts, fontSizes, spacing } from '../../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FF6B35', '#FFD93D', '#00D4AA', '#FF4757', '#00BFFF', '#FF8A5C', '#A855F7'];
const EMOJIS = ['\uD83D\uDCAA', '\uD83D\uDD25', '\u2B50', '\uD83C\uDFC6', '\uD83E\uDD4A', '\uD83C\uDFCB', '\u26A1'];

interface CelebrationOverlayProps {
  visible: boolean;
  onDone: () => void;
  message?: string;
}

function ConfettiPiece({ index, total }: { index: number; total: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = (index / total) * SCREEN_W + (Math.random() - 0.5) * 60;
  const endX = startX + (Math.random() - 0.5) * 120;
  const size = 8 + Math.random() * 8;
  const delay = Math.random() * 400;
  const duration = 1200 + Math.random() * 600;
  const rotation = Math.random() * 360;
  const isSquare = index % 3 !== 0;

  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(SCREEN_H * 0.7, { duration, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(endX, { duration }));
    rotate.value = withDelay(delay, withTiming(rotation + 360, { duration }));
    opacity.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: duration * 0.3 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: size,
    height: isSquare ? size : size * 0.4,
    borderRadius: isSquare ? 2 : size,
    backgroundColor: color,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return <Animated.View style={style} />;
}

function FloatingEmoji({ index }: { index: number }) {
  const emoji = EMOJIS[index % EMOJIS.length];
  const startX = SCREEN_W * 0.15 + Math.random() * SCREEN_W * 0.7;
  const delay = 200 + index * 150;

  const translateY = useSharedValue(SCREEN_H * 0.5);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay, withTiming(SCREEN_H * 0.15 + index * 40, { duration: 800, easing: Easing.out(Easing.back(1.5)) }));
    opacity.value = withDelay(delay + 1200, withTiming(0, { duration: 400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: 0,
    fontSize: 32 + index * 4,
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return <Animated.Text style={style}>{emoji}</Animated.Text>;
}

export function CelebrationOverlay({ visible, onDone, message }: CelebrationOverlayProps) {
  const overlayOpacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const confettiCount = 30;
  const emojiCount = 5;

  useEffect(() => {
    if (!visible) return;

    overlayOpacity.value = withTiming(1, { duration: 200 });
    textScale.value = withDelay(300, withSpring(1, { damping: 6, stiffness: 120 }));
    textOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));

    // Auto dismiss — both timers cleaned up
    const dismissTimer = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 200 });
    }, 2200);

    const callbackTimer = setTimeout(() => {
      runOnJS(onDone)();
    }, 2550);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(callbackTimer);
    };
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    opacity: overlayOpacity.value,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none' as const,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={overlayStyle}>
      {/* Confetti */}
      {Array.from({ length: confettiCount }).map((_, i) => (
        <ConfettiPiece key={`c${i}`} index={i} total={confettiCount} />
      ))}

      {/* Floating emojis */}
      {Array.from({ length: emojiCount }).map((_, i) => (
        <FloatingEmoji key={`e${i}`} index={i} />
      ))}

      {/* Message */}
      <Animated.View style={[textStyle, styles.textContainer]}>
        <Text style={styles.emoji}>{'\uD83D\uDCAA'}</Text>
        <Text style={styles.title}>{message ?? 'Bien jou\u00e9 !'}</Text>
        <Text style={styles.subtitle}>Repas valid\u00e9</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 28,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});
