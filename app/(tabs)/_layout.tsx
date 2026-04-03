import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing } from '../../src/theme/spacing';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Sidebar } from '../../src/components/layout/Sidebar';
import { useT } from '../../src/i18n';
import type { ThemeColors } from '../../src/theme';

function TabIcon({ label, focused, colors }: { label: string; focused: boolean; colors: ThemeColors }) {
  const icons: Record<string, { active: string; inactive: string }> = {
    Accueil: { active: '\u2302', inactive: '\u2302' },
    Repas: { active: '\u2615', inactive: '\u2615' },
    Coach: { active: '\u2709', inactive: '\u2709' },
    Profil: { active: '\u2603', inactive: '\u2603' },
    Home: { active: '\u2302', inactive: '\u2302' },
    Meals: { active: '\u2615', inactive: '\u2615' },
    Profile: { active: '\u2603', inactive: '\u2603' },
  };

  const icon = icons[label] ?? { active: '\u25CF', inactive: '\u25CB' };

  return (
    <View style={tabIconStyles.container}>
      <Text
        style={[
          tabIconStyles.icon,
          { color: focused ? colors.primary : colors.textSecondary },
        ]}
      >
        {focused ? icon.active : icon.inactive}
      </Text>
      <Text
        style={[
          tabIconStyles.label,
          { color: focused ? colors.primary : colors.textSecondary },
          focused && tabIconStyles.labelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});

export default function TabLayout() {
  const { isDesktop } = useResponsive();
  const { colors } = useTheme();
  const { t } = useT();

  const tabHome = t('tabHome');
  const tabMeals = t('tabMeals');
  const tabCoach = t('tabCoach');
  const tabProfile = t('tabProfile');

  const mobileTabBarStyle = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: spacing.sm,
    elevation: 0,
    shadowOpacity: 0,
  };

  const tabs = (
    <Tabs
      initialRouteName="home"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' as const },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: tabHome,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabHome} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: tabMeals,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabMeals} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: tabCoach,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabCoach} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tabProfile,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabProfile} focused={focused} colors={colors} />
          ),
        }}
      />
    </Tabs>
  );

  if (isDesktop) {
    return (
      <View style={[desktopStyles.wrapper, { backgroundColor: colors.background }]}>
        <Sidebar />
        <View style={desktopStyles.content}>{tabs}</View>
      </View>
    );
  }

  return tabs;
}

const desktopStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
