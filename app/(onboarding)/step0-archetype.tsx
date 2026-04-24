import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ImageBackground,
  TextInput,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing, borderRadius, MAX_CONTENT_WIDTH } from '../../src/theme/spacing';
import type { Archetype } from '../../src/types/user';
import { useT } from '../../src/i18n';
import type { TranslationKey } from '../../src/i18n/locales/fr';

interface ArchetypeData {
  id: Archetype;
  nameKey: TranslationKey;
  taglineKey: TranslationKey;
  descKey: TranslationKey;
  traitKeys: TranslationKey[];
  hue: number;
  imageUri: string;
  plan: { calories: number; protein: number; sessionsPerWeek: number };
}

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'warrior',
    nameKey: 'archetypeWarriorName',
    taglineKey: 'archetypeWarriorTagline',
    descKey: 'archetypeWarriorDesc',
    traitKeys: ['archetypeWarriorTrait1', 'archetypeWarriorTrait2', 'archetypeWarriorTrait3', 'archetypeWarriorTrait4'],
    hue: 20,
    imageUri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    plan: { calories: 2680, protein: 185, sessionsPerWeek: 5 },
  },
  {
    id: 'craftsman',
    nameKey: 'archetypeCraftsmanName',
    taglineKey: 'archetypeCraftsmanTagline',
    descKey: 'archetypeCraftsmanDesc',
    traitKeys: ['archetypeCraftsmanTrait1', 'archetypeCraftsmanTrait2', 'archetypeCraftsmanTrait3', 'archetypeCraftsmanTrait4'],
    hue: 35,
    imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    plan: { calories: 2280, protein: 155, sessionsPerWeek: 4 },
  },
  {
    id: 'explorer',
    nameKey: 'archetypeExplorerName',
    taglineKey: 'archetypeExplorerTagline',
    descKey: 'archetypeExplorerDesc',
    traitKeys: ['archetypeExplorerTrait1', 'archetypeExplorerTrait2', 'archetypeExplorerTrait3', 'archetypeExplorerTrait4'],
    hue: 180,
    imageUri: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80',
    plan: { calories: 2100, protein: 155, sessionsPerWeek: 3 },
  },
];

const INTENSITY_LABEL_KEYS: Record<number, TranslationKey> = {
  1: 'archetypeIntensity1',
  2: 'archetypeIntensity2',
  3: 'archetypeIntensity3',
  4: 'archetypeIntensity4',
  5: 'archetypeIntensity5',
};

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

export default function ArchetypeScreen() {
  const insets = useSafeAreaInsets();
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);
  const onboardingData = useUserStore((s) => s.onboardingData);

  const [step, setStep] = useState<0 | 1>(onboardingData.archetype ? 1 : 0);
  const [selectedId, setSelectedId] = useState<Archetype | null>(onboardingData.archetype ?? null);
  const [name, setName] = useState(onboardingData.name ?? '');
  const [intensity, setIntensity] = useState<number>(onboardingData.intensity ?? 3);

  const selected = ARCHETYPES.find((a) => a.id === selectedId) ?? null;

  const choose = (a: ArchetypeData) => {
    setSelectedId(a.id);
    setStep(1);
  };

  const goNext = () => {
    if (!selected) return;
    setOnboardingData({
      archetype: selected.id,
      intensity: intensity as 1 | 2 | 3 | 4 | 5,
      name: name.trim() || undefined,
    });
    router.push('/(onboarding)/step1-identity');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {step === 0 ? (
        <ChooseStep onChoose={choose} />
      ) : selected ? (
        <ConfirmStep
          archetype={selected}
          name={name}
          setName={setName}
          intensity={intensity}
          setIntensity={setIntensity}
          onBack={() => setStep(0)}
          onNext={goNext}
          bottomInset={insets.bottom}
        />
      ) : null}
    </View>
  );
}

/* ─── STEP 0 — CHOOSE ARCHETYPE ─────────────────────────── */

