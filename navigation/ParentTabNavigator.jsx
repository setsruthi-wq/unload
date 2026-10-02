import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ParentActivityScreen } from '../screens/parent/ParentActivityScreen';
import { ParentLocationScreen } from '../screens/parent/ParentLocationScreen';
import { ParentBedtimeScreen } from '../screens/parent/ParentBedtimeScreen';
import { ParentLimitsScreen } from '../screens/parent/ParentLimitsScreen';
import { ParentProfileScreen } from '../screens/parent/ParentProfileScreen';

const Tab = createBottomTabNavigator();

export const ParentTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.sky,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'shield-checkmark';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Location') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Bedtime') {
            iconName = focused ? 'moon' : 'moon-outline';
          } else if (route.name === 'Limits') {
            iconName = focused ? 'options' : 'options-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ParentDashboardScreen} />
      <Tab.Screen
        name="Activity"
        component={ParentActivityScreen}
        options={{ tabBarLabel: 'Child Activity' }}
      />
      <Tab.Screen name="Location" component={ParentLocationScreen} />
      <Tab.Screen name="Bedtime" component={ParentBedtimeScreen} />
      <Tab.Screen name="Limits" component={ParentLimitsScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
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
