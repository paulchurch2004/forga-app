import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressCircleProps {
  /** Progress value between 0 and 1 */
  progress: number;
  /** Diameter of the circle in px */
  size?: number;
  /** Width of the stroke */
  strokeWidth?: number;
  /** Color of the progress arc */
  color?: string;
  /** Label displayed below the value */
  label?: string;
  /** Value displayed in the center of the circle */
  value?: string;
  /** Font size for the center value */
  valueFontSize?: number;
  /** Color of the track (unfilled portion) */
  trackColor?: string;
  /** Animation duration in ms */
  animationDuration?: number;
}

export function ProgressCircle({
  progress,
  size = 100,
  strokeWidth = 8,
  color,
  label,
  value,
  valueFontSize,
  trackColor,
  animationDuration = 800,
}: ProgressCircleProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const resolvedColor = color ?? colors.primary;
  const resolvedTrackColor = trackColor ?? colors.surfaceHover;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress, animationDuration, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const computedValueFontSize = valueFontSize ?? (size >= 80 ? fontSizes.xl : fontSizes.md);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track (background circle) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedTrackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {/* Center content */}
      <View style={styles.centerContent}>
        {value !== undefined && (
          <Text
            style={[
              styles.valueText,
              {
                fontSize: computedValueFontSize,
                color: resolvedColor,
              },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
        {label !== undefined && (
          <Text style={styles.labelText} numberOfLines={1}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: fonts.data,
    fontWeight: '700',
  },
  labelText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
}));

export default ProgressCircle;
