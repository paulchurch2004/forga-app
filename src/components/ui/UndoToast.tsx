import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useT } from '../../i18n';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoToast({ message, onUndo, onDismiss, duration = 4000 }: UndoToastProps) {
  const { t } = useT();
  const styles = useStyles();

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={onUndo} style={styles.undoButton}>
        <Text style={styles.undoText}>{t('undo')}</Text>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.text,
    borderRadius: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    zIndex: 100,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.background,
    flex: 1,
  },
  undoButton: {
    marginLeft: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  undoText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.primary,
    textTransform: 'uppercase',
  },
}));
