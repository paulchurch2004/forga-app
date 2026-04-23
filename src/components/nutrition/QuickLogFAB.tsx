import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { fonts } from '../../theme/fonts';

export interface QuickLogAction {
  label: string;
  icon: 'barcode' | 'camera' | 'search';
  onPress: () => void;
}

interface QuickLogFABProps {
  actions: QuickLogAction[];
  // Distance from the bottom in addition to the safe-area bottom inset.
  // Use this to clear a custom tab bar.
  bottomOffset?: number;
}

export function QuickLogFAB({ actions, bottomOffset = 80 }: QuickLogFABProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const rotation = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(open ? 45 : 0, { damping: 12, stiffness: 200 });
    backdropOpacity.value = withTiming(open ? 1 : 0, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, [open]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const toggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setOpen((o) => !o);
  };

  const handleAction = (action: QuickLogAction) => {
    setOpen(false);
    action.onPress();
  };

  const baseBottom = insets.bottom + bottomOffset;

  return (
    <>
      {/* Backdrop — only mounted when open so it doesn't intercept taps */}
      {open && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        </Animated.View>
      )}

      {/* Action menu */}
      {open && (
        <View style={[styles.menuWrap, { bottom: baseBottom + 70 }]} pointerEvents="box-none">
          {actions.map((action, i) => (
            <ActionItem key={action.label} action={action} index={i} onPress={() => handleAction(action)} />
          ))}
        </View>
      )}

      {/* FAB button */}
      <Pressable onPress={toggle} style={[styles.fabWrap, { bottom: baseBottom }]}>
        <LinearGradient
          colors={['#FF8C40', '#FF5A1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Animated.View style={fabStyle}>
            <PlusIcon />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </>
  );
}

function ActionItem({
  action,
  index,
  onPress,
}: {
  action: QuickLogAction;
  index: number;
  onPress: () => void;
}) {
  const offset = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 60;
    setTimeout(() => {
      offset.value = withSpring(0, { damping: 18, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 180 });
    }, delay);
  }, []);

  const itemStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View style={[styles.actionItemWrap, itemStyle]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}>
        <View style={styles.actionIconWrap}>
          <ActionIcon name={action.icon} />
        </View>
        <Text style={styles.actionLabel}>{action.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function PlusIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5 V19 M5 12 H19" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function ActionIcon({ name }: { name: QuickLogAction['icon'] }) {
  if (name === 'barcode') {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 5 V19 M7 5 V19 M11 5 V13 M11 17 V19 M15 5 V13 M15 17 V19 M19 5 V19 M21 5 V19"
          stroke="#FFFFFF"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'camera') {
    return (
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"
          stroke="#FFFFFF"
          strokeWidth={1.6}
        />
        <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="#FFFFFF" strokeWidth={1.6} />
      </Svg>
    );
  }
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4-4" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(7,7,13,0.65)',
    zIndex: 99,
  },
  fabWrap: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    zIndex: 102,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  menuWrap: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    gap: 10,
    zIndex: 101,
  },
  actionItemWrap: {
    // wrapper kept for the entrance animation
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(20,20,30,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,53,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingRight: 6,
  },
});
