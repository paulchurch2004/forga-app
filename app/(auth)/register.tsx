import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { supabase, isDemoMode } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { isValidReferralCode } from '../../src/services/referrals';

function showError(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showError('Erreur', 'Remplis tous les champs.');
      return;
    }
    if (password.length < 8) {
      showError('Erreur', 'Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    setLoading(true);

    if (isDemoMode) {
      // Mode démo : créer une session fictive
      useAuthStore.getState().setSession({
        access_token: 'demo',
        refresh_token: 'demo',
        expires_in: 999999,
        token_type: 'bearer',
        user: {
          id: 'demo-user',
          email: email.trim().toLowerCase() || 'demo@forga.fr',
          app_metadata: {},
          user_metadata: { name },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      } as any);
      useAuthStore.getState().setOnboarded(false);
      setLoading(false);
      router.replace('/(onboarding)/step1-identity');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      showError('Erreur', error.message);
      return;
    }

    if (data.session) {
      useAuthStore.getState().setSession(data.session);
      // Store referral code if provided
      const trimmedCode = referralCode.trim().toUpperCase();
      if (trimmedCode && isValidReferralCode(trimmedCode)) {
        setOnboardingData({ referredByCode: trimmedCode });
      }
      // Go to onboarding
      router.replace('/(onboarding)/step1-identity');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Inscription</Text>
        <Text style={styles.subtitle}>On commence. Pas de blabla.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (8 caractères min.)"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Referral code (optional) */}
          {!showReferral ? (
            <Pressable onPress={() => setShowReferral(true)}>
              <Text style={styles.referralLink}>Tu as un code parrain ?</Text>
            </Pressable>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Code parrain (ex: FORGA-A3K9)"
              placeholderTextColor={colors.textMuted}
              value={referralCode}
              onChangeText={(t) => setReferralCode(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={9}
            />
          )}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Créer mon compte</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={[styles.socialButton, styles.socialButtonDisabled]} disabled>
          <Text style={styles.socialButtonText}>Continuer avec Apple (bientôt)</Text>
        </Pressable>

        <Pressable style={[styles.socialButton, styles.socialButtonDisabled]} disabled>
          <Text style={styles.socialButtonText}>Continuer avec Google (bientôt)</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing['2xl'],
  },
  backText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  title: {
    fontFamily: 'Outfit',
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing['2xl'],
    gap: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
  },
  socialButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  socialButtonDisabled: {
    opacity: 0.4,
  },
  socialButtonText: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  referralLink: {
    fontFamily: 'DMSans',
    fontSize: fontSizes.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
