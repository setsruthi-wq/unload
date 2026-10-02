import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { mockParentData } from '../../data/mockData';

export const ParentProfileScreen = () => {
  const { logout, switchRole, user } = useAuth();

  // Live user name/email/avatar — falls back to mock defaults for demo
  const name = user?.name || mockParentData.name;
  const email = user?.email || mockParentData.email;
  const avatar = user?.avatar || mockParentData.avatar;
  const { familyId, children } = mockParentData;

  // Guardian Alert toggles
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [arrivalPings, setArrivalPings] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Privacy Settings toggles (Step 4)
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [usageSharingEnabled, setUsageSharingEnabled] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);
  const [reflectionDataRetention, setReflectionDataRetention] = useState(true);

  const handlePairDevice = () => {
    alert("📱 Pairing Code Generated: SPROUT-8492. Enter this code on your child's device during registration to sync.");
  };

  return (
    <View style={styles.container}>
      <Header
        title="Guardian Settings"
        subtitle="Family account & device pairing"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={{ fontSize: 34 }}>{avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <Badge label={`Family ID: ${familyId}`} variant="sky" size="small" style={{ marginTop: 4 }} />
            </View>
          </View>
        </Card>

        {/* Paired Child Devices */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Paired Child Devices</Text>
          <Button
            title="+ Pair New Device"
            variant="outline"
            size="small"
            onPress={handlePairDevice}
          />
        </View>

        {children.map((child) => (
          <Card key={child.id} style={styles.childCard}>
            <View style={styles.childRow}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{child.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childStatus}>{child.status}</Text>
              </View>
              <Badge label={`${child.battery}% 🔋`} variant="neutral" size="small" />
            </View>
          </Card>
        ))}

        {/* Guardian Alerts */}
        <Text style={[styles.sectionHeading, { marginTop: 18, marginBottom: 10 }]}>
          Guardian Alerts
        </Text>
        <Card style={styles.settingsCard}>
          <SettingRow
            title="Late-Night Screen Alerts"
            desc="Notify if phone is unlocked past 9:00 PM"
            value={alertsEnabled}
            onValueChange={setAlertsEnabled}
          />
          <SettingRow
            title="Safe Zone Arrival Pings"
            desc="Alerts upon safe school/home check-ins"
            value={arrivalPings}
            onValueChange={setArrivalPings}
            divider
          />
          <SettingRow
            title="Weekly Progress Summary"
            desc="Receive email digest of progressive unloading habits"
            value={weeklyDigest}
            onValueChange={setWeeklyDigest}
            divider
          />
        </Card>

        {/* ── Privacy Settings (Step 4) ── */}
        <Text style={[styles.sectionHeading, { marginTop: 18, marginBottom: 6 }]}>
          🔒 Privacy & Data Settings
        </Text>
        <Card variant="light" style={styles.privacyNoteCard}>
          <Text style={styles.privacyNoteText}>
            UNLOAD uses only the minimum data needed to support healthy digital habits.
            Location sharing is controlled by you and is never used for advertising.
            All data stays on-device in this prototype.
          </Text>
        </Card>

        <Card style={styles.settingsCard}>
          <SettingRow
            title="Safe Zone Location Sharing"
            desc="Allow the app to know when your child arrives at configured safe zones"
            value={locationSharingEnabled}
            onValueChange={setLocationSharingEnabled}
          />
          <SettingRow
            title="App Usage Data Sharing"
            desc="Share screen-time summaries across Child and Guardian views"
            value={usageSharingEnabled}
            onValueChange={setUsageSharingEnabled}
            divider
          />
          <SettingRow
            title="Reflection Session Retention"
            desc="Keep mindful reflection responses to track wellbeing progress"
            value={reflectionDataRetention}
            onValueChange={setReflectionDataRetention}
            divider
          />
          <SettingRow
            title="Anonymous Usage Analytics"
            desc="Help Safesprout improve the app with anonymous crash & usage data"
            value={anonymousAnalytics}
            onValueChange={setAnonymousAnalytics}
            divider
          />
        </Card>

        {/* App Version */}
        <Card variant="light" style={styles.versionCard}>
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>UNLOAD by Safesprout</Text>
            <Badge label="v1.0.0-prototype" variant="neutral" size="small" />
          </View>
          <Text style={styles.versionDesc}>
            Step 4 — Parent Guardian System · No real GPS, screen-time APIs, or backend used
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actionsBox}>
          <Button
            title="Switch to Child View 🌱"
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

// ─── Reusable setting row component ───────────────────────────────────────────
const SettingRow = ({ title, desc, value, onValueChange, divider = false }) => (
  <View
    style={[
      styles.settingRow,
      divider && { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
    ]}
  >
    <View style={{ flex: 1, marginRight: 10 }}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{desc}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
      thumbColor={colors.textPrimary}
    />
  </View>
);

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

  // Profile card
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
    borderColor: colors.sky,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Section header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Child card
  childCard: {
    padding: 14,
    marginBottom: 8,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  childStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Settings / Privacy cards
  settingsCard: {
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  // Privacy note
  privacyNoteCard: {
    padding: 13,
    marginBottom: 10,
  },
  privacyNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  // Version
  versionCard: {
    padding: 14,
    marginBottom: 20,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  versionDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },

  // Actions
  actionsBox: {
    marginTop: 4,
  },
});
