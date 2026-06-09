import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';

interface QA {
  q: string;
  a: string;
}

const QA_FR: QA[] = [
  {
    q: "Combien de temps dure l'essai gratuit ?",
    a: "À ton inscription tu reçois 7 jours offerts en mode FORGA Pro, sans carte bancaire. Tu accèdes à tout : coach IA, scans repas et programmes complets. À la fin du trial tu peux choisir de continuer en gratuit (avec quotas journaliers) ou souscrire à FORGA Pro (50 messages coach et 10 scans par jour).",
  },
  {
    q: 'Quelles sont les limites en version gratuite ?',
    a: "5 messages par jour avec le coach IA, 3 scans repas par jour, 1 programme d'entraînement, accès à 5 recettes. Tu peux gagner des bonus en regardant des vidéos publicitaires (à venir).",
  },
  {
    q: 'Comment annuler mon abonnement Pro ?',
    a: "Depuis l'App Store : Réglages iOS → Ton nom → Abonnements → FORGA → Annuler. Tu gardes l'accès Pro jusqu'à la fin de la période payée. Aucune relance, aucune friction.",
  },
  {
    q: "Comment FORGA calcule mes besoins en calories ?",
    a: "On utilise la formule Mifflin-St Jeor (référence en nutrition) pour ton métabolisme de base, ajustée selon ton niveau d'activité et ton objectif (sèche, prise de masse, recomp ou maintien).",
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: "Oui. Hébergement chiffré en Europe (Supabase), mots de passe hachés (bcrypt), communications HTTPS. Tu peux à tout moment exporter ou supprimer toutes tes données depuis ton profil.",
  },
  {
    q: 'Le coach IA est-il un vrai coach ?',
    a: "Non. C'est un modèle d'intelligence artificielle (Llama 3.3 70B) entraîné pour répondre à tes questions nutrition et entraînement, en utilisant tes données pour personnaliser ses réponses. Il ne remplace pas un avis médical ou diététique professionnel.",
  },
  {
    q: 'Puis-je utiliser FORGA hors ligne ?',
    a: "Partiellement. Les recettes, ton historique et ton programme du jour sont accessibles offline. Le coach IA et le scan photo nécessitent une connexion internet.",
  },
  {
    q: 'Comment fonctionne le streak ?',
    a: "Ton streak compte le nombre de jours consécutifs où tu as validé au moins un repas et logué ta journée. 1 streak freeze par semaine te permet de sauter une journée sans perdre ta série.",
  },
  {
    q: "Comment importer mes données depuis MyFitnessPal ou Yazio ?",
    a: "Pas encore disponible. C'est dans la roadmap pour la v1.1.",
  },
  {
    q: "Je n'ai pas de notifications, c'est normal ?",
    a: "Vérifie que tu as bien autorisé les notifications dans Réglages iOS → FORGA. Si oui, va dans l'app : Profil → Réglages → Notifications, et assure-toi que les rappels sont activés.",
  },
  {
    q: "Puis-je utiliser FORGA si j'ai moins de 16 ans ?",
    a: "Non. FORGA est réservé aux personnes âgées de 16 ans ou plus, conformément au RGPD.",
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: "Profil → Réglages → Supprimer mon compte. Toutes tes données sont effacées sous 30 jours, à l'exception des données de facturation conservées légalement (10 ans).",
  },
];

const QA_EN: QA[] = [
  {
    q: 'How long does the free trial last?',
    a: 'When you sign up you get 7 free days of FORGA Pro, no credit card needed. Full access: AI coach, food scans and all programs. After the trial you can stay free (with daily quotas) or subscribe to FORGA Pro (50 coach messages and 10 scans per day).',
  },
  {
    q: 'What are the limits on the free version?',
    a: '5 daily AI coach messages, 3 daily food scans, 1 training program, access to 5 recipes. Bonus credits can be earned by watching rewarded videos (coming soon).',
  },
  {
    q: 'How do I cancel my Pro subscription?',
    a: "From the App Store: iOS Settings → Your name → Subscriptions → FORGA → Cancel. You keep Pro access until the end of the paid period. No reminders, no friction.",
  },
  {
    q: 'How does FORGA calculate my calories?',
    a: 'We use the Mifflin-St Jeor formula (industry standard) for your basal metabolic rate, adjusted to your activity level and goal (cut, bulk, recomp or maintain).',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Encrypted hosting in Europe (Supabase), hashed passwords (bcrypt), HTTPS communications. You can export or delete all your data from your profile at any time.',
  },
  {
    q: 'Is the AI coach a real coach?',
    a: "No. It's an AI model (Llama 3.3 70B) trained to answer your nutrition and training questions, using your data to personalize answers. It does not replace medical or professional dietary advice.",
  },
  {
    q: 'Can I use FORGA offline?',
    a: "Partially. Recipes, your history and today's program are accessible offline. The AI coach and food scanner require internet.",
  },
  {
    q: 'How does the streak work?',
    a: "Your streak counts consecutive days you've validated at least one meal. One streak freeze per week lets you skip a day without losing your streak.",
  },
  {
    q: 'How do I import my data from MyFitnessPal or Yazio?',
    a: "Not yet available. It's on the v1.1 roadmap.",
  },
  {
    q: "I'm not getting notifications, is that normal?",
    a: 'Check that notifications are allowed in iOS Settings → FORGA. If yes, in the app: Profile → Settings → Notifications, and make sure reminders are enabled.',
  },
  {
    q: 'Can I use FORGA if I am under 16?',
    a: 'No. FORGA is reserved for users aged 16 and over, per GDPR requirements.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Profile → Settings → Delete account. All your data is wiped within 30 days, except billing data legally retained (10 years).',
  },
];

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { locale } = useT();
  const isFr = locale !== 'en';
  const styles = useStyles();
  const items = isFr ? QA_FR : QA_EN;

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

      <Text style={styles.title}>{isFr ? 'Questions fréquentes' : 'FAQ'}</Text>
      <Text style={styles.subtitle}>
        {isFr
          ? 'Pas de réponse ici ? Écris-nous depuis Contact.'
          : 'No answer here? Reach out from Contact.'}
      </Text>

      {items.map((item, i) => (
        <FaqItem key={i} qa={item} index={i} />
      ))}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

function FaqItem({ qa, index }: { qa: QA; index: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(220)} style={styles.itemWrapper}>
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={styles.itemHeader}
        hitSlop={4}
      >
        <Text style={styles.question}>{qa.q}</Text>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{
          transform: [{ rotate: expanded ? '180deg' : '0deg' }],
        }}>
          <Path d="M6 9l6 6 6-6" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      {expanded && (
        <Text style={styles.answer}>{qa.a}</Text>
      )}
    </Animated.View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  itemWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  question: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  answer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: spacing.md,
  },
}));
