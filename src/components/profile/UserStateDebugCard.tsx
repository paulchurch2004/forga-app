import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';
import { useUserState, useUserSuggestion } from '../../hooks/useUserState';
import type { SuggestionState } from '../../engine/userStateEngine';

/**
 * Read-only debug card for FORGA Core State.
 * Mount on the profile (gated by __DEV__) to validate the model
 * makes sense across ~1 week of real data before any auto-action is wired.
 */
export function UserStateDebugCard() {
  const state = useUserState();
  const suggestion = useUserSuggestion();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FORGA CORE STATE · DEBUG</Text>
        <Pressable onPress={() => setExpanded((v) => !v)} hitSlop={8}>
          <Text style={styles.toggle}>{expanded ? '−' : '+'}</Text>
        </Pressable>
      </View>

      {/* Cognitive layer — interpretation only, never enforced. */}
      <View style={[styles.suggestionBox, { borderColor: STATE_COLORS[suggestion.state] }]}>
        <View style={styles.suggestionHeaderRow}>
          <Text style={[styles.suggestionState, { color: STATE_COLORS[suggestion.state] }]}>
            {suggestion.state}
          </Text>
          <Text style={styles.suggestionConfidence}>
            confiance {Math.round(suggestion.confidence * 100)}%
          </Text>
        </View>
        {suggestion.insights.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.suggestionLabel}>FORGA observe</Text>
            {suggestion.insights.map((s, i) => (
              <Text key={i} style={styles.suggestionLine}>· {s}</Text>
            ))}
          </View>
        )}
        {suggestion.recommendations.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.suggestionLabel}>FORGA suggère</Text>
            {suggestion.recommendations.map((r, i) => (
              <Text key={i} style={styles.suggestionLine}>· {r}</Text>
            ))}
          </View>
        )}
        <Text style={styles.suggestionFootnote}>Lecture seule — aucune modification appliquée.</Text>
      </View>

      {/* Always-visible derived metrics — the 3 numbers that matter */}
      <View style={styles.derivedRow}>
        <DerivedTile label="Fatigue" value={state.derived.fatigueIndex} colorBand="warm" />
        <DerivedTile label="Readiness" value={state.derived.readinessScore} colorBand="cool" />
        <DerivedTile label="Progression" value={state.derived.progressionPotential} colorBand="accent" />
      </View>

      {!expanded && (
        <Text style={styles.hint}>
          Tap + pour voir tous les signaux et la trace de calcul.
        </Text>
      )}

      {expanded && (
        <View style={{ marginTop: 14, gap: 14 }}>
          <Section title="Body">
            <Row label="weight" value={state.body.weight} unit="kg" />
            <Row label="trend 7j" value={state.body.weightTrendKg7d} unit="kg" signed />
          </Section>

          <Section title="Training">
            <Row label="weeklyVolume" value={state.training.weeklyVolumeKg} unit="kg" />
            <Row label="weeklyTarget" value={state.training.weeklyVolumeTargetKg} unit="kg" muted />
            <Row label="adherence" value={state.training.adherenceScore} unit="%" />
            <Row label="lastWorkout" value={state.training.lastWorkoutDaysAgo} unit="j" />
          </Section>

          <Section title="Nutrition">
            <Row label="avgKcalDelta" value={state.nutrition.avgCaloriesDelta} unit="kcal" signed />
            <Row label="proteinConsistency" value={state.nutrition.proteinConsistency} unit="%" />
            <Row label="macroBalance" value={state.nutrition.macroBalance} unit="/100" />
          </Section>

          <Section title="Recovery">
            <Row label="energy" value={state.recovery.energy} unit="/100" />
            <Row label="sleep" value={state.recovery.sleepQuality} unit="/100" />
            <Row label="soreness" value={state.recovery.soreness} unit="/100" muted />
          </Section>

          <Section title="Behavior">
            <Row label="streak" value={state.behavior.streak} unit="j" />
            <Row label="skipped 7j" value={state.behavior.skippedDaysLast7} unit="j" />
          </Section>

          <Section title="Decision trace">
            {state.trace.map((t) => (
              <View key={t.metric} style={styles.traceBlock}>
                <Text style={styles.traceMetric}>
                  {t.metric} = {t.value ?? '—'}
                </Text>
                {t.inputs.map((inp) => (
                  <Text key={inp.name} style={styles.traceInput}>
                    · {inp.name}: {inp.value ?? '—'} × {inp.weight}
                    {inp.contribution !== null ? `  →  ${inp.contribution}` : ''}
                  </Text>
                ))}
                {t.notes && <Text style={styles.traceNote}>{t.notes}</Text>}
              </View>
            ))}
          </Section>
        </View>
      )}
    </View>
  );
}

function DerivedTile({
  label,
  value,
  colorBand,
}: {
  label: string;
  value: number | null;
  colorBand: 'warm' | 'cool' | 'accent';
}) {
  const color =
    colorBand === 'warm'
      ? value === null
        ? 'rgba(255,255,255,0.38)'
        : value >= 70
        ? '#FF6B6B'
        : value >= 40
        ? '#FFC94D'
        : '#00D4AA'
      : colorBand === 'cool'
      ? value === null
        ? 'rgba(255,255,255,0.38)'
        : value >= 70
        ? '#00D4AA'
        : value >= 40
        ? '#FFC94D'
        : '#FF6B6B'
      : '#FF6B35';

  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color }]}>{value ?? '—'}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  label,
  value,
  unit,
  signed,
  muted,
}: {
  label: string;
  value: number | null;
  unit?: string;
  signed?: boolean;
  muted?: boolean;
}) {
  let display: string;
  if (value === null || value === undefined) display = '—';
  else if (signed && value > 0) display = `+${value}`;
  else display = String(value);
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.muted]}>{label}</Text>
      <Text style={[styles.rowValue, muted && styles.muted]}>
        {display}
        {unit ? ` ${unit}` : ''}
      </Text>
    </View>
  );
}

const STATE_COLORS: Record<SuggestionState, string> = {
  PUSH: '#00D4AA',
  MAINTAIN: '#FFC94D',
  REDUCE: '#FF8C40',
  RECOVERY: '#FF6B6B',
  INSUFFICIENT_DATA: 'rgba(255,255,255,0.38)',
};

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  toggle: {
    fontFamily: fonts.data,
    fontSize: 18,
    color: 'rgba(255,255,255,0.62)',
    paddingHorizontal: 8,
  },
  derivedRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  suggestionBox: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 12,
  },
  suggestionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionState: {
    fontFamily: fonts.data,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  suggestionConfidence: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
  },
  suggestionLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.2,
    color: 'rgba(255,107,53,0.85)',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  suggestionLine: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
    marginBottom: 2,
  },
  suggestionFootnote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  tile: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    alignItems: 'center',
  },
  tileLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tileValue: {
    fontFamily: fonts.data,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.62)',
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionBody: {
    gap: 4,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
  },
  rowValue: {
    fontFamily: fonts.data,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  muted: {
    color: 'rgba(255,255,255,0.38)',
  },
  traceBlock: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  traceMetric: {
    fontFamily: fonts.data,
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '700',
    marginBottom: 2,
  },
  traceInput: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 14,
  },
  traceNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,201,77,0.85)',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
