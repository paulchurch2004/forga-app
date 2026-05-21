import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, usePathname } from 'expo-router';
import { makeStyles, fonts, fontSizes, spacing, borderRadius, SIDEBAR_WIDTH } from '../../theme';
import { useT } from '../../i18n';

// Routes "satellites" du Home (accessibles via les tiles) qui n'ont
// pas leur propre entrée sidebar mais doivent quand même highlight la
// tuile Home pour que l'user garde la spatialisation.
const HOME_SATELLITE_ROUTES = [
  '/coach',
  '/training',
  '/active-workout',
  '/nutrition',
  '/meal',
  '/scan',
  '/exercise-tutorial',
  '/strength-test',
  '/weekly-review',
];

export function Sidebar() {
  const styles = useStyles();
  const pathname = usePathname();
  const { t } = useT();

  // Sidebar desktop \u2014 m\u00EAmes 4 tabs que la barre du bas mobile
  // (training et coach accessibles via les gros tiles du Home).
  const NAV_ITEMS = [
    { route: '/(tabs)/home', label: t('tabHome'), icon: '\u2302' },
    { route: '/(tabs)/meals', label: t('tabMeals'), icon: '\u2615' },
    { route: '/(tabs)/offers', label: t('tabOffers' as any) as string, icon: '\u2605' },
    { route: '/(tabs)/profile', label: t('tabProfile'), icon: '\u2603' },
  ];

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
          let isActive = pathname === `/${segment}` || pathname.startsWith(`/${segment}/`);
          // Fallback : si on est sur une route satellite du Home
          // (training, coach, scan, etc — accessibles via les tiles),
          // on active la tuile Home pour que l'user garde la
          // spatialisation. Sinon AUCUNE entrée sidebar n'est highlight.
          if (!isActive && segment === 'home' && HOME_SATELLITE_ROUTES.some((r) => pathname.startsWith(r))) {
            isActive = true;
          }

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

const useStyles = makeStyles((colors) => ({
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
}));
