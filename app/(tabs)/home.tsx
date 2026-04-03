import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '../../src/store/userStore';
import { useStreak } from '../../src/hooks/useStreak';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../src/theme';
import { useResponsive } from '../../src/hooks/useResponsive';

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

  if (!profile) {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = 'Bonjour';
  else if (hour < 18) greeting = 'Bon apres-midi';
  else greeting = 'Bonsoir';

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
            {isTodayValidated ? 'Continue comme ca !' : 'Pret a forger ta journee ?'}
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
            <Text style={styles.cardTitle}>Nutrition</Text>
            <Text style={styles.cardDesc}>
              Score, macros, repas, coach, scanner
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      {/* ── ENTRAÎNEMENT ── */}
      <Pressable
        style={styles.card}
        onPress={() => {
          if (Platform.OS === 'web') {
            window.alert('Bientot disponible !');
          } else {
            import('react-native').then(({ Alert }) => {
              Alert.alert('FORGA', 'La section Entrainement arrive bientot !');
            });
          }
        }}
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
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Entrainement</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Bientot</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              Programmes, seances et progression
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
            <Text style={styles.cardTitle}>Mon Espace</Text>
            <Text style={styles.cardDesc}>
              Profil, badges, reglages, notifications
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      {/* ── COMMUNAUTÉ ── */}
      <Pressable
        style={styles.card}
        onPress={() => {
          if (Platform.OS === 'web') {
            window.alert('Bientot disponible !');
          } else {
            import('react-native').then(({ Alert }) => {
              Alert.alert('FORGA', 'La Communaute arrive bientot !');
            });
          }
        }}
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
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Communaute</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Bientot</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              Echange avec les autres forgerons
            </Text>
          </LinearGradient>
        </ImageBackground>
      </Pressable>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
