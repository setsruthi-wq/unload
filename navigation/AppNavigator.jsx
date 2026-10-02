import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { ChildTabNavigator } from './ChildTabNavigator';
import { ParentTabNavigator } from './ParentTabNavigator';
import { colors } from '../theme/colors';

export const AppNavigator = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (role === 'parent') {
    return <ParentTabNavigator />;
  }

  // Default to ChildTabNavigator if authenticated as child
  return <ChildTabNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
