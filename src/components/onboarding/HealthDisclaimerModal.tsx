// FORGA — Modal "Disclaimer santé" affichée 1 fois après l'onboarding.
//
// Pourquoi : Apple guideline 1.4.1 (Safety / Physical Harm) impose un
// disclaimer EXPLICITE et VISIBLE pour toute app qui donne des conseils
// nutrition, training ou bien-être. Sans ça, l'app peut être rejetée
// pour "présentation comme service médical sans garde-fou".
//
// Une mention dans les CGU ou un footer en bas du signup ne compte pas
// — Apple cherche une interaction délibérée de l'user où il acknowledge
// le disclaimer avant d'utiliser les fonctions à risque (coach IA,
// plans nutrition, ajustements caloriques).
//
// Le flag d'acceptation est persisté localement (AsyncStorage) ET sync
// à Supabase (`profile.healthDisclaimerAcceptedAt`) pour cross-device.
// On ne le re-demande jamais à l'user (sauf reset compte).

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export function HealthDisclaimerModal({ visible, onAccept }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useT();
  const styles = makeStyles(colors);
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={() => { /* non-dismissable */ }}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.iconWrap}>
            <ShieldIcon />
          </View>

          <Text style={styles.title}>{t('healthDisclaimerTitle' as any) as string}</Text>
          <Text style={styles.subtitle}>{t('healthDisclaimerSubtitle' as any) as string}</Text>

          {/* 3 points clés. On évite le mur de texte — l'user doit pouvoir lire
              en 15 secondes max, sinon il scrolle direct sans comprendre. */}
          <View style={styles.bulletList}>
            <Bullet text={t('healthDisclaimerPoint1' as any) as string} />
            <Bullet text={t('healthDisclaimerPoint2' as any) as string} />
            <Bullet text={t('healthDisclaimerPoint3' as any) as string} />
          </View>

          <Text style={styles.callout}>{t('healthDisclaimerCallout' as any) as string}</Text>
        </ScrollView>

        <View style={styles.footer}>
          {/* Checkbox NON pré-cochée — exigence RGPD + Apple */}
          <Pressable
            onPress={() => setAcknowledged((v) => !v)}
            style={({ pressed }) => [styles.checkboxRow, pressed && { opacity: 0.7 }]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acknowledged }}
          >
            <View style={[styles.checkbox, acknowledged && styles.checkboxChecked]}>
              {acknowledged && <CheckMark />}
            </View>
            <Text style={styles.checkboxLabel}>{t('healthDisclaimerAcknowledge' as any) as string}</Text>
          </Pressable>

          <Pressable
            onPress={() => acknowledged && onAccept()}
            disabled={!acknowledged}
            style={({ pressed }) => [
              styles.confirmBtn,
              !acknowledged && styles.confirmBtnDisabled,
              pressed && acknowledged && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !acknowledged }}
          >
            <Text style={styles.confirmText}>{t('healthDisclaimerContinue' as any) as string}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Bullet({ text }: { text: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ShieldIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 L20 5 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V5 Z"
        stroke="#FF6B35"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M9 12 L11 14 L15 10" stroke="#FF6B35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckMark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xl,
    },
    scroll: {
      paddingBottom: spacing.xl,
      alignItems: 'center',
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255,107,53,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: fontSizes['2xl'],
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.4,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: fontSizes.md * 1.5,
      marginBottom: spacing.xl,
    },
    bulletList: {
      width: '100%',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    bulletRow: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FF6B35',
      marginTop: 8,
    },
    bulletText: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: fontSizes.sm * 1.55,
    },
    callout: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      fontWeight: '600',
      color: colors.warning ?? '#FFB740',
      textAlign: 'center',
      lineHeight: fontSizes.sm * 1.55,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: 'rgba(255,183,64,0.08)',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(255,183,64,0.25)',
    },
    footer: {
      gap: spacing.md,
      paddingTop: spacing.md,
    },
    checkboxRow: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
      paddingVertical: spacing.sm,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    checkboxChecked: {
      backgroundColor: '#FF6B35',
      borderColor: '#FF6B35',
    },
    checkboxLabel: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: fontSizes.sm * 1.45,
    },
    confirmBtn: {
      paddingVertical: spacing.md,
      backgroundColor: '#FF6B35',
      borderRadius: borderRadius.full,
      alignItems: 'center',
    },
    confirmBtnDisabled: {
      backgroundColor: 'rgba(255,107,53,0.3)',
    },
    confirmText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
  });
