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
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { loadProfileFromSupabase } from '../../src/services/profile';
import { loadAllUserData } from '../../src/services/userSync';

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
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sine) })
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
      router.replace('/');
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
