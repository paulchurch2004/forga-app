import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { PROGRAMS, PROGRAM_IDS } from '../../data/programs';
import type { ProgramId } from '../../types/program';
import type { Objective } from '../../types/user';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Medium)
  ).catch(() => {});
};

interface Props {
  recommendedId: ProgramId;
  objective: Objective;
  onSelect: (programId: ProgramId, objective: Objective) => void;
}

export function ProgramSelector({ recommendedId, objective, onSelect }: Props) {
  const styles = useStyles();
  const { t } = useT();

  // Recommended first, then the rest
  const ordered = [
    recommendedId,
    ...PROGRAM_IDS.filter((id) => id !== recommendedId),
  ];

  return (
    <View>
      <Text style={styles.subtitle}>{t('basedOnProfile')}</Text>

      {ordered.map((id, idx) => {
        const program = PROGRAMS[id];
        const isRecommended = id === recommendedId;

        return (
          <Animated.View
            key={id}
            entering={FadeInDown.delay(idx * 100).duration(400)}
          >
            <Pressable
              style={[styles.card, isRecommended && styles.cardRecommended]}
              onPress={() => {
                triggerHaptic();
                onSelect(id as ProgramId, objective);
              }}
            >
              {isRecommended && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('recommendedForYou')}</Text>
                </View>
              )}

              <Text style={[styles.name, isRecommended && styles.nameRecommended]}>
                {t(program.nameKey as any)}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.days}>
                  {t('daysPerWeek', { count: program.daysPerWeek })}
                </Text>
                <Text style={styles.level}>{t(program.levelKey as any)}</Text>
              </View>

              <Text style={styles.desc}>
                {t(program.descriptionKey as any)}
              </Text>

              <View style={[styles.selectBtn, isRecommended && styles.selectBtnRecommended]}>
                <Text style={[styles.selectBtnText, isRecommended && styles.selectBtnTextRecommended]}>
                  {t('selectProgram')}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  cardRecommended: {
    borderColor: colors.primary,
  },
  badge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.white,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  nameRecommended: {
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  days: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  level: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  selectBtn: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  selectBtnRecommended: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  selectBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: 1,
  },
  selectBtnTextRecommended: {
    color: colors.white,
  },
}));
