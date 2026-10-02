import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { mockChildData } from '../../data/mockData';

export const ChildProfileScreen = () => {
  const { logout, switchRole, user } = useAuth();
  // Use live user name/avatar; fall back to mock for static fields (grade, guardian info)
  const name = user?.name || mockChildData.name;
  const avatar = user?.avatar || mockChildData.avatar;
  const { grade, familyCode, guardianName, guardianPhone } = mockChildData;

  const handleCallGuardian = () => {
    alert(`Emergency Call simulated to ${guardianName} (${guardianPhone})`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Profile"
        subtitle="Device settings & guardian link"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 36 }}>{avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.gradeText}>{grade}</Text>
              <Badge label="Active Unloader" variant="primary" size="small" style={{ marginTop: 4 }} />
            </View>
          </View>
        </Card>

        {/* Linked Guardian Card */}
        <Text style={styles.sectionTitle}>Digital Guardian Connection</Text>
        <Card variant="light" style={styles.guardianCard}>
          <View style={styles.guardianRow}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guardianName}>{guardianName}</Text>
              <Text style={styles.guardianPhone}>{guardianPhone}</Text>
              <Text style={styles.guardianStatus}>Device Linked • Safe Zones Active</Text>
            </View>
          </View>

          <Button
            title="📞 Call Guardian (Emergency)"
            variant="outline"
            size="small"
            onPress={handleCallGuardian}
            style={styles.callBtn}
          />
        </Card>

        {/* Pairing Code Card */}
        <Card style={styles.codeCard}>
          <Text style={styles.codeLabel}>Family Pairing Code</Text>
          <Text style={styles.codeValue}>{familyCode}</Text>
          <Text style={styles.codeDesc}>
            Used to securely link another parent or tablet device to your progressive unloading profile.
          </Text>
        </Card>

        {/* Switch Role & Logout */}
        <View style={styles.actionButtons}>
          <Button
            title="Switch to Parent View 👩‍💼"
            variant="secondary"
            size="medium"
            onPress={switchRole}
            style={{ marginBottom: 12 }}
          />

          <Button
            title="Log Out of UNLOAD"
            variant="danger"
            size="medium"
            onPress={logout}
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
    paddingBottom: 30,
  },
  profileCard: {
    padding: 18,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gradeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  guardianCard: {
    padding: 16,
    marginBottom: 16,
  },
  guardianRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guardianName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guardianPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guardianStatus: {
    fontSize: 11,
    color: colors.primaryLight,
    marginTop: 4,
    fontWeight: '500',
  },
  callBtn: {
    borderColor: colors.borderLight,
  },
  codeCard: {
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 3,
    color: colors.primaryLight,
    marginBottom: 6,
  },
  codeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionButtons: {
    marginTop: 10,
  },
});
