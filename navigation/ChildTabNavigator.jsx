import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { ChildHomeScreen } from '../screens/child/ChildHomeScreen';
import { ChildProgressScreen } from '../screens/child/ChildProgressScreen';
import { ChildUsageScreen } from '../screens/child/ChildUsageScreen';
import { ChildRewardsScreen } from '../screens/child/ChildRewardsScreen';
import { ChildBedtimeScreen } from '../screens/child/ChildBedtimeScreen';
import { ChildProfileScreen } from '../screens/child/ChildProfileScreen';

const Tab = createBottomTabNavigator();

export const ChildTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'leaf';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Usage') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Bedtime') {
            iconName = focused ? 'moon' : 'moon-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ChildHomeScreen} />
      <Tab.Screen name="Progress" component={ChildProgressScreen} />
      <Tab.Screen name="Usage" component={ChildUsageScreen} />
      <Tab.Screen name="Rewards" component={ChildRewardsScreen} />
      <Tab.Screen name="Bedtime" component={ChildBedtimeScreen} />
      <Tab.Screen name="Profile" component={ChildProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 62,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
