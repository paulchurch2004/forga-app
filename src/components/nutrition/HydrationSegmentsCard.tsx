import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';

const SEGMENT_COUNT = 10;
const ACCENT = '#00D4AA';

interface HydrationSegmentsCardProps {
  currentMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
}

export function HydrationSegmentsCard({ currentMl, goalMl, onAdd }: HydrationSegmentsCardProps) {
  const filledSegments = Math.min(SEGMENT_COUNT, Math.floor((currentMl / goalMl) * SEGMENT_COUNT));
  const currentL = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <DropletIcon />
          <Text style={styles.title}>Hydratation</Text>
        </View>
        <Text style={styles.amount}>
          {currentL} <Text style={styles.amountGoal}>/ {goalL} L</Text>
        </Text>
      </View>

      <View style={styles.segmentsRow}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <Segment key={i} index={i} filled={i < filledSegments} />
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={() => onAdd(250)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
          <Text style={styles.actionText}>+ 250 ml</Text>
        </Pressable>
        <Pressable onPress={() => onAdd(500)} style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
          <Text style={styles.actionText}>+ 500 ml</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Segment({ index, filled }: { index: number; filled: boolean }) {
  const scale = useSharedValue(filled ? 0 : 1);

  useEffect(() => {
    if (filled) {
      scale.value = withDelay(index * 60, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    } else {
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [{ scaleY: scale.value }],
  }));

  return (
    <View style={styles.segmentTrack}>
      <Animated.View style={[StyleSheet.absoluteFill, fillStyle]}>
        <LinearGradient
          colors={[ACCENT, '#00A88A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.segmentFill}
        />
      </Animated.View>
    </View>
  );
}

function DropletIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 C12 2 5 10 5 15 a7 7 0 0 0 14 0 c0-5-7-13-7-13Z"
        stroke={ACCENT}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amount: {
    fontFamily: fonts.data,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountGoal: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 11,
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  segmentTrack: {
    flex: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentFill: {
    flex: 1,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    alignItems: 'center',
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
