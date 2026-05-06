import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
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
import { makeStyles } from '../../src/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { supabase, isDemoMode } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useUserStore } from '../../src/store/userStore';
import { isValidReferralCode } from '../../src/services/referrals';
import { signInWithApple, isAppleSignInAvailable, signInWithGoogle, SocialAuthError } from '../../src/services/socialAuth';
import { loadProfileFromSupabase } from '../../src/services/profile';
import { loadAllUserData } from '../../src/services/userSync';
import { events } from '../../src/services/analytics';

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
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
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
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);
  const onboardingReferralCode = useUserStore((s) => s.onboardingData.referredByCode);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Pre-fill the referral input when the user opened the app via a
  // referral deep link (forga.fr/r/<CODE> or forga://r/<CODE>).
  useEffect(() => {
    if (onboardingReferralCode && !referralCode) {
      setReferralCode(onboardingReferralCode);
      setShowReferral(true);
    }
    // We intentionally don't depend on `referralCode` to avoid re-prefilling
    // after the user manually clears it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingReferralCode]);

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
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showError(t('error'), t('fillAllFields'));
      return;
    }
    if (password.length < 8) {
      showError(t('error'), t('passwordMinLength'));
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
      // Pre-fill onboarding name from the register input so step 0 doesn't ask twice.
      setOnboardingData({ name: name.trim() });
      setLoading(false);
      router.replace('/(onboarding)/step0-archetype');
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
      showError(t('error'), error.message);
      return;
    }

    if (data.session) {
      useAuthStore.getState().setSession(data.session);
      const trimmedCode = referralCode.trim().toUpperCase();
      // Pre-fill the onboarding name with what the user just typed so we don't
      // ask the same prénom twice.
      setOnboardingData({
        name: name.trim(),
        ...(trimmedCode && isValidReferralCode(trimmedCode) ? { referredByCode: trimmedCode } : {}),
      });
      events.signUp('email');
      router.replace('/(onboarding)/step0-archetype');
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const result = await signInWithApple();
      useAuthStore.getState().setSession(result.session);

      if (result.isNewUser) {
        // Brand new account → straight into onboarding, pre-filling the name
        // from Apple if we got one.
        const trimmedCode = referralCode.trim().toUpperCase();
        setOnboardingData({
          ...(result.displayName ? { name: result.displayName } : {}),
          ...(trimmedCode && isValidReferralCode(trimmedCode) ? { referredByCode: trimmedCode } : {}),
        });
        events.signUp('apple');
        router.replace('/(onboarding)/step0-archetype');
      } else {
        // Returning user → load profile + push to home.
        await loadProfileFromSupabase(result.session.user.id);
        await loadAllUserData(result.session.user.id);
        events.signIn('apple');
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof SocialAuthError && e.code === 'cancelled') {
        // User dismissed the Apple sheet — silent, no error toast.
      } else {
        const message = e instanceof Error ? e.message : 'Apple Sign In failed.';
        showError(t('error'), message);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      useAuthStore.getState().setSession(result.session);

      if (result.isNewUser) {
        const trimmedCode = referralCode.trim().toUpperCase();
        setOnboardingData({
          ...(result.displayName ? { name: result.displayName } : {}),
          ...(trimmedCode && isValidReferralCode(trimmedCode) ? { referredByCode: trimmedCode } : {}),
        });
        events.signUp('google');
        router.replace('/(onboarding)/step0-archetype');
      } else {
        await loadProfileFromSupabase(result.session.user.id);
        await loadAllUserData(result.session.user.id);
        events.signIn('google');
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof SocialAuthError && e.code === 'cancelled') {
        // silent
      } else {
        const message = e instanceof Error ? e.message : 'Google Sign In failed.';
        showError(t('error'), message);
      }
    } finally {
      setGoogleLoading(false);
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

      <View style={styles.flex}>
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
            <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
          </Pressable>

          {/* Brand */}
          <Animated.View style={[styles.brandContainer, brandStyle]}>
            <Image source={require('../../assets/wordmark.png')} style={styles.brandWordmark} resizeMode="contain" />
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleStyle}>
            <Text style={styles.title}>{t('register')}</Text>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.form}>
            <Animated.View style={nameInputStyle}>
              <View style={[styles.inputWrapper, nameFocused && styles.inputWrapperFocused]}>
                <Text style={[styles.inputLabel, nameFocused && styles.inputLabelFocused]}>
                  {t('name')}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('name')}
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
                  {t('email')}
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
                  {t('password')}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('passwordPlaceholder')}
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
                  <Text style={styles.referralLink}>{t('referralCodeQuestion')}</Text>
                </Pressable>
              ) : (
                <View style={[styles.inputWrapper, referralFocused && styles.inputWrapperFocused]}>
                  <Text style={[styles.inputLabel, referralFocused && styles.inputLabelFocused]}>
                    {t('referralCodeLabel')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: FORGA-A3K9"
                    placeholderTextColor={colors.textMuted}
                    value={referralCode}
                    onChangeText={(val) => setReferralCode(val.toUpperCase())}
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
                      <Text style={styles.buttonText}>{t('createAccount')}</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Divider */}
          <Animated.View style={[styles.divider, dividerStyle]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social buttons */}
          <Animated.View style={socialStyle}>
            {!appleAvailable && (
            <Pressable style={styles.socialButton} disabled>
              <Text style={styles.socialIcon}>{'\uF8FF'}</Text>
              <Text style={styles.socialButtonText}>{t('continueWithApple')}</Text>
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>{t('soon')}</Text>
              </View>
            </Pressable>
            )}
            {appleAvailable ? (
              <Pressable
                style={styles.socialButtonActive}
                onPress={handleAppleSignIn}
                disabled={appleLoading}
              >
                {appleLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.socialButtonTextActive}>{t('continueWithApple')}</Text>
                )}
              </Pressable>
            ) : null}

            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.googleButtonText}>{t('continueWithGoogle')}</Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Bottom link */}
          <Animated.View style={[styles.bottomLink, bottomStyle]}>
            <Text style={styles.bottomText}>{t('haveAccount')} </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.bottomAction}>{t('signIn')}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
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
    alignItems: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  brandWordmark: {
    width: 180,
    height: 56,
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
  socialButtonActive: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  socialIconActive: {
    fontSize: fontSizes.lg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  socialButtonTextActive: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  googleButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
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
}));
