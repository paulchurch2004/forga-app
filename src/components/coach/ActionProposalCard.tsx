import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';
import {
  describeAction,
  executeCoachAction,
  DESTRUCTIVE_ACTIONS,
  type CoachAction,
} from '../../services/coachActions';

interface ActionProposalCardProps {
  action: CoachAction;
  /** Persisted state ('pending' by default, switches to confirmed/dismissed). */
  initialState?: 'pending' | 'confirmed' | 'dismissed';
  onStateChange?: (state: 'confirmed' | 'dismissed') => void;
}

export function ActionProposalCard({ action, initialState = 'pending', onStateChange }: ActionProposalCardProps) {
  const [state, setState] = useState<'pending' | 'confirmed' | 'dismissed' | 'busy' | 'awaiting-confirm'>(initialState);
  const meta = describeAction(action);
  const isDestructive = DESTRUCTIVE_ACTIONS.includes(action.type);

  const handleConfirmFirst = () => {
    if (isDestructive) {
      setState('awaiting-confirm');
    } else {
      void doExecute();
    }
  };

  const doExecute = async () => {
    setState('busy');
    try {
      await executeCoachAction(action);
      setState('confirmed');
      onStateChange?.('confirmed');
    } catch {
      setState('pending');
    }
  };

  const handleDismiss = () => {
    setState('dismissed');
    onStateChange?.('dismissed');
  };

  if (state === 'dismissed') {
    return (
      <View style={styles.dismissed}>
        <Text style={styles.dismissedText}>Proposition ignorée</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.glow} pointerEvents="none" />

      <Text style={styles.tag}>{meta.tag.toUpperCase()}</Text>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.subtitle}>{meta.subtitle}</Text>

      {state === 'confirmed' ? (
        <View style={styles.confirmedRow}>
          <CheckIcon />
          <Text style={styles.confirmedText}>Appliqué</Text>
        </View>
      ) : state === 'awaiting-confirm' ? (
        <>
          <Text style={styles.warnText}>
            ⚠️ Cette action modifie tes paramètres / ton plan. Confirme une seconde fois.
          </Text>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => setState('pending')}
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
            >
              <Text style={styles.btnSecondaryText}>Retour</Text>
            </Pressable>
            <Pressable
              onPress={doExecute}
              style={({ pressed }) => [styles.btnPrimaryWrap, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={['#FF6B6B', '#CC5424']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnPrimary}
              >
                <Text style={styles.btnPrimaryText}>Confirmer</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleDismiss}
            disabled={state === 'busy'}
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.btnSecondaryText}>Annuler</Text>
          </Pressable>
          <Pressable
            onPress={handleConfirmFirst}
            disabled={state === 'busy'}
            style={({ pressed }) => [styles.btnPrimaryWrap, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={isDestructive ? ['#FFC94D', '#FF8C40'] : ['#FF8C40', '#FF5A1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>{state === 'busy' ? '…' : isDestructive ? 'Examiner' : 'Valider'}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#00D4AA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    padding: 14,
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,107,53,0.20)',
    opacity: 0.5,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#FF6B35',
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '600',
  },
  btnPrimaryWrap: {
    flex: 1.4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  btnPrimary: {
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  confirmedText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '700',
  },
  warnText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FFC94D',
    marginTop: 10,
    lineHeight: 15,
  },
  dismissed: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 14,
  },
  dismissedText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    fontStyle: 'italic',
  },
});
