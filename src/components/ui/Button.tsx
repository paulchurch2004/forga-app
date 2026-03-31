import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from 'react-native';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((Haptics) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }).catch(() => {});
};
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: {
    bg: colors.primary,
    text: colors.white,
    border: colors.primary,
  },
  secondary: {
    bg: colors.surface,
    text: colors.text,
    border: colors.border,
  },
  ghost: {
    bg: colors.transparent,
    text: colors.text,
    border: colors.transparent,
  },
  danger: {
    bg: colors.error,
    text: colors.white,
    border: colors.error,
  },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingH: number; fontSize: number }> = {
  sm: { height: 36, paddingH: spacing.md, fontSize: fontSizes.sm },
  md: { height: 48, paddingH: spacing.xl, fontSize: fontSizes.md },
  lg: { height: 56, paddingH: spacing['2xl'], fontSize: fontSizes.lg },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  style,
  ...pressableProps
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(0.9);
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withSpring(1);
  }, [scale, opacity]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    triggerHaptic();
    onPress?.();
  }, [isDisabled, onPress]);

  return (
    <AnimatedPressable
      {...pressableProps}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingH,
        },
        variant === 'primary' && !isDisabled && shadows.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.text}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              {
                color: variantStyle.text,
                fontSize: sizeStyle.fontSize,
              },
              leftIcon ? { marginLeft: spacing.sm } : undefined,
              rightIcon ? { marginRight: spacing.sm } : undefined,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.body,
    fontWeight: '600',
  },
});

export default Button;
