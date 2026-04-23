import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface WorkoutTopBarProps {
  elapsedSeconds: number;
  isPaused?: boolean;
  onClose: () => void;
  onTogglePause?: () => void;
}

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function WorkoutTopBar({ elapsedSeconds, isPaused, onClose, onTogglePause }: WorkoutTopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={onClose} hitSlop={12} style={styles.iconBtn}>
        <CloseIcon />
      </Pressable>
      <View style={styles.center}>
        <PulsingDot active={!isPaused} />
        <Text style={styles.time}>{fmt(elapsedSeconds)}</Text>
      </View>
      <Pressable onPress={onTogglePause} hitSlop={12} style={styles.iconBtn} disabled={!onTogglePause}>
        {isPaused ? <PlayIcon /> : <PauseIcon />}
      </Pressable>
    </View>
  );
}

function PulsingDot({ active }: { active: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 750, easing: Easing.inOut(Easing.sin) }), withTiming(1, { duration: 750, easing: Easing.inOut(Easing.sin) })),
        -1,
        false
      );
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [active]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, !active && styles.dotPaused, dotStyle]} />;
}

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 L18 18 M18 6 L6 18" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function PauseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={6} y={4} width={4} height={16} rx={1.5} fill="#FFFFFF" />
      <Rect x={14} y={4} width={4} height={16} rx={1.5} fill="#FFFFFF" />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4 L20 12 L7 20 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(7,7,13,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4757',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  dotPaused: {
    backgroundColor: 'rgba(255,255,255,0.40)',
    shadowOpacity: 0,
  },
  time: {
    fontFamily: fonts.data,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
