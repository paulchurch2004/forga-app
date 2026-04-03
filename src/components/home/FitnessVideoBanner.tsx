import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n';

// Free fitness images (Unsplash Source -- allows hotlinking)
const IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&h=360&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=360&fit=crop&q=60',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=640&h=360&fit=crop&q=60',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=640&h=360&fit=crop&q=60',
];

const MOTIVATIONAL_KEYS: TranslationKey[] = [
  'motivForgeBody',
  'motivEveryMealCounts',
  'motivConsistencyPays',
  'motivExceedLimits',
];

export function FitnessVideoBanner() {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Rotate images every 8s with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % IMAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={{ uri: IMAGES[index] }}
        style={styles.image}
        resizeMode="cover"
      >
        {/* Dark gradient overlay for readability */}
        <LinearGradient
          colors={['rgba(11, 11, 20, 0.2)', 'rgba(11, 11, 20, 0.85)']}
          style={styles.overlay}
        />

        {/* Motivational text */}
        <View style={styles.content}>
          <Text style={styles.motivText}>{t(MOTIVATIONAL_KEYS[index])}</Text>
          <View style={styles.divider} />
          <Text style={styles.subText}>{t('everyDayIsOpportunity')}</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: '#1a1a2e',
  },
  image: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
}));
