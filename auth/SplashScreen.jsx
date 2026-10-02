import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

export const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => navigation.replace('Welcome')}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoBadge}>
          <Text style={styles.sproutIcon}>🌱</Text>
        </View>

        <Text style={styles.appName}>UNLOAD</Text>
        <Text style={styles.tagline}>"Unload gradually. Live freely."</Text>

        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>Digital Guardian & Screen Wellness</Text>
        </View>

        <Text style={styles.philosophy}>
          Gradual progressive screen reduction.{'\n'}Not harsh blocks. Real self-regulation.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.teamText}>Designed with care by</Text>
        <Text style={styles.teamName}>Team Safesprout</Text>
        <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sproutIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryLight,
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center',
  },
  pillContainer: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  philosophy: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  footer: {
    alignItems: 'center',
  },
  teamText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  tapPrompt: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 12,
    fontWeight: '500',
  },
});
