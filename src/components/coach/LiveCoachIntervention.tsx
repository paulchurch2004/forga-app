import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/locales/fr';

export type LiveCoachKind = 'form' | 'rest' | 'push' | 'swap';

const VARIANT_KEYS: Record<LiveCoachKind, { tag: TranslationKey; title: TranslationKey; body: TranslationKey; action: TranslationKey }> = {
  form: { tag: 'liveCoachFormTag', title: 'liveCoachFormTitle', body: 'liveCoachFormBody', action: 'liveCoachFormAction' },
  rest: { tag: 'liveCoachRestTag', title: 'liveCoachRestTitle', body: 'liveCoachRestBody', action: 'liveCoachRestAction' },
  push: { tag: 'liveCoachPushTag', title: 'liveCoachPushTitle', body: 'liveCoachPushBody', action: 'liveCoachPushAction' },
  swap: { tag: 'liveCoachSwapTag', title: 'liveCoachSwapTitle', body: 'liveCoachSwapBody', action: 'liveCoachSwapAction' },
};

interface LiveCoachInterventionProps {
  visible: boolean;
  kind: LiveCoachKind;
  customTitle?: string;
  customBody?: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function LiveCoachIntervention({
  visible,
  kind,
  customTitle,
  customBody,
  onAccept,
  onDismiss,
}: LiveCoachInterventionProps) {
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-16);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 350, easing: Easing.bezier(0.2, 0.9, 0.3, 1.1) });
      translateY.value = withTiming(0, { duration: 350, easing: Easing.bezier(0.2, 0.9, 0.3, 1.1) });
      scale.value = withTiming(1, { duration: 350, easing: Easing.bezier(0.2, 0.9, 0.3, 1.1) });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = -16;
      scale.value = 0.96;
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!visible) return null;
  const v = VARIANT_KEYS[kind];
  const title = customTitle ?? t(v.title);
  const body = customBody ?? t(v.body);

  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 60 }, animStyle]}>
      <LinearGradient
        colors={['rgba(20,10,8,0.96)', 'rgba(15,8,5,0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        <View style={styles.row}>
          <PulsingAvatar />
          <View style={styles.body}>
            <View style={styles.headerRow}>
              <Text style={styles.eyebrow}>{t('liveCoachEyebrow')}</Text>
              <View style={styles.greenDot} />
              <Text style={styles.tag}>{t(v.tag)}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.bodyText}>{body}</Text>
          </View>
          <Pressable onPress={onDismiss} hitSlop={12} style={styles.closeBtn}>
            <CloseIcon />
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={onDismiss} style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}>
            <Text style={styles.btnSecondaryText}>{t('liveCoachLater')}</Text>
          </Pressable>
          <Pressable onPress={onAccept} style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
            <LinearGradient
              colors={['#FF8C40', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimaryInner}
            >
              <Text style={styles.btnPrimaryText}>{t(v.action)}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function PulsingAvatar() {
  const ring = useSharedValue(0);

  useEffect(() => {
    ring.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.4 - ring.value * 0.4,
    transform: [{ scale: 1 + ring.value * 0.6 }],
  }));

  return (
    <View style={styles.avatarWrap}>
      <Animated.View style={[styles.avatarRing, ringStyle]} pointerEvents="none" />
      <LinearGradient
        colors={['#FF8C40', '#CC5424']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <SparkleIcon />
      </LinearGradient>
    </View>
  );
}

function SparkleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 L18 18 M18 6 L6 18" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.50)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.6,
    color: '#FF6B35',
    fontWeight: '700',
  },
  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00D4AA',
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bodyText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.4,
  },
  btnPrimary: {
    flex: 1.6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  btnPrimaryInner: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
