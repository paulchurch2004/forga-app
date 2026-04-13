import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import type { TrainingProgram } from '../../types/program';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Light)
  ).catch(() => {});
};

interface Props {
  program: TrainingProgram;
  onChangePress: () => void;
}

export function ProgramCard({ program, onChangePress }: Props) {
  const styles = useStyles();
  const { t } = useT();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{t(program.nameKey as any)}</Text>
          <Text style={styles.meta}>
            {t('daysPerWeek', { count: program.daysPerWeek })}
            {'  '}
            {t(program.levelKey as any)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            triggerHaptic();
            onChangePress();
          }}
          hitSlop={12}
        >
          <Text style={styles.changeBtn}>{t('changeProgram')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  changeBtn: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.primary,
    letterSpacing: 1,
  },
}));
