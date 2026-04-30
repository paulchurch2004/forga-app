import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { fonts, fontSizes, spacing } from '../../theme';
import type {
  TrainingLevel,
  TrainingFrequency,
  EquipmentAccess,
  Objective,
  Sex,
} from '../../types/user';
import { assignProgram } from '../../services/programAssignment';
import { PROGRAMS } from '../../data/programs';
import { EXERCISES } from '../../data/exercises';
import type { ProgramId } from '../../types/program';

type Step = 'intro' | 'level' | 'frequency' | 'equipment' | 'result';

interface Props {
  objective: Objective;
  sex: Sex;
  age: number;
  /** Called when the user confirms the recommended program. */
  onConfirm: (
    programId: ProgramId,
    level: TrainingLevel,
    frequency: TrainingFrequency,
    equipment: EquipmentAccess,
  ) => void;
  /** Called when the user wants to browse all programs instead. */
  onBrowseAll: () => void;
}

const LEVEL_OPTIONS: { value: TrainingLevel; label: string; sub: string }[] = [
  { value: 'beginner', label: 'Je débute', sub: '0-6 mois' },
  { value: 'intermediate', label: 'Quelques mois à 2 ans', sub: 'Je connais les bases' },
  { value: 'advanced', label: '2-5 ans', sub: 'Je connais mes maxes' },
  { value: 'expert', label: '5+ ans', sub: 'Athlète confirmé' },
];

const FREQUENCY_OPTIONS: { value: TrainingFrequency; label: string; sub: string }[] = [
  { value: 3, label: '3 séances', sub: '~1h, équilibre vie/sport' },
  { value: 4, label: '4 séances', sub: '~1h, sweet spot pour la plupart' },
  { value: 5, label: '5 séances', sub: '~1h-1h15, sérieux' },
  { value: 6, label: '6 séances', sub: '~1h-1h15, intensif' },
];

const EQUIPMENT_OPTIONS: { value: EquipmentAccess; label: string; sub: string }[] = [
  { value: 'full_gym', label: 'Salle de sport', sub: 'Barres, machines, haltères' },
  { value: 'home_equipped', label: 'Maison équipée', sub: 'Haltères + barre + banc' },
  { value: 'minimal', label: 'Minimal / poids du corps', sub: 'Pas de matériel ou très léger' },
];

export function TrainingSetupWizard({ objective, sex, age, onConfirm, onBrowseAll }: Props) {
  const [step, setStep] = useState<Step>('intro');
  const [level, setLevel] = useState<TrainingLevel | null>(null);
  const [frequency, setFrequency] = useState<TrainingFrequency | null>(null);
  const [equipment, setEquipment] = useState<EquipmentAccess | null>(null);

  const result = useMemo(() => {
    if (!level || !frequency || !equipment) return null;
    return assignProgram({
      objective,
      sex,
      age,
      trainingLevel: level,
      trainingFrequency: frequency,
      equipmentAccess: equipment,
    });
  }, [objective, sex, age, level, frequency, equipment]);

  const recommendedProgram = result ? PROGRAMS[result.programId] : null;

  return (
    <View style={styles.container}>
      {step === 'intro' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Text style={styles.title}>Configure ton entraînement</Text>
          <Text style={styles.subtitle}>
            3 questions pour qu'on te trouve le programme qui colle vraiment à toi.
          </Text>
          <View style={styles.stepsPreview}>
            <StepDot index={1} label="Niveau" />
            <StepDot index={2} label="Fréquence" />
            <StepDot index={3} label="Matériel" />
          </View>
          <Pressable style={styles.primaryBtn} onPress={() => setStep('level')}>
            <Text style={styles.primaryBtnText}>Commencer</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={onBrowseAll}>
            <Text style={styles.skipBtnText}>Voir tous les programmes →</Text>
          </Pressable>
        </Animated.View>
      )}

      {step === 'level' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={1} />
          <Text style={styles.question}>Depuis quand t'entraînes-tu sérieusement ?</Text>
          <Text style={styles.questionHint}>
            Sérieusement = au moins 3 mois avec barre / haltères, pas juste les pompes du matin.
          </Text>
          {LEVEL_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              onPress={() => {
                setLevel(opt.value);
                setStep('frequency');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'frequency' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={2} />
          <Text style={styles.question}>Combien de séances par semaine ?</Text>
          <Text style={styles.questionHint}>
            Sois honnête sur ce que tu peux tenir sur la durée — pas ce que tu rêverais de faire.
          </Text>
          {FREQUENCY_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              onPress={() => {
                setFrequency(opt.value);
                setStep('equipment');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'equipment' && (
        <Animated.View entering={FadeInUp.duration(250)}>
          <StepHeader current={3} />
          <Text style={styles.question}>Tu t'entraînes où ?</Text>
          <Text style={styles.questionHint}>
            Choisis l'option qui décrit la majorité de tes séances.
          </Text>
          {EQUIPMENT_OPTIONS.map((opt) => (
            <ChoiceCard
              key={opt.value}
              label={opt.label}
              sub={opt.sub}
              onPress={() => {
                setEquipment(opt.value);
                setStep('result');
              }}
            />
          ))}
        </Animated.View>
      )}

      {step === 'result' && result && recommendedProgram && level && frequency && equipment && (
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
          </View>

          <View style={styles.metaRow}>
            <MetaPill label="Fréquence" value={`${recommendedProgram.daysPerWeek}j/sem`} />
            <MetaPill label="Niveau" value={level === 'expert' ? 'Avancé' : level === 'advanced' ? 'Avancé' : level === 'intermediate' ? 'Intermédiaire' : 'Débutant'} />
          </View>

          {/* Aperçu des exercices de la séance 1 */}
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
            onPress={() => onConfirm(result.programId, level, frequency, equipment)}
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
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}

function StepHeader({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={styles.stepHeader}>
      {[1, 2, 3].map((n) => (
        <View
          key={n}
          style={[
            styles.stepHeaderBar,
            n <= current ? styles.stepHeaderBarActive : null,
          ]}
        />
      ))}
    </View>
  );
}

function ChoiceCard({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.choiceCard} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceLabel}>{label}</Text>
        <Text style={styles.choiceSub}>{sub}</Text>
      </View>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
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
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  stepDot: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
  },
  stepHeader: {
    flexDirection: 'row',
    gap: 6,
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
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: spacing.sm,
  },
  choiceLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  choiceSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
  },
  reasonCard: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
    borderRadius: 14,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  reasonLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  reasonBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  warnings: {
    marginTop: spacing.md,
    gap: 4,
  },
  warning: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metaPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: spacing.md,
  },
  metaPillLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaPillValue: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  previewBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
  },
  previewName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
  },
  previewReps: {
    fontFamily: fonts.data,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  previewMore: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  primaryBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.5)',
  },
});
