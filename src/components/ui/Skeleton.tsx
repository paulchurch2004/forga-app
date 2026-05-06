import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Glass-style shimmering skeleton block. Use stacked Skeletons to
 * approximate the layout of a loading card.
 */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.block,
        { width: width as any, height, borderRadius: radius },
        animStyle,
        style,
      ]}
    />
  );
}

/**
 * Common skeleton: a card with a title line and 2 body lines.
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton width="60%" height={14} radius={6} />
      <Skeleton width="100%" height={11} radius={5} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={11} radius={5} style={{ marginTop: 8 }} />
    </View>
  );
}

/**
 * Full-screen skeleton: header chip + 3 cards. Drop-in replacement for
 * an ActivityIndicator on the initial load of the home/profile/training tabs.
 */
export function SkeletonScreen() {
  return (
    <View style={styles.screen}>
      <Skeleton width={120} height={12} radius={6} style={{ marginBottom: 10 }} />
      <Skeleton width="78%" height={26} radius={8} style={{ marginBottom: 28 }} />
      <SkeletonCard />
      <View style={{ height: 14 }} />
      <SkeletonCard />
      <View style={{ height: 14 }} />
      <SkeletonCard />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
