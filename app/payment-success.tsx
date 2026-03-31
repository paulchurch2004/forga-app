import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../src/theme/colors';
import { fontSizes } from '../src/theme/fonts';
import { spacing, borderRadius } from '../src/theme/spacing';
import { verifyCheckoutSession } from '../src/services/stripeWeb';
import { useUserStore } from '../src/store/userStore';
import { events } from '../src/services/analytics';

export default function PaymentSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!session_id) {
      setStatus('error');
      setErrorMessage('Session manquante');
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
        events.purchaseCompleted('monthly');
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? 'Paiement non confirmé');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message ?? 'Erreur de vérification');
    }
  };

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.text}>Vérification du paiement...</Text>
        </>
      )}
      {status === 'success' && (
        <>
          <Text style={styles.checkmark}>&#10003;</Text>
          <Text style={styles.title}>Bienvenue en Premium !</Text>
          <Text style={styles.text}>Ton abonnement FORGA PRO est maintenant actif.</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.buttonText}>C'est parti</Text>
          </Pressable>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={styles.title}>Oups...</Text>
          <Text style={styles.text}>{errorMessage}</Text>
          <Pressable style={styles.button} onPress={() => router.replace('/paywall')}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
