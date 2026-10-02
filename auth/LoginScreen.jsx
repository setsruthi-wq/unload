import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const { login, loginAsDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('child'); // 'child' | 'parent'

  const handleLogin = () => {
    login(
      email || (selectedRole === 'child' ? 'leo.j@safesprout.org' : 'sarah.j@safesprout.org'),
      password,
      selectedRole,
      name,
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Welcome Back"
        subtitle="Sign in to continue your unloading journey"
        onBack={() => navigation.goBack()}
        showRoleBadge={false}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Role Toggle Selector */}
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
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder={selectedRole === 'child' ? 'e.g. Alex Johnson' : 'e.g. Sarah Johnson'}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>Email or Username</Text>
          <TextInput
            style={styles.input}
            placeholder={selectedRole === 'child' ? 'leo.j@safesprout.org' : 'sarah.j@safesprout.org'}
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title={`Log In as ${selectedRole === 'child' ? 'Child' : 'Parent'}`}
            size="large"
            onPress={handleLogin}
            style={styles.submitBtn}
          />
        </Card>

        {/* Quick Demo Logins for Hackathon review */}
        <View style={styles.demoBox}>
          <Text style={styles.demoHeading}>⚡ Quick One-Tap Demo Login</Text>
          <View style={styles.demoButtonRow}>
            <Button
              title="Child: Leo 🌱"
              variant="outline"
              size="small"
              onPress={() => loginAsDemo('child')}
              style={styles.demoSingleBtn}
            />
            <Button
              title="Parent: Sarah 👩‍💼"
              variant="outline"
              size="small"
              onPress={() => loginAsDemo('parent')}
              style={styles.demoSingleBtn}
            />
          </View>
        </View>

        {/* Register Prompt */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an UNLOAD account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
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
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 4,
  },
  demoBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  demoButtonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  demoSingleBtn: {
    flex: 1,
    marginHorizontal: 4,
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
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
