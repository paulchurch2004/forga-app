// TrainingSetupWizard V5 — 5 étapes (+ intro + résultat)
//
// 1) Objectif    — pré-rempli depuis profile.objective, modifiable
// 2) Niveau      — Débutant / Pas débutant (raffiné par le test calibration)
// 3) Disponibilité — 3/4/5/6 séances par semaine
// 4) Lieu        — Salle / Maison (pilote la version V4 du programme)
// 5) Calibration — Skippable avec warning "fortement recommandé". Set
//                  strengthTest + raffine le niveau (inter vs avancé)
//                  via les ratios force.
//
// À la confirmation finale : on call onConfirm() avec TOUT (objectif +
// level + frequency + equipment + location + optional strengthTest).
// Le parent persist dans le profil + appelle assignProgram.

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing } from '../../theme';
import type {
  TrainingLevel,
  TrainingFrequency,
  EquipmentAccess,
  TrainingLocation,
  Objective,
  Sex,
} from '../../types/user';
import type { StrengthTestResult, StrengthTestAnswers } from '../../types/strength';
import { assignProgram } from '../../services/programAssignment';
import { runStrengthTest } from '../../services/strengthTest';
import { PROGRAMS } from '../../data/programs';
import { EXERCISES } from '../../data/exercises';
import type { ProgramId } from '../../types/program';

type Step = 'intro' | 'objective' | 'level' | 'frequency' | 'location' | 'calibration' | 'result';

interface Props {
  /** Objectif posé à l'inscription — pré-coché à l'étape 1, modifiable. */
  objective: Objective;
  sex: Sex;
  age: number;
  bodyweightKg?: number;
  /** Appelé quand l'user confirme le programme recommandé. */
  onConfirm: (
    programId: ProgramId,
    finalObjective: Objective,
    level: TrainingLevel,
    frequency: TrainingFrequency,
    equipment: EquipmentAccess,
    location: TrainingLocation,
    strengthTest: StrengthTestResult | null,
  ) => void;
  /** Appelé quand l'user veut browse au lieu d'utiliser la reco. */
  onBrowseAll: () => void;
}

const OBJECTIVE_OPTIONS: { value: Objective; label: string; sub: string }[] = [
  { value: 'bulk', label: 'Prise de masse', sub: 'Construire du muscle, surplus calorique' },
  { value: 'cut', label: 'Sèche', sub: 'Perdre du gras, préserver le muscle' },
  { value: 'recomp', label: 'Recomposition', sub: 'Perdre gras + gagner muscle en même temps' },
  { value: 'maintain', label: 'Maintien', sub: 'Conserver tes acquis' },
  { value: 'force', label: 'Force (powerlifter)', sub: 'Charges lourdes, reps basses, 5/3/1' },
];

const LEVEL_OPTIONS: { value: 'beginner' | 'experienced'; label: string; sub: string }[] = [
  { value: 'beginner', label: 'Je débute', sub: '0-6 mois d\'entraînement régulier' },
  { value: 'experienced', label: 'J\'ai déjà de l\'expérience', sub: '6 mois+ régulièrement. Le test de calibration affinera ton niveau.' },
];

const FREQUENCY_OPTIONS: { value: TrainingFrequency; label: string; sub: string }[] = [
  { value: 3, label: '3 séances/sem', sub: '~1h, équilibre vie/sport' },
  { value: 4, label: '4 séances/sem', sub: '~1h, sweet spot pour la plupart' },
  { value: 5, label: '5 séances/sem', sub: '~1h-1h15, sérieux' },
  { value: 6, label: '6 séances/sem', sub: '~1h-1h15, intensif' },
];

const LOCATION_OPTIONS: { value: TrainingLocation; label: string; sub: string }[] = [
  { value: 'gym', label: 'Salle de sport', sub: 'Barres, machines, racks, poulies' },
  { value: 'home', label: 'Maison', sub: 'Haltères, élastiques, poids du corps' },
];

