import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';

interface RecipeStepsProps {
  steps: string[];
}

export function RecipeSteps({ steps }: RecipeStepsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preparation</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  stepNumber: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.white,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
    paddingTop: 4,
  },
});

export default RecipeSteps;
