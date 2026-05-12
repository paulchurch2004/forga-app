import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { makeStyles, fonts } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useMealStore } from '../../store/mealStore';
import { useUserStore } from '../../store/userStore';
import { syncMealPreference } from '../../services/userSync';
import type { Meal } from '../../types/meal';
import { getMealEmoji, gradientIndexFor, SLOT_GRADIENT_BUCKETS } from '../../utils/mealEmoji';
import { getMealPhotoUrl } from '../../utils/mealPhoto';

// Photo strategy: we generate a per-meal photo on the fly through Pollinations
// (free AI image API, no key required for basic use). The same meal name
// always yields the same photo (seed = hash of meal.id), and `expo-image`
// caches it to disk via cachePolicy="memory-disk" so the user only ever waits
// once. If the URL fails (offline, server error, etc.) we fall back to a
// gradient + dish-derived emoji card — never a broken-image icon.
//
// We deliberately don't trust `meal.photoUrl` from the data files anymore:
// the inherited Wikimedia URLs were unreliable (403s on thumbs, mismatched
// dishes, scientific charts in place of food, duplicate URLs across meals).

const triggerHaptic = () => {
  if (Platform.OS === 'web') return;
  import('expo-haptics').then((H) => H.impactAsync(H.ImpactFeedbackStyle.Light)).catch(() => {});
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MealPhotoCardProps {
  meal: Meal;
  cardWidth?: number;
  slot?: string;
  /** Optional ISO date forwarded to the detail screen for retroactive
   *  logging (history → "Add a meal" flow). */
  date?: string;
}

function MealPhotoCardImpl({ meal, cardWidth, slot, date }: MealPhotoCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  // Per-meal boolean selectors — only re-render this card when *this meal's*
  // favorite/like/dislike status changes, not when any other meal is touched.
  const isFav = useMealStore((s) => s.favorites.includes(meal.id));
  const isLiked = useMealStore((s) => s.likedMeals.includes(meal.id));
  const isDisliked = useMealStore((s) => s.dislikedMeals.includes(meal.id));
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  const toggleLike = useMealStore((s) => s.toggleLike);
  const toggleDislike = useMealStore((s) => s.toggleDislike);
  const favScale = useSharedValue(1);
  const favAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: favScale.value }] }));
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dynamicCardStyle = cardWidth ? { width: cardWidth } : { flex: 1 };
  const imageHeight = cardWidth ? cardWidth : 160; // aspect 1:1
  // Fallback gradient + emoji used only if the Pollinations image fails to
  // load. Two variants per slot so the fallback grid never looks monotonous.
  const gradients = SLOT_GRADIENT_BUCKETS[meal.slot] ?? SLOT_GRADIENT_BUCKETS.lunch;
  const gradient = gradients[gradientIndexFor(meal.id, gradients.length)];
  const emoji = getMealEmoji(meal);
  const photoUrl = getMealPhotoUrl(meal);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <AnimatedPressable
      style={[styles.card, dynamicCardStyle, animatedStyle]}
      onPress={() => {
        const qs = [
          slot ? `slot=${slot}` : null,
          date ? `date=${date}` : null,
        ].filter(Boolean).join('&');
        router.push(qs ? `/meal/${meal.id}?${qs}` : `/meal/${meal.id}`);
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${meal.name}, ${Math.round(meal.baseMacros.calories)} calories`}
    >
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        {imageFailed ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.image, styles.gradientBg, { width: cardWidth ?? '100%', height: imageHeight }]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </LinearGradient>
        ) : (
          <Image
            source={{ uri: photoUrl }}
            // expo-image: in-memory + on-disk cache. After first load, no
            // network call ever for this meal again.
            cachePolicy="memory-disk"
            contentFit="cover"
            transition={180}
            // Show the gradient+emoji while the image is loading the first
            // time (and as a permanent fallback if generation fails).
            placeholder={null}
            placeholderContentFit="cover"
            onError={() => setImageFailed(true)}
            style={[styles.image, { width: cardWidth ?? '100%', height: imageHeight }]}
          />
        )}
        <View style={styles.gradient} />

        <Pressable
          style={styles.favButton}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(meal.id);
            triggerHaptic();
            favScale.value = withSequence(
              withSpring(1.4, { damping: 6 }),
              withSpring(1, { damping: 10 })
            );
          }}
          hitSlop={8}
        >
          <Animated.Text style={[styles.favIcon, isFav && styles.favIconActive, favAnimStyle]}>
            {isFav ? '♥' : '♡'}
          </Animated.Text>
        </Pressable>

        {meal.budget === 'eco' && (
          <View style={styles.budgetBadge}>
            <Text style={styles.budgetBadgeText}>ECO</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.mealName} numberOfLines={2}>
          {meal.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.kcalWrap}>
            <Text style={styles.kcalValue}>{Math.round(meal.baseMacros.calories)}</Text>
            <Text style={styles.kcalUnit}>kcal</Text>
          </View>
          <View style={styles.dots}>
            <Text style={[styles.dot, { color: colors.protein }]}>
              {Math.round(meal.baseMacros.protein)}
            </Text>
            <Text style={[styles.dot, { color: colors.carbs }]}>
              {Math.round(meal.baseMacros.carbs)}
            </Text>
            <Text style={[styles.dot, { color: colors.fat }]}>
              {Math.round(meal.baseMacros.fat)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{meal.prepTimeMin} min</Text>
          <View style={styles.feedbackRow}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                toggleLike(meal.id);
                triggerHaptic();
                const userId = useUserStore.getState().profile?.id;
                if (userId) {
                  syncMealPreference(meal.id, userId, !isLiked ? 'like' : null);
                }
              }}
              hitSlop={6}
              style={styles.feedbackBtn}
            >
              <Ionicons
                name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={13}
                color={isLiked ? colors.success : colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                toggleDislike(meal.id);
                triggerHaptic();
                const userId = useUserStore.getState().profile?.id;
                if (userId) {
                  syncMealPreference(meal.id, userId, !isDisliked ? 'dislike' : null);
                }
              }}
              hitSlop={6}
              style={styles.feedbackBtn}
            >
              <Ionicons
                name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                size={13}
                color={isDisliked ? colors.error : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden' as const,
  },
  imageWrap: {
    width: '100%' as const,
    position: 'relative' as const,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  gradientBg: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emoji: {
    fontSize: 64,
    lineHeight: 76,
  },
  gradient: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,7,13,0.10)',
  },
  favButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  favIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  favIconActive: {
    color: colors.error,
  },
  budgetBadge: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,212,170,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.4)',
  },
  budgetBadgeText: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#00D4AA',
    letterSpacing: 0.8,
  },
  info: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    lineHeight: 18,
    minHeight: 36,
  },
  bottomRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    marginTop: 8,
  },
  kcalWrap: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: 2,
  },
  kcalValue: {
    fontFamily: fonts.data,
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  kcalUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  dots: {
    flexDirection: 'row' as const,
    gap: 6,
  },
  dot: {
    fontFamily: fonts.data,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 6,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
  },
  feedbackRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  feedbackBtn: {
    padding: 2,
  },
}));

export const MealPhotoCard = React.memo(
  MealPhotoCardImpl,
  (prev, next) =>
    prev.meal.id === next.meal.id &&
    prev.cardWidth === next.cardWidth &&
    prev.slot === next.slot &&
    prev.date === next.date
);

export default MealPhotoCard;
