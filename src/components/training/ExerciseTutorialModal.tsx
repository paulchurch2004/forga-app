import React from 'react';
import { View, Text, Pressable, Modal, Linking, ScrollView, Platform, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { makeStyles, fonts, fontSizes, spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';
import { EXERCISES } from '../../data/exercises';
import { EXERCISE_TUTORIALS } from '../../data/exerciseTips';

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) =>
    H.impactAsync(H.ImpactFeedbackStyle.Medium)
  ).catch(() => {});
};

interface ExerciseTutorialModalProps {
  visible: boolean;
  exerciseId: string | null;
  onClose: () => void;
}

export function ExerciseTutorialModal({
  visible,
  exerciseId,
  onClose,
}: ExerciseTutorialModalProps) {
  const { t } = useT();
  const styles = useStyles();
  const { colors } = useTheme();

  if (!exerciseId) return null;
  const tutorial = EXERCISE_TUTORIALS[exerciseId];
  const exercise = EXERCISES[exerciseId];
  if (!tutorial || !exercise) return null;

  const handleWatchVideo = () => {
    triggerHaptic();
    Linking.openURL(tutorial.videoUrl);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke={styles.closeIcon.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {/* Exercise name */}
            <Text style={styles.title}>{t(exercise.nameKey as any)}</Text>
            <Text style={styles.subtitle}>{t('exerciseTutorial')}</Text>

            {/* Animated GIF demo */}
            {exercise.gifUrl && (
              <View style={styles.gifContainer}>
                <Image
                  source={{ uri: exercise.gifUrl }}
                  style={styles.gifImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Video button */}
            <Pressable style={styles.videoBtn} onPress={handleWatchVideo}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M5 3l14 9-14 9V3z" fill={colors.white} />
              </Svg>
              <Text style={styles.videoBtnText}>{t('watchTutorial')}</Text>
            </Pressable>

            {/* Tips section */}
            <Text style={styles.tipsHeader}>{t('formTips')}</Text>
            {tutorial.tipKeys.map((tipKey) => (
              <View key={tipKey} style={styles.tipRow}>
                <Text style={styles.tipBullet}>{'\u25A0'}</Text>
                <Text style={styles.tipText}>{t(tipKey as any)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  card: {
    width: '100%' as any,
    maxWidth: 380,
    maxHeight: '80%' as any,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 0,
    padding: spacing['2xl'],
  },
  closeBtn: {
    position: 'absolute' as const,
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
  },
  closeIcon: {
    color: colors.textSecondary,
  },
  scrollView: {
    flexGrow: 0,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
    paddingRight: spacing['2xl'],
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },
  gifContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
    backgroundColor: '#f0f0f5',
    borderRadius: spacing.md,
    overflow: 'hidden' as const,
  },
  gifImage: {
    width: 280,
    height: 200,
  },
  videoBtn: {
    backgroundColor: colors.primary,
    borderRadius: 0,
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  videoBtnText: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    fontWeight: '800' as const,
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  tipsHeader: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xs,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.md,
  },
  tipRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipBullet: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginTop: 2,
  },
  tipText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },
}));
