// FORGA — Modal soft "Trial bientôt fini" (J-2 + J-1).
//
// Différence avec TrialExpirationModal (J0) : ici on n'est PAS bloqué.
// L'user peut continuer à utiliser l'app, c'est juste un rappel poli
// "il te reste 2 jours, regarde l'offre". Sans ça, l'user découvre
// brutalement à J+1 que tout est verrouillé → churn instantané.
//
// Affichage : 1 SEULE FOIS par jour de warning (J-2 puis J-1).
// Persistance : AsyncStorage avec clé dérivée du trial_ends_at → si
// l'user étend son trial, la nouvelle date génère une nouvelle clé et
// les warnings se réaffichent au bon moment.

import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { fonts } from '../theme/fonts';

interface Props {
  visible: boolean;
  daysRemaining: number;
  onClose: () => void;
}

export function TrialWarningModal({ visible, daysRemaining, onClose }: Props) {
  const insets = useSafeAreaInsets();

  // Wording adapté au nombre de jours restants. À J-1 on tease un peu
  // plus fort (urgence), à J-2 on reste cool.
  const isLastDay = daysRemaining <= 1;

  const handleSeeOffer = () => {
    onClose();
    router.push('/paywall');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { paddingBottom: 20 + insets.bottom }]}>
          {/* Icône clock — alerte sans agresser */}
          <View style={styles.iconWrap}>
            <ClockIcon />
          </View>

          <Text style={styles.title}>
            {isLastDay ? 'Dernier jour de ton essai' : `Plus que ${daysRemaining} jours d'essai`}
          </Text>
          <Text style={styles.body}>
            {isLastDay
              ? 'Ton essai gratuit se termine demain. Choisis ton plan dès maintenant pour ne rien perdre — coach IA, plans nutrition, suivi muscu.'
              : `Pour garder ton coach IA, tes plans nutrition et ton historique au-delà de ${daysRemaining} jours, passe en Pro. 7j d'essai = 7j pour décider.`}
          </Text>

          {/* Reassurance line — Apple recommande de mentionner annulation easy */}
          <Text style={styles.reassurance}>
            Annule en 1 tap depuis les Réglages iOS. Pas de pénalité, pas de surprise.
          </Text>

          <Pressable
            onPress={handleSeeOffer}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>
              {isLastDay ? 'Voir l\'offre Pro' : 'Découvrir Pro'}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.6 }]}>
            <Text style={styles.secondaryBtnText}>
              {isLastDay ? 'Plus tard (je risque de perdre l\'accès)' : 'Plus tard'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ClockIcon() {
  return (
    <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke="#FF6B2C" strokeWidth={1.6} />
      <Path d="M12 7 V12 L15 14" stroke="#FF6B2C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#16161A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,107,44,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F5F7',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#C5C5C9',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 12,
  },
  reassurance: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 22,
    fontStyle: 'italic',
  },
  primaryBtn: {
    backgroundColor: '#FF6B2C',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8E8E93',
  },
});
