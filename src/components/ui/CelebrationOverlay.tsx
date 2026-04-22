import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface CelebrationOverlayProps {
  visible: boolean;
  onDone: () => void;
  message?: string;
}

/** Play a success chime via Web Audio API — louder, 3-tone ascending (works on all browsers) */
const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    // 3-tone ascending chime — clear, audible
    playTone(784, 0, 0.12, 0.4);      // G5
    playTone(988, 0.08, 0.12, 0.4);   // B5
    playTone(1319, 0.16, 0.25, 0.35); // E6 (hold longer)
  } catch {}
};

const triggerSuccessFeedback = () => {
  if (Platform.OS === 'web') {
    // Vibrate on Android browsers (longer pattern for clear feedback)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 60, 120]);
    }
    // Play success sound on all browsers (incl. iOS)
    playSuccessSound();
    return;
  }
  import('expo-haptics')
    .then((H) => H.notificationAsync(H.NotificationFeedbackType.Success))
    .catch(() => {});
};

export function CelebrationOverlay({ visible, onDone }: CelebrationOverlayProps) {
  const overlayOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    // Haptic feedback — Apple Pay style success
    triggerSuccessFeedback();

    // Quick flash: ring expands + check pops in
    overlayOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 200 }),
    );

    ringOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 200 }),
    );

    ringScale.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 500 }),
      withTiming(1.1, { duration: 200 }),
    );

    checkScale.value = withSequence(
      withTiming(0, { duration: 50 }),
      withTiming(1.15, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 150 }),
    );

    // Done after 900ms total
    const timer = setTimeout(() => {
      runOnJS(onDone)();
    }, 950);

    return () => clearTimeout(timer);
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    opacity: overlayOpacity.value,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none' as const,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#00D4AA',
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
    justifyContent: 'center',
    alignItems: 'center',
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={overlayStyle}>
      <Animated.View style={ringStyle}>
        <Animated.View style={checkStyle}>
          <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 6L9 17l-5-5"
              stroke="#00D4AA"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
