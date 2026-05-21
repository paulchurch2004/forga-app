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
  KeyboardAvoidingView,
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
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { loadProfileFromSupabase } from '../../src/services/profile';
import { loadAllUserData } from '../../src/services/userSync';
import { signInWithApple, isAppleSignInAvailable, signInWithGoogle, SocialAuthError } from '../../src/services/socialAuth';
import { events } from '../../src/services/analytics';
import { useUserStore } from '../../src/store/userStore';

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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Staggered entrance animations
  const brandStyle = useEntrance(0);
  const titleStyle = useEntrance(100);
  const subtitleStyle = useEntrance(200);
  const emailInputStyle = useEntrance(350);
  const passwordInputStyle = useEntrance(450);
  const forgotStyle = useEntrance(550);
  const buttonEntranceStyle = useEntrance(650);
  const bottomStyle = useEntrance(800);

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

  const showError = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      showError(t('error'), error.message);
      return;
    }

    if (data.session) {
      useAuthStore.getState().setSession(data.session);
      await loadProfileFromSupabase(data.session.user.id);
      await loadAllUserData(data.session.user.id);
      events.signIn('email');
      router.replace('/');
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const result = await signInWithApple();
      useAuthStore.getState().setSession(result.session);

      if (result.isNewUser) {
        if (result.displayName) {
          setOnboardingData({ name: result.displayName });
        }
        events.signUp('apple');
        router.replace('/(onboarding)/step0-archetype');
      } else {
        await loadProfileFromSupabase(result.session.user.id);
        await loadAllUserData(result.session.user.id);
        events.signIn('apple');
        router.replace('/');
      }
    } catch (e) {
      if (e instanceof SocialAuthError && e.code === 'cancelled') {
        // silent
      } else if (e instanceof SocialAuthError && e.code === 'email_in_use') {
        showError(t('error'), t('socialEmailInUse' as any));
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
        if (result.displayName) {
          setOnboardingData({ name: result.displayName });
        }
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
      } else if (e instanceof SocialAuthError && e.code === 'email_in_use') {
        showError(t('error'), t('socialEmailInUse' as any));
      } else {
        const message = e instanceof Error ? e.message : 'Google Sign In failed.';
        showError(t('error'), message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError(t('email'), t('resetPasswordPrompt'));
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      showError(t('error'), error.message);
    } else {
      showError(t('emailSent'), t('checkInbox'));
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

      {/* KAV ajouté : sans, le clavier Android cachait le bouton "Sign in"
          sur les petits devices (l'audit cross-platform a flag ça en P0). */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            <Text style={styles.backText}>{'\u2039'} {t('back')}</Text>
          </Pressable>

          {/* Brand */}
          <Animated.View style={[styles.brandContainer, brandStyle]}>
            <Image source={require('../../assets/wordmark.png')} style={styles.brandWordmark} resizeMode="contain" />
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleStyle}>
            <Text style={styles.title}>{t('login')}</Text>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <Text style={styles.subtitle}>{t('welcomeBack')}</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.form}>
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
                  placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>
            </Animated.View>

            <Animated.View style={forgotStyle}>
              <Pressable onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={buttonEntranceStyle}>
              <Animated.View style={buttonPressStyle}>
                <Pressable
                  onPress={handleLogin}
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
                      <Text style={styles.buttonText}>{t('signIn')}</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('or')}</Text>
            <View style={styles.dividerLine} />
          </View>
          {appleAvailable && (
            <Pressable
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={appleLoading}
            >
              {appleLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.appleButtonText}>{t('continueWithApple')}</Text>
              )}
            </Pressable>
          )}
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

          {/* Bottom link */}
          <Animated.View style={[styles.bottomLink, bottomStyle]}>
            <Text style={styles.bottomText}>{t('noAccount')} </Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.bottomAction}>{t('signUp')}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: spacing['3xl'],
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
    marginBottom: spacing['3xl'],
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
    marginTop: spacing['3xl'],
    gap: spacing.lg,
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
  forgotText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textAlign: 'right',
    fontWeight: '500',
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

  // Divider + Apple
  divider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
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
  appleButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  appleButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: spacing.md,
  },
  googleButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text,
  },

  // Bottom
  bottomLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['3xl'],
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
