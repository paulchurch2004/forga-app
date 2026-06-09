// Pop-up "Comment tu te sens ?" avant le démarrage d'une séance.
//
// Remplace l'ancien Morning Ritual qui était sur le Home (lieu peu
// adapté car l'user check-in à 8h pour une séance à 19h → state stale).
// Maintenant on demande JUSTE AVANT de commencer la séance — l'état
// est frais, et on peut adapter la charge / le volume en conséquence.
//
// Le retour utilisateur (un "métal" de plomb à or) est :
//   - persisté dans `metalHistoryStore` pour la frise gamification
//   - retourné via `onConfirm(metalId)` au caller, qui peut s'en servir
//     pour ajuster les charges (ex: -10% si plomb, +5% si or)
//   - exposé au coach IA via les mémoires/contexte

import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import { fonts, fontSizes, fontWeights } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';
import { useMetalHistoryStore, type MetalId as MetalIdFR } from '../../store/metalHistoryStore';
import { useUserStore } from '../../store/userStore';
import { syncMetalEntry } from '../../services/userSync';
import { todayLocalIso } from '../../utils/date';
import type { TranslationKey } from '../../i18n/locales/fr';
import type { TrainingLevel } from '../../types/user';

export type MetalId = 'lead' | 'bronze' | 'iron' | 'steel' | 'gold';

/** Map des IDs EN (utilisés ici pour matcher avec les multiplicateurs
 *  loadMultiplier explicites) vers les IDs FR du store (`metalHistoryStore`
 *  qui utilise plomb/bronze/fer/acier/or). Sans ce mapping, on stockait
 *  des clés EN dans le store, et la frise gamification ne reconnaissait
 *  aucune entrée → frise toute grise. */
const METAL_FR: Record<MetalId, MetalIdFR> = {
  lead: 'plomb',
  bronze: 'bronze',
  iron: 'fer',
  steel: 'acier',
  gold: 'or',
};

interface Metal {
  id: MetalId;
  labelKey: TranslationKey;
  color: string;
  /** Description courte de l'impact ressenti */
  impactKey: TranslationKey;
}

const METALS: Metal[] = [
  { id: 'lead', labelKey: 'ritualMetalPlomb', color: '#6b6b7a', impactKey: 'ritualImpactPlomb' },
  { id: 'bronze', labelKey: 'ritualMetalBronze', color: '#cd7f32', impactKey: 'ritualImpactBronze' },
  { id: 'iron', labelKey: 'ritualMetalFer', color: '#8a9099', impactKey: 'ritualImpactFer' },
  { id: 'steel', labelKey: 'ritualMetalAcier', color: '#b4c0d0', impactKey: 'ritualImpactAcier' },
  { id: 'gold', labelKey: 'ritualMetalOr', color: '#ffc94d', impactKey: 'ritualImpactOr' },
];

/**
 * Multiplicateur de charge PAR MÉTAL et PAR NIVEAU.
 *
 * Avant : amplitude fixe (-15% à +8%) pour tout le monde. C'était
 * anti-pédagogique : un DÉBUTANT en "plomb" n'a pas besoin de -15%
 * (ça casse sa progression et son moral — il a juste besoin de bouger
 * avec une bonne technique), et un débutant "en or" à +8% augmente le
 * risque de blessure car sa technique n'est pas encore solide.
 *
 * Un vrai coach module l'autorégulation selon l'expérience :
 *  - Débutant   : bande ÉTROITE (la régularité prime sur l'autorégulation)
 *  - Inter      : bande moyenne
 *  - Avancé/Expert : bande LARGE (ils bénéficient d'une vraie gestion
 *                    de charge selon la forme du jour)
 *
 * "iron" (état neutre) reste toujours à 1.0 quel que soit le niveau.
 */
const LEVEL_METAL_MULTIPLIERS: Record<TrainingLevel, Record<MetalId, number>> = {
  beginner:     { lead: 0.95, bronze: 0.98, iron: 1.0, steel: 1.02, gold: 1.04 },
  intermediate: { lead: 0.90, bronze: 0.95, iron: 1.0, steel: 1.03, gold: 1.06 },
  advanced:     { lead: 0.85, bronze: 0.92, iron: 1.0, steel: 1.04, gold: 1.08 },
  expert:       { lead: 0.82, bronze: 0.90, iron: 1.0, steel: 1.05, gold: 1.10 },
};

/** Résout le multiplicateur pour un métal, selon le niveau de l'user.
 *  Fallback `intermediate` si le niveau n'est pas renseigné. */
function metalLoadMultiplier(metalId: MetalId, level: TrainingLevel | undefined): number {
  const table = LEVEL_METAL_MULTIPLIERS[level ?? 'intermediate'] ?? LEVEL_METAL_MULTIPLIERS.intermediate;
  return table[metalId] ?? 1.0;
}