export function TrainingSetupWizard({ objective: initialObjective, sex, age, bodyweightKg, onConfirm, onBrowseAll }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [objective, setObjective] = useState<Objective>(initialObjective);
  const [levelChoice, setLevelChoice] = useState<'beginner' | 'experienced' | null>(null);
  const [frequency, setFrequency] = useState<TrainingFrequency | null>(null);
  const [location, setLocation] = useState<TrainingLocation | null>(null);

  // Calibration state
  const [knownBench, setKnownBench] = useState('');
  const [knownSquat, setKnownSquat] = useState('');
  const [knownDeadlift, setKnownDeadlift] = useState('');
  const [pushupsMax, setPushupsMax] = useState('');
  const [pullupsMax, setPullupsMax] = useState('');
  const [strengthTest, setStrengthTest] = useState<StrengthTestResult | null>(null);
  const [calibrationSkipped, setCalibrationSkipped] = useState(false);

  // Niveau final dérivé : si débutant → 'beginner'. Sinon : si on a un
  // strengthTest, on prend son niveau. Sinon défaut 'intermediate'.
  const finalLevel: TrainingLevel = useMemo(() => {
    if (levelChoice === 'beginner') return 'beginner';
    if (strengthTest) {
      // Le test renvoie novice/beginner/intermediate/advanced
      // → on mappe : novice/beginner → beginner si pas tested-experienced,
      //   intermediate → intermediate, advanced → advanced.
      const lvl = strengthTest.level;
      if (lvl === 'novice' || lvl === 'beginner') return 'beginner';
      if (lvl === 'intermediate') return 'intermediate';
      return 'advanced';
    }
    return 'intermediate'; // expérimenté sans test → default inter
  }, [levelChoice, strengthTest]);

  // Equipment dérivé du lieu (pour rester compatible avec l'API existante).
  const equipment: EquipmentAccess = location === 'gym' ? 'full_gym' : 'home_equipped';

  const result = useMemo(() => {
    if (!frequency || !location) return null;
    return assignProgram({
      objective,
      sex,
      age,
      trainingLevel: finalLevel,
      trainingFrequency: frequency,
      equipmentAccess: equipment,
      trainingLocation: location,
    });
  }, [objective, sex, age, finalLevel, frequency, equipment, location]);

  const recommendedProgram = result ? PROGRAMS[result.programId] : null;

  const handleRunCalibration = () => {
    if (!bodyweightKg) {
      // Sans poids on ne peut pas calibrer → skip silencieux
      setCalibrationSkipped(true);
      setStep('result');
      return;
    }
    const hasKnownMax = !!(knownBench || knownSquat || knownDeadlift);
    const hasBodyweight = !!(pushupsMax || pullupsMax);
    if (!hasKnownMax && !hasBodyweight) {
      // L'user n'a rien rempli → skip
      setCalibrationSkipped(true);
      setStep('result');
      return;
    }
    const answers: StrengthTestAnswers = {
      hasTrained: true,
      knownBenchKg: knownBench ? parseFloat(knownBench) : undefined,
      knownSquatKg: knownSquat ? parseFloat(knownSquat) : undefined,
      knownDeadliftKg: knownDeadlift ? parseFloat(knownDeadlift) : undefined,
      pushupsMax: pushupsMax ? parseInt(pushupsMax, 10) : undefined,
      pullupsMax: pullupsMax ? parseInt(pullupsMax, 10) : undefined,
    };
    const res = runStrengthTest({ answers, bodyweightKg, sex });
    setStrengthTest(res);
    setStep('result');
  };

  const handleSkipCalibration = () => {
    setCalibrationSkipped(true);
    setStep('result');
  };

  return (
    <View style={styles.container}>
      {step === 'intro' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.title}>Configure ton entraînement</Text>
          <Text style={styles.subtitle}>
            5 étapes rapides pour qu'on te trouve le programme qui colle vraiment à toi.
          </Text>
          <View style={styles.stepsPreview}>
            <StepDot index={1} label="Objectif" />
            <StepDot index={2} label="Niveau" />
            <StepDot index={3} label="Fréquence" />
            <StepDot index={4} label="Lieu" />
            <StepDot index={5} label="Calibration" />
          </View>
          <Pressable style={styles.primaryBtn} onPress={() => setStep('objective')}>
            <Text style={styles.primaryBtnText}>Commencer</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={onBrowseAll}>
            <Text style={styles.skipBtnText}>Voir tous les programmes →</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 'objective' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={1} total={5} />
          <Text style={styles.question}>Quel est ton objectif ?</Text>
          <Text style={styles.questionHint}>
            Pré-sélectionné depuis ton inscription. Tu peux changer.
          </Text>
          {OBJECTIVE_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              selected={objective === opt.value}
              onPress={() => {
                setObjective(opt.value);
                setStep('level');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'level' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={2} total={5} />
          <Text style={styles.question}>Ton niveau d'entraînement ?</Text>
          <Text style={styles.questionHint}>
            Si tu hésites, choisis "j'ai déjà de l'expérience" — le test à l'étape 5 affinera.
          </Text>
          {LEVEL_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              selected={levelChoice === opt.value}
              onPress={() => {
                setLevelChoice(opt.value);
                setStep('frequency');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'frequency' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={3} total={5} />
          <Text style={styles.question}>Combien de séances par semaine ?</Text>
          <Text style={styles.questionHint}>
            Sois honnête sur ce que tu peux tenir — pas ce que tu rêverais de faire.
          </Text>
          {FREQUENCY_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              selected={frequency === opt.value}
              onPress={() => {
                setFrequency(opt.value);
                setStep('location');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'location' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={4} total={5} />
          <Text style={styles.question}>Tu t'entraînes où ?</Text>
          <Text style={styles.questionHint}>
            On adapte les exos : barres + machines vs haltères + élastiques.
          </Text>
          {LOCATION_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              selected={location === opt.value}
              onPress={() => {
                setLocation(opt.value);
                // Si débutant → on peut skip directement à result (les seeds
                // bodyweight suffisent). Sinon on propose la calibration.
                if (levelChoice === 'beginner') {
                  setStep('result');
                } else {
                  setStep('calibration');
                }
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'calibration' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={5} total={5} />
          <Text style={styles.question}>Test de calibration</Text>
          <View style={styles.recoBanner}>
            <Text style={styles.recoBannerText}>
              ⚡ <Text style={{ fontWeight: '700' }}>Fortement recommandé.</Text>{' '}
              Sans calibration, tes premières charges seront sous-évaluées (estimation conservatrice).
            </Text>
          </View>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Tu connais tes 1RM (poids max sur 1 répétition) ?</Text>
            <Text style={styles.questionHint}>
              Optionnel — laisse vide ce que tu ne connais pas.
            </Text>

            <KgInput
              label="Développé couché (max 1 rep, kg)"
              value={knownBench}
              onChangeText={setKnownBench}
            />
            <KgInput
              label="Squat (max 1 rep, kg)"
              value={knownSquat}
              onChangeText={setKnownSquat}
            />
            <KgInput
              label="Soulevé de terre (max 1 rep, kg)"
              value={knownDeadlift}
              onChangeText={setKnownDeadlift}
            />

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>
              Ou indique ton bodyweight max
            </Text>
            <Text style={styles.questionHint}>
              Si tu ne connais pas tes maxes barres.
            </Text>

            <KgInput
              label="Pompes max d'affilée (reps)"
              value={pushupsMax}
              onChangeText={setPushupsMax}
              suffix="reps"
            />
            <KgInput
              label="Tractions max (reps)"
              value={pullupsMax}
              onChangeText={setPullupsMax}
              suffix="reps"
            />
          </ScrollView>

          <Pressable style={styles.primaryBtn} onPress={handleRunCalibration}>
            <Text style={styles.primaryBtnText}>Valider et voir mon programme</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={handleSkipCalibration}>
            <Text style={styles.skipBtnText}>Passer pour l'instant →</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 'result' && result && recommendedProgram && frequency && location && (
        <Animated.View entering={FadeIn.duration(350)}>
          <Text style={styles.eyebrow}>RECOMMANDÉ POUR TOI</Text>
          <Text style={styles.title}>{recommendedProgram.nameKey}</Text>
          <Text style={styles.subtitle}>{recommendedProgram.descriptionKey}</Text>

          <View style={styles.reasonCard}>
            <Text style={styles.reasonLabel}>Pourquoi ce choix ?</Text>
            <Text style={styles.reasonBody}>{result.reason}</Text>
            {result.warnings.length > 0 && (
              <View style={styles.warnings}>
                {result.warnings.map((w, i) => (
                  <Text key={i} style={styles.warning}>⚠️ {w}</Text>
                ))}
              </View>
            )}
            {calibrationSkipped && (
              <View style={styles.warnings}>
                <Text style={styles.warning}>
                  ⚡ Calibration non faite — charges initiales conservatrices. Tu peux la lancer plus tard depuis ton profil.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <MetaPill label="Fréquence" value={`${recommendedProgram.daysPerWeek}j/sem`} />
            <MetaPill label="Niveau" value={
              finalLevel === 'advanced' || finalLevel === 'expert' ? 'Avancé'
              : finalLevel === 'intermediate' ? 'Intermédiaire'
              : 'Débutant'
            } />
            <MetaPill label="Lieu" value={location === 'gym' ? 'Salle' : 'Maison'} />
          </View>

          {(() => {
            const firstSession = recommendedProgram.rotation[0];
            if (!firstSession) return null;
            const previewExercises = firstSession.exercises.slice(0, 5);
            const remaining = firstSession.exercises.length - previewExercises.length;
            return (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>
                  Aperçu — Séance 1 sur {recommendedProgram.daysPerWeek} cette semaine
                </Text>
                {previewExercises.map((pe) => {
                  const exo = EXERCISES[pe.exerciseId];
                  const repsLabel = pe.targetReps > 0 ? `${pe.targetSets} × ${pe.targetReps}` : `${pe.targetSets} séries`;
                  return (
                    <View key={pe.exerciseId} style={styles.previewRow}>
                      <View style={styles.previewBullet} />
                      <Text style={styles.previewName} numberOfLines={1}>
                        {exo?.nameKey ?? pe.exerciseId}
                      </Text>
                      <Text style={styles.previewReps}>{repsLabel}</Text>
                    </View>
                  );
                })}
                {remaining > 0 && (
                  <Text style={styles.previewMore}>+ {remaining} autres exercices</Text>
                )}
              </View>
            );
          })()}

          <Pressable
            style={styles.primaryBtn}
            onPress={() => onConfirm(
              result.programId,
              objective,
              finalLevel,
              frequency,
              equipment,
              location,
              strengthTest,
            )}
          >
            <Text style={styles.primaryBtnText}>C'est parti</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={onBrowseAll}>
            <Text style={styles.skipBtnText}>Voir d'autres programmes</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function StepDot({ index, label }: { index: number; label: string }) {
  return (
    <View style={styles.stepDot}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{index}</Text>
      </View>
      <Text style={styles.stepLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function StepHeader({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepHeader}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stepHeaderBar,
            i + 1 <= current ? styles.stepHeaderBarActive : null,
          ]}
        />
      ))}
    </View>
  );
}

function ChoiceCard({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choiceCard, selected && styles.choiceCardSelected]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text>
        <Text style={styles.choiceSub}>{sub}</Text>
      </View>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 6 L15 12 L9 18"
          stroke={selected ? '#FF6B35' : 'rgba(255,255,255,0.5)'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

function KgInput({
  label,
  value,
  onChangeText,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.kgInputRow}>
      <Text style={styles.kgInputLabel}>{label}</Text>
      <View style={styles.kgInputBox}>
        <TextInput
          style={styles.kgInputField}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/,/g, '.').replace(/[^0-9.]/g, ''))}
          placeholder="—"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="decimal-pad"
          inputMode="decimal"
          maxLength={6}
        />
        {suffix && <Text style={styles.kgInputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillLabel}>{label}</Text>
      <Text style={styles.metaPillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  stepsPreview: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  stepDot: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B35',
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  stepHeader: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xl,
  },
  stepHeaderBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stepHeaderBarActive: {
    backgroundColor: '#FF6B35',
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    lineHeight: 28,
  },
  questionHint: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: spacing.xl,
    lineHeight: 19,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  recoBanner: {
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  recoBannerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  choiceCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  choiceLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  choiceLabelSelected: {
    color: '#FF6B35',
  },
  choiceSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
  },
  kgInputRow: {
    marginBottom: spacing.md,
  },
  kgInputLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  kgInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  kgInputField: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    paddingVertical: spacing.md,
  },
  kgInputSuffix: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
    marginLeft: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  skipBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  skipBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  reasonCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  reasonLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  reasonBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  warnings: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  warning: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFC857',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  metaPillLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaPillValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  previewLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  previewBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B35',
  },
  previewName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
  },
  previewReps: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  previewMore: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.45)',
    marginTop: spacing.sm,
  },
});
