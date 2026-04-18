import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, fontSizes, spacing, makeStyles } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const styles = useStyles();
  const { locale } = useT();
  const isFr = locale !== 'en';

  const sections = isFr ? SECTIONS_FR : SECTIONS_EN;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top, maxWidth: contentMaxWidth }]}>
      <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backRow}>
        <Text style={styles.backText}>{'\u2039'} {isFr ? 'Retour' : 'Back'}</Text>
      </Pressable>

      <Text style={styles.title}>{isFr ? "Conditions Generales d'Utilisation" : 'Terms of Service'}</Text>
      <Text style={styles.date}>{isFr ? 'Derniere mise a jour : 18 avril 2026' : 'Last updated: April 18, 2026'}</Text>

      {sections.map((section, i) => (
        <View key={i} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const SECTIONS_FR = [
  {
    title: '1. Acceptation des conditions',
    body: "En telechargeant et en utilisant l'application FORGA, vous acceptez les presentes Conditions Generales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.",
  },
  {
    title: '2. Description du service',
    body: "FORGA est une application de suivi nutritionnel et de coaching fitness. Elle propose un suivi des macronutriments, des plans de repas personnalises, un suivi d'entrainement et un systeme de gamification. L'application ne fournit pas de conseils medicaux.",
  },
  {
    title: '3. Conditions d\'age',
    body: "L'utilisation de FORGA est reservee aux personnes agees de 16 ans ou plus. Les utilisateurs de moins de 18 ans doivent obtenir le consentement de leur representant legal.",
  },
  {
    title: '4. Compte utilisateur',
    body: "Vous etes responsable de la confidentialite de vos identifiants de connexion. Vous vous engagez a fournir des informations exactes lors de votre inscription et a les maintenir a jour.",
  },
  {
    title: '5. Abonnement et paiement',
    body: "FORGA propose une version gratuite et une version premium (FORGA PRO). Les abonnements sont geres via l'App Store (Apple) ou le Google Play Store. Les conditions de renouvellement et d'annulation sont celles de la plateforme de paiement utilisee. Aucun remboursement ne sera effectue pour la periode en cours.",
  },
  {
    title: '6. Limitation de responsabilite',
    body: "FORGA est un outil de suivi et ne remplace en aucun cas l'avis d'un professionnel de sante, d'un nutritionniste ou d'un medecin. Les informations et recommandations fournies par l'application sont a titre indicatif. FORGA ne peut etre tenu responsable des dommages directs ou indirects lies a l'utilisation de l'application.",
  },
  {
    title: '7. Propriete intellectuelle',
    body: "L'ensemble du contenu de l'application (textes, images, logos, algorithmes, base de donnees de repas) est la propriete exclusive de FORGA. Toute reproduction, distribution ou utilisation non autorisee est interdite.",
  },
  {
    title: '8. Donnees personnelles',
    body: "Le traitement de vos donnees personnelles est decrit dans notre Politique de Confidentialite, accessible depuis l'application. En utilisant FORGA, vous consentez au traitement de vos donnees conformement a cette politique.",
  },
  {
    title: '9. Modification des conditions',
    body: "FORGA se reserve le droit de modifier ces conditions a tout moment. Les utilisateurs seront informes des modifications significatives. L'utilisation continue de l'application apres modification vaut acceptation des nouvelles conditions.",
  },
  {
    title: '10. Contact',
    body: 'Pour toute question relative a ces conditions, contactez-nous a : support@forga.fr',
  },
];

const SECTIONS_EN = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading and using the FORGA app, you agree to these Terms of Service. If you do not agree, please do not use the app.',
  },
  {
    title: '2. Service Description',
    body: 'FORGA is a nutrition tracking and fitness coaching app. It offers macro tracking, personalized meal plans, workout tracking, and gamification. The app does not provide medical advice.',
  },
  {
    title: '3. Age Requirements',
    body: 'FORGA is intended for users aged 16 and over. Users under 18 must obtain parental or guardian consent.',
  },
  {
    title: '4. User Account',
    body: 'You are responsible for maintaining the confidentiality of your login credentials. You agree to provide accurate information during registration and keep it up to date.',
  },
  {
    title: '5. Subscription and Payment',
    body: 'FORGA offers a free version and a premium version (FORGA PRO). Subscriptions are managed through the App Store (Apple) or Google Play Store. Renewal and cancellation terms follow the payment platform used. No refunds will be issued for the current period.',
  },
  {
    title: '6. Limitation of Liability',
    body: 'FORGA is a tracking tool and does not replace the advice of a healthcare professional, nutritionist, or doctor. Information and recommendations are for guidance only. FORGA cannot be held liable for any direct or indirect damages related to app usage.',
  },
  {
    title: '7. Intellectual Property',
    body: 'All app content (text, images, logos, algorithms, meal database) is the exclusive property of FORGA. Unauthorized reproduction, distribution, or use is prohibited.',
  },
  {
    title: '8. Personal Data',
    body: 'Your personal data processing is described in our Privacy Policy, accessible from the app. By using FORGA, you consent to data processing in accordance with this policy.',
  },
  {
    title: '9. Changes to Terms',
    body: 'FORGA reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the app after modification constitutes acceptance.',
  },
  {
    title: '10. Contact',
    body: 'For any questions regarding these terms, contact us at: support@forga.fr',
  },
];

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, alignSelf: 'center', width: '100%' },
  backRow: { paddingTop: spacing.md, marginBottom: spacing.lg },
  backText: { fontFamily: fonts.body, fontSize: fontSizes.lg, color: colors.primary, fontWeight: '600' },
  title: { fontFamily: fonts.display, fontSize: fontSizes['2xl'], fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  date: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing['2xl'] },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontFamily: fonts.display, fontSize: fontSizes.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sectionBody: { fontFamily: fonts.body, fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 22 },
}));
