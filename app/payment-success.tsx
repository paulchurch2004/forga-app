import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useT } from '../src/i18n';
import { fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';
import { verifyCheckoutSession } from '../src/services/stripeWeb';
import { useUserStore } from '../src/store/userStore';
import { events } from '../src/services/analytics';

export default function PaymentSuccessScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!session_id) {
      setStatus('error');
      setErrorMessage(t('missingSession'));
      return;
    }
    verifyPayment(session_id);
  }, [session_id]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const result = await verifyCheckoutSession(sessionId);
      if (result.isPremium) {
        updateProfile({
          isPremium: true,
          premiumUntil: result.premiumUntil,
        });
        events.purchaseCompleted('weekly');
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? t('paymentNotConfirmed'));
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message ?? t('verificationError'));
    }
  };

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.text}>{t("verifyingPayment")}</Text>
        </>
      )}
      {status === 'success' && (
        <>
          <Text style={styles.checkmark}>&#10003;</Text>
          <Text style={styles.title}>{t("welcomePremium")}</Text>
          <Text style={styles.text}>{t("premiumActiveMessage")}</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.buttonText}>{t("letsGo")}</Text>
          </Pressable>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={styles.title}>{t("oops")}</Text>
          <Text style={styles.text}>{errorMessage}</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/paywall')}>
            <Text style={styles.buttonText}>{t("tryAgain")}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  checkmark: {
    fontSize: 48,
    color: colors.success,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  text: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  buttonText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.white,
  },
}));
