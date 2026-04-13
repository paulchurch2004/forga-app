import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';
import { fonts, fontSizes } from '../../src/theme/fonts';
import { spacing } from '../../src/theme/spacing';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Sidebar } from '../../src/components/layout/Sidebar';
import { useT } from '../../src/i18n';
import type { ThemeColors } from '../../src/theme';

const TAB_ICONS: Record<string, string> = {
  home: 'M3 12l9-8 9 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z',
  meals: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
  training: 'M6.5 6.5h11M6 12h12M17.5 6.5v11M6.5 6.5v11M4 9v6M20 9v6M2 10.5v3M22 10.5v3',
  coach: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

function TabIcon({ label, iconName, focused, colors }: { label: string; iconName: string; focused: boolean; colors: ThemeColors }) {
  const color = focused ? colors.primary : colors.textSecondary;
  return (
    <View style={tabIconStyles.container}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d={TAB_ICONS[iconName] ?? ''} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={[tabIconStyles.label, { color }, focused && tabIconStyles.labelActive]}>
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
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginTop: 2,
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
  const tabTraining = t('trainingTitle');
  const tabCoach = t('tabCoach');
  const tabProfile = t('tabProfile');

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
            <TabIcon label={tabHome} iconName="home" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: tabMeals,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabMeals} iconName="meals" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: tabTraining,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabTraining} iconName="training" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: tabCoach,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabCoach} iconName="coach" focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: tabProfile,
          tabBarIcon: ({ focused }) => (
            <TabIcon label={tabProfile} iconName="profile" focused={focused} colors={colors} />
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
