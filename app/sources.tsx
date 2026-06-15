// FORGA — Page "Sources scientifiques".
//
// Apple Guideline 1.4.1 (Safety / Physical Harm) : une app qui donne des
// recommandations nutrition/santé (calories, macros, IMC, rythme de perte…)
// doit CITER ses sources, et ces citations doivent être faciles à trouver.
//
// Cette page liste les références réelles sur lesquelles s'appuient les
// calculs et conseils de FORGA. Elle est accessible par un lien depuis la
// zone Nutrition (onglet nutrition, calculateur TDEE, résumé d'onboarding)
// et depuis le profil — au plus près des écrans qui affichent ces infos.

import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { useT } from '../src/i18n';

type Reference = {
  categoryFr: string;
  categoryEn: string;
  citation: string;
  url: string;
};

// Références réelles, vérifiables, avec liens stables (PubMed, OMS, ANSES, JISSN).
const REFERENCES: Reference[] = [
  {
    categoryFr: 'Dépense énergétique & métabolisme de base (calories)',
    categoryEn: 'Energy expenditure & basal metabolism (calories)',
    citation:
      'Mifflin MD, St Jeor ST, Hill LA, et al. « A new predictive equation for resting energy expenditure in healthy individuals. » Am J Clin Nutr. 1990;51(2):241-247.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/',
  },
  {
    categoryFr: 'Besoins en protéines & nutrition sportive',
    categoryEn: 'Protein needs & sports nutrition',
    citation:
      'Jäger R, Kerksick CM, Campbell BI, et al. « International Society of Sports Nutrition Position Stand: protein and exercise. » J Int Soc Sports Nutr. 2017;14:20.',
    url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8',
  },
  {
    categoryFr: 'Nutrition & composition corporelle (déficit/surplus, rythme de perte/prise)',
    categoryEn: 'Nutrition & body composition (deficit/surplus, weekly rate)',
    citation:
      'Helms ER, Aragon AA, Fitschen PJ. « Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation. » J Int Soc Sports Nutr. 2014;11:20.',
    url: 'https://jissn.biomedcentral.com/articles/10.1186/1550-2783-11-20',
  },
  {
    categoryFr: 'Nutrition & performance (macronutriments, apports)',
    categoryEn: 'Nutrition & performance (macronutrients, intake)',
    citation:
      'Thomas DT, Erdman KA, Burke LM. « Position of the Academy of Nutrition and Dietetics, Dietitians of Canada, and the American College of Sports Medicine: Nutrition and Athletic Performance. » J Acad Nutr Diet. 2016;116(3):501-528.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26891166/',
  },
  {
    categoryFr: 'Références nutritionnelles (France)',
    categoryEn: 'Nutritional reference values (France)',
    citation:
      'ANSES — Agence nationale de sécurité sanitaire de l’alimentation, de l’environnement et du travail. « Les références nutritionnelles. »',
    url: 'https://www.anses.fr/fr/content/les-r%C3%A9f%C3%A9rences-nutritionnelles',
  },
  {
    categoryFr: 'Alimentation saine (recommandations générales)',
    categoryEn: 'Healthy diet (general recommendations)',
    citation:
      'Organisation mondiale de la Santé (OMS). « Alimentation saine » (aide-mémoire).',
    url: 'https://www.who.int/fr/news-room/fact-sheets/detail/healthy-diet',
  },
  {
    categoryFr: 'Indice de masse corporelle (IMC) & surpoids',
    categoryEn: 'Body Mass Index (BMI) & overweight',
    citation:
      'Organisation mondiale de la Santé (OMS). « Obésité et surpoids » (aide-mémoire).',
    url: 'https://www.who.int/fr/news-room/fact-sheets/detail/obesity-and-overweight',
  },
];

export default function SourcesScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { colors } = useTheme();
  const { locale } = useT();
  const isFr = locale !== 'en';
  const styles = useStyles();

  const open = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
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

      <Text style={styles.title}>{isFr ? 'Sources scientifiques' : 'Scientific sources'}</Text>
      <Text style={styles.subtitle}>
        {isFr
          ? "Les calculs et recommandations de FORGA (calories, macronutriments, IMC, rythme de progression) s'appuient sur des références scientifiques reconnues. En voici les sources principales."
          : 'FORGA’s calculations and recommendations (calories, macronutrients, BMI, progression rate) are based on recognized scientific references. Here are the main sources.'}
      </Text>

      {REFERENCES.map((ref, i) => (
        <Pressable key={i} style={styles.refCard} onPress={() => open(ref.url)} accessibilityRole="link">
          <Text style={styles.refCategory}>{isFr ? ref.categoryFr : ref.categoryEn}</Text>
          <Text style={styles.refCitation}>{ref.citation}</Text>
          <Text style={styles.refLink}>{ref.url}</Text>
        </Pressable>
      ))}

      <Text style={styles.disclaimer}>
        {isFr
          ? "FORGA est un outil d'aide à la nutrition et à l'entraînement. Il ne remplace pas l'avis d'un professionnel de santé. Les calculs sont des estimations basées sur les formules ci-dessus. Consulte un médecin ou un diététicien pour des besoins spécifiques."
          : 'FORGA is a nutrition and training assistance tool. It does not replace professional health advice. Calculations are estimates based on the formulas above. Consult a doctor or dietitian for specific needs.'}
      </Text>

      <View style={{ height: insets.bottom + spacing['3xl'] }} />
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
  refCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  refCategory: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  refCitation: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  refLink: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: fontSizes.xs * 1.6,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
}));
