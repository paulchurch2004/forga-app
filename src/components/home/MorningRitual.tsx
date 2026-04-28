import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { fonts, fontSizes } from '../../theme/fonts';
import { spacing, borderRadius } from '../../theme/spacing';
import { todayLocalIso } from '../../utils/date';
import { useTheme } from '../../context/ThemeContext';
import { useMetalHistoryStore } from '../../store/metalHistoryStore';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/locales/fr';

type MetalId = 'lead' | 'bronze' | 'iron' | 'steel' | 'gold';

interface Metal {
  id: MetalId;
  labelKey: TranslationKey;
  color: string;
  impactKey: TranslationKey;
}

const METALS: Metal[] = [
  { id: 'lead', labelKey: 'ritualMetalPlomb', color: '#6b6b7a', impactKey: 'ritualImpactPlomb' },
  { id: 'bronze', labelKey: 'ritualMetalBronze', color: '#cd7f32', impactKey: 'ritualImpactBronze' },
  { id: 'iron', labelKey: 'ritualMetalFer', color: '#8a9099', impactKey: 'ritualImpactFer' },
  { id: 'steel', labelKey: 'ritualMetalAcier', color: '#b4c0d0', impactKey: 'ritualImpactAcier' },
  { id: 'gold', labelKey: 'ritualMetalOr', color: '#ffc94d', impactKey: 'ritualImpactOr' },
];

const STORAGE_KEY = 'forga-metal-today';

function getTodayKey(): string {
  return todayLocalIso();
}

export function MorningRitual() {
  const { colors } = useTheme();
  const { t } = useT();
  const [metal, setMetal] = useState<MetalId | null>(null);
  const [preview, setPreview] = useState<MetalId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const { date, metalId } = JSON.parse(raw);
          if (date === getTodayKey()) setMetal(metalId);
        } catch {}
      }
      setHydrated(true);
    });
  }, []);

  const chooseMetal = (m: Metal) => {
    setMetal(m.id);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), metalId: m.id }));
    // Persist in the long-term history store so the 30-day frieze on
    // the profile picks it up.
    useMetalHistoryStore.getState().setMetalForDate(getTodayKey(), m.id as any);
  };

  const reset = () => {
    setMetal(null);
    setPreview(null);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  if (!hydrated) return null;

  const currentMetal = metal ? METALS.find((m) => m.id === metal) ?? null : null;
  const previewMetal = preview ? METALS.find((m) => m.id === preview) ?? null : null;

  if (currentMetal) {
    return <ChosenCard metal={currentMetal} onChange={reset} />;
  }

  return <ChooseCard previewMetal={previewMetal} onPreview={setPreview} onConfirm={chooseMetal} />;
}

function ChooseCard({
  previewMetal,
  onPreview,
  onConfirm,
}: {
  previewMetal: Metal | null;
  onPreview: (id: MetalId) => void;
  onConfirm: (m: Metal) => void;
}) {
  const { t } = useT();
  return (
    <View style={styles.card}>
      <CornerGlow color="#FF6B35" intensity={0.35} />

      <Text style={styles.eyebrow}>{t('ritualEyebrow')}</Text>
      <Text style={styles.cardTitle}>{t('ritualTitle')}</Text>
      <Text style={styles.cardSubtitle}>{t('ritualSubtitle')}</Text>

      <View style={styles.metalsRow}>
        {METALS.map((m) => (
          <MetalButton
            key={m.id}
            metal={m}
            active={previewMetal?.id === m.id}
            onPress={() => onPreview(m.id)}
          />
        ))}
      </View>

      <PreviewPanel metal={previewMetal} />

      {previewMetal && <ConfirmButton metal={previewMetal} onPress={() => onConfirm(previewMetal)} />}
    </View>
  );
}

