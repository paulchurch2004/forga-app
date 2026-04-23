import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export type CoachMode = 'presence' | 'conversation';

interface CoachModeToggleProps {
  mode: CoachMode;
  onChange: (mode: CoachMode) => void;
}

export function CoachModeToggle({ mode, onChange }: CoachModeToggleProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <ToggleButton label="Présence" icon={<EyeIcon active={mode === 'presence'} />} active={mode === 'presence'} onPress={() => onChange('presence')} />
        <ToggleButton label="Conversation" icon={<ChatIcon active={mode === 'conversation'} />} active={mode === 'conversation'} onPress={() => onChange('conversation')} />
      </View>
      <Text style={styles.helpText}>
        {mode === 'presence'
          ? "Il t'observe, note ce qu'il voit, et t'alerte au bon moment."
          : 'Pose tes questions, demande des conseils. Réponse instantanée.'}
      </Text>
    </View>
  );
}

function ToggleButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={styles.btnWrap}>
        <LinearGradient
          colors={['rgba(255,107,53,0.18)', 'rgba(255,107,53,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btn, styles.btnActive]}
        >
          {icon}
          <Text style={[styles.btnLabel, styles.btnLabelActive]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.btnWrap, styles.btn]}>
      {icon}
      <Text style={styles.btnLabel}>{label}</Text>
    </Pressable>
  );
}

function EyeIcon({ active }: { active: boolean }) {
  const color = active ? '#FF6B35' : 'rgba(255,255,255,0.38)';
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12 S5 5 12 5 22 12 22 12 19 19 12 19 2 12 2 12Z" stroke={color} strokeWidth={1.8} />
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  const color = active ? '#FF6B35' : 'rgba(255,255,255,0.38)';
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-5A8 8 0 1 1 21 12Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    padding: 4,
    gap: 2,
  },
  btnWrap: {
    flex: 1,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnActive: {
    borderColor: 'rgba(255,107,53,0.3)',
  },
  btnLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.38)',
  },
  btnLabelActive: {
    color: '#FF6B35',
  },
  helpText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 14,
  },
});
