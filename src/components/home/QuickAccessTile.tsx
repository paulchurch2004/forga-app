import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { fonts } from '../../theme/fonts';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const RING_STROKE = 2.5;
const CARD_RADIUS = 18;
const ORANGE = '#FF6B35';
const ORANGE_DIM = 'rgba(255,107,53,0.18)';
const SUCCESS = '#34D399';

/** Approximate perimeter of a rounded rectangle.
 *  Formula: 2(w + h) - 8r + 2πr  (the 4 corners replace 90° straight
 *  segments with 90° arcs of radius r). */
function roundedRectPerimeter(w: number, h: number, r: number): number {
  return 2 * (w + h) - 8 * r + 2 * Math.PI * r;
}

interface ProgressRingProps {
  width: number;
  height: number;
  /** 0..1 — fraction of the ring to fill. */
  progress: number;
  /** When true, animates a small "energy dot" travelling around the ring.
   *  Used to suggest "action pending" until progress reaches 1. */
  active: boolean;
}

function ProgressRing({ width, height, progress, active }: ProgressRingProps) {
  const inset = RING_STROKE / 2;
  const w = width - RING_STROKE;
  const h = height - RING_STROKE;
  const perimeter = roundedRectPerimeter(w, h, CARD_RADIUS);
  const filled = perimeter * Math.min(Math.max(progress, 0), 1);
  const isComplete = progress >= 1;
  const ringColor = isComplete ? SUCCESS : ORANGE;

  // Travelling dot: animated dashoffset cycles 0 → -perimeter every 3s.
  const dashOffset = useSharedValue(0);
  useEffect(() => {
    if (active && !isComplete) {
      dashOffset.value = withRepeat(
        withTiming(-perimeter, { duration: 2800, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      dashOffset.value = 0;
    }
  }, [active, isComplete, perimeter, dashOffset]);

  const dotProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
      {/* Background ring — full perimeter, low opacity */}
      <Rect
        x={inset}
        y={inset}
        width={w}
        height={h}
        rx={CARD_RADIUS}
        ry={CARD_RADIUS}
        fill="none"
        stroke={ORANGE_DIM}
        strokeWidth={RING_STROKE}
      />
      {/* Progress ring — filled portion */}
      <Rect
        x={inset}
        y={inset}
        width={w}
        height={h}
        rx={CARD_RADIUS}
        ry={CARD_RADIUS}
        fill="none"
        stroke={ringColor}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${perimeter}`}
      />
      {/* Travelling "energy" dot — only while there is action to take */}
      {active && !isComplete && (
        <AnimatedRect
          x={inset}
          y={inset}
          width={w}
          height={h}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          fill="none"
          stroke="#FFD7B8"
          strokeWidth={RING_STROKE + 1}
          strokeLinecap="round"
          strokeDasharray={`8 ${perimeter}`}
          animatedProps={dotProps}
        />
      )}
    </Svg>
  );
}

export interface QuickAccessTileProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUri: string;
  accent?: boolean;
  onPress: () => void;
  /** Optional 0..1 progress. When provided, an animated ring is drawn
   *  around the card. Use to communicate "today's status" at a glance. */
  progress?: number;
  /** When true, the ring shows a small travelling dot to suggest pending
   *  action. Defaults to (progress < 1) when progress is provided. */
  active?: boolean;
}

export function QuickAccessTile({
  eyebrow,
  title,
  subtitle,
  imageUri,
  accent,
  onPress,
  progress,
  active,
}: QuickAccessTileProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const showRing = progress !== undefined;
  const ringActive = active ?? (showRing ? (progress as number) < 1 : false);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          accent && styles.cardAccent,
          showRing && styles.cardWithRing,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <View style={styles.image}>
          <Image
            source={{ uri: imageUri }}
            style={[StyleSheet.absoluteFill, styles.imageRadius]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
          />
          <LinearGradient
            colors={['transparent', 'rgba(7,7,13,0.9)']}
            locations={[0.3, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Pressable>

      {showRing && size.w > 0 && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <ProgressRing
            width={size.w}
            height={size.h}
            progress={progress as number}
            active={ringActive}
          />
        </View>
      )}
    </View>
  );
}

interface QuickAccessRowProps {
  tiles: QuickAccessTileProps[];
}

export function QuickAccessRow({ tiles }: QuickAccessRowProps) {
  return (
    <View style={styles.row}>
      {tiles.map((tile, i) => (
        <View key={i} style={styles.cell}>
          <QuickAccessTile {...tile} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  wrapper: {
    position: 'relative',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  cardAccent: {
    borderColor: 'rgba(255,107,53,0.25)',
  },
  /** When the SVG ring is drawn, hide the static border to avoid a
   *  double-line on the edge. */
  cardWithRing: {
    borderColor: 'transparent',
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    height: 100,
    width: '100%',
  },
  imageRadius: {
    borderTopLeftRadius: CARD_RADIUS - 1,
    borderTopRightRadius: CARD_RADIUS - 1,
  },
  body: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 4,
  },
});
