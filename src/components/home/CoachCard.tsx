import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { CoachMessage, CoachMood } from '../../engine/coachEngine';

interface CoachCardProps {
  message: CoachMessage;
}

function MoodIcon({ mood }: { mood: CoachMood }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const size = 28;

  if (mood === 'fire') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,107,53,0.15)' }]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10Z" fill={colors.primary} opacity={0.9} />
          <Path d="M12 8c0 2-2 3-2 5a2 2 0 0 0 4 0c0-2-2-3-2-5Z" fill="#FFD93D" />
        </Svg>
      </View>
    );
  }

  if (mood === 'trophy') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,217,61,0.15)' }]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 3h12v5a6 6 0 0 1-12 0V3Z" stroke="#FFD700" strokeWidth={1.8} fill="rgba(255,215,0,0.2)" />
          <Path d="M9 21h6M12 14v7" stroke="#FFD700" strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M6 5H4a2 2 0 0 0 0 4h2M18 5h2a2 2 0 0 1 0 4h-2" stroke="#FFD700" strokeWidth={1.8} />
        </Svg>
      </View>
    );
  }

  if (mood === 'alert') {
    return (
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,217,61,0.15)' }]}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 9v4M12 17h.01" stroke={colors.warning} strokeWidth={2} strokeLinecap="round" />
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke={colors.warning} strokeWidth={1.8} fill="rgba(255,217,61,0.1)" />
        </Svg>
      </View>
    );
  }

  // chill
  return (
    <View style={[styles.iconCircle, { backgroundColor: 'rgba(0,212,170,0.15)' }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M14 9l-2 2-2-2" stroke={colors.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" stroke={colors.success} strokeWidth={1.8} />
        <Path d="M12 16v-4" stroke={colors.success} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

export function CoachCard({ message }: CoachCardProps) {
  const { t } = useT();
  const styles = useStyles();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.row}>
        <MoodIcon mood={message.mood} />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{message.text}</Text>
          {message.subtext && (
            <Text style={styles.subtext}>{message.subtext}</Text>
          )}
        </View>
      </View>
      <View style={styles.buttonsRow}>
        {message.action && (
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(message.action!.route as any)}
          >
            <Text style={styles.actionText}>{message.action.label}</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.chatButton}
          onPress={() => router.push('/(tabs)/coach' as any)}
        >
          <Text style={styles.chatButtonText}>{t('coachChat')}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 0,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    paddingTop: 2,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  subtext: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginLeft: 56, // align with text (44 icon + 12 margin)
    gap: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  chatButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 0,
    backgroundColor: colors.primary,
  },
  chatButtonText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.white,
  },
}));

export default CoachCard;
