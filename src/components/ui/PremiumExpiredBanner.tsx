import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { useUserStore } from '../../store/userStore';
import { lookupReferralCode, applyReferral, calculatePremiumUntil } from '../../services/referrals';
import { isDemoMode } from '../../services/supabase';

interface PremiumExpiredBannerProps {
  onDismiss?: () => void;
}

export function PremiumExpiredBanner({ onDismiss }: PremiumExpiredBannerProps) {
  const styles = useStyles();
  const { t } = useT();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleApplyCode = async () => {
    if (!profile || !code.trim()) return;
    setLoading(true);
    try {
      if (isDemoMode) {
        // Demo: accept any valid format code
        if (/^FORGA-[A-Z0-9]{4,8}$/i.test(code.trim())) {
          const newUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          updateProfile({ isPremium: true, premiumUntil: newUntil });
          onDismiss?.();
        }
        return;
      }

      const referrerId = await lookupReferralCode(code.trim());
      if (referrerId && referrerId !== profile.id) {
        await applyReferral(referrerId, profile.id, code.trim());
        const newUntil = calculatePremiumUntil(profile.premiumUntil);
        updateProfile({ isPremium: true, premiumUntil: newUntil });
        onDismiss?.();
      } else {
        const msg = t('invalidCode');
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert(t('error'), msg);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('premiumExpiredTitle')}</Text>
      <Text style={styles.message}>{t('premiumExpiredMessage')}</Text>

      {showInput ? (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="FORGA-XXXX"
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.applyBtn, loading && { opacity: 0.6 }]}
            onPress={handleApplyCode}
            disabled={loading}
          >
            <Text style={styles.applyBtnText}>{t('confirm')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.codeBtn} onPress={() => setShowInput(true)}>
            <Text style={styles.codeBtnText}>{t('premiumEnterCode')}</Text>
          </Pressable>
          <Text style={styles.orText}>{t('premiumExpiredOr')}</Text>
          <Pressable style={styles.subscribeBtn} onPress={() => router.push('/paywall')}>
            <Text style={styles.subscribeBtnText}>{t('subscribe')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  codeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  codeBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.white,
  },
  orText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  subscribeBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  subscribeBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.data,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center' as const,
  },
  applyBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.white,
  },
}));