function MetalButton({ metal, active, onPress }: { metal: Metal; active: boolean; onPress: () => void }) {
  const { t } = useT();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(active ? -2 : 0, { damping: 15, stiffness: 250 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <Animated.View style={[styles.metalCol, animStyle]}>
      <Pressable
        onPress={onPress}
        style={[
          styles.metalButton,
          {
            backgroundColor: active ? `${metal.color}22` : 'rgba(255,255,255,0.03)',
            borderColor: active ? `${metal.color}aa` : 'rgba(255,255,255,0.08)',
          },
        ]}
      >
        <View
          style={[
            styles.metalDot,
            { backgroundColor: metal.color, borderWidth: active ? 2 : 0, borderColor: 'rgba(255,255,255,0.6)' },
          ]}
        />
        <Text style={styles.metalLabel}>{t(metal.labelKey)}</Text>
      </Pressable>
    </Animated.View>
  );
}

function PreviewPanel({ metal }: { metal: Metal | null }) {
  const { t } = useT();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(metal ? 1 : 0.6, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, [metal]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.previewPanel,
        animStyle,
        {
          backgroundColor: metal ? `${metal.color}10` : 'rgba(255,255,255,0.02)',
          borderColor: metal ? `${metal.color}44` : 'rgba(255,255,255,0.06)',
        },
      ]}
    >
      <View
        style={[styles.sparkleDot, { backgroundColor: metal ? metal.color : 'rgba(255,255,255,0.38)' }]}
      />
      <Text style={[styles.previewText, !metal && styles.previewTextMuted]} numberOfLines={2}>
        {metal ? t(metal.impactKey) : t('ritualHint')}
      </Text>
    </Animated.View>
  );
}

function ConfirmButton({ metal, onPress }: { metal: Metal; onPress: () => void }) {
  const { t } = useT();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isGold = metal.id === 'gold';
  const textColor = isGold ? '#1A1A1A' : '#FFFFFF';

  return (
    <Animated.View style={[styles.confirmWrap, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
      >
        <LinearGradient
          colors={[metal.color, `${metal.color}dd`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.confirmButton, { shadowColor: metal.color }]}
        >
          <Text style={[styles.confirmText, { color: textColor }]}>{t('ritualConfirmCta').toUpperCase()} · {t(metal.labelKey).toUpperCase()}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function ChosenCard({ metal, onChange }: { metal: Metal; onChange: () => void }) {
  const { t } = useT();
  return (
    <View style={styles.card}>
      <CornerGlow color={metal.color} intensity={0.45} />

      <View style={styles.chosenHeader}>
        <View
          style={[
            styles.chosenDot,
            {
              backgroundColor: metal.color,
              shadowColor: metal.color,
            },
          ]}
        />
        <View style={styles.chosenTextWrap}>
          <Text style={styles.eyebrow}>{t('ritualEyebrow')}</Text>
          <Text style={styles.chosenLabel}>{t(metal.labelKey)}</Text>
        </View>
        <Pressable onPress={onChange} style={styles.changeButton}>
          <Text style={styles.changeButtonText}>{t('ritualResetCta').toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={[styles.impactBox, { borderLeftColor: metal.color }]}>
        <Text style={styles.impactLabel}>{t('ritualPreviewLabel')}</Text>
        <Text style={styles.impactText}>{t(metal.impactKey)}</Text>
      </View>
    </View>
  );
}

function CornerGlow({ color, intensity }: { color: string; intensity: number }) {
  return (
    <View style={styles.glowWrap} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <SvgRadialGradient id="cornerGlow" cx="80%" cy="0%" rx="70%" ry="70%">
            <Stop offset="0%" stopColor={color} stopOpacity={intensity} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#cornerGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 6,
    lineHeight: 18,
  },
  metalsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
  },
  metalCol: {
    flex: 1,
  },
  metalButton: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  metalDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  metalLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  previewPanel: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 16,
  },
  previewTextMuted: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.38)',
  },
  confirmWrap: {
    marginTop: 12,
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  confirmText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chosenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chosenDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  chosenTextWrap: {
    flex: 1,
  },
  chosenLabel: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  chosenSub: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 14,
    fontWeight: '400',
  },
  changeButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeButtonText: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.8,
  },
  impactBox: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderLeftWidth: 2,
  },
  impactLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.38)',
  },
  impactText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    lineHeight: 18,
  },
});
