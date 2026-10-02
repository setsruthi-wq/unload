import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

export const WelcomeScreen = ({ navigation }) => {
  const { loginAsDemo } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Badge */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.sproutIcon}>🌱</Text>
        </View>
        <Text style={styles.title}>UNLOAD</Text>
        <Text style={styles.tagline}>"Unload gradually. Live freely."</Text>
        <Text style={styles.subtitle}>
          The progressive screen-addiction prevention app designed by Team Safesprout.
        </Text>
      </View>

      {/* Progressive Unloading Highlight Card */}
      <Card variant="primary" style={styles.heroCard}>
        <Text style={styles.heroTitle}>🌿 The Progressive Unloading Model</Text>
        <Text style={styles.heroDescription}>
          Most blockers fail because sudden lockouts trigger resistance and frustration. UNLOAD
          gently tapers daily screen time step-by-step, turning dependency into empowered self-regulation.
        </Text>
      </Card>

      {/* 3 Pillars */}
      <View style={styles.pillarsContainer}>
        <Card style={styles.pillarCard}>
          <Text style={styles.pillarIcon}>📉</Text>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>Gradual Tapering Stages</Text>
            <Text style={styles.pillarDesc}>
              Daily limits adapt in 15–20 min intervals so minds naturally adjust without sudden cutoffs.
            </Text>
          </View>
        </Card>

        <Card style={styles.pillarCard}>
          <Text style={styles.pillarIcon}>🪙</Text>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>Sprout Coins & Rewards</Text>
            <Text style={styles.pillarDesc}>
              Staying under target earns points redeemable for real family adventures and fun perks.
            </Text>
          </View>
        </Card>

        <Card style={styles.pillarCard}>
          <Text style={styles.pillarIcon}>🛡️</Text>
          <View style={styles.pillarText}>
            <Text style={styles.pillarTitle}>Digital Guardian Harmony</Text>
            <Text style={styles.pillarDesc}>
              Parents configure gentle curfews and view mock safe zones with transparent trust.
            </Text>
          </View>
        </Card>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <Button
          title="Get Started (Select Role)"
          size="large"
          onPress={() => navigation.navigate('RoleSelection')}
          style={styles.primaryBtn}
        />

        <Button
          title="Log In to Existing Account"
          variant="secondary"
          size="medium"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryBtn}
        />

        {/* Demo Fast Track */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>— HACKATHON DEMO SHORTCUTS —</Text>
          <View style={styles.demoRow}>
            <Button
              title="Demo Child (Leo)"
              variant="outline"
              size="small"
              onPress={() => loginAsDemo('child')}
              style={styles.demoBtn}
            />
            <Button
              title="Demo Parent (Sarah)"
              variant="outline"
              size="small"
              onPress={() => loginAsDemo('parent')}
              style={styles.demoBtn}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sproutIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.primaryLight,
    marginTop: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  heroCard: {
    marginVertical: 12,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  pillarsContainer: {
    marginVertical: 8,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 5,
  },
  pillarIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  pillarText: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  buttonGroup: {
    marginTop: 18,
  },
  primaryBtn: {
    marginBottom: 10,
  },
  secondaryBtn: {
    marginBottom: 18,
  },
  demoSection: {
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  demoBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
