import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';

interface ErrorStateProps {
  variant?: 'network' | 'generic';
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ variant = 'generic', title, message, retryLabel, onRetry }: ErrorStateProps) {
  const { t } = useT();
  const c = variant === 'network'
    ? { title: t('errorStateNetworkTitle'), message: t('errorStateNetworkMessage') }
    : { title: t('errorStateGenericTitle'), message: t('errorStateGenericMessage') };
  const resolvedRetry = retryLabel ?? t('errorStateRetry');
  return (
    <View style={styles.container}>
      <View style={styles.medallion}>
        <View style={styles.medallionInner}>
          {variant === 'network' ? <CloudOffIcon /> : <AlertIcon />}
        </View>
      </View>
      <Text style={styles.title}>{title ?? c.title}</Text>
      <Text style={styles.message}>{message ?? c.message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
          <LinearGradient
            colors={['#FF8C40', '#FF5A1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retry}
          >
            <Text style={styles.retryText}>{resolvedRetry}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

function CloudOffIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3 L21 21 M9 5a5 5 0 0 1 10 1 4 4 0 0 1 1 8 M5 9a4 4 0 0 0 0 8h10"
        stroke="#FF6B35"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 9 V13 M12 17 h0.01 M10.3 4.6 L2.7 18 a2 2 0 0 0 1.7 3 h15.2 a2 2 0 0 0 1.7-3 L13.7 4.6 a2 2 0 0 0-3.4 0 Z"
        stroke="#FF6B35"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
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
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  retry: {
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 999,
  },
  retryText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
