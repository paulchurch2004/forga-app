import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';
import type { TrainingProgram, ProgramId } from '../../types/program';

interface ProgramSelectorSheetProps {
  open: boolean;
  onClose: () => void;
  programs: TrainingProgram[];
  currentId?: ProgramId;
  recommendedId?: ProgramId;
  onSelect: (id: ProgramId) => void;
  /** i18n resolver for nameKey / levelKey / descriptionKey */
  t: (key: string) => string;
}

export function ProgramSelectorSheet({
  open,
  onClose,
  programs,
  currentId,
  recommendedId,
  onSelect,
  t,
}: ProgramSelectorSheetProps) {
  return (
    <ProfileSheet open={open} onClose={onClose} title="Changer de programme" subtitle="Sélectionne le plan qui te ressemble">
      {programs.map((p) => {
        const isCurrent = p.id === currentId;
        const isRecommended = p.id === recommendedId;
        return (
          <Pressable
            key={p.id}
            onPress={() => {
              onSelect(p.id);
              onClose();
            }}
            style={({ pressed }) => [styles.row, isCurrent && styles.rowCurrent, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <DumbbellIcon active={isCurrent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowHeader}>
                <Text style={[styles.name, isCurrent && styles.nameCurrent]}>{t(p.nameKey)}</Text>
                {isRecommended && !isCurrent && <Text style={styles.recoBadge}>RECOMMANDÉ</Text>}
                {isCurrent && <Text style={styles.currentBadge}>ACTUEL</Text>}
              </View>
              <Text style={styles.meta}>
                {p.daysPerWeek}j/sem · {t(p.levelKey)}
                {p.sexVariant === 'male' ? ' · ♂' : p.sexVariant === 'female' ? ' · ♀' : ''}
              </Text>
            </View>
            {isCurrent ? <CheckIcon /> : <ChevronRightIcon />}
          </Pressable>
        );
      })}
    </ProfileSheet>
  );
}

function DumbbellIcon({ active }: { active: boolean }) {
  const color = active ? '#FF6B35' : 'rgba(255,255,255,0.62)';
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 V18 M3 9 V15 M18 6 V18 M21 9 V15 M6 12 H18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#FF6B35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: 8,
  },
  rowCurrent: {
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderColor: 'rgba(255,107,53,0.30)',
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nameCurrent: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  recoBadge: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#FF6B35',
    letterSpacing: 1,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderRadius: 4,
  },
  currentBadge: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: '#FF6B35',
    letterSpacing: 1,
    fontWeight: '700',
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 3,
  },
});
