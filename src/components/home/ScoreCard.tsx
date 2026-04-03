import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Card } from '../ui/Card';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import type { ForgaScore } from '../../types/score';

interface ScoreCardProps {
  score: ForgaScore;
  weeklyChange: number;
}

export function ScoreCard({ score, weeklyChange }: ScoreCardProps) {
  const { colors } = useTheme();
  const { t } = useT();
  const styles = useStyles();
  const [expanded, setExpanded] = useState(false);
  const contentHeight = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
    contentHeight.value = withTiming(expanded ? 0 : 1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  };

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: contentHeight.value * 200,
    opacity: contentHeight.value,
    overflow: 'hidden' as const,
  }));

  const changeColor = weeklyChange >= 0 ? colors.success : colors.error;
  const changePrefix = weeklyChange >= 0 ? '+' : '';

  return (
    <Card
      header={t('scoreForga')}
      headerRight={
        <View style={styles.changeBadge}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {t('ptsThisWeek', { change: `${changePrefix}${weeklyChange}` })}
          </Text>
        </View>
      }
      onPress={toggleExpand}
    >
      <ScoreDisplay
        score={score}
        size={140}
        strokeWidth={10}
        animationDuration={1000}
      />
      <Animated.View style={expandStyle}>
        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>{t('pillarDetails')}</Text>
          <DetailRow
            label={t('pillarNutrition')}
            value={score.nutrition}
            max={40}
            color={colors.primary}
          />
          <DetailRow
            label={t('pillarConsistency')}
            value={score.consistency}
            max={30}
            color={colors.carbs}
          />
          <DetailRow
            label={t('pillarProgression')}
            value={score.progression}
            max={20}
            color={colors.fat}
          />
          <DetailRow
            label={t('pillarDiscipline')}
            value={score.discipline}
            max={10}
            color={colors.calories}
          />
        </View>
      </Animated.View>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const styles = useStyles();
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>
          {Math.round(value)}/{max}
        </Text>
      </View>
      <View style={styles.detailTrack}>
        <View
          style={[
            styles.detailFill,
            { width: `${Math.min(100, percent)}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  changeBadge: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  changeText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  detailSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  detailTrack: {
    height: 4,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  detailFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
}));

export default ScoreCard;