const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => {
    const s = style === 'medium'
      ? H.ImpactFeedbackStyle.Medium
      : H.ImpactFeedbackStyle.Light;
    H.impactAsync(s);
  }).catch(() => {});
};

export interface PreWorkoutCheckInResult {
  metalId: MetalId;
  loadMultiplier: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Appelé quand l'user a confirmé son état. Le caller peut utiliser
   *  loadMultiplier pour ajuster les charges proposées de la séance. */
  onConfirm: (result: PreWorkoutCheckInResult) => void;
}

export function PreWorkoutCheckInModal({ visible, onClose, onConfirm }: Props) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = makeStyles(colors);
  const setMetalForDate = useMetalHistoryStore((s) => s.setMetalForDate);
  const [selected, setSelected] = useState<MetalId | null>(null);

  // Reset `selected` quand la modale se ferme — sinon, à la prochaine
  // ouverture, le métal précédemment choisi reste pré-sélectionné, ce
  // qui biaise le check-in (l'user voit "or" alors qu'il n'a rien
  // tapé aujourd'hui).
  useEffect(() => {
    if (!visible) setSelected(null);
  }, [visible]);

  const handleSelect = useCallback((id: MetalId) => {
    triggerHaptic('medium');
    setSelected(id);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const metal = METALS.find((m) => m.id === selected);
    if (!metal) return;
    triggerHaptic('light');
    const today = todayLocalIso();
    const metalFr = METAL_FR[selected];
    // Persist dans la frise gamification (avec mapping EN → FR pour
    // que le store reconnaisse la clé — sinon frise visuelle cassée).
    setMetalForDate(today, metalFr);
    // Sync vers Supabase — sinon perdu à chaque réinstall/multi-device.
    const profile = useUserStore.getState().profile;
    if (profile?.id) {
      syncMetalEntry(today, metalFr, profile.id);
    }
    // Multiplicateur adapté au niveau de l'user (cf LEVEL_METAL_MULTIPLIERS).
    const loadMultiplier = metalLoadMultiplier(selected, profile?.trainingLevel);
    onConfirm({ metalId: selected, loadMultiplier });
    setSelected(null);
  }, [selected, setMetalForDate, onConfirm]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    // Skip = on assume "fer" (état neutre, pas d'ajustement) — toujours 1.0
    onConfirm({ metalId: 'iron', loadMultiplier: 1.0 });
    setSelected(null);
  }, [onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('preWorkoutCheckInTitle' as any)}</Text>
          <Text style={styles.subtitle}>{t('preWorkoutCheckInSubtitle' as any)}</Text>

          {/* 5 métaux — du plomb (épuisé) à l'or (en forme) */}
          <View style={styles.metalsRow}>
            {METALS.map((m) => {
              const isSelected = selected === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => handleSelect(m.id)}
                  style={[styles.metalBtn, isSelected && styles.metalBtnActive]}
                  accessibilityRole="button"
                  accessibilityLabel={t(m.labelKey as any) as string}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.metalDot, { backgroundColor: m.color }]} />
                  <Text style={[styles.metalLabel, isSelected && styles.metalLabelActive]}>
                    {t(m.labelKey as any)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Aperçu de l'impact */}
          {selected ? (
            <View style={styles.impactBox}>
              <Text style={styles.impactLabel}>{t('preWorkoutCheckInImpactLabel' as any)}</Text>
              <Text style={styles.impactText}>
                {t(METALS.find((m) => m.id === selected)?.impactKey as any) as string}
              </Text>
            </View>
          ) : (
            <View style={styles.impactPlaceholder} />
          )}

          {/* Actions */}
          <Pressable
            onPress={handleConfirm}
            disabled={!selected}
            style={({ pressed }) => [
              styles.confirmBtn,
              !selected && styles.confirmBtnDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmGradient}
            >
              <Text style={styles.confirmText}>
                {t('preWorkoutCheckInStart' as any)}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.7 }]}>
            <Text style={styles.skipText}>{t('preWorkoutCheckInSkip' as any)}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.xl,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
      lineHeight: fontSizes.md * 1.4,
    },
    metalsRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'space-between',
    },
    metalBtn: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: 4,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      gap: 6,
    },
    metalBtnActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    metalDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    metalLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      fontWeight: fontWeights.semibold as any,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    metalLabelActive: {
      color: colors.primary,
    },
    impactBox: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 64,
    },
    impactPlaceholder: {
      marginTop: spacing.lg,
      minHeight: 64,
    },
    impactLabel: {
      fontFamily: fonts.body,
      fontSize: 10,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    impactText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.text,
      lineHeight: fontSizes.sm * 1.4,
    },
    confirmBtn: {
      marginTop: spacing.xl,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    confirmBtnDisabled: {
      opacity: 0.4,
    },
    confirmGradient: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    confirmText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.md,
      fontWeight: fontWeights.bold as any,
      color: '#FFFFFF',
    },
    skipBtn: {
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    skipText: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: colors.textMuted,
    },
  });
