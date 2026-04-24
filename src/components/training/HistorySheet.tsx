import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ProfileSheet } from '../profile/ProfileSheet';
import { fonts } from '../../theme/fonts';

export interface HistoryItem {
  id: string;
  name: string;
  dateLabel: string; // "Aujourd'hui · 58 min"
  volumeLabel: string; // "9 220 kg"
  onPress: () => void;
}

interface HistorySheetProps {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
}

export function HistorySheet({ open, onClose, items }: HistorySheetProps) {
  return (
    <ProfileSheet open={open} onClose={onClose} title="Historique" subtitle={`${items.length} séances enregistrées`}>
      {items.length === 0 ? (
        <Text style={styles.empty}>Pas encore de séance loggée. Commence ta première !</Text>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.iconWrap}>
              <DumbbellIcon />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.date}>{item.dateLabel}</Text>
            </View>
            {item.volumeLabel ? <Text style={styles.volume}>{item.volumeLabel}</Text> : null}
            <ChevronRightIcon />
          </Pressable>
        ))
      )}
    </ProfileSheet>
  );
}

function DumbbellIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 V18 M3 9 V15 M18 6 V18 M21 9 V15 M6 12 H18" stroke="rgba(255,255,255,0.62)" strokeWidth={2} strokeLinecap="round" />
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
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
    paddingVertical: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  volume: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: '#FF6B35',
  },
});
