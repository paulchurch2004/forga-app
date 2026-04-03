import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useMealStore } from '../../store/mealStore';
import type { Meal } from '../../types/meal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MealPhotoCardProps {
  meal: Meal;
  cardWidth?: number;
}

export function MealPhotoCard({ meal, cardWidth }: MealPhotoCardProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const favorites = useMealStore((s) => s.favorites);
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  const likedMeals = useMealStore((s) => s.likedMeals);
  const dislikedMeals = useMealStore((s) => s.dislikedMeals);
  const toggleLike = useMealStore((s) => s.toggleLike);
  const toggleDislike = useMealStore((s) => s.toggleDislike);
  const isFav = favorites.includes(meal.id);
  const isLiked = likedMeals.includes(meal.id);
  const isDisliked = dislikedMeals.includes(meal.id);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    router.push(`/meal/${meal.id}`);
  };

  const budgetLabel = meal.budget === 'eco' ? 'eco' : 'premium';
  const budgetColor = meal.budget === 'eco' ? colors.success : colors.fat;

  const dynamicCardStyle = cardWidth ? { width: cardWidth } : { flex: 1 };
  const imageHeight = cardWidth ? cardWidth * 0.75 : 140;

  return (
    <AnimatedPressable
      style={[styles.card, dynamicCardStyle, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${meal.name}, ${Math.round(meal.baseMacros.calories)} calories`}
    >
      {/* Photo */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        <Image
          source={{ uri: meal.photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Gradient overlay */}
        <View style={styles.gradient} />

        {/* Budget tag */}
        <View style={[styles.budgetTag, { backgroundColor: budgetColor }]}>
          <Text style={styles.budgetText}>{budgetLabel}</Text>
        </View>

        {/* Favorite button */}
        <Pressable
          style={styles.favButton}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(meal.id);
          }}
          hitSlop={8}
        >
          <Text style={[styles.favIcon, isFav && styles.favIconActive]}>
            {isFav ? '\u2665' : '\u2661'}
          </Text>
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.mealName} numberOfLines={2}>
          {meal.name}
        </Text>
        <View style={styles.macrosRow}>
          <MacroChip
            value={Math.round(meal.baseMacros.protein)}
            unit="g P"
            color={colors.protein}
          />
          <MacroChip
            value={Math.round(meal.baseMacros.calories)}
            unit="kcal"
            color={colors.calories}
          />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {meal.prepTimeMin} min
          </Text>
          <Text style={styles.metaDot}>{'\u00B7'}</Text>
          <Text style={styles.metaText}>
            {meal.difficulty === 1
              ? 'Facile'
              : meal.difficulty === 2
              ? 'Moyen'
              : 'Avance'}
          </Text>
          <View style={styles.feedbackRow}>
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); toggleLike(meal.id); }}
              hitSlop={6}
              style={styles.feedbackBtn}
            >
              <Ionicons
                name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={14}
                color={isLiked ? colors.success : colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); toggleDislike(meal.id); }}
              hitSlop={6}
              style={styles.feedbackBtn}
            >
              <Ionicons
                name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                size={14}
                color={isDisliked ? colors.error : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function MacroChip({
  value,
  unit,
  color,
}: {
  value: number;
  unit: string;
  color: string;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.macroChip, { borderColor: color }]}>
      <Text style={[styles.macroChipValue, { color }]}>
        {value}
      </Text>
      <Text style={[styles.macroChipUnit, { color }]}>{unit}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  budgetTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  budgetText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: {
    padding: spacing.sm,
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    gap: 3,
  },
  macroChipValue: {
    fontFamily: fonts.data,
    fontSize: 10,
    fontWeight: '700',
  },
  macroChipUnit: {
    fontFamily: fonts.data,
    fontSize: 9,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 10,
  },
  favButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    fontSize: 16,
    color: colors.white,
  },
  favIconActive: {
    color: colors.error,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: 'auto',
  },
  feedbackBtn: {
    padding: 2,
  },
}));

export default MealPhotoCard;
