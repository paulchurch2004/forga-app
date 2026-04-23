import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

export interface CompareFeature {
  text: string;
  free: string | 'unavailable';
}

interface CompareTableProps {
  features: CompareFeature[];
}

export function CompareTable({ features }: CompareTableProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.headerCellLeft]}>FONCTIONNALITÉ</Text>
        <Text style={[styles.headerCell, styles.headerCellMid]}>GRATUIT</Text>
        <Text style={[styles.headerCell, styles.headerCellPro]}>PRO</Text>
      </View>

      {features.map((f, i) => (
        <View key={i} style={[styles.row, i < features.length - 1 && styles.rowBorder]}>
          <Text style={styles.featureText} numberOfLines={2}>{f.text}</Text>
          <View style={styles.cellMid}>
            {f.free === 'unavailable' ? (
              <CrossIcon />
            ) : (
              <Text style={styles.freeText} numberOfLines={2}>{f.free}</Text>
            )}
          </View>
          <View style={styles.cellPro}>
            <CheckIcon />
          </View>
        </View>
      ))}
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

function CrossIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6 L18 18 M18 6 L6 18" stroke="#FF4757" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  headerCell: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  headerCellLeft: {
    flex: 1,
    color: 'rgba(255,255,255,0.38)',
  },
  headerCellMid: {
    width: 80,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.38)',
  },
  headerCellPro: {
    width: 64,
    textAlign: 'center',
    color: '#FF6B35',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  featureText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    paddingRight: 8,
  },
  cellMid: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    textAlign: 'center',
  },
  cellPro: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
