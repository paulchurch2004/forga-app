import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoToast({ message, onUndo, onDismiss, duration = 4000 }: UndoToastProps) {
  const { t } = useT();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  // Sit above the custom tab bar (~88px iOS / ~64px Android) + extra spacing
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 64;
  const bottomOffset = insets.bottom > 0 ? tabBarHeight + 16 : tabBarHeight + 28;

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.wrap, { bottom: bottomOffset }]}
    >
      <LinearGradient
        colors={['rgba(20,20,30,0.96)', 'rgba(10,10,16,0.96)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.message} numberOfLines={1}>{message}</Text>
        <Pressable onPress={onUndo} style={({ pressed }) => [styles.undoButton, pressed && styles.pressed]}>
          <Text style={styles.undoText}>{t('undo' as any)}</Text>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  undoButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.85,
  },
  undoText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FF6B35',
    textTransform: 'uppercase',
  },
});
