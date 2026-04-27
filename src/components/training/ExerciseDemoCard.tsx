import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80';

interface ExerciseDemoCardProps {
  /** GIF or static image URL of the exercise */
  imageUri?: string;
  onPlayDemo?: () => void;
  onShowForm?: () => void;
}

export function ExerciseDemoCard({ imageUri, onPlayDemo, onShowForm }: ExerciseDemoCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUri ?? FALLBACK_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['rgba(255,107,53,0.20)', 'rgba(255,107,53,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bottomRow}>
        <Pressable
          onPress={onPlayDemo}
          style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
        >
          <PlayIcon />
          <Text style={styles.pillText}>Démo vidéo</Text>
        </Pressable>
        <Pressable
          onPress={onShowForm}
          style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
        >
          <SparkleIcon />
          <Text style={styles.pillText}>Forme</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PlayIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4 L20 12 L7 20 Z" fill="#FF6B35" />
    </Svg>
  );
}

function SparkleIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10,
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  bottomRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.8,
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
