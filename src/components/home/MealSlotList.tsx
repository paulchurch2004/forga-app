import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useT } from '../../i18n';
import { MEAL_SLOT_LABELS, type MealSlot, type MealSlotStatus } from '../../types/meal';

interface SlotItem {
  slot: MealSlot;
  status: MealSlotStatus;
  time: string;
  isValidated: boolean;
}

interface MealSlotListProps {
  slots: SlotItem[];
}

function StatusIcon({ status }: { status: MealSlotStatus }) {
  const styles = useStyles();

  if (status === 'done') {
    return (
      <View style={[styles.statusCircle, styles.statusDone]}>
        <Text style={styles.statusCheckmark}>{'\u2713'}</Text>
      </View>
    );
  }

  if (status === 'current') {
    return (
      <View style={[styles.statusCircle, styles.statusCurrent]}>
        <View style={styles.statusDot} />
      </View>
    );
  }

  return (
    <View style={[styles.statusCircle, styles.statusUpcoming]} />
  );
}

function SlotRow({ item }: { item: SlotItem }) {
  const { t } = useT();
  const styles = useStyles();
  const label = MEAL_SLOT_LABELS[item.slot];

  const handleChoose = () => {
    router.navigate('/(tabs)/meals');
  };

  const handleCustom = () => {
    router.push(`/meal/custom?slot=${item.slot}`);
  };

  return (
    <View style={[styles.slotRow, item.status === 'current' && styles.slotRowCurrent]}>
      <StatusIcon status={item.status} />
      <View style={styles.slotInfo}>
        <Text
          style={[
            styles.slotLabel,
            item.status === 'done' && styles.slotLabelDone,
          ]}
        >
          {label}
        </Text>
        <Text style={styles.slotTime}>{item.time}</Text>
      </View>
      <View style={styles.slotAction}>
        {item.status === 'done' && (
          <Text style={styles.validatedText}>{t('mealDone')}</Text>
        )}
        {item.status === 'current' && (
          <View style={styles.actionRow}>
            <Pressable style={styles.customButton} onPress={handleCustom}>
              <Text style={styles.customButtonText}>{t('mealFree')}</Text>
            </Pressable>
            <Pressable style={styles.chooseButton} onPress={handleChoose}>
              <Text style={styles.chooseButtonText}>{t('mealChoose')}</Text>
            </Pressable>
          </View>
        )}
        {item.status === 'upcoming' && (
          <View style={styles.actionRow}>
            <Pressable style={styles.customButton} onPress={handleCustom}>
              <Text style={styles.customButtonText}>{t('mealFree')}</Text>
            </Pressable>
            <Pressable style={styles.chooseButton} onPress={handleChoose}>
              <Text style={styles.chooseButtonText}>{t('mealChoose')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export function MealSlotList({ slots }: MealSlotListProps) {
  const { t } = useT();
  const styles = useStyles();

  return (
    <Card header={t('mealsOfTheDay')} noPadding>
      <View style={styles.listContainer}>
        {slots.map((item, index) => (
          <React.Fragment key={item.slot}>
            <SlotRow item={item} />
            {index < slots.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>
    </Card>
  );
}

const useStyles = makeStyles((colors) => ({
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  slotRowCurrent: {
    backgroundColor: colors.surfaceHover,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statusDone: {
    backgroundColor: colors.success,
  },
  statusCurrent: {
    backgroundColor: colors.primary,
  },
  statusUpcoming: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  statusCheckmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  slotLabelDone: {
    color: colors.textSecondary,
  },
  slotTime: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  slotAction: {
    marginLeft: spacing.sm,
  },
  validatedText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.success,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customButton: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  chooseButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chooseButtonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  upcomingText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
}));

export default MealSlotList;
