import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

interface ScreenTopBarProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  variant?: 'close' | 'back';
  transparent?: boolean;
}

export function ScreenTopBar({
  title,
  subtitle,
  onBack,
  right,
  variant = 'back',
  transparent,
}: ScreenTopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + 12 },
        !transparent && styles.barOpaque,
      ]}
    >
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
          {variant === 'close' ? <CloseIcon /> : <BackIcon />}
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}

      <View style={styles.titleCol}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      {/* Slot droit : `minWidth:40` (symétrie avec le bouton retour pour
          centrer le titre) mais `width:auto` pour qu'un bouton texte
          large ("Refaire", "Enregistrer") ne soit pas coupé / inclickable
          comme avant (il était enfermé dans une boîte 40×40). */}
      <View style={styles.rightSlot}>{right ?? null}</View>
    </View>
  );
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18 L9 12 L15 6" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 L18 18 M18 6 L6 18" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  barOpaque: {
    backgroundColor: 'rgba(7,7,13,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    // Remonté de 0.38 → 0.55 : à 38% le sous-titre était à la limite du
    // lisible sur certains fonds. 55% reste discret mais nettement plus net.
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    lineHeight: 15,
  },
});
