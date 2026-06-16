import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import { gradients, shadows } from '../../theme';

interface PrimaryGradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: any;
  size?: 'md' | 'lg';
}

export function PrimaryGradientButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  style,
  size = 'md',
}: PrimaryGradientButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        style,
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={gradients.forgeGlow}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, size === 'lg' ? styles.buttonLg : styles.buttonMd]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={[styles.label, size === 'lg' ? styles.labelLg : styles.labelMd]}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  buttonMd: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonLg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.body,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  labelMd: {
    fontSize: 14,
  },
  labelLg: {
    fontSize: 15,
  },
});
