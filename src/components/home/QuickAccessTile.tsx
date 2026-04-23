import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../theme/fonts';

export interface QuickAccessTileProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUri: string;
  accent?: boolean;
  onPress: () => void;
}

export function QuickAccessTile({ eyebrow, title, subtitle, imageUri, accent, onPress }: QuickAccessTileProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, accent && styles.cardAccent, pressed && styles.cardPressed]}>
      <View style={styles.image}>
        <Image
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, styles.imageRadius]}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />
        <LinearGradient
          colors={['transparent', 'rgba(7,7,13,0.9)']}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

interface QuickAccessRowProps {
  tiles: QuickAccessTileProps[];
}

export function QuickAccessRow({ tiles }: QuickAccessRowProps) {
  return (
    <View style={styles.row}>
      {tiles.map((tile, i) => (
        <View key={i} style={styles.cell}>
          <QuickAccessTile {...tile} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardAccent: {
    borderColor: 'rgba(255,107,53,0.25)',
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    height: 100,
    width: '100%',
  },
  imageRadius: {
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  body: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#FF6B35',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginTop: 4,
  },
});
