import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface CoachWelcomeCardProps {
  firstName?: string;
  onDismiss: () => void;
}

interface CapabilityItem {
  emoji: string;
  title: string;
  examples: string[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    emoji: '📝',
    title: 'Logger ce que tu fais',
    examples: [
      '« J\'ai bu un shake protéine vanille au lait »',
      '« J\'ai couru 45 min ce matin »',
      '« J\'ai bu 500 ml d\'eau »',
    ],
  },
  {
    emoji: '💪',
    title: 'Inventer des séances sur mesure',
    examples: [
      '« Invente une séance épaules 30 min, j\'ai juste des haltères »',
      '« Bas du corps 45 min en salle, focus jambes »',
    ],
  },
  {
    emoji: '🎯',
    title: 'Ajuster tes objectifs et calories',
    examples: [
      '« Je veux passer en sèche pour l\'été »',
      '« Nouvel objectif : 75 kg pour le 15 sept »',
      '« Sommeil dégradé cette semaine, baisse mes cals »',
    ],
  },
  {
    emoji: '📅',
    title: 'Modifier ton plan d\'entraînement',
    examples: [
      '« Décale ma séance de mardi à mercredi »',
      '« Saute aujourd\'hui, je suis crevé »',
      '« Remplace mon squat par leg press »',
    ],
  },
  {
    emoji: '🛒',
    title: 'Listes de courses & idées repas',
    examples: [
      '« Liste de courses pour ma semaine »',
      '« J\'ai poulet, riz, courgettes — propose un déj 500 kcal »',
    ],
  },
  {
    emoji: '📊',
    title: 'Comprendre tes données',
    examples: [
      '« Pourquoi mon score FORGA est à 65 ? »',
      '« Comment va ma semaine ? »',
      '« Comment bien faire un soulevé de terre ? »',
    ],
  },
  {
    emoji: '🧠',
    title: 'Se souvenir de l\'important',
    examples: [
      'Blessures, allergies, objectifs, contraintes…',
      'Pour mieux te conseiller dans le temps.',
    ],
  },
];

export function CoachWelcomeCard({ firstName, onDismiss }: CoachWelcomeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.glow} pointerEvents="none" />

      {/* Header */}
      <View style={styles.headerRow}>
        <LinearGradient
          colors={['#FF8C40', '#CC5424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <SparkleIcon />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>FORGA COACH</Text>
          <Text style={styles.headline}>
            {firstName ? `Salut ${firstName}, voici ce que je peux faire pour toi` : 'Voici ce que je peux faire pour toi'}
          </Text>
        </View>
      </View>

      <Text style={styles.intro}>
        Parle-moi en langage naturel. À chaque demande importante, je te montre une carte avec ce que je propose — c'est toi qui valides.
      </Text>

      {/* Capabilities */}
      <View style={{ gap: 14, marginTop: 14 }}>
        {CAPABILITIES.map((cap) => (
          <View key={cap.title} style={styles.capabilityBlock}>
            <View style={styles.capHeader}>
              <Text style={styles.capEmoji}>{cap.emoji}</Text>
              <Text style={styles.capTitle}>{cap.title}</Text>
            </View>
            {cap.examples.map((ex, i) => (
              <Text key={i} style={styles.capExample}>{ex}</Text>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Vas-y, demande-moi ce que tu veux. Je m'adapte à ton rythme.
      </Text>

      {/* Dismiss button */}
      <Pressable
        onPress={onDismiss}
        style={({ pressed }) => [styles.dismissBtn, pressed && styles.pressed]}
      >
        <Text style={styles.dismissText}>Ne plus afficher</Text>
      </Pressable>
    </View>
  );
}

function SparkleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.40)',
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,107,53,0.20)',
    opacity: 0.55,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  intro: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 17,
    marginTop: 8,
  },
  capabilityBlock: {
    paddingTop: 4,
  },
  capHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  capEmoji: {
    fontSize: 16,
  },
  capTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  capExample: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 16,
    paddingLeft: 24,
    marginTop: 1,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  dismissBtn: {
    marginTop: 14,
    alignSelf: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  dismissText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
