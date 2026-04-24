import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export interface SelectedDayExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // "8-10" or "10"
  weightKg?: number;
  restSec?: number;
}

export type SelectedDayState = 'today' | 'done' | 'rest' | 'plan';

interface SelectedDayCardProps {
  state: SelectedDayState;
  /** Type label, e.g. "Push" or "Pull" */
  typeLabel: string;
  /** Estimated minutes for the session */
  durationMin: number;
  /** Bold title — muscle groups joined ("Pectoraux & Épaules") */
  title: string;
  /** Optional intention quote, only shown for `today` */
  intentionQuote?: string;
  /** Muscle chips */
  muscleChips?: string[];
  /** Top 3 exercises preview */
  exercisesPreview?: SelectedDayExercise[];
  /** Total exercises count, for the "Voir les N exercices" CTA */
  totalExercises?: number;
  /** Volume in kg, only shown for `done` */
  volumeKg?: number;
  /** Weekday label for the card title fallback ("jeudi") */
  weekdayLabel?: string;

  onStart?: () => void;
  onSeeAll?: () => void;
  onActions?: () => void;
  onMoveUp?: () => void;
  onSkip?: () => void;
  onSeeSummary?: () => void;
  onDuplicate?: () => void;
  onForceWorkout?: () => void;
  onExercisePress?: (exercise: SelectedDayExercise) => void;
}

const ACCENT = '#FF6B35';
const SUCCESS = '#00D4AA';

export function SelectedDayCard(props: SelectedDayCardProps) {
  if (props.state === 'rest') return <RestCard {...props} />;
  if (props.state === 'done') return <DoneCard {...props} />;
  return <PlannedCard {...props} />;
}

/* ─── REST ─────────────────────────────────── */

function RestCard({ onForceWorkout }: SelectedDayCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.restMedallion}>
        <MoonIcon />
      </View>
      <Text style={styles.restTitle}>Récupération</Text>
      <Text style={styles.restText}>
        Le muscle se construit au repos.{'\n'}Marche 20 min, étire, dors tôt.
      </Text>
      <Pressable onPress={onForceWorkout} style={({ pressed }) => [styles.restCta, pressed && styles.pressed]}>
        <Text style={styles.restCtaText}>Je veux m'entraîner quand même</Text>
      </Pressable>
    </View>
  );
}

/* ─── DONE ─────────────────────────────────── */

