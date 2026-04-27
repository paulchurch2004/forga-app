import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';

export interface SessionAction {
  id: string;
  label: string;
  description?: string;
  icon: 'up' | 'skip' | 'eye' | 'replace' | 'trash';
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

interface SessionActionsSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: SessionAction[];
}

export function SessionActionsSheet({ open, onClose, title, subtitle, actions }: SessionActionsSheetProps) {
  return (
    <ProfileSheet
      open={open}
      onClose={onClose}
      title={title ?? 'Actions de séance'}
      subtitle={subtitle}
    >
      {actions.map((a) => (
        <Pressable
          key={a.id}
          disabled={a.disabled}
          onPress={() => {
            a.onPress();
            onClose();
          }}
          style={({ pressed }) => [
            styles.row,
            a.disabled && styles.rowDisabled,
            pressed && !a.disabled && styles.pressed,
          ]}
        >
          <View style={[styles.iconWrap, a.destructive && styles.iconWrapDanger]}>
            <ActionIcon name={a.icon} color={a.destructive ? '#FF6B6B' : '#FF6B35'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, a.destructive && styles.labelDanger, a.disabled && styles.labelDisabled]}>
              {a.label}
            </Text>
            {a.description && (
              <Text style={styles.description}>{a.description}</Text>
            )}
          </View>
          <ChevronRightIcon />
        </Pressable>
      ))}
    </ProfileSheet>
  );
}

function ActionIcon({ name, color }: { name: SessionAction['icon']; color: string }) {
  const stroke = color;
  if (name === 'up') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M12 19 V5 M5 12 L12 5 L19 12" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'skip') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M5 4 L19 12 L5 20 Z M19 5 V19" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (name === 'eye') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M2 12 S5 5 12 5 22 12 22 12 19 19 12 19 2 12 2 12Z" stroke={stroke} strokeWidth={2} />
        <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke={stroke} strokeWidth={2} />
      </Svg>
    );
  }
  if (name === 'replace') {
    return (
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M4 8 H17 L13 4 M20 16 H7 L11 20" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 20 H17 L18 7" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6 L15 12 L9 18" stroke="rgba(255,255,255,0.38)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: 8,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderColor: 'rgba(255,107,107,0.30)',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  labelDanger: {
    color: '#FF6B6B',
  },
  labelDisabled: {
    color: 'rgba(255,255,255,0.38)',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
});
