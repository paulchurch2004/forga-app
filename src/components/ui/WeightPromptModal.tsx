import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useUserStore } from '../../store/userStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../i18n';
import { supabase, isDemoMode } from '../../services/supabase';
import { syncProfile } from '../../services/userSync';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { todayLocalIso } from '../../utils/date';

interface WeightPromptModalProps {
  visible: boolean;
  daysSinceLastWeighIn: number;
  onClose: () => void;
}

export function WeightPromptModal({
  visible,
  daysSinceLastWeighIn,
  onClose,
}: WeightPromptModalProps) {
  const { t } = useT();
  const styles = useStyles();
  const [weightInput, setWeightInput] = useState('');
  const [error, setError] = useState(false);

  const handleSave = () => {
    const weight = parseFloat(weightInput.replace(',', '.'));
    if (isNaN(weight) || weight < 30 || weight > 300) {
      setError(true);
      return;
    }

    const today = todayLocalIso();
    const profile = useUserStore.getState().profile;
    if (!profile) return;

    const weightEntry = {
      id: `w_${Date.now()}`,
      userId: profile.id,
      date: today,
      weight,
      createdAt: new Date().toISOString(),
    };

    useUserStore.getState().addWeightEntry(weightEntry);
    useUserStore.getState().updateProfile({ currentWeight: weight });

    // Sync to Supabase so data survives reinstall
    if (!isDemoMode) {
      const userId = useAuthStore.getState().session?.user?.id;
      if (userId) {
        supabase.from('weight_log').upsert({
          id: weightEntry.id,
          user_id: userId,
          date: today,
          weight,
          created_at: weightEntry.createdAt,
        }).then(() => {}, () => {});
        syncProfile({ currentWeight: weight }, userId);
      }
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setWeightInput('');
    setError(false);
    onClose();
  };

  const handleSkip = () => {
    const today = todayLocalIso();
    useSettingsStore.getState().setWeightPromptDismissedDate(today);
    setWeightInput('');
    setError(false);
    onClose();
  };

  const subtitle =
    daysSinceLastWeighIn < 0
      ? t('weightFirstEntry')
      : t('weightPromptLastWeighIn', { days: daysSinceLastWeighIn });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Ambient glow behind the card */}
          <View style={styles.glow} pointerEvents="none" />

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={handleSkip} hitSlop={12}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>

          <Text style={styles.eyebrow}>{t('weightPromptTitle')}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={[styles.inputRow, error && styles.inputError]}>
            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={(v) => {
                setWeightInput(v);
                setError(false);
              }}
              placeholder={t('weightPromptPlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.30)"
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              autoFocus
            />
            <Text style={styles.unit}>{t('weightUnit')}</Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{t('invalidWeight')}</Text>
          )}

          <Pressable style={styles.saveBtnWrap} onPress={handleSave}>
            <LinearGradient
              colors={['#FF8C40', '#FF5A1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{t('weightPromptSave')}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>
              {t('weightPromptSkip')} {'\u2192'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // darker for better focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0E0E14',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 22,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -60,
    left: '50%',
    width: 240,
    height: 160,
    borderRadius: 120,
    backgroundColor: 'rgba(255,107,53,0.20)',
    opacity: 0.6,
    transform: [{ translateX: -120 }],
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 10,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 20,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    padding: 0,
    minHeight: 32,
  },
  unit: {
    fontFamily: fonts.data,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    marginLeft: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B6B',
    marginBottom: 6,
  },
  saveBtnWrap: {
    marginTop: 14,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  skipBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
}));