function DoneCard({ title, durationMin, volumeKg, onSeeSummary, onDuplicate }: SelectedDayCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.doneHeaderRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.doneEyebrowRow}>
            <CheckIcon color={SUCCESS} />
            <Text style={styles.doneEyebrow}>TERMINÉE · {durationMin} MIN</Text>
          </View>
          <Text style={styles.doneTitle}>{title}</Text>
        </View>
        {volumeKg && volumeKg > 0 ? (
          <Text style={styles.doneVolume}>{volumeKg.toLocaleString('fr-FR')} kg</Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.doneActionsRow}>
        <Pressable onPress={onSeeSummary} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
          <EyeIcon />
          <Text style={styles.actionBtnText}>Voir le résumé</Text>
        </Pressable>
        <Pressable onPress={onDuplicate} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
          <CopyIcon />
          <Text style={styles.actionBtnText}>Dupliquer</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── PLANNED (today / future plan) ─────────── */

function PlannedCard({
  state,
  typeLabel,
  durationMin,
  title,
  intentionQuote,
  muscleChips,
  exercisesPreview,
  totalExercises,
  onStart,
  onSeeAll,
  onActions,
  onMoveUp,
  onSkip,
  onExercisePress,
}: SelectedDayCardProps) {
  const isToday = state === 'today';
  const previewLimit = 3;
  const hasMore = (totalExercises ?? 0) > previewLimit;

  return (
    <View style={styles.card}>
      <View style={styles.plannedHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.plannedEyebrow}>{typeLabel.toUpperCase()} · {durationMin} MIN</Text>
          <Text style={styles.plannedTitle}>{title}</Text>
        </View>
        <Pressable onPress={onActions} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <MoreIcon />
        </Pressable>
      </View>

      {isToday && intentionQuote && (
        <View style={styles.intentionBox}>
          <Text style={styles.intentionEyebrow}>OBJECTIF SÉANCE</Text>
          <Text style={styles.intentionQuote}>"{intentionQuote}"</Text>
        </View>
      )}

      {muscleChips && muscleChips.length > 0 && (
        <View style={styles.chipsRow}>
          {muscleChips.map((c) => (
            <View key={c} style={styles.chip}>
              <Text style={styles.chipText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {exercisesPreview && exercisesPreview.length > 0 && (
        <>
          {exercisesPreview.slice(0, previewLimit).map((ex, i) => (
            <Pressable
              key={ex.id}
              onPress={() => onExercisePress?.(ex)}
              style={({ pressed }) => [styles.exerciseRow, pressed && styles.pressed]}
            >
              <Text style={styles.exerciseIndex}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                {ex.weightKg !== undefined && ex.restSec !== undefined && (
                  <Text style={styles.exerciseMeta}>
                    {ex.weightKg}kg · rec {Math.floor(ex.restSec / 60)}:{String(ex.restSec % 60).padStart(2, '0')}
                  </Text>
                )}
              </View>
              <Text style={styles.exerciseTarget}>{ex.sets}×{ex.reps}</Text>
              <ChevronRightIcon />
            </Pressable>
          ))}
          {hasMore && (
            <Pressable onPress={onSeeAll} style={({ pressed }) => [styles.seeAllBtn, pressed && styles.pressed]}>
              <Text style={styles.seeAllText}>Voir les {totalExercises} exercices →</Text>
            </Pressable>
          )}
        </>
      )}

      {isToday && onStart && (
        <Pressable onPress={onStart} style={({ pressed }) => [pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FF8C40', '#FF5A1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startBtn}
          >
            <PlayIcon />
            <Text style={styles.startBtnText}>Commencer la séance</Text>
          </LinearGradient>
        </Pressable>
      )}

      {state === 'plan' && (
        <View style={styles.planActionsRow}>
          <Pressable onPress={onMoveUp} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
            <Text style={styles.actionBtnText}>Avancer</Text>
          </Pressable>
          <Pressable onPress={onSkip} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
            <Text style={styles.actionBtnText}>Sauter</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ─── ICONS ─────────────────────────────────── */

function MoonIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.8 A9 9 0 1 1 11.2 3 a7 7 0 0 0 9.8 9.8 Z" stroke="rgba(255,255,255,0.62)" strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function CheckIcon({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12 S5 5 12 5 22 12 22 12 19 19 12 19 2 12 2 12Z" stroke="#FFFFFF" strokeWidth={1.8} />
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#FFFFFF" strokeWidth={1.8} />
    </Svg>
  );
}

function CopyIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M9 9 H20 V20 H9 Z M5 4 H16 V15" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MoreIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 h.01 M12 12 h.01 M19 12 h.01" stroke="rgba(255,255,255,0.62)" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.38)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlayIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4 L20 12 L7 20 Z" fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },
  pressed: {
    opacity: 0.85,
  },
  /* Rest */
  restMedallion: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  restTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  restText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  restCta: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    alignSelf: 'center',
  },
  restCtaText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  /* Done */
  doneHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doneEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doneEyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: SUCCESS,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  doneTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  doneVolume: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: ACCENT,
  },
  doneActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  /* Planned */
  plannedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plannedEyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: ACCENT,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  plannedTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intentionBox: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderLeftWidth: 2,
    borderLeftColor: ACCENT,
    borderRadius: 8,
  },
  intentionEyebrow: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    color: ACCENT,
    fontWeight: '700',
  },
  intentionQuote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  exerciseIndex: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    width: 20,
  },
  exerciseName: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  exerciseMeta: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  exerciseTarget: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
  },
  seeAllBtn: {
    paddingVertical: 10,
    paddingBottom: 14,
  },
  seeAllText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
    textAlign: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  startBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  planActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  actionBtnText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
