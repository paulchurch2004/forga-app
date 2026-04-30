import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export type SetCardState = 'done' | 'current' | 'upcoming';

interface SetCardV2Props {
  index: number; // 1-based
  state: SetCardState;
  weight: string; // editable string
  reps: string; // editable string
  targetReps?: number;
  /** % of 1RM this weight represents (0 = unknown, hides the hint). */
  percentOneRM?: number;
  onChangeWeight?: (v: string) => void;
  onChangeReps?: (v: string) => void;
  onValidate?: () => void;
}

export function SetCardV2({
  index,
  state,
  weight,
  reps,
  targetReps,
  percentOneRM,
  onChangeWeight,
  onChangeReps,
  onValidate,
}: SetCardV2Props) {
  const isDone = state === 'done';
  const isCurrent = state === 'current';

  const borderColor = isCurrent
    ? 'rgba(255,107,53,0.40)'
    : isDone
    ? 'rgba(0,212,170,0.25)'
    : 'rgba(255,255,255,0.08)';

  const indexColor = isCurrent ? '#FF6B35' : isDone ? '#00D4AA' : 'rgba(255,255,255,0.38)';

  return (
    <View
      style={[
        styles.card,
        { borderColor },
        isCurrent && styles.cardCurrent,
      ]}
    >
      <Text style={[styles.index, { color: indexColor }]}>
        {String(index).padStart(2, '0')}
      </Text>

      <View style={styles.fields}>
        <Field
          label="POIDS"
          value={weight}
          unit="kg"
          editable={isCurrent}
          onChangeText={onChangeWeight}
          isDone={isDone}
          hint={percentOneRM && percentOneRM > 0 ? `${percentOneRM}% 1RM` : undefined}
        />
        <Field
          label="REPS"
          value={isDone ? reps : reps || (targetReps !== undefined ? String(targetReps) : '')}
          editable={isCurrent}
          onChangeText={onChangeReps}
          isDone={isDone}
        />
      </View>

      {isDone && (
        <View style={styles.checkBadge}>
          <CheckIcon />
        </View>
      )}
      {isCurrent && (
        <Pressable onPress={onValidate} style={({ pressed }) => [styles.validateBtn, pressed && styles.pressed]}>
          <Text style={styles.validateText}>VALIDER</Text>
        </Pressable>
      )}
    </View>
  );
}

function Field({
  label,
  value,
  unit,
  editable,
  onChangeText,
  isDone,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  editable: boolean;
  onChangeText?: (v: string) => void;
  isDone: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={styles.fieldInput}
          />
        ) : (
          <Text style={[styles.fieldValueStatic, isDone && styles.fieldValueDone]} numberOfLines={1}>
            {value || '—'}
          </Text>
        )}
        {unit ? <Text style={styles.fieldUnit}>{unit}</Text> : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

function CheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#00D4AA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 8,
  },
  cardCurrent: {
    backgroundColor: 'rgba(255,107,53,0.04)',
  },
  index: {
    fontFamily: fonts.data,
    fontSize: 14,
    fontWeight: '700',
    width: 32,
  },
  fields: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.data,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    padding: 0,
    minHeight: 22,
  },
  fieldValueStatic: {
    fontFamily: fonts.data,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldValueDone: {
    color: 'rgba(255,255,255,0.62)',
  },
  fieldUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  fieldHint: {
    fontFamily: fonts.data,
    fontSize: 9.5,
    color: '#FF6B35',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  checkBadge: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.85,
  },
  validateText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