function ChooseStep({ onChoose }: { onChoose: (a: ArchetypeData) => void }) {
  const { t } = useT();
  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
        <BackIcon />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('archetypeStep1Eyebrow')}</Text>
        <Text style={styles.title}>{t('archetypeStep1Title')}</Text>
        <Text style={styles.subtitle}>{t('archetypeStep1Subtitle')}</Text>
      </View>

      <View style={styles.archetypeList}>
        {ARCHETYPES.map((a) => (
          <ArchetypeCard key={a.id} archetype={a} onPress={() => onChoose(a)} />
        ))}
      </View>
    </ScrollView>
  );
}

function ArchetypeCard({ archetype, onPress }: { archetype: ArchetypeData; onPress: () => void }) {
  const { t } = useT();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.archetypeCard, pressed && { opacity: 0.85 }]}>
      <ImageBackground source={{ uri: archetype.imageUri }} style={styles.archetypeImage} imageStyle={styles.archetypeImageRadius}>
        <LinearGradient
          colors={[hsl(archetype.hue, 100, 60, 0.4), 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', 'rgba(7,7,13,0.95)']}
          locations={[0.2, 0.98]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.archetypeBadgeRow}>
          <View
            style={[
              styles.archetypeIconWrap,
              { backgroundColor: hsl(archetype.hue, 100, 60), shadowColor: hsl(archetype.hue, 100, 60) },
            ]}
          >
            <ArchetypeIcon id={archetype.id} />
          </View>
          <Text style={[styles.archetypeBadgeLabel, { color: hsl(archetype.hue, 100, 70) }]}>{t('archetypeBadge')}</Text>
        </View>

        <View style={styles.archetypeNameWrap}>
          <Text style={styles.archetypeName}>{t(archetype.nameKey)}</Text>
          <Text style={styles.archetypeTagline}>{t(archetype.taglineKey)}</Text>
        </View>
      </ImageBackground>

      <View style={styles.archetypeBody}>
        <Text style={styles.archetypeDesc}>{t(archetype.descKey)}</Text>
        <View style={styles.traitsRow}>
          {archetype.traitKeys.map((traitKey) => (
            <View key={traitKey} style={styles.traitPill}>
              <Text style={styles.traitText}>{t(traitKey)}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/* ─── STEP 1 — CONFIRM + TUNE ─────────────────────────── */

function ConfirmStep({
  archetype,
  name,
  setName,
  intensity,
  setIntensity,
  onBack,
  onNext,
  bottomInset,
}: {
  archetype: ArchetypeData;
  name: string;
  setName: (v: string) => void;
  intensity: number;
  setIntensity: (v: number) => void;
  onBack: () => void;
  onNext: () => void;
  bottomInset: number;
}) {
  const { t } = useT();
  const accent = hsl(archetype.hue, 100, 60);
  const accentLight = hsl(archetype.hue, 100, 65);
  const accentSoft = hsl(archetype.hue, 100, 70);

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + bottomInset, maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={onBack} hitSlop={16} style={styles.backButton}>
          <BackIcon />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: accentSoft }]}>{t('archetypeStep2Eyebrow')}</Text>
          <Text style={styles.title}>{t('archetypeStep2Title', { archetype: t(archetype.nameKey) })}</Text>
        </View>

        {/* Identity card */}
        <View
          style={[
            styles.identityCard,
            {
              backgroundColor: hsl(archetype.hue, 100, 60, 0.12),
              borderColor: hsl(archetype.hue, 100, 60, 0.35),
            },
          ]}
        >
          <View
            style={[
              styles.identityIconWrap,
              { backgroundColor: accent, shadowColor: accent },
            ]}
          >
            <ArchetypeIcon id={archetype.id} size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityName}>{t(archetype.nameKey)}</Text>
            <Text style={styles.identityTagline}>{t(archetype.taglineKey)}</Text>
          </View>
        </View>

        {/* Name input */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('archetypeFirstNameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Paul"
            placeholderTextColor="rgba(255,255,255,0.38)"
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        {/* Intensity */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('archetypeIntensityLabel')}</Text>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((i) => {
              const active = intensity >= i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setIntensity(i)}
                  style={[
                    styles.intensityButton,
                    {
                      backgroundColor: active ? accent : 'rgba(255,255,255,0.04)',
                      borderColor: active ? accent : 'rgba(255,255,255,0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.intensityLabel,
                      { color: active ? '#FFFFFF' : 'rgba(255,255,255,0.38)' },
                    ]}
                  >
                    {t(INTENSITY_LABEL_KEYS[i])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Plan card */}
        <View style={styles.planCard}>
          <Text style={[styles.planLabel, { color: accentSoft }]}>{t('archetypePlanLabel')}</Text>
          <View style={styles.planRow}>
            <PlanStat value={archetype.plan.calories.toString()} unit="kcal" label={t('archetypePlanCalories')} color={accentLight} />
            <PlanStat value={archetype.plan.protein.toString()} unit="g" label={t('archetypePlanProteins')} color={accentLight} />
            <PlanStat value={archetype.plan.sessionsPerWeek.toString()} unit={t('archetypePlanSessionsUnit')} label={t('archetypePlanSessions')} color={accentLight} />
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: bottomInset + spacing.lg }]}>
        <LinearGradient
          colors={['transparent', '#07070D']}
          locations={[0, 0.5]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable onPress={onNext} style={({ pressed }) => [pressed && { opacity: 0.92 }]}>
          <View style={[styles.ctaButton, { backgroundColor: accent, shadowColor: accent }]}>
            <Text style={styles.ctaText}>{t('archetypeForgeCta')}</Text>
          </View>
        </Pressable>
      </View>
    </>
  );
}

function PlanStat({ value, unit, label, color }: { value: string; unit: string; label: string; color: string }) {
  return (
    <View style={styles.planStat}>
      <Text style={[styles.planValue, { color }]}>{value}</Text>
      <Text style={styles.planUnit}>{unit}</Text>
      <Text style={styles.planStatLabel}>{label}</Text>
    </View>
  );
}

/* ─── ICONS ─────────────────────────────────── */

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18 L9 12 L15 6"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArchetypeIcon({ id, size = 16 }: { id: Archetype; size?: number }) {
  if (id === 'warrior') {
    // Dumbbell
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 6 V18 M3 9 V15 M18 6 V18 M21 9 V15 M6 12 H18" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (id === 'craftsman') {
    // Target
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
          stroke="#FFFFFF"
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  // Compass for explorer
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="#FFFFFF" strokeWidth={1.7} />
      <Path d="m15 9-2 4-4 2 2-4 4-2Z" stroke="#FFFFFF" strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

/* ─── STYLES ─────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#07070D',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  backButton: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    width: 32,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 10,
    lineHeight: 19,
  },
  /* Choose step */
  archetypeList: {
    gap: 12,
    marginTop: spacing.md,
  },
  archetypeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  archetypeImage: {
    height: 140,
    width: '100%',
    justifyContent: 'flex-end',
  },
  archetypeImageRadius: {
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  archetypeBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archetypeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 6,
  },
  archetypeBadgeLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  archetypeNameWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  archetypeName: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  archetypeTagline: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
  archetypeBody: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  archetypeDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 18,
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  traitPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
  },
  traitText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 0.4,
  },
  /* Confirm step */
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  identityIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  identityName: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  identityTagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  field: {
    marginTop: 22,
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1.3,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    color: '#FFFFFF',
    fontFamily: fonts.body,
    fontSize: 16,
    borderRadius: 12,
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  intensityLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
  },
  planLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  planStat: {
    flex: 1,
    alignItems: 'center',
  },
  planValue: {
    fontFamily: fonts.data,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  planUnit: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  planStatLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: 30,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
});
