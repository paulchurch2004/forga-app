import React, { useEffect } from 'react';
import { View, Pressable, Platform, StyleSheet, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useUserStore } from '../../store/userStore';
import { resolveLocalUri } from '../../utils/persistImage';
import { useActionBadges } from '../../hooks/useActionBadges';

// Tabs visibles dans la barre du bas (training et coach sont accessibles
// via les gros tiles du Home → `if (!path) return null` les skip).
const TAB_ICON_PATHS: Record<string, string> = {
  home: 'M3 12l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z',
  meals:
    'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
  offers:
    'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  profile:
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

const ACTIVE_COLOR = '#FF6B35';
const INACTIVE_COLOR = 'rgba(255,255,255,0.42)';

// Hauteur occupée par la barre flottante (hors safe-area). Les écrans
// scrollables ajoutent `insets.bottom + FLOATING_TABBAR_HEIGHT (+ marge)` en
// padding bas pour que leur dernier contenu passe SOUS la barre sans être
// masqué (la barre est en position absolue → elle ne réserve plus d'espace).
export const FLOATING_TABBAR_HEIGHT = 68;

// Vibration légère au toucher (natif uniquement). Import dynamique pour
// ne rien charger sur web.
function haptic() {
  if (Platform.OS === 'web') return;
  import('expo-haptics')
    .then((H) => H.impactAsync(H.ImpactFeedbackStyle.Light))
    .catch(() => {});
}

function TabButton({
  path,
  focused,
  onPress,
  avatarUri,
  badgeCount = 0,
  badgeShowNumber = false,
}: {
  path: string;
  focused: boolean;
  onPress: () => void;
  avatarUri?: string;
  badgeCount?: number;
  badgeShowNumber?: boolean;
}) {
  // p : 0 = inactif, 1 = actif. Ressort doux pour le rebond.
  const p = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 180, mass: 0.6 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + p.value * 0.1 }, { translateY: -p.value * 3 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.7 + p.value * 0.3 }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptic();
        onPress();
      }}
      style={styles.cell}
      android_ripple={{ color: 'rgba(255,107,53,0.18)', borderless: true, radius: 30 }}
      hitSlop={6}
    >
      <View style={styles.iconBox}>
        {avatarUri ? (
          // Onglet Profil : photo de profil ronde (façon Instagram),
          // anneau orange quand l'onglet est actif.
          <Animated.View style={[styles.avatarWrap, focused && styles.avatarWrapActive, iconStyle]}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
          </Animated.View>
        ) : (
          <>
            {/* Halo orange animé derrière l'icône active */}
            <Animated.View style={[styles.glowPill, glowStyle]} pointerEvents="none" />
            <Animated.View style={iconStyle}>
              <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
                <Path
                  d={path}
                  stroke={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </>
        )}

        {/* Pastille rouge "à faire" (chiffre ou simple point) */}
        {badgeCount > 0 && (
          <View style={[styles.badge, !badgeShowNumber && styles.badgeDot]} pointerEvents="none">
            {badgeShowNumber && (
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : String(badgeCount)}</Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  // Marge sous la barre pour qu'elle "lévite" au-dessus du bord / indicateur home.
  const bottomMargin = Math.max(insets.bottom, 14);

  // Photo de profil (façon Instagram) pour l'onglet Profil. Peut être une
  // URI locale ou une URL Supabase → resolveLocalUri gère les deux.
  const avatarStored = useUserStore((s) => s.profile?.avatarUri);
  const avatarUri = resolveLocalUri(avatarStored);

  // ── Badges "à faire" — source de vérité partagée avec les écrans (fil
  // d'Ariane) : le point se répète sur l'élément exact de l'écran cible.
  const { mealsRemaining, checkinDue, trialEndingSoon } = useActionBadges();

  // Le check-in se lance depuis le Profil (et la bannière Nutrition), PAS
  // depuis l'accueil → on place son point sur l'onglet Profil pour qu'il
  // guide réellement jusqu'à l'action.
  const badgeFor = (name: string): { count: number; showNumber: boolean } => {
    if (name === 'meals') return { count: mealsRemaining, showNumber: true };
    if (name === 'profile') {
      return { count: checkinDue || trialEndingSoon ? 1 : 0, showNumber: false };
    }
    return { count: 0, showNumber: false };
  };

  // training/coach sont des routes valides hors tab bar → fallback Home
  // pour qu'un onglet reste visuellement actif.
  const activeRouteName = state.routes[state.index]?.name;
  const isOnVisibleTab = activeRouteName && TAB_ICON_PATHS[activeRouteName];
  const fallbackFocusName = isOnVisibleTab ? activeRouteName : 'home';

  return (
    <View style={[styles.wrap, { paddingBottom: bottomMargin }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {/* Fond "verre" translucide (faux blur via dégradé sombre) */}
        <LinearGradient
          colors={['rgba(32,32,44,0.96)', 'rgba(13,13,19,0.97)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {state.routes.map((route) => {
          const path = TAB_ICON_PATHS[route.name];
          if (!path) return null;
          const focused = route.name === fallbackFocusName;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const badge = badgeFor(route.name);
          return (
            <TabButton
              key={route.key}
              path={path}
              focused={focused}
              onPress={onPress}
              avatarUri={route.name === 'profile' ? avatarUri : undefined}
              badgeCount={badge.count}
              badgeShowNumber={badge.showNumber}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // Barre FLOTTANTE : position absolue → ne réserve plus de bande en bas
    // (plus de "rectangle noir"). Le contenu des écrans descend jusqu'en bas
    // et la barre flotte par-dessus. pointerEvents="box-none" laisse passer
    // les touches du contenu autour de l'îlot.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingHorizontal: 8,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    overflow: 'hidden',
    // Couleur de fond opaque sous le dégradé → l'ombre iOS se calcule bien.
    backgroundColor: '#0E0E14',
    // Ombre portée = effet de lévitation.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  cell: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 46,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0E0E14',
  },
  badgeDot: {
    minWidth: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    paddingHorizontal: 0,
    top: 2,
    right: 7,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
  },
  glowPill: {
    position: 'absolute',
    width: 50,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,53,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.35)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrapActive: {
    borderColor: ACTIVE_COLOR,
    borderWidth: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
