import React from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../../theme/fonts';

const SUCCESS = '#00D4AA';

export interface MealSlotPhotoItem {
  id: string;
  label: string; // "Petit-déj"
  time: string; // "07:30"
  meal: string | null;
  kcal?: number;
  imageUri?: string;
  done: boolean;
  optional?: boolean;
  onPress?: () => void;
}

interface MealSlotPhotoListProps {
  items: MealSlotPhotoItem[];
}

export function MealSlotPhotoList({ items }: MealSlotPhotoListProps) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <MealRow key={item.id} item={item} />
      ))}
    </View>
  );
}

function MealRow({ item }: { item: MealSlotPhotoItem }) {
  const isEmpty = !item.meal;
  const dimmed = item.optional && isEmpty;
  return (
    <Pressable
      onPress={item.onPress}
      disabled={!item.onPress}
      style={({ pressed }) => [
        styles.row,
        item.done && styles.rowDone,
        dimmed && styles.rowDim,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.imageWrap}>
        {item.imageUri ? (
          <ImageBackground source={{ uri: item.imageUri }} style={styles.imageBg} imageStyle={styles.imageRadius}>
            {item.done && (
              <LinearGradient
                colors={['rgba(0,212,170,0.25)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, styles.imageRadius]}
              />
            )}
          </ImageBackground>
        ) : (
          <View style={styles.imagePlaceholder}>
            <PlusIcon />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.bodyHeader}>
          <Text style={[styles.eyebrow, item.done && styles.eyebrowDone]}>
            {item.label.toUpperCase()} · {item.time}
          </Text>
          {item.done && (
            <View style={styles.checkBadge}>
              <CheckIcon />
            </View>
          )}
        </View>
        <Text style={styles.mealName} numberOfLines={1}>
          {item.meal ?? 'Ajouter un repas'}
        </Text>
        {item.kcal !== undefined && item.meal && (
          <Text style={styles.kcal}>{item.kcal} kcal</Text>
        )}
      </View>
    </Pressable>
  );
}

function CheckIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12 L10 17 L19 7" stroke="#000000" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5 V19 M5 12 H19" stroke="rgba(255,255,255,0.38)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowDone: {
    borderColor: 'rgba(0,212,170,0.25)',
  },
  rowDim: {
    opacity: 0.5,
  },
  rowPressed: {
    opacity: 0.85,
  },
  imageWrap: {
    width: 72,
  },
  imageBg: {
    width: 72,
    height: '100%',
  },
  imageRadius: {
    borderTopLeftRadius: 17,
    borderBottomLeftRadius: 17,
  },
  imagePlaceholder: {
    width: 72,
    height: '100%',
    minHeight: 72,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.8,
  },
  eyebrowDone: {
    color: SUCCESS,
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  kcal: {
    fontFamily: fonts.data,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 2,
  },
});
