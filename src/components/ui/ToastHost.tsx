import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type ToastKind } from '../../store/toastStore';
import { fonts, fontSizes, spacing } from '../../theme';

const KIND_BG: Record<ToastKind, string> = {
  success: 'rgba(34, 197, 94, 0.95)',
  error: 'rgba(239, 68, 68, 0.95)',
  info: 'rgba(28, 28, 32, 0.95)',
};

const KIND_BORDER: Record<ToastKind, string> = {
  success: 'rgba(34, 197, 94, 0.6)',
  error: 'rgba(239, 68, 68, 0.6)',
  info: 'rgba(255, 255, 255, 0.12)',
};

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 80 }]}>
      {toasts.map((t) => (
        <Animated.View
          key={t.id}
          entering={FadeInUp.duration(200)}
          exiting={FadeOutDown.duration(180)}
          style={[
            styles.toast,
            { backgroundColor: KIND_BG[t.kind], borderColor: KIND_BORDER[t.kind] },
          ]}
        >
          <Pressable onPress={() => dismiss(t.id)} hitSlop={8}>
            <Text style={styles.text}>{t.message}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  toast: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 220,
    maxWidth: '88%',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#fff',
    textAlign: 'center',
  },
});
