import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { useTrial } from '../src/hooks/useTrial';

const FEATURES_LOST = [
  { icon: '💬', label: 'Coach IA', from: '50 / jour', to: '5 / jour' },
  { icon: '📸', label: 'Scans repas', from: '10 / jour', to: '3 / jour' },
  { icon: '🏋️', label: 'Programmes', from: '40+ plans', to: '1 seul' },
  { icon: '🍳', label: 'Recettes', from: '510 premium', to: '5 free' },
  { icon: '🎬', label: 'Vidéos étape par étape', from: 'Toutes', to: 'Bloquées' },
  { icon: '📊', label: 'Weekly review détaillée', from: 'Complète', to: 'Aperçu' },
  { icon: '📥', label: 'Export CSV / PDF', from: 'Disponible', to: 'Bloqué' },
  { icon: '📺', label: 'Publicités', from: 'Aucune', to: 'Présentes' },
];

export default function DowngradeConfirmation() {
  const { extendTrial, expireTrial } = useTrial();
  const [step, setStep] = useState<'list' | 'last_chance'>('list');
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const handleConfirmFree = () => {
    setStep('last_chance');
  };

  const handleLastChanceAccept = async () => {
    const result = await extendTrial();
    if (result?.success) {
      router.back();
    }
  };

  const handleLastChanceDecline = async () => {
    await expireTrial();
    router.replace('/(tabs)/home');
  };

  if (step === 'last_chance') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lastChanceEmoji}>👋</Text>
          <Text style={styles.lastChanceTitle}>Une dernière chose...</Text>
          <Text style={styles.lastChanceBody}>
            Tu peux essayer <Text style={{ fontWeight: '700' }}>1 semaine de plus, offerte</Text>.
            Aucune carte bancaire, rien à annuler — ton essai s'arrête tout seul à la fin.
          </Text>

          <Pressable style={styles.acceptBtn} onPress={handleLastChanceAccept}>
            <Text style={styles.acceptBtnText}>J'essaie 7 jours de plus</Text>
            <Text style={styles.acceptBtnSubtext}>Gratuit · sans carte bancaire</Text>
          </Pressable>

          <Pressable style={styles.declineBtn} onPress={handleLastChanceDecline}>
            <Text style={styles.declineBtnText}>Non merci, passer en gratuit</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tu vas perdre ton accès FORGA Pro</Text>

        <Animated.View style={{ opacity }}>
          {FEATURES_LOST.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureChange}>
                  <Text style={styles.featureFrom}>{f.from}</Text>
                  <Text style={styles.arrow}> → </Text>
                  <Text style={styles.featureTo}>{f.to}</Text>
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Pressable style={styles.keepBtn} onPress={() => router.push('/paywall')}>
          <Text style={styles.keepBtnText}>Garder FORGA Pro</Text>
        </Pressable>

        <Pressable style={styles.confirmBtn} onPress={handleConfirmFree}>
          <Text style={styles.confirmBtnText}>Continuer en gratuit</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  featureIcon: { fontSize: 24, marginRight: 12 },
  featureContent: { flex: 1 },
  featureLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },
  featureChange: { fontSize: 12, marginTop: 2 },
  featureFrom: { color: '#FF6B2C' },
  arrow: { color: '#666' },
  featureTo: { color: '#999', textDecorationLine: 'line-through' },
  keepBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  keepBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmBtn: { padding: 14, alignItems: 'center', marginTop: 12 },
  confirmBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
  // Last chance
  lastChanceEmoji: { fontSize: 64, textAlign: 'center', marginTop: 80, marginBottom: 16 },
  lastChanceTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  lastChanceBody: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  acceptBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  acceptBtnSubtext: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  declineBtn: { padding: 14, alignItems: 'center' },
  declineBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
});
