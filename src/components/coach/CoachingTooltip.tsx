import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

const STORAGE_KEY_PREFIX = 'forga.tooltip.seen.';
const { width: SW } = Dimensions.get('window');

interface CoachingTooltipProps {
  /** Unique id; once dismissed it never shows again. */
  id: string;
  title: string;
  body: string;
  /** Optional anchor: if set, an arrow points up/down to this y position. */
  anchorY?: number;
  arrow?: 'up' | 'down' | 'none';
  cta?: string;
  /** Delay (ms) before the tooltip becomes visible after mount. */
  delayMs?: number;
}

/**
 * One-shot coaching tooltip. Mount it anywhere — it will show itself
 * after `delayMs` and persist its dismissal in AsyncStorage. Future
 * mounts of the same `id` are no-ops.
 */
export function CoachingTooltip({
  id,
  title,
  body,
  anchorY,
  arrow = 'none',
  cta = 'OK, compris',
  delayMs = 600,
}: CoachingTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_PREFIX + id).then((seen) => {
      if (!seen) {
        setTimeout(() => setVisible(true), delayMs);
      }
      setHydrated(true);
    });
  }, [id, delayMs]);

  const dismiss = () => {
    AsyncStorage.setItem(STORAGE_KEY_PREFIX + id, '1');
    setVisible(false);
  };

  if (!hydrated || !visible) return null;

  return (
    <Modal visible transparent animationType="none">
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <View style={[styles.cardWrap, anchorY !== undefined && { top: anchorY - 90 }]}>
          <Card title={title} body={body} cta={cta} arrow={arrow} onDismiss={dismiss} />
        </View>
      </Pressable>
    </Modal>
  );
}

function Card({
  title,
  body,
  cta,
  arrow,
  onDismiss,
}: {
  title: string;
  body: string;
  cta: string;
  arrow: 'up' | 'down' | 'none';
  onDismiss: () => void;
}) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(arrow === 'up' ? -10 : 10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[styles.cardOuter, anim]}>
      {arrow === 'up' && <View style={styles.arrowUp} />}
      <LinearGradient
        colors={['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <SparkleIcon />
          </View>
          <Text style={styles.eyebrow}>COACH · ASTUCE</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Pressable onPress={onDismiss} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}>
          <Text style={styles.ctaText}>{cta}</Text>
        </Pressable>
      </LinearGradient>
      {arrow === 'down' && <View style={styles.arrowDown} />}
    </Animated.View>
  );
}

function SparkleIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const CARD_WIDTH = Math.min(SW - 32, 320);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,7,13,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cardWrap: {
    width: CARD_WIDTH,
  },
  cardOuter: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.40)',
    padding: 18,
  },
  arrowUp: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,107,53,0.40)',
    marginBottom: -1,
  },
  arrowDown: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,107,53,0.40)',
    marginTop: -1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#FF6B35',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 8,
    lineHeight: 19,
  },
  cta: {
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 18,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
