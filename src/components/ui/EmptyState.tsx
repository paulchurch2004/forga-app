import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';

interface EmptyStateProps {
  icon: string; // emoji or short string for the icon medallion
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.medallion}>
        <View style={styles.medallionInner}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
          <LinearGradient
            colors={['#FF8C40', '#FF5A1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  medallion: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  medallionInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,53,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  button: {
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 999,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
