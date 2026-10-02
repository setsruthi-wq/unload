import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

export const RoleSelectionScreen = ({ navigation }) => {
  const { selectRole } = useAuth();
  const [chosenRole, setChosenRole] = useState('child'); // 'child' | 'parent'

  const handleConfirmRole = () => {
    selectRole(chosenRole);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Select Your Role"
        subtitle="Experience UNLOAD tailored to your needs"
        onBack={() => navigation.goBack()}
        showRoleBadge={false}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.leadText}>
          UNLOAD fosters healthy digital habits through mutual cooperation rather than conflict.
          Choose how you will be using this device:
        </Text>

        {/* Child Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setChosenRole('child')}
        >
          <Card
            style={[
              styles.roleCard,
              chosenRole === 'child' && styles.roleCardActiveChild,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primarySubtle }]}>
                <Text style={styles.avatarEmoji}>🌱</Text>
              </View>
              <View style={styles.cardHeaderTitles}>
                <Text style={styles.roleTitle}>Child / Teen</Text>
                <Text style={styles.roleSubtitle}>Self-Regulation & Rewards</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  chosenRole === 'child' && styles.radioOuterActiveChild,
                ]}
              >
                {chosenRole === 'child' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
            </View>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>✓ Progressive Unloading daily targets without sudden lockouts</Text>
              <Text style={styles.bulletItem}>✓ Mindful pause breaks to breathe and reset focus</Text>
              <Text style={styles.bulletItem}>✓ Earn Sprout Coins for staying on track & unlock perks</Text>
              <Text style={styles.bulletItem}>✓ Track your streak and become a Digital Zen Master</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Parent Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setChosenRole('parent')}
        >
          <Card
            style={[
              styles.roleCard,
              chosenRole === 'parent' && styles.roleCardActiveParent,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.skySubtle }]}>
                <Text style={styles.avatarEmoji}>👩‍💼</Text>
              </View>
              <View style={styles.cardHeaderTitles}>
                <Text style={styles.roleTitle}>Parent / Guardian</Text>
                <Text style={styles.roleSubtitle}>Digital Guardian & Guidance</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  chosenRole === 'parent' && styles.radioOuterActiveParent,
                ]}
              >
                {chosenRole === 'parent' && <View style={[styles.radioInner, { backgroundColor: colors.sky }]} />}
              </View>
            </View>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>✓ View overall Digital Wellbeing score and tapering trends</Text>
              <Text style={styles.bulletItem}>✓ Configure gentle progressive limits and bedtime wind-down</Text>
              <Text style={styles.bulletItem}>✓ Safe zones & check-in logs (School, Home, Library)</Text>
              <Text style={styles.bulletItem}>✓ Instant Dinner Mode / Focus Lock for family moments</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Confirmation Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={`Enter UNLOAD as ${chosenRole === 'child' ? 'Child / Teen 🌱' : 'Parent / Guardian 👩‍💼'}`}
            size="large"
            onPress={handleConfirmRole}
            style={chosenRole === 'parent' ? styles.parentConfirmBtn : styles.childConfirmBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  leadText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  roleCard: {
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleCardActiveChild: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  roleCardActiveParent: {
    borderColor: colors.sky,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  cardHeaderTitles: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActiveChild: {
    borderColor: colors.primary,
  },
  radioOuterActiveParent: {
    borderColor: colors.sky,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bulletList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bulletItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginVertical: 2,
  },
  buttonContainer: {
    marginTop: 10,
  },
  childConfirmBtn: {
    backgroundColor: colors.primary,
  },
  parentConfirmBtn: {
    backgroundColor: colors.sky,
  },
});
