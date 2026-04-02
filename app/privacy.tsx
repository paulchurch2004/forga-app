import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../src/theme';
import { useResponsive } from '../src/hooks/useResponsive';

const LAST_UPDATED = '2 avril 2025';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, maxWidth: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16}>
            <Text style={styles.backText}>Retour</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Confidentialite</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.updated}>Derniere mise a jour : {LAST_UPDATED}</Text>

        <Section title="1. Introduction">
          FORGA (ci-apres "l'Application") est editee par FORGA SAS. La presente
          politique de confidentialite decrit comment nous collectons, utilisons et
          protegeons vos donnees personnelles conformement au Reglement General sur
          la Protection des Donnees (RGPD) et a la loi Informatique et Libertes.
        </Section>

        <Section title="2. Donnees collectees">
          Nous collectons les donnees suivantes :{'\n\n'}
          - Donnees d'inscription : nom, adresse e-mail{'\n'}
          - Donnees de profil : age, sexe, taille, poids, objectif nutritionnel,
          niveau d'activite, restrictions alimentaires{'\n'}
          - Donnees d'utilisation : repas valides, historique alimentaire,
          scores, badges, check-ins hebdomadaires{'\n'}
          - Donnees techniques : type d'appareil, version de l'OS (pour le bon
          fonctionnement de l'application uniquement)
        </Section>

        <Section title="3. Finalites du traitement">
          Vos donnees sont utilisees pour :{'\n\n'}
          - Calculer vos besoins nutritionnels personnalises{'\n'}
          - Generer vos plans de repas et ajuster vos portions{'\n'}
          - Suivre votre progression (poids, score, streak){'\n'}
          - Vous envoyer des rappels de repas (si vous l'autorisez){'\n'}
          - Ameliorer l'experience utilisateur de l'application
        </Section>

        <Section title="4. Base legale">
          Le traitement de vos donnees repose sur :{'\n\n'}
          - Votre consentement (article 6.1.a du RGPD){'\n'}
          - L'execution du contrat de service (article 6.1.b){'\n'}
          - Notre interet legitime a ameliorer nos services (article 6.1.f)
        </Section>

        <Section title="5. Stockage et securite">
          Vos donnees sont stockees de maniere securisee via Supabase
          (hebergement UE). Les donnees sont egalement mises en cache
          localement sur votre appareil pour permettre l'utilisation hors-ligne.
          {'\n\n'}
          Nous utilisons le chiffrement en transit (HTTPS/TLS) et au repos.
          L'acces aux donnees est strictement limite aux personnes autorisees.
        </Section>

        <Section title="6. Partage des donnees">
          Nous ne vendons jamais vos donnees personnelles. Vos donnees peuvent
          etre partagees avec :{'\n\n'}
          - Supabase (hebergement et base de donnees){'\n'}
          - RevenueCat (gestion des abonnements, sur mobile uniquement){'\n'}
          - Stripe (paiements web){'\n\n'}
          Ces sous-traitants sont conformes au RGPD et heberges dans l'UE ou
          beneficient de garanties adequates.
        </Section>

        <Section title="7. Vos droits">
          Conformement au RGPD, vous disposez des droits suivants :{'\n\n'}
          - Droit d'acces : consulter vos donnees{'\n'}
          - Droit de rectification : corriger vos informations{'\n'}
          - Droit a l'effacement : supprimer votre compte et toutes vos donnees{'\n'}
          - Droit a la portabilite : exporter vos donnees en JSON{'\n'}
          - Droit d'opposition : vous opposer a certains traitements{'\n'}
          - Droit de retrait du consentement : a tout moment{'\n\n'}
          Ces droits sont exercables directement dans l'application (Profil →
          Exporter mes donnees, Supprimer mon compte) ou par e-mail a
          privacy@forga.fr.
        </Section>

        <Section title="8. Conservation des donnees">
          Vos donnees sont conservees tant que votre compte est actif. En cas
          de suppression de compte, toutes vos donnees sont effacees sous 30
          jours. Les donnees de facturation sont conservees conformement aux
          obligations legales (10 ans).
        </Section>

        <Section title="9. Cookies et traceurs">
          L'application web utilise uniquement le stockage local (localStorage)
          pour la persistance de vos preferences et donnees hors-ligne. Aucun
          cookie tiers ni traceur publicitaire n'est utilise.
        </Section>

        <Section title="10. Notifications">
          Les notifications push sont optionnelles et necessitent votre
          consentement explicite. Vous pouvez les desactiver a tout moment
          depuis les reglages de votre appareil ou dans l'application.
        </Section>

        <Section title="11. Contact">
          Pour toute question relative a vos donnees personnelles :{'\n\n'}
          E-mail : privacy@forga.fr{'\n'}
          Adresse : FORGA SAS, France{'\n\n'}
          Vous pouvez egalement introduire une reclamation aupres de la CNIL
          (www.cnil.fr).
        </Section>

        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['5xl'],
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  updated: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
