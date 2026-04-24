import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';

const SUCCESS = '#00D4AA';

interface ValidatedMealOverlayProps {
  visible: boolean;
  kcal: number;
  protein: number;
  onDone: () => void;
  autoDismissMs?: number;
}

export function ValidatedMealOverlay({ visible, kcal, protein, onDone, autoDismissMs = 1100 }: ValidatedMealOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, autoDismissMs);
    return () => clearTimeout(t);
  }, [visible, autoDismissMs]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Inner kcal={kcal} protein={protein} />
      </View>
    </Modal>
  );
}

function Inner({ kcal, protein }: { kcal: number; protein: number }) {
  const { t } = useT();
  const checkScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(12);
  const subOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withSpring(1, { damping: 10, stiffness: 220 });
    titleOpacity.value = withDelay(220, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    titleY.value = withDelay(220, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    subOpacity.value = withDelay(380, withTiming(1, { duration: 400 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));

  return (
    <View style={styles.center}>
      <Animated.View style={[styles.check, checkStyle]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12 L10 17 L19 7" stroke="#000000" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
      <Animated.Text style={[styles.title, titleStyle]}>{t('validatedMealTitle')}</Animated.Text>
      <Animated.Text style={[styles.sub, subStyle]}>
        {t('validatedMealSubtitle', { kcal, protein })}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11,11,20,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  check: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SUCCESS,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 6,
  },
});
