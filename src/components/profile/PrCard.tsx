import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';
import { useT } from '../../i18n';

export interface PrItem {
  id: string;
  exercise: string;
  value: number;
  unit: string;
  previous?: number;
  delta?: number;
  dateLabel: string;
}

interface PrListProps {
  items: PrItem[];
}

export function PrList({ items }: PrListProps) {
  return (
    <View style={styles.list}>
      {items.map((pr) => (
        <PrCard key={pr.id} item={pr} />
      ))}
    </View>
  );
}

function PrCard({ item }: { item: PrItem }) {
  const { t } = useT();
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <FlameIcon />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.exo} numberOfLines={1}>{item.exercise}</Text>
        {item.previous !== undefined && (
          <Text style={styles.previous}>
            {t('prPreviousLabel', { value: item.previous, unit: item.unit, date: item.dateLabel })}
          </Text>
        )}
        {item.previous === undefined && <Text style={styles.previous}>{item.dateLabel}</Text>}
      </View>
      <View style={styles.valueCol}>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.unit}>{item.unit}</Text>
        </View>
        {item.delta !== undefined && item.delta !== 0 && (
          <Text style={styles.delta}>
            {item.delta > 0 ? '+' : ''}{item.delta} {item.unit}
          </Text>
        )}
      </View>
    </View>
  );
}

function FlameIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 C13 5 16 7 16 11 a4 4 0 1 1 -8 0 C8 9 9 7.5 10 7 C10 9 11 9.5 12 9 C12 7 12 4 12 2 Z"
        fill="#FF6B35"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exo: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previous: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
  valueCol: {
    alignItems: 'flex-end',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontFamily: fonts.data,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  delta: {
    fontFamily: fonts.data,
    fontSize: 10,
    color: '#00D4AA',
    marginTop: 2,
  },
});
