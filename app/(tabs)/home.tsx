import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useUserStore } from '../../src/store/userStore';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useStreak } from '../../src/hooks/useStreak';
import { useWeightPrompt } from '../../src/hooks/useWeightPrompt';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { TutorialOverlay } from '../../src/components/ui/TutorialOverlay';
import { WeightPromptModal } from '../../src/components/ui/WeightPromptModal';
import { fonts, fontSizes, spacing, borderRadius, makeStyles } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useTheme } from '../../src/context/ThemeContext';
import { useT } from '../../src/i18n';

// ──────────── CARD DATA ────────────

const CARDS = [
  {
    key: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    titleKey: 'nutritionCard',
    subKey: 'nutritionCardSub',
    route: '/nutrition',
  },
  {
    key: 'training',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    titleKey: 'trainingCard',
    subKey: 'trainingCardSub',
    route: '/(tabs)/training',
  },
  {
    key: 'space',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    titleKey: 'mySpace',
    subKey: 'mySpaceSub',
    route: '/(tabs)/profile',
  },
  {
    key: 'boutique',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80',
    titleKey: 'boutiqueCard',
    subKey: 'boutiqueCardSub',
    route: null,
    comingSoon: true,
  },
];

// ──────────── 3D CAROUSEL CARD ────────────

function CarouselCard({
  card,
  index,
  scrollX,
  cardWidth,
  cardHeight,
  snapInterval,
  t,
}: {
  card: typeof CARDS[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
  cardWidth: number;
  cardHeight: number;
  snapInterval: number;
  t: any;
}) {
  const styles = useStyles();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * snapInterval,
      index * snapInterval,
      (index + 1) * snapInterval,
    ];

    const rotateY = interpolate(scrollX.value, inputRange, [25, 0, -25], Extrapolation.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.88, 1, 0.88], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.65, 1, 0.65], Extrapolation.CLAMP);

    return {
      transform: [
        { perspective: 800 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const handlePress = useCallback(() => {
    if (card.route) router.push(card.route as any);
  }, [card.route]);

  const content = (
    <ImageBackground
      source={{ uri: card.image }}
      style={[styles.carouselImage, { width: cardWidth, height: cardHeight }]}
      imageStyle={styles.carouselImageInner}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.8)']}
        style={styles.carouselOverlay}
      >
        {card.comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('comingSoonBadge')}</Text>
          </View>
        )}
        <Text style={styles.carouselTitle}>{t(card.titleKey as any)}</Text>
        <Text style={styles.carouselDesc}>{t(card.subKey as any)}</Text>
      </LinearGradient>
    </ImageBackground>
  );

  return (
    <Animated.View style={[{ width: cardWidth, alignItems: 'center' }, animatedStyle]}>
      {card.route ? (
        <Pressable onPress={handlePress} style={styles.carouselCard}>{content}</Pressable>
      ) : (
        <View style={[styles.carouselCard, { opacity: 0.8 }]}>{content}</View>
      )}
    </Animated.View>
  );
}

// ──────────── DOT INDICATOR ────────────

function DotIndicator({ scrollX, snapInterval, count }: { scrollX: Animated.SharedValue<number>; snapInterval: number; count: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: spacing.lg }}>
      {Array.from({ length: count }).map((_, i) => (
        <DotItem key={i} index={i} scrollX={scrollX} snapInterval={snapInterval} colors={colors} />
      ))}
    </View>
  );
}

function DotItem({ index, scrollX, snapInterval, colors }: { index: number; scrollX: Animated.SharedValue<number>; snapInterval: number; colors: any }) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * snapInterval, index * snapInterval, (index + 1) * snapInterval];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: colors.primary }, animStyle]} />
  );
}

// ──────────── MAIN SCREEN ────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth } = useResponsive();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const profile = useUserStore((s) => s.profile);
  const { currentStreak, isTodayValidated } = useStreak();
  const tutorialStep = useSettingsStore((s) => s.tutorialStep);
  const setTutorialStep = useSettingsStore((s) => s.setTutorialStep);
  const { shouldPrompt, daysSinceLastWeighIn } = useWeightPrompt();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const styles = useStyles();
  const { t } = useT();

  const scrollX = useSharedValue(0);
  const visibleWidth = Math.min(screenWidth, contentMaxWidth);
  const cardWidth = visibleWidth * 0.70;
  const cardSpacing = (visibleWidth - cardWidth) / 2;
  const snapInterval = cardWidth + spacing.lg;
  const cardHeight = Math.min(screenHeight - insets.top - insets.bottom - 200, 480);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    if (profile && tutorialStep === 0) {
      const timer = setTimeout(() => setTutorialStep(1), 800);
      return () => clearTimeout(timer);
    }
  }, [profile, tutorialStep, setTutorialStep]);

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
    <View style={[styles.wrapper, { paddingTop: insets.top + spacing.xl }]}>
      {/* Header */}
      <View style={[styles.header, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: spacing.lg }]}>
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

      {/* 3D Carousel — 4 cartes fixes */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: cardSpacing,
          paddingVertical: spacing.md,
          gap: spacing.lg,
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {CARDS.map((card, index) => (
          <CarouselCard
            key={card.key}
            card={card}
            index={index}
            scrollX={scrollX}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            snapInterval={snapInterval}
            t={t}
          />
        ))}
      </Animated.ScrollView>

      {/* Dot indicator */}
      <DotIndicator scrollX={scrollX} snapInterval={snapInterval} count={CARDS.length} />

      {/* Tutorial overlay */}
      <TutorialOverlay step={tutorialStep} />

      {/* Weight prompt modal */}
      <WeightPromptModal
        visible={showWeightModal}
        daysSinceLastWeighIn={daysSinceLastWeighIn}
        onClose={() => setShowWeightModal(false)}
      />
    </View>
  );
}

// ──────────── STYLES ────────────

const useStyles = makeStyles((colors) => ({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  carouselCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  carouselImage: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
  },
  carouselImageInner: {
    borderRadius: borderRadius.xl,
  },
  carouselOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  carouselTitle: {
    fontFamily: fonts.display,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
    color: colors.white,
  },
  carouselDesc: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  comingSoonBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}));
