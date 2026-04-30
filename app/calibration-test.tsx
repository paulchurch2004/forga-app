import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing, makeStyles } from '../src/theme';
import { useTheme } from '../src/context/ThemeContext';
import { useUserStore } from '../src/store/userStore';
import { runStrengthTest } from '../src/services/strengthTest';
import type { StrengthTestAnswers } from '../src/types/strength';

type Step = 'intro' | 'experience' | 'known_lifts' | 'pushups' | 'squats' | 'pullups' | 'result';

export default function CalibrationTestScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const profile = useUserStore((s) => s.profile);
  const setStrengthTest = useUserStore((s) => s.setStrengthTest);

  const [step, setStep] = useState<Step>('intro');
  const [hasTrained, setHasTrained] = useState<boolean | null>(null);
  const [knownBench, setKnownBench] = useState('');
  const [knownSquat, setKnownSquat] = useState('');
  const [knownDeadlift, setKnownDeadlift] = useState('');
  const [pushupsMax, setPushupsMax] = useState<number | null>(null);
  const [squatsMax, setSquatsMax] = useState<number | null>(null);
  const [pullupsMax, setPullupsMax] = useState<number | null>(null);

  const result = useMemo(() => {
    if (step !== 'result') return null;
    if (!profile) return null;
    const answers: StrengthTestAnswers = {
      hasTrained: !!hasTrained,
      knownBenchKg: knownBench ? parseFloat(knownBench) : undefined,
      knownSquatKg: knownSquat ? parseFloat(knownSquat) : undefined,
      knownDeadliftKg: knownDeadlift ? parseFloat(knownDeadlift) : undefined,
      pushupsMax: pushupsMax ?? undefined,
      squatsMax: squatsMax ?? undefined,
      pullupsMax: pullupsMax ?? undefined,
    };
    return runStrengthTest({
      answers,
      bodyweightKg: profile.currentWeight,
      sex: profile.sex,
    });
  }, [step, profile, hasTrained, knownBench, knownSquat, knownDeadlift, pushupsMax, squatsMax, pullupsMax]);

  const handleSave = () => {
    if (!result) return;
    setStrengthTest(result);
    Alert.alert(
      'Calibration enregistrée',
      'Tes charges initiales sont prêtes. Première séance, on ajustera en temps réel.',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const handleSkipKnown = () => setStep('pushups');

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Profil non chargé</Text>
        <Pressable onPress={() => router.back()} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={12}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      {step === 'intro' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.title}>Test de calibration</Text>
          <Text style={styles.subtitle}>
            3 minutes pour qu'on calcule tes charges de départ. Aucun risque, juste 3 questions sur ce
            que ton corps sait déjà faire.
          </Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Pourquoi ce test ?</Text>
            <Text style={styles.infoBody}>
              Sans ces infos, on devine au pif. Avec, on te propose la bonne charge dès la première
              séance — ni trop léger pour rien apprendre, ni trop lourd pour te blesser.
            </Text>
          </View>
          <Pressable style={styles.primaryBtn} onPress={() => setStep('experience')}>
            <Text style={styles.primaryBtnText}>Commencer</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 'experience' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <Text style={styles.question}>As-tu déjà fait de la musculation sérieusement ?</Text>
          <Text style={styles.questionHint}>
            Sérieusement = au moins 3 mois avec barre / haltères, pas juste les pompes du matin.
          </Text>
          <View style={styles.choices}>
            <ChoiceButton
              label="Oui, j'ai des références"
              onPress={() => {
                setHasTrained(true);
                setStep('known_lifts');
              }}
            />
            <ChoiceButton
              label="Non, je débute"
              onPress={() => {
                setHasTrained(false);
                setStep('pushups');
              }}
            />
          </View>
        </Animated.View>
      )}

      {step === 'known_lifts' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <Text style={styles.question}>Tes charges max connues (1RM)</Text>
          <Text style={styles.questionHint}>
            Optionnel mais ça aide. Saute si tu sais pas.
          </Text>

          <NumInput label="Développé couché (kg)" value={knownBench} onChange={setKnownBench} />
          <NumInput label="Squat barre (kg)" value={knownSquat} onChange={setKnownSquat} />
          <NumInput label="Soulevé de terre (kg)" value={knownDeadlift} onChange={setKnownDeadlift} />

          <Pressable style={styles.primaryBtn} onPress={() => setStep('pushups')}>
            <Text style={styles.primaryBtnText}>Continuer</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={handleSkipKnown}>
            <Text style={styles.skipBtnText}>Passer cette étape</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 'pushups' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <Text style={styles.question}>Combien de pompes d'affilée, sans pause ?</Text>
          <Text style={styles.questionHint}>Estimation honnête, pas de pression.</Text>
          <RangeChoices
            options={[
              { label: '0-5', value: 3 },
              { label: '5-15', value: 10 },
              { label: '15-30', value: 22 },
              { label: '30+', value: 40 },
            ]}
            selected={pushupsMax}
            onSelect={(v) => {
              setPushupsMax(v);
              setStep('squats');
            }}
          />
        </Animated.View>
      )}

      {step === 'squats' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <Text style={styles.question}>Combien de squats poids du corps en 1 série ?</Text>
          <Text style={styles.questionHint}>Descente complète, jusqu'à fatigue.</Text>
          <RangeChoices
            options={[
              { label: '0-10', value: 5 },
              { label: '10-25', value: 17 },
              { label: '25-50', value: 35 },
              { label: '50+', value: 60 },
            ]}
            selected={squatsMax}
            onSelect={(v) => {
              setSquatsMax(v);
              setStep('pullups');
            }}
          />
        </Animated.View>
      )}

      {step === 'pullups' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <Text style={styles.question}>Combien de tractions strictes ?</Text>
          <Text style={styles.questionHint}>Bras tendus en bas, menton au-dessus de la barre.</Text>
          <RangeChoices
            options={[
              { label: '0', value: 0 },
              { label: '1-3', value: 2 },
              { label: '4-10', value: 7 },
              { label: '10+', value: 15 },
            ]}
            selected={pullupsMax}
            onSelect={(v) => {
              setPullupsMax(v);
              setStep('result');
            }}
          />
        </Animated.View>
      )}

      {step === 'result' && result && (
        <Animated.View entering={FadeIn.duration(350)}>
          <Text style={styles.title}>Tes charges de départ</Text>
          <Text style={styles.subtitle}>
            Niveau estimé : <Text style={{ color: colors.primary, fontWeight: '700' }}>{LEVEL_LABELS[result.level]}</Text>
          </Text>

          <View style={styles.resultCard}>
            <ResultRow label="Squat" weight={result.startingWeights.squat} />
            <ResultRow label="Développé couché" weight={result.startingWeights.bench} />
            <ResultRow label="Soulevé de terre" weight={result.startingWeights.deadlift} />
            <ResultRow label="Développé militaire" weight={result.startingWeights.overheadPress} />
            <ResultRow label="Tirage barre" weight={result.startingWeights.row} />
            <ResultRow
              label="Tractions"
              weight={result.startingWeights.canPullUp ? -1 : 0}
              custom={result.startingWeights.canPullUp ? 'Au poids du corps' : 'Assistées (élastique)'}
            />
          </View>

          <Text style={styles.disclaimer}>
            Ces charges sont conservatrices. Pendant ta première séance, on ajuste set par set selon
            ton ressenti.
          </Text>

          <Pressable style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Enregistrer et commencer</Text>
          </Pressable>
        </Animated.View>
      )}

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const LEVEL_LABELS: Record<string, string> = {
  novice: 'Très débutant',
  beginner: 'Débutant',
  intermediate: 'Initié',
  advanced: 'Expérimenté',
};

function ChoiceButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable style={styles.choiceBtn} onPress={onPress}>
      <Text style={styles.choiceBtnText}>{label}</Text>
    </Pressable>
  );
}

function NumInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.numInputRow}>
      <Text style={styles.numInputLabel}>{label}</Text>
      <TextInput
        style={styles.numInput}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor="#666"
      />
    </View>
  );
}

function RangeChoices({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: number }[];
  selected: number | null;
  onSelect: (value: number) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.rangeChoices}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.rangeChoice, selected === opt.value && styles.rangeChoiceActive]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.rangeChoiceText, selected === opt.value && styles.rangeChoiceTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ResultRow({ label, weight, custom }: { label: string; weight: number; custom?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{custom ? custom : `${weight} kg`}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['4xl'] },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: { fontFamily: fonts.body, fontSize: fontSizes.md, color: colors.text },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  question: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  questionHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  choices: { gap: spacing.md },
  choiceBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  choiceBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  numInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numInputLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    flex: 1,
  },
  numInput: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    width: 100,
    textAlign: 'right',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rangeChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rangeChoice: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  rangeChoiceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rangeChoiceText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  rangeChoiceTextActive: { color: '#fff' },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  resultValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255,107,44,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,44,0.30)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  infoTitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  skipBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
}));
