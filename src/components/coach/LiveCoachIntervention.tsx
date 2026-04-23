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

export type LiveCoachKind = 'form' | 'rest' | 'push' | 'swap';

const VARIANTS: Record<LiveCoachKind, { tag: string; title: string; body: string; action: string }> = {
  form: {
    tag: 'Observation',
    title: 'Ralentis la descente',
    body: 'Tu descends en 0.8s. Cible 2-3s. Le temps sous tension fait le muscle — pas le nombre de reps.',
    action: "OK, j'applique",
  },
  rest: {
    tag: 'Récup',
    title: '+30s de repos',
    body: 'Ton HR est encore à 142. Pour garder la force sur la série suivante, laisse-le redescendre sous 120.',
    action: "D'accord",
  },
  push: {
    tag: 'Opportunité',
    title: 'Tente +2kg',
    body: 'Ta dernière série à 80kg était propre (RPE 7). Tu as la réserve pour tester 82kg sur la suivante.',
    action: 'Je tente',
  },
  swap: {
    tag: 'Ajustement',
    title: "Je remplace l'exo 4",
    body: "Tu es à 85% du volume cible et tes épaules fatiguent. On zappe l'élévation latérale, on garde l'essentiel.",
    action: 'Valider',
  },
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
  const v = VARIANTS[kind];
  const title = customTitle ?? v.title;
  const body = customBody ?? v.body;

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
              <Text style={styles.eyebrow}>COACH · LIVE</Text>
              <View style={styles.greenDot} />
              <Text style={styles.tag}>{v.tag}</Text>
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
            <Text style={styles.btnSecondaryText}>Plus tard</Text>
          </Pressable>
          <Pressable onPress={onAccept} style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
            <LinearGradient
              colors={['#FF8C40', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimaryInner}
            >
              <Text style={styles.btnPrimaryText}>{v.action}</Text>
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
