import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../src/theme/colors';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing } from '../../src/theme/spacing';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Sidebar } from '../../src/components/layout/Sidebar';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, { active: string; inactive: string }> = {
    Accueil: { active: '\u2302', inactive: '\u2302' },
    Repas: { active: '\u2615', inactive: '\u2615' },
    Coach: { active: '\u2709', inactive: '\u2709' },
    Profil: { active: '\u2603', inactive: '\u2603' },
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
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Repas',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Repas" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Coach" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );

  if (isDesktop) {
    return (
      <View style={desktopStyles.wrapper}>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
