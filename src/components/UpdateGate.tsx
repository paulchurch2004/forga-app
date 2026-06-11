// Popup de mise à jour App Store.
//
// - Mise à jour OBLIGATOIRE (force) → overlay bloquant, pas de "Plus tard".
// - Mise à jour SUGGÉRÉE (soft)     → overlay avec "Plus tard".
// Le bouton "Mettre à jour" ouvre la fiche App Store.
//
// Overlay absolu (pas de <Modal> natif) pour éviter tout risque de freeze.
// Monté en dernier dans app/_layout.tsx pour passer au-dessus de tout.

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../theme/fonts';
import { checkForUpdate, type UpdateVerdict } from '../services/appUpdate';

export function UpdateGate() {
  const [verdict, setVerdict] = useState<UpdateVerdict | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let alive = true;
    checkForUpdate()
      .then((v) => { if (alive && v.type !== 'none') setVerdict(v); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!verdict || verdict.type === 'none') return null;
  const isForce = verdict.type === 'force';
  if (!isForce && dismissed) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <Text style={styles.title}>
          {isForce ? 'Mise à jour requise' : 'Nouvelle version disponible'}
        </Text>
        <Text style={styles.body}>
          {verdict.message
            || (isForce
              ? 'Une nouvelle version de FORGA est nécessaire pour continuer à utiliser l’app.'
              : 'Une nouvelle version de FORGA est disponible, avec des améliorations et corrections.')}
        </Text>

        <Pressable onPress={() => Linking.openURL(verdict.url)} style={({ pressed }) => [{ borderRadius: 12, overflow: 'hidden' }, pressed && { opacity: 0.9 }]}>
          <LinearGradient
            colors={['#FFB347', '#FF6B2C', '#E04A0A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Mettre à jour</Text>
          </LinearGradient>
        </Pressable>

        {!isForce && (
          <Pressable onPress={() => setDismissed(true)} style={styles.later} hitSlop={8}>
            <Text style={styles.laterText}>Plus tard</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(7,7,13,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#16161A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F5F7',
    marginBottom: 10,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.66)',
    lineHeight: 20,
    marginBottom: 22,
  },
  btn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  later: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  laterText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline',
  },
});
