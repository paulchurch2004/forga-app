import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { fonts } from '../../theme/fonts';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';

interface TrainingHeroProps {
  /** "Semaine 4 / 8" — current week / program length */
  weekLabel: string;
  /** "Jeudi 23 avril" */
  dateLabel: string;
  /** "Jour de Push · 60 min prévues" */
  subtitle: string;
  /** Active program name shown in the top-left pill */
  programName: string;
  onProgramPress: () => void;
  onHistoryPress: () => void;
}

export function TrainingHero({
  weekLabel,
  dateLabel,
  subtitle,
  programName,
  onProgramPress,
  onHistoryPress,
}: TrainingHeroProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 14 }]}>
      <Image
        source={{ uri: HERO_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['rgba(7,7,13,0.20)', 'rgba(7,7,13,0.98)']}
        locations={[0, 0.95]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        {/* Bouton retour vers Home — Training est maintenant accessible
            via la tuile Home (et caché du tab bar), donc on a besoin
            d'un chemin retour visible. Le swipe-back iOS ne marche pas
            entre tabs, d'où ce bouton. */}
        <Pressable
          onPress={() => router.push('/(tabs)/home')}
          hitSlop={16}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Retour à l'accueil"
        >
          <BackArrowIcon />
        </Pressable>
        <Pressable onPress={onProgramPress} style={({ pressed }) => [styles.programPill, pressed && styles.pressed]}>
          <DumbbellIcon />
          <Text style={styles.programPillLabel} numberOfLines={1}>{programName}</Text>
          <ChevronDownIcon />
        </Pressable>
        <Pressable onPress={onHistoryPress} hitSlop={8} style={({ pressed }) => [styles.iconPill, pressed && styles.pressed]}>
          <ClockIcon />
        </Pressable>
      </View>

      <View style={styles.bottomBlock}>
        <Text style={styles.eyebrow}>{weekLabel.toUpperCase()}</Text>
        <Text style={styles.date}>{dateLabel}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function DumbbellIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 V18 M3 9 V15 M18 6 V18 M21 9 V15 M6 12 H18" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9 L12 15 L18 9" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6 v6 l4 2" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BackArrowIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18L9 12l6-6" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 220,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  programPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    maxWidth: 220,
  },
  programPillLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Bouton retour vers Home — même style que iconPill (rond noir
   *  semi-transparent) pour cohérence visuelle. */
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  bottomBlock: {
    zIndex: 2,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  date: {
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
    // lineHeight passé de 32 → 36 (1.2× fontSize) pour éviter le
    // clipping des descendeurs (g, p, y) sur display font avec
    // fontSize 30.
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
  },
});
