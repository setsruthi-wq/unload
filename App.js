import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { UnloadProvider } from './src/context/UnloadContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UnloadProvider>
          <View style={styles.rootContainer}>
            <View style={styles.mobileViewport}>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor={colors.background} />
                <AppNavigator />
              </NavigationContainer>
            </View>
          </View>
        </UnloadProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#05070B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileViewport: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : '100%',
    maxHeight: Platform.OS === 'web' ? 920 : '100%',
    backgroundColor: colors.background,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          borderRadius: 28,
          borderWidth: 1,
          borderColor: colors.borderLight,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          marginVertical: 16,
        }
      : {}),
  },
});
