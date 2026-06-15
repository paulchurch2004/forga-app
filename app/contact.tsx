import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';

const SUPPORT_EMAIL = 'support.forga@gmail.com';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { locale } = useT();
  const isFr = locale !== 'en';
  const styles = useStyles();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    (Constants.expoConfig?.ios as any)?.buildNumber ??
    (Constants.expoConfig?.android as any)?.versionCode ??
    '—';

  const subject = encodeURIComponent(
    isFr ? `[FORGA] Support — v${version} (build ${build})` : `[FORGA] Support — v${version} (build ${build})`,
  );

  const sendEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
    const supported = await Linking.canOpenURL(url).catch(() => false);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        isFr ? 'Pas de client mail détecté' : 'No mail client detected',
        SUPPORT_EMAIL,
      );
    }
  };

  const showEmail = () => {
    Alert.alert(
      isFr ? 'Adresse mail' : 'Email address',
      SUPPORT_EMAIL,
      [{ text: 'OK' }],
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md, maxWidth: contentMaxWidth }]}
    >
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={12}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.backText}>{isFr ? 'Retour' : 'Back'}</Text>
      </Pressable>

      <Text style={styles.title}>{isFr ? 'Contact & support' : 'Contact & support'}</Text>
      <Text style={styles.subtitle}>
        {isFr
          ? "Une question, un bug, une idée ? On lit toutes les réponses sous 48h."
          : 'A question, a bug, an idea? We read every reply within 48 hours.'}
      </Text>

      <Pressable style={styles.primaryButton} onPress={sendEmail}>
        <Text style={styles.primaryButtonText}>
          {isFr ? 'Écrire un email' : 'Send an email'}
        </Text>
        <Text style={styles.primaryButtonHint}>{SUPPORT_EMAIL}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={showEmail}>
        <Text style={styles.secondaryButtonText}>
          {isFr ? "Voir l'adresse" : 'Show address'}
        </Text>
      </Pressable>

      <View style={styles.metaCard}>
        <Text style={styles.metaTitle}>
          {isFr ? "Pour qu'on t'aide plus vite" : 'To help you faster'}
        </Text>
        <Text style={styles.metaBody}>
          {isFr
            ? "Inclue dans ton message :\n• Une description du problème\n• Ce que tu essayais de faire\n• Une capture d'écran si possible"
            : 'Include in your message:\n• A description of the issue\n• What you were trying to do\n• A screenshot if possible'}
        </Text>
      </View>

      <View style={styles.legalCard}>
        <Text style={styles.legalTitle}>{isFr ? 'Mentions légales' : 'Legal'}</Text>
        <Text style={styles.legalBody}>
          {isFr
            ? "Édité par Paul Church, entrepreneur individuel\n2 allée Armand Praviel, 33000 Bordeaux, France\nResponsable de la publication : Paul Church\nContact : support.forga@gmail.com\n\nPour toute demande relative à tes données personnelles : support.forga@gmail.com (CNIL : cnil.fr)."
            : 'Published by Paul Church, sole proprietor\n2 allee Armand Praviel, 33000 Bordeaux, France\nPublication manager: Paul Church\nContact: support.forga@gmail.com'}
        </Text>
      </View>

      <Text style={styles.footer}>
        FORGA · v{version} (build {build}) · {Platform.OS}
      </Text>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    alignSelf: 'center',
    width: '100%',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { fontFamily: fonts.body, fontSize: fontSizes.md, color: colors.text },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.white,
  },
  primaryButtonHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  secondaryButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing['2xl'],
  },
  metaTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  legalCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  legalTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  legalBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    opacity: 0.5,
  },
}));
