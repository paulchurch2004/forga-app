// Big tile cards pour Home — restructure UI mai 2026.
//
// Avant : tiles 2-colonnes (QuickAccessTile) — trop tassés visuellement
// pour les 3 sections KEY (Nutrition, Entraînement, Coach).
// Maintenant : tiles pleine largeur, hauteur 140-160px, avec image
// hero + overlay sombre + eyebrow + titre + subtitle.
//
// L'UX cible : 3 grosses surfaces tactiles immédiatement scannables,
// au lieu d'une grille fine où tout se confond.

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { fonts, fontSizes, fontWeights } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';

interface BigTileCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  imageUri: string;
  /** Progress 0..1 affiché en barre fine en bas. Optionnel. */
  progress?: number;
  onPress: () => void;
  /** Style accentué (border primary orange) — pour la tuile Nutrition. */
  accent?: boolean;
  /** Override la couleur de la bordure + eyebrow + progress. Utilisé
   *  pour différencier visuellement les 3 tuiles Home :
   *    - Nutrition : orange (accent=true)
   *    - Entraînement : bleu
   *    - Coach IA : vert
   *  L'eyebrow et la progress bar prennent aussi cette couleur. */
  accentColor?: string;
}

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => {
    H.impactAsync(H.ImpactFeedbackStyle.Light);
  }).catch(() => {});
};

export function BigTileCard({
  eyebrow,
  title,
  subtitle,
  imageUri,
  progress,
  onPress,
  accent,
  accentColor,
}: BigTileCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  // Couleur d'accentuation effective : explicite > accent orange > rien
  const effectiveAccent = accentColor ?? (accent ? colors.primary : null);

  return (
    <Pressable
      onPress={() => {
        triggerHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        // Border + glow colorée (orange/bleu/vert selon la tuile)
        effectiveAccent && {
          borderColor: effectiveAccent,
          borderWidth: 1.5,
          // Léger glow externe pour donner du relief — iOS shadow,
          // Android elevation (l'overflow:hidden de la card clip mais
          // le shadow se rend toujours sur iOS).
          shadowColor: effectiveAccent,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle ?? ''}`}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={250}
      />
      {/* Dégradé sombre pour la lisibilité du texte. Renforcé pour
          que le titre + subtitle restent lisibles même sur des images
          claires (gym blanc, plat coloré sur fond clair). */}
      <LinearGradient
        colors={['rgba(7,7,13,0.35)', 'rgba(7,7,13,0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Contenu */}
      <View style={styles.content}>
        <View>
          <Text
            style={[
              styles.eyebrow,
              // L'eyebrow prend la couleur d'accent — match visuel
              // avec la bordure + barre de progress.
              effectiveAccent ? { color: effectiveAccent } : null,
            ]}
          >
            {eyebrow}
          </Text>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          ) : null}
        </View>

        {typeof progress === 'number' && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                  // Barre de progress dans la couleur d'accent aussi
                  ...(effectiveAccent ? { backgroundColor: effectiveAccent } : {}),
                },
              ]}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      height: 156,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardAccent: {
      borderColor: colors.primaryBorder,
      borderWidth: 1.5,
    },
    cardPressed: {
      opacity: 0.92,
    },
    image: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    eyebrow: {
      fontFamily: fonts.body,
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.bold as any,
      color: colors.primary,
      letterSpacing: 1.4,
      textTransform: 'uppercase' as const,
      // Ombre noire pour ressortir sur n'importe quelle image, même
      // sur les zones claires où le dégradé ne masque pas tout.
      textShadowColor: 'rgba(0,0,0,0.85)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold as any,
      color: '#FFFFFF',
      marginTop: spacing.xs,
      letterSpacing: -0.5,
      lineHeight: fontSizes['2xl'] * 1.15,
      // Ombre plus prononcée sur le titre (le plus lu), pour garantir
      // la lisibilité même si l'user a un device avec un écran clair.
      textShadowColor: 'rgba(0,0,0,0.9)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      color: '#FFFFFF',
      marginTop: 2,
      lineHeight: fontSizes.sm * 1.35,
      // Subtitle passé en blanc 100% (au lieu de 78%) + ombre — plus
      // lisible que le gris faible sur fond image.
      textShadowColor: 'rgba(0,0,0,0.85)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    progressTrack: {
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
  });
