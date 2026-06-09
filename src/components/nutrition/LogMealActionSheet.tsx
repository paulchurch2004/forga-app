// Action sheet "Comment logger ce repas ?" — affiché quand l'user tape
// un slot vide (petit-dej / déj / etc.) sur la page nutrition (ou home).
//
// 3 options :
//  1) Choisir une recette → bibliothèque interne (recettes pré-calibrées,
//     mode "je suis le plan").
//  2) Scanner un produit → code-barre OpenFoodFacts (mode "j'ai acheté
//     un produit en magasin, je veux ses macros sans tout saisir").
//  3) Saisir manuellement → form custom (mode "fait maison" ou "rien
//     trouvé, je connais les macros").
//
// Le slot est propagé via query param pour que chaque destination
// l'utilise (assign le log au bon créneau).

import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPickRecipe: () => void;
  onScan: () => void;
  onLogManual: () => void;
  /** "Décris-le au coach" — route vers le coach IA avec un prompt
   *  prérempli. Le coach analyse le texte (ex: "deux œufs brouillés
   *  et 50g d'avoine") et propose un log_meal validable. */
  onDescribeToCoach: () => void;
  /** Label du créneau ("Petit-déjeuner", "Déjeuner"…) affiché en titre. */
  slotLabel?: string;
}

export function LogMealActionSheet({
  visible,
  onClose,
  onPickRecipe,
  onScan,
  onLogManual,
  onDescribeToCoach,
  slotLabel,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useT();
  const styles = makeStyles(colors);

  const title = slotLabel
    ? (t('logMealSheetTitleWithSlot' as any, { slot: slotLabel }) as string)
    : (t('logMealSheetTitle' as any) as string);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          // Pressable inerte pour absorber les tap sur la carte (sinon
          // le backdrop catch et close en plein milieu d'une action).
          onPress={(e) => e.stopPropagation?.()}
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{t('logMealSheetSubtitle' as any) as string}</Text>

          <ActionRow
            iconColor="#FF6B35"
            icon={<RecipeIcon />}
            label={t('logMealActionRecipe' as any) as string}
            hint={t('logMealActionRecipeHint' as any) as string}
            onPress={onPickRecipe}
          />
          <ActionRow
            iconColor="#5B8BFF"
            icon={<BarcodeIcon />}
            label={t('logMealActionScan' as any) as string}
            hint={t('logMealActionScanHint' as any) as string}
            onPress={onScan}
          />
          <ActionRow
            iconColor="#00D4AA"
            icon={<EditIcon />}
            label={t('logMealActionManual' as any) as string}
            hint={t('logMealActionManualHint' as any) as string}
            onPress={onLogManual}
          />
          <ActionRow
            iconColor="#B388FF"
            icon={<CoachIcon />}
            label={t('logMealActionCoach' as any) as string}
            hint={t('logMealActionCoachHint' as any) as string}
            onPress={onDescribeToCoach}
          />

          <Pressable onPress={onClose} style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}>
            <Text style={styles.cancelText}>{t('cancel' as any) as string}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  iconColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  iconColor: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.06)' }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22`, borderColor: `${iconColor}55` }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Chevron />
    </Pressable>
  );
}

function RecipeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h13a3 3 0 013 3v13a3 3 0 01-3 3H7a3 3 0 01-3-3V4z"
        stroke="#FF6B35"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M8 9h8M8 13h8M8 17h5" stroke="#FF6B35" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BarcodeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14" stroke="#5B8BFF" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function EditIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4l10-10-4-4L4 16v4z" stroke="#00D4AA" strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M14 6l4 4" stroke="#00D4AA" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function CoachIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"
        stroke="#B388FF"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M8 10h2M14 10h2M11 13h2" stroke="#B388FF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function Chevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.45)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: fontSizes.xl,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.2,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.xs,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    rowLabel: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.1,
    },
    rowHint: {
      fontFamily: fonts.body,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cancelBtn: {
      marginTop: spacing.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderRadius: borderRadius.lg,
      backgroundColor: 'rgba(255,255,255,0.04)',
    },
    cancelText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
