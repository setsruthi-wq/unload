import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('child'); // 'child' | 'parent'

  const handleRegister = () => {
    if (!name.trim()) {
      alert('Please enter your full name to continue.');
      return;
    }
    register({
      name: name.trim(),
      email: email || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@safesprout.org`,
      role: selectedRole,
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Create Account"
        subtitle="Begin your Progressive Unloading journey"
        onBack={() => navigation.goBack()}
        showRoleBadge={false}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Role Toggle Selector */}
        <Text style={styles.sectionLabel}>I am joining as a:</Text>
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity
            style={[
              styles.roleTab,
              selectedRole === 'child' && styles.roleTabActiveChild,
            ]}
            onPress={() => setSelectedRole('child')}
          >
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'child' && styles.roleTabTextActive,
              ]}
            >
              🌱 Child / Teen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleTab,
              selectedRole === 'parent' && styles.roleTabActiveParent,
            ]}
            onPress={() => setSelectedRole('parent')}
          >
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'parent' && styles.roleTabTextActive,
              ]}
            >
              👩‍💼 Parent / Guardian
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Form */}
        <Card style={styles.formCard}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder={selectedRole === 'child' ? 'e.g. Leo Jenkins' : 'e.g. Sarah Jenkins'}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@safesprout.org"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a secure password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {selectedRole === 'child' ? (
            <>
              <Text style={styles.label}>Guardian Pairing Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. SPROUT-8492"
                placeholderTextColor={colors.textMuted}
                value={familyCode}
                onChangeText={setFamilyCode}
                autoCapitalize="characters"
              />
              <Text style={styles.hintText}>
                Ask your parent for their 6-digit Safesprout pairing code to link devices.
              </Text>
            </>
          ) : (
            <Text style={styles.hintText}>
              As a guardian, you will receive a unique pairing code after registration to connect your children's devices.
            </Text>
          )}

          <Button
            title={`Create ${selectedRole === 'child' ? 'Child' : 'Parent'} Account`}
            size="large"
            onPress={handleRegister}
            style={styles.submitBtn}
          />
        </Card>

        {/* Login Prompt */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActiveChild: {
    backgroundColor: colors.primary,
  },
  roleTabActiveParent: {
    backgroundColor: colors.sky,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTabTextActive: {
    color: colors.textInverse,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    fontSize: 15,
  },
  hintText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 16,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
