import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts } from '../../theme/fonts';

interface SessionIntentionCardProps {
  intention: string;
}

export function SessionIntentionCard({ intention }: SessionIntentionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>OBJECTIF SÉANCE</Text>
      <Text style={styles.text}>{intention}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B35',
    borderRadius: 8,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: '#FF6B35',
    textTransform: 'uppercase',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 4,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
