import React, { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { supabase, isDemoMode } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { isValidReferralCode } from '../../src/services/referrals';

const EASE_OUT = Easing.out(Easing.cubic);

function useEntrance(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE_OUT }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 700, easing: EASE_OUT }));
  }, []);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

function showError(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [referralFocused, setReferralFocused] = useState(false);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  // Staggered entrance animations
  const brandStyle = useEntrance(0);
  const titleStyle = useEntrance(100);
  const subtitleStyle = useEntrance(200);
  const nameInputStyle = useEntrance(300);
  const emailInputStyle = useEntrance(400);
  const passwordInputStyle = useEntrance(500);
  const referralStyle = useEntrance(600);
  const buttonEntranceStyle = useEntrance(700);
  const dividerStyle = useEntrance(850);
  const socialStyle = useEntrance(950);
  const bottomStyle = useEntrance(1050);

  // Button press animation
  const buttonScale = useSharedValue(1);
  const buttonPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Background glow pulse
  const glowOpacity = useSharedValue(0);
  useEffect(() => {
    glowOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) })
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

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
      const trimmedCode = referralCode.trim().toUpperCase();
      if (trimmedCode && isValidReferralCode(trimmedCode)) {
        setOnboardingData({ referredByCode: trimmedCode });
      }
      router.replace('/(onboarding)/step1-identity');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.glowContainer, glowStyle]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', `${colors.primary}18`, `${colors.primary}08`, 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backRow}>
            <Text style={styles.backText}>{'\u2039'} Retour</Text>
          </Pressable>

          {/* Brand */}
          <Animated.View style={[styles.brandContainer, brandStyle]}>
            <Text style={styles.brandText}>FORGA</Text>
            <View style={styles.brandDot} />
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleStyle}>
            <Text style={styles.title}>Inscription</Text>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <Text style={styles.subtitle}>On commence. Pas de blabla.</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.form}>
            <Animated.View style={nameInputStyle}>
              <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                <Text style={[styles.inputLabel, nameFocused && styles.inputLabelFocused]}>
                  Prénom
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton prénom"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </Animated.View>

            <Animated.View style={emailInputStyle}>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <Text style={[styles.inputLabel, emailFocused && styles.inputLabelFocused]}>
                  Email
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="ton@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </Animated.View>

            <Animated.View style={passwordInputStyle}>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <Text style={[styles.inputLabel, passwordFocused && styles.inputLabelFocused]}>
                  Mot de passe
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="8 caractères minimum"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </Animated.View>

            {/* Referral code */}
            <Animated.View style={referralStyle}>
              {!showReferral ? (
                <Pressable onPress={() => setShowReferral(true)}>
                  <Text style={styles.referralLink}>Tu as un code parrain ?</Text>
                </Pressable>
              ) : (
                <View style={[styles.inputWrapper, referralFocused && styles.inputWrapperFocused]}>
                  <Text style={[styles.inputLabel, referralFocused && styles.inputLabelFocused]}>
                    Code parrain
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: FORGA-A3K9"
                    placeholderTextColor={colors.textMuted}
                    value={referralCode}
                    onChangeText={(t) => setReferralCode(t.toUpperCase())}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={9}
                    onFocus={() => setReferralFocused(true)}
                    onBlur={() => setReferralFocused(false)}
                  />
                </View>
              )}
            </Animated.View>

            {/* CTA Button */}
            <Animated.View style={buttonEntranceStyle}>
              <Animated.View style={buttonPressStyle}>
                <Pressable
                  onPress={handleRegister}
                  onPressIn={() => { buttonScale.value = withSpring(0.96); }}
                  onPressOut={() => { buttonScale.value = withSpring(1); }}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading
                      ? [`${colors.primary}99`, `${colors.primaryDark}99`]
                      : [colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Créer mon compte</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Divider */}
          <Animated.View style={[styles.divider, dividerStyle]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social buttons */}
          <Animated.View style={socialStyle}>
            <Pressable style={styles.socialButton} disabled>
              <Text style={styles.socialIcon}>{'\uF8FF'}</Text>
              <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Bientôt</Text>
              </View>
            </Pressable>

            <Pressable style={styles.socialButton} disabled>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Bientôt</Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Bottom link */}
          <Animated.View style={[styles.bottomLink, bottomStyle]}>
            <Text style={styles.bottomText}>Déjà un compte ? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.bottomAction}>Se connecter</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['5xl'],
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  // Background glow
  glowContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 500,
  },

  // Back
  backRow: {
    marginBottom: spacing['2xl'],
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },

  // Brand
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  brandText: {
    fontFamily: fonts.display,
    fontSize: fontSizes['4xl'],
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 4,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 4,
    marginTop: 14,
  },

  // Title
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Form
  form: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  inputWrapper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  inputLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  inputLabelFocused: {
    color: colors.primary,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  referralLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Button
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },

  // Divider
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
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
  },

  // Social
  socialButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: 0.5,
  },
  socialIcon: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontWeight: '700',
  },
  socialButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  soonBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  soonBadgeText: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },

  // Bottom
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  bottomText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  bottomAction: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '700',
  },
});
