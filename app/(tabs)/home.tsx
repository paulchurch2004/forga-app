import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { useWeightPrompt } from '../../src/hooks/useWeightPrompt';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { WeightPromptModal } from '../../src/components/ui/WeightPromptModal';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useT } from '../../src/i18n';
// WaterCard is displayed in nutrition.tsx, not on home

const CARD_IMAGES = {
  nutrition:
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
  training:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  space:
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
  community:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const profile = useUserStore((s) => s.profile);
  const { currentStreak, isTodayValidated } = useStreak();
  const tutorialStep = useSettingsStore((s) => s.tutorialStep);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const { shouldPrompt, daysSinceLastWeighIn } = useWeightPrompt();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const styles = useStyles();
  const { t } = useT();

  // Auto-start tutorial on first visit after onboarding
  useEffect(() => {
    if (profile && tutorialStep === 0) {
      const timer = setTimeout(() => setTutorialStep(1), 800);
      return () => clearTimeout(timer);
    }
  }, [profile, tutorialStep, setTutorialStep]);

  // Show weight prompt after 10+ days without weigh-in
  useEffect(() => {
    if (shouldPrompt && profile && tutorialStep === -1) {
      const timer = setTimeout(() => setShowWeightModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldPrompt, profile, tutorialStep]);

  if (!profile) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = t('greetingMorning');
  else if (hour < 18) greeting = t('greetingAfternoon');
  else greeting = t('greetingEvening');

  const firstName = profile.name.split(' ')[0];

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, maxWidth: contentMaxWidth },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetingCol}>
          <Text style={styles.greeting}>
            {greeting}, {firstName}
          </Text>
          <Text style={styles.subtitle}>
            {isTodayValidated ? t('keepItUp') : t('readyToForge')}
          </Text>
        </View>
        <StreakBadge streak={currentStreak} isActive={isTodayValidated} size="sm" />
      </View>

      {/* ── NUTRITION ── */}
      <Pressable style={styles.card} onPress={() => router.push('/nutrition')}>
        <ImageBackground
          source={{ uri: CARD_IMAGES.nutrition }}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.cardTitle}>{t('nutritionCard')}</Text>
            <Text style={styles.cardDesc}>
              {t('nutritionCardSub')}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      {/* ── ENTRAÎNEMENT ── */}
      <Pressable
        style={styles.card}
        onPress={() => router.push('/(tabs)/training')}
      >
        <ImageBackground
          source={{ uri: CARD_IMAGES.training }}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.cardTitle}>{t('trainingCard')}</Text>
            <Text style={styles.cardDesc}>
              {t('trainingCardSub')}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      {/* ── MON ESPACE ── */}
      <Pressable style={styles.card} onPress={() => router.push('/(tabs)/profile')}>
        <ImageBackground
          source={{ uri: CARD_IMAGES.space }}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.cardTitle}>{t('mySpace')}</Text>
            <Text style={styles.cardDesc}>
              {t('mySpaceSub')}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      {/* ── BILAN HEBDO/MENSUEL ── */}
      <Pressable
        style={styles.card}
        onPress={() => router.push('/report')}
      >
        <ImageBackground
          source={{ uri: CARD_IMAGES.community }}
          style={styles.cardImage}
          imageStyle={styles.cardImageInner}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={styles.cardOverlay}
          >
            <Text style={styles.cardTitle}>{t('myProgress')}</Text>
            <Text style={styles.cardDesc}>
              {t('progressSubtitle')}
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      <View style={{ height: spacing['3xl'] }} />

      {/* Tutorial overlay */}
      <TutorialOverlay step={tutorialStep} />

      {/* Weight prompt modal */}
      <WeightPromptModal
        visible={showWeightModal}
        daysSinceLastWeighIn={daysSinceLastWeighIn}
        onClose={() => setShowWeightModal(false)}
      />
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  greetingCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Cards
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardImageInner: {
    borderRadius: borderRadius.xl,
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.white,
  },
  cardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  quickIcon: {
    fontSize: 22,
  },
  quickLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Badge
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
  },
}));
