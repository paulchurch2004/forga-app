import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { fonts, fontSizes } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';

// Free stock fitness videos (SD for fast mobile loading)
// Source: Pexels.com (free for commercial use, no attribution required)
const VIDEOS = [
  'https://videos.pexels.com/video-files/4754031/4754031-sd_640_360_25fps.mp4',
  'https://videos.pexels.com/video-files/4761563/4761563-sd_640_360_25fps.mp4',
  'https://videos.pexels.com/video-files/3195394/3195394-sd_640_360_25fps.mp4',
  'https://videos.pexels.com/video-files/4753879/4753879-sd_640_360_25fps.mp4',
];

const MOTIVATIONAL = [
  'FORGE TON CORPS',
  'CHAQUE REPAS COMPTE',
  'LA REGULARITE PAIE',
  'DEPASSE TES LIMITES',
];

export function FitnessVideoBanner() {
  const [videoIndex, setVideoIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textIndex = useRef(0);
  const [motivText, setMotivText] = useState(MOTIVATIONAL[0]);

  // Rotate videos every 12s with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setVideoIndex((i) => (i + 1) % VIDEOS.length);
        textIndex.current = (textIndex.current + 1) % MOTIVATIONAL.length;
        setMotivText(MOTIVATIONAL[textIndex.current]);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Only render on web
  if (Platform.OS !== 'web') return null;

  const videoElement = !hasError
    ? React.createElement('video', {
        key: `video-${videoIndex}`,
        src: VIDEOS[videoIndex],
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        onError: () => setHasError(true),
        style: {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover' as const,
          borderRadius: 16,
        },
      })
    : null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Video or fallback gradient */}
      {videoElement}

      {/* Dark gradient overlay for readability */}
      <LinearGradient
        colors={['rgba(11, 11, 20, 0.3)', 'rgba(11, 11, 20, 0.85)']}
        style={styles.overlay}
      />

      {/* Motivational text */}
      <View style={styles.content}>
        <Text style={styles.motivText}>{motivText}</Text>
        <View style={styles.divider} />
        <Text style={styles.subText}>Chaque jour est une opportunite</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: '#1a1a2e',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.xl,
  },
  motivText: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: spacing.sm,
  },
  subText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
