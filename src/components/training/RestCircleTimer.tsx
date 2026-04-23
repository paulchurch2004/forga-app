import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 50;
const STROKE = 5;
const SIZE = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ACCENT = '#FF6B35';

interface RestCircleTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  hint?: string;
  onSkip: () => void;
}

export function RestCircleTimer({
  secondsLeft,
  totalSeconds,
  hint = 'Reconstitution phosphocréatine pour force max.',
  onSkip,
}: RestCircleTimerProps) {
  const progress = useSharedValue(secondsLeft / totalSeconds);

  useEffect(() => {
    progress.value = withTiming(secondsLeft / totalSeconds, { duration: 950, easing: Easing.linear });
  }, [secondsLeft, totalSeconds]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${CIRCUMFERENCE * progress.value} ${CIRCUMFERENCE}`,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.circleWrap}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotateZ: '-90deg' }] }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ACCENT}
            strokeWidth={STROKE}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.timeValue}>{secondsLeft}s</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow}>REPOS OPTIMAL</Text>
        <Text style={styles.hint}>{hint}</Text>
        <Pressable onPress={onSkip} style={({ pressed }) => [styles.skipButton, pressed && styles.skipPressed]}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
  },
  circleWrap: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontFamily: fonts.data,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  body: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: ACCENT,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 8,
    lineHeight: 18,
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FFFFFF',
  },
});
