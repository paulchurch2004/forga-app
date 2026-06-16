// Big tile cards pour Home — restructure UI mai 2026.
//
// Avant : tiles 2-colonnes (QuickAccessTile) — trop tassés visuellement
// pour les 3 sections KEY (Nutrition, Entraînement, Coach).
// Maintenant : tiles pleine largeur, hauteur 140-160px, avec image
// hero + overlay sombre + eyebrow + titre + subtitle.
//
// Profondeur premium (juin 2026) : wrapper d'ombre (carte "soulevée" avec
// glow coloré diagonal) séparé du clip image, + reflet "verre" en haut.

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
  progress?: number;
  onPress: () => void;
  accent?: boolean;
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
  const effectiveAccent = accentColor ?? (accent ? colors.primary : null);

  return (
    <Pressable
      onPress={() => {
        triggerHaptic();
        onPress();
      }}
      style={({ pressed }) => [
        styles.shadowWrap,
        // Carte "soulevée" : glow coloré diagonal (orange/bleu/vert).
        effectiveAccent
          ? {
              shadowColor: effectiveAccent,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.4,
              shadowRadius: 18,
              elevation: 12,
            }
          : styles.neutralDepth,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle ?? ''}`}
    >
      <View
        style={[
          styles.card,
          effectiveAccent && { borderColor: effectiveAccent, borderWidth: 1.5 },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={250}
        />
        {/* Dégradé sombre pour la lisibilité du texte. */}
        <LinearGradient
          colors={['rgba(7,7,13,0.35)', 'rgba(7,7,13,0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Reflet "verre" en haut — bord lumineux subtil (premium). */}
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.glassHighlight}
          pointerEvents="none"
        />
        {/* Contenu */}
        <View style={styles.content}>
          <View>
            <Text
              style={[
                styles.eyebrow,
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
                    ...(effectiveAccent ? { backgroundColor: effectiveAccent } : {}),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    shadowWrap: {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
    },
    neutralDepth: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      height: 156,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }],
    },
    image: {
      ...StyleSheet.absoluteFillObject,
    },
    glassHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 56,
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
