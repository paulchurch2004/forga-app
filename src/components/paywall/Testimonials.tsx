// FORGA — Carousel testimonials pour le paywall.
//
// ⚠️ LÉGAL : avant la mise sur l'App Store, REMPLACER ces testimonials
// par de VRAIS témoignages d'utilisateurs avec leur consentement
// écrit. Les fausses reviews sont sanctionnées par Apple (guideline
// 2.3.1 — Misleading Marketing) ET par la DGCCRF / FTC selon le pays.
//
// Pour l'instant ces testimonials sont marqués comme placeholders et
// utilisent des prénoms + résultats RÉALISTES (pas de "j'ai perdu 20kg
// en 1 mois"). À remplacer 1-pour-1 par les vrais beta-testers du
// programme parrain dès qu'on a 3-5 vrais retours.
//
// Format choisi : carousel horizontal, swipeable, 3 cards visibles
// minimum (la psychologie de la preuve sociale demande de la diversité
// — 1 seul témoignage = perçu comme planté, 3+ = perçu comme commun).

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { fonts } from '../../theme/fonts';

interface Testimonial {
  /** Prénom + initiale du nom. Pas de nom complet pour respect privacy. */
  name: string;
  /** Ville (optionnel) pour ancrer localement. */
  city?: string;
  /** Le programme/objectif suivi — donne contexte au résultat. */
  context: string;
  /** Citation. < 140 chars, format conversation, pas "marketing". */
  quote: string;
  /** Résultat quantifié si dispo (poids perdu, perf gagnée, etc.). */
  result?: string;
  /** URL avatar. Faute de mieux, on utilise des initiales colorées. */
  avatarColor: string;
}

// ⚠️ PLACEHOLDERS — à remplacer par de vrais testimonials avant launch.
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Thomas L.',
    city: 'Lyon',
    context: 'Recomp 12 semaines',
    quote: "Le coach m'a remis sur les rails après 3 ans de plateau. Le truc dingue c'est qu'il connaît MON contexte.",
    result: '−4 kg gras · +2 kg muscle',
    avatarColor: '#FF6B2C',
  },
  {
    name: 'Sarah M.',
    city: 'Paris',
    context: 'Prise de masse propre',
    quote: "Premier programme que je tiens 8 semaines d'affilée. Les plans repas sont vraiment adaptés à mon budget étudiant.",
    result: '+3 kg · squat 60→80kg',
    avatarColor: '#5B8BFF',
  },
  {
    name: 'Karim B.',
    city: 'Marseille',
    context: 'Sèche pré-mariage',
    quote: "J'ai testé MyFitnessPal, Yazio, tout. Le coach IA + les ajustements auto, y a que ça qui m'a fait avancer.",
    result: '−7 kg en 14 sem.',
    avatarColor: '#00D4AA',
  },
];

export function Testimonials() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>ILS L'ONT FAIT</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={300}
        decelerationRate="fast"
      >
        {TESTIMONIALS.map((t, i) => (
          <Card key={i} item={t} />
        ))}
      </ScrollView>
    </View>
  );
}

function Card({ item }: { item: Testimonial }) {
  const initials = item.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.card}>
      {/* Header — avatar (initiales colorées) + nom + ville */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.contextLine}>
            {item.city ? `${item.city} · ` : ''}
            {item.context}
          </Text>
        </View>
      </View>

      {/* Quote */}
      <Text style={styles.quote}>« {item.quote} »</Text>

      {/* Résultat (si dispo) */}
      {item.result && (
        <View style={styles.resultPill}>
          <Text style={styles.resultText}>{item.result}</Text>
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
    gap: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F5F5F7',
  },
  contextLine: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  quote: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#D5D5D9',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  resultPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.32)',
    borderRadius: 999,
  },
  resultText: {
    fontFamily: fonts.data,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.3,
  },
});
