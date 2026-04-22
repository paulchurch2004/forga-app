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
import Svg, { Path } from 'react-native-svg';

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

    const today = new Date().toISOString().split('T')[0];
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
    const today = new Date().toISOString().split('T')[0];
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
          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={handleSkip} hitSlop={12}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke={styles.closeIcon.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>

          <Text style={styles.title}>{t('weightPromptTitle')}</Text>
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
              placeholderTextColor={styles.placeholder.color}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            <Text style={styles.unit}>{t('weightUnit')}</Text>
          </View>

          {error && (
            <Text style={styles.errorText}>{t('invalidWeight')}</Text>
          )}

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t('weightPromptSave')}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 0,
    padding: spacing['2xl'],
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.textSecondary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    padding: 0,
  },
  unit: {
    fontFamily: fonts.data,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  placeholder: {
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 0,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  skipBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
}));
