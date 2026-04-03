import React from 'react';
import {
  View,
  Text,
  Pressable,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  children: React.ReactNode;
  header?: string;
  headerRight?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function Card({
  children,
  header,
  headerRight,
  onPress,
  style,
  noPadding = false,
}: CardProps) {
  const styles = useStyles();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const content = (
    <>
      {header && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{header}</Text>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={noPadding ? undefined : styles.body}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, animatedStyle, style]}
        accessibilityRole="button"
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[styles.card, style]}>
      {content}
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    padding: spacing.lg,
  },
}));

export default Card;
