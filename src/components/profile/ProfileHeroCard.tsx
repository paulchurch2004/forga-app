import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import { Glow } from '../ui/Glow';
import type { Archetype } from '../../types/user';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/locales/fr';

interface ProfileHeroCardProps {
  name: string;
  archetype?: Archetype;
  cycleLabel?: string;
  streak: number;
  formScore: number;
  weight: number;
  /** URI locale ou URL distante de la photo de profil. Si fourni, on
   *  l'affiche à la place de l'initiale en gradient. */
  avatarUri?: string;
  /** Callback déclenché au tap sur l'avatar. Permet à l'écran parent
   *  d'ouvrir le picker photo (`expo-image-picker`). Optionnel : si
   *  absent, l'avatar n'est pas tappable. */
  onAvatarPress?: () => void;
}

const ARCHETYPE_LABEL_KEY: Record<Archetype, TranslationKey> = {
  warrior: 'archetypeWarriorName',
  craftsman: 'archetypeCraftsmanName',
  explorer: 'archetypeExplorerName',
};

export function ProfileHeroCard({
  name,
  archetype,
  cycleLabel,
  streak,
  formScore,
  weight,
  avatarUri,
  onAvatarPress,
}: ProfileHeroCardProps) {
  const { t } = useT();
  const initial = name.charAt(0).toUpperCase();
  const archetypeLabel = archetype ? t(ARCHETYPE_LABEL_KEY[archetype]) : t('profileArchetypeUnknown');

  // Si l'user a une photo custom, on l'affiche à la place de
  // l'initiale en gradient. Le Pressable wrap rend l'avatar tappable
  // pour ouvrir le picker (callback fourni par l'écran parent).
  const avatarContent = avatarUri ? (
    <Image
      source={{ uri: avatarUri }}
      style={styles.avatar}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  ) : (
    <LinearGradient
      colors={['#FF6B35', '#CC5424']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.avatar}
    >
      <Text style={styles.avatarLetter}>{initial}</Text>
    </LinearGradient>
  );

  return (
    <View style={styles.card}>
      <Glow color="#FF6B35" size={240} intensity={0.5} style={styles.glow} />
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.glassHighlight}
        pointerEvents="none"
      />
      <View style={styles.headerRow}>
        {onAvatarPress ? (
          <Pressable
            onPress={onAvatarPress}
            accessibilityRole="button"
            accessibilityLabel={t('profileChangePhoto' as any)}
            hitSlop={8}
          >
            {avatarContent}
            {/* Petit indicateur "édit" en coin bas-droit de l'avatar
                pour signaler que l'élément est interactif. */}
            <View style={styles.editBadge} pointerEvents="none">
              <Text style={styles.editBadgeIcon}>✎</Text>
            </View>
          </Pressable>
        ) : (
          avatarContent
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{t('profileArchetypeEyebrow', { name: archetypeLabel.toUpperCase() })}</Text>
          <Text style={styles.name}>{name}</Text>
          {cycleLabel && <Text style={styles.cycle}>{cycleLabel}</Text>}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <Stat label={t('profileStreakLabel')} value={String(streak)} unit={t('profileStreakUnit')} />
        <Stat label={t('profileFormLabel')} value={String(formScore)} unit="" valueColor="#00D4AA" />
        <Stat label={t('profileWeightLabel')} value={weight.toFixed(1)} unit={t('profileWeightUnit')} small />
      </View>
    </View>
  );
}

function Stat({ label, value, unit, valueColor, small }: { label: string; value: string; unit: string; valueColor?: string; small?: boolean }) {
  return (
    <View style={styles.statCol}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, valueColor && { color: valueColor }, small && { fontSize: 20 }]}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 22,
    overflow: 'hidden',
    // Profondeur "lift" chaud (bronze) — la carte se soulève.
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -80,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /** Petit badge "édit" en coin bas-droit de l'avatar quand interactif. */
  editBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  editBadgeIcon: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '700',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
    // lineHeight passé de 28 → 32 pour ne pas clipper les descendeurs
    // sur display font (l'audit signalait un risque sur les `g/p/y`).
    lineHeight: 32,
  },
  cycle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 18,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 4,
  },
  statValue: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
});
