// FORGA — Bloc de valeur du paywall (carousel horizontal).
//
// Remplace l'ancien composant Testimonials (faux témoignages attribués,
// risque Apple 2.3.1 / DGCCRF). Ici : bénéfices produit FACTUELS et NON
// attribués — aucune fausse review, aucun chiffre inventé.
//
// Les stats affichées sont réelles et vérifiables dans l'app :
//   - 500+ recettes  → src/data/meals/* (~500 classiques) + sport.ts (72)
//   - 60 programmes  → moteur training (OBJECTIF_NIVEAU_LIEU_SEXE)
//   - Coach IA 24/7  → Edge Function coach-chat (multi-LLM)
// Si tu modifies un chiffre, garde-le strictement vrai.
//
// Quand on aura de vrais témoignages beta (consentement écrit), on pourra
// rajouter un bloc Testimonials séparé en v1.1.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

interface Highlight {
  /** Catégorie courte affichée dans la puce colorée. */
  tag: string;
  /** Titre de la feature. */
  title: string;
  /** Bénéfice concret, ton conversationnel, < 120 chars. */
  benefit: string;
  /** Stat/fait VÉRIFIABLE. Pas de chiffre inventé. */
  fact?: string;
  /** Couleur d'accent de la carte. */
  accent: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    tag: 'COACH',
    title: 'Un coach qui te connaît',
    benefit: "Il connaît ton profil, tes objectifs et ton historique. Disponible 24/7, en français.",
    fact: 'Réponses personnalisées',
    accent: '#FF6B2C',
  },
  {
    tag: 'NUTRITION',
    title: 'Des repas faits pour toi',
    benefit: "Adaptés à tes macros et ton budget, recalculés à chaque changement d'objectif.",
    fact: '500+ recettes',
    accent: '#5B8BFF',
  },
  {
    tag: 'TRAINING',
    title: "Des charges qui s'ajustent",
    benefit: 'Auto-réglées sur ta forme du jour et ta progression réelle, séance après séance.',
    fact: '60 programmes',
    accent: '#00D4AA',
  },
];

export function FeatureHighlights() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CE QUE FORGA FAIT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={300}
        decelerationRate="fast"
      >
        {HIGHLIGHTS.map((h, i) => (
          <Card key={i} item={h} />
        ))}
      </ScrollView>
    </View>
  );
}

function Card({ item }: { item: Highlight }) {
  return (
    <View style={styles.card}>
      {/* Header — puce catégorie colorée */}
      <View style={styles.headerRow}>
        <View style={[styles.tagPill, { backgroundColor: item.accent }]}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>

      {/* Titre */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Bénéfice */}
      <Text style={styles.benefit}>{item.benefit}</Text>

      {/* Fait vérifiable (si dispo) */}
      {item.fact && (
        <View style={styles.factPill}>
          <Text style={styles.factText}>{item.fact}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
  },
  eyebrow: {
    fontFamily: fonts.data,
    fontSize: 9.5,
    color: '#FF6B2C',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: 290,
    backgroundColor: '#16161A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontFamily: fonts.data,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0B0B0E',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  benefit: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#D5D5D9',
    lineHeight: 18,
  },
  factPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.32)',
    borderRadius: 999,
  },
  factText: {
    fontFamily: fonts.data,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.3,
  },
});
