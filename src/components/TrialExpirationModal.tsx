import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTrial } from '../hooks/useTrial';
import { router } from 'expo-router';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface TrialStats {
  messages_used: number;
  scans_used: number;
  workouts_logged: number;
  meals_logged: number;
}

export function TrialExpirationModal({ visible, onClose }: Props) {
  const { fetchStats, extendTrial } = useTrial();
  const [stats, setStats] = useState<TrialStats | null>(null);

  useEffect(() => {
    if (visible) {
      fetchStats().then(setStats);
    }
  }, [visible, fetchStats]);

  const handleGoPro = () => {
    onClose();
    router.push('/paywall');
  };

  const handleExtend = async () => {
    // TODO: déclencher le flow Stripe/RevenueCat pour CB sans charge immédiate
    // Pour l'instant : appel extend_trial directement (à raffiner avec CB)
    const result = await extendTrial();
    if (result?.success) {
      onClose();
    }
  };

  const handleGoFree = () => {
    onClose();
    router.push('/downgrade-confirmation');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Ton trial PRO se termine</Text>

          {stats && (
            <View style={styles.statsBlock}>
              <Text style={styles.statsTitle}>Tu as utilisé en 7 jours :</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.messages_used}</Text>
                <Text style={styles.statLabel}>messages coach</Text>
                <Text style={styles.statLimit}>(gratuit : 35 max)</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.scans_used}</Text>
                <Text style={styles.statLabel}>scans repas</Text>
                <Text style={styles.statLimit}>(gratuit : 21 max)</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.workouts_logged}</Text>
                <Text style={styles.statLabel}>séances loggées</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{stats.meals_logged}</Text>
                <Text style={styles.statLabel}>repas validés</Text>
              </View>
            </View>
          )}

          <Pressable style={styles.primaryBtn} onPress={handleGoPro}>
            <Text style={styles.primaryBtnText}>Continuer PRO — 14,99 €/mois</Text>
            <Text style={styles.primaryBtnSubtext}>★ Garde tout illimité</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleExtend}>
            <Text style={styles.secondaryBtnText}>Essayer 7 jours de plus</Text>
            <Text style={styles.secondaryBtnSubtext}>Avec CB · annulable à tout moment</Text>
          </Pressable>

          <Pressable style={styles.tertiaryBtn} onPress={handleGoFree}>
            <Text style={styles.tertiaryBtnText}>Passer en gratuit</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsBlock: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B2C',
    minWidth: 40,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  statLimit: {
    fontSize: 11,
    color: '#666',
  },
  primaryBtn: {
    backgroundColor: '#FF6B2C',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  secondaryBtn: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryBtnSubtext: { color: '#999', fontSize: 11, marginTop: 2 },
  tertiaryBtn: {
    padding: 12,
    alignItems: 'center',
  },
  tertiaryBtnText: { color: '#666', fontSize: 13, textDecorationLine: 'underline' },
});
