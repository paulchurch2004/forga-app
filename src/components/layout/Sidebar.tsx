import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { colors } from '../../theme/colors';
import { fonts, fontSizes } from '../../theme/fonts';
import { spacing, borderRadius, SIDEBAR_WIDTH } from '../../theme/spacing';

const NAV_ITEMS = [
  { route: '/(tabs)/home', label: 'Accueil', icon: '\u2302' },
  { route: '/(tabs)/meals', label: 'Repas', icon: '\u2615' },
  { route: '/(tabs)/coach', label: 'Coach', icon: '\u2709' },
  { route: '/(tabs)/profile', label: 'Profil', icon: '\u2603' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('../../../assets/logo/logo_sans_fond.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>FORGA</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const segment = item.route.replace('/(tabs)/', '');
          const isActive = pathname === `/${segment}` || pathname.startsWith(`/${segment}/`);

          return (
            <Pressable
              key={item.route}
              style={({ hovered }: any) => [
                styles.navItem,
                isActive && styles.navItemActive,
                hovered && !isActive && styles.navItemHovered,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              {isActive && <View style={styles.activeBar} />}
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: spacing.sm,
  },
  appName: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 2,
  },
  nav: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    position: 'relative' as const,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,107,53,0.12)',
  },
  navItemHovered: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeBar: {
    position: 'absolute' as const,
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  navIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center' as const,
  },
  navIconActive: {
    color: colors.primary,
  },
  navLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
