import React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// Tabs visibles dans la barre du bas (mai 2026 : retrait de training
// et coach qui sont maintenant accessibles via les gros tiles du Home).
// Si une route n'est pas listée ici, le tab bar la skip (`if (!path)
// return null`). Le `href: null` côté layout cache la route du
// navigator par défaut, mais le custom tab bar a besoin de filtrer
// explicitement aussi.
const TAB_ICON_PATHS: Record<string, string> = {
  home: 'M3 12l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z',
  meals:
    'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
  // Cadeau / boîte ouverte — symbole universel pour les offres promo
  offers:
    'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  profile:
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

const ACTIVE_COLOR = '#FF6B35';
const INACTIVE_COLOR = 'rgba(255,255,255,0.38)';

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'ios' ? Math.max(insets.bottom - 4, 8) : 10;

  // Bug fix : training et coach sont des routes valides (accessibles
  // via les BigTiles du Home) mais ne sont pas dans la tab bar. Si
  // l'user est sur ces routes, `state.routes[state.index].name` est
  // 'training'/'coach' qui n'apparaît dans aucun TAB_ICON_PATHS →
  // AUCUN tab visible n'est focused. On fallback sur Home pour ces cas.
  const activeRouteName = state.routes[state.index]?.name;
  const isOnVisibleTab = activeRouteName && TAB_ICON_PATHS[activeRouteName];
  const fallbackFocusName = isOnVisibleTab ? activeRouteName : 'home';

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      {state.routes.map((route, index) => {
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

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.cell}
            android_ripple={{ color: 'rgba(255,107,53,0.15)', borderless: true, radius: 32 }}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d={path}
                  stroke={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(7,7,13,0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.30)',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
});
