import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { useUnload } from '../../context/UnloadContext';
import { mockParentData } from '../../data/mockData';

export const ParentDashboardScreen = ({ navigation }) => {
  const [selectedChild, setSelectedChild] = useState('child_1');
  const [dinnerMode, setDinnerMode] = useState(false);

  const {
    actualDailyUsage,
    currentDailyLimit,
    savedComparedToBaseline,
    currentStage,
    dayNumber,
    streak,
    appsList,
    addUsage,
    safeZones,
    currentMockLocation,
    activeSafeZone,
    locationEvents,
    bedtimeStatus,
    bedtimeSettings,
    bedtimeMessage,
    lateNightEvents,
  } = useUnload();

  const { children } = mockParentData;
  const currentChild = children.find((c) => c.id === selectedChild) || children[0];

  const percentageUsed = Math.min(
    Math.round((actualDailyUsage / currentDailyLimit) * 100),
    100
  );
  const remainingMinutes = Math.max(0, currentDailyLimit - actualDailyUsage);

  // Status calculation
  let statusText = 'Within Limit';
  let statusVariant = 'primary';
  if (actualDailyUsage >= currentDailyLimit) {
    statusText = 'Goal Reached';
    statusVariant = 'danger';
  } else if (percentageUsed >= 80) {
    statusText = 'Near Limit';
    statusVariant = 'warning';
  }

  const toggleDinnerMode = () => {
    const newState = !dinnerMode;
    setDinnerMode(newState);
    alert(
      newState
        ? `🍽️ Dinner Mode Activated: ${currentChild.name}'s device is paused with a friendly family dinner reminder.`
        : '🍽️ Dinner Mode Deactivated: Normal Progressive Unloading restored.'
    );
  };

  const handleGrantBonus = () => {
    addUsage(-15);
    alert(`✨ +15 Minutes Mindful Bonus granted to ${currentChild.name} as a reward for staying on schedule!`);
  };

  const currentSafeZone = safeZones?.find((z) => z.status === 'Inside') || safeZones?.[0];

  return (
    <View style={styles.container}>
      <Header
        title="Family Guardian"
        subtitle="SafeSprout Digital Wellbeing Dashboard"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Switcher Pills */}
        <View style={styles.childrenRow}>
          {children.map((child) => {
            const isSelected = child.id === selectedChild;
            return (
              <TouchableOpacity
                key={child.id}
                onPress={() => setSelectedChild(child.id)}
                style={[
                  styles.childPill,
                  isSelected && styles.childPillActive,
                ]}
              >
                <Text style={styles.childAvatar}>{child.avatar}</Text>
                <View style={styles.childPillText}>
                  <Text style={[styles.childName, isSelected && styles.childNameActive]}>
                    {child.name} Jenkins
                  </Text>
                  <Text style={styles.childAge}>Day {dayNumber} • 84% 🔋</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clean Visual Summary Card (Required Format) */}
        <Card variant="surface" style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryHeading}>TODAY'S SCREEN TIME</Text>
            <Badge label={statusText} variant={statusVariant} size="small" />
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.actualTimeBig}>{actualDailyUsage} min</Text>
            <Text style={styles.limitTimeText}>/ {currentDailyLimit} min</Text>
          </View>

          <ProgressBar
            progress={percentageUsed}
            color={statusVariant === 'danger' ? colors.danger : statusVariant === 'warning' ? colors.warning : colors.primary}
            height={10}
            style={{ marginVertical: 8 }}
          />

          <View style={styles.remainingRow}>
            <Text style={styles.remainingText}>
              🌿 <Text style={styles.remainingBold}>{remainingMinutes} min remaining</Text>
            </Text>
            <Text style={styles.percentText}>{percentageUsed}% of limit used</Text>
          </View>

          <View style={styles.divider} />

          {/* Stage & Streak Row */}
          <View style={styles.metaRow}>
            <View style={styles.stageBox}>
              <Text style={styles.stageTitle}>{currentStage.shortName}</Text>
              <Text style={styles.stageSubtitle}>{currentStage.subtitle}</Text>
            </View>

            <View style={styles.streakBox}>
              <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
            </View>
          </View>

          {/* Baseline Savings Banner */}
          <View style={styles.savingsBox}>
            <Text style={styles.savingsText}>
              You saved <Text style={styles.savingsHighlight}>{savedComparedToBaseline}</Text> compared with your baseline.
            </Text>
          </View>
        </Card>

        {/* Privacy-First Guardian Ethos */}
        <Card variant="light" style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🌱 SafeSprout Philosophy</Text>
          <Text style={styles.privacyText}>
            Healthy digital habits, not constant surveillance. Parents guide limits while children develop empowered self-regulation.
          </Text>
        </Card>

        {/* Current Safe Zone Status (Step 5) */}
        <Card style={styles.locationCard}>
          <View style={styles.locHeader}>
            <Text style={styles.locHeading}>📍 CHILD LOCATION</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Location')}>
              <Text style={styles.locLink}>Safe Zones →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locRow}>
            <Text style={{ fontSize: 26, marginRight: 10 }}>
              {activeSafeZone?.icon || currentMockLocation?.icon || '📍'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locTitle}>
                {activeSafeZone ? `At ${activeSafeZone.name}` : `At ${currentMockLocation?.name || 'Transit Area'}`}
              </Text>
              <Text style={styles.locSub}>
                {activeSafeZone ? `Inside safe geofence (${activeSafeZone.radius || activeSafeZone.radiusMeters}m)` : 'Outside configured safe zones'}
              </Text>
              {locationEvents && locationEvents.length > 0 && (
                <Text style={styles.lastEventText}>
                  Last event: "{locationEvents[0].text}"
                </Text>
              )}
            </View>
            <Badge
              label={activeSafeZone ? 'Inside Safe Zone' : 'Outside'}
              variant={activeSafeZone ? 'primary' : 'neutral'}
              size="small"
            />
          </View>
        </Card>

        {/* Bedtime & Curfew Status Card (Step 7) */}
        <Card style={styles.locationCard}>
          <View style={styles.locHeader}>
            <Text style={styles.locHeading}>🌙 BEDTIME STATUS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bedtime')}>
              <Text style={styles.locLink}>Bedtime →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locRow}>
            <Text style={{ fontSize: 26, marginRight: 10 }}>
              {bedtimeStatus === 'REST_MODE' ? '🌙' : bedtimeStatus === 'WIND_DOWN' ? '🌅' : bedtimeStatus === 'MORNING_CHECK_IN' ? '☀️' : '🌱'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.locTitle}>
                {bedtimeMessage?.title || 'Good Daytime Balance'}
              </Text>
              <Text style={styles.locSub}>
                {bedtimeMessage?.countdownText || `Rest: ${bedtimeSettings?.restStartTime || '21:00'} – ${bedtimeSettings?.restEndTime || '07:00'}`}
              </Text>
              {lateNightEvents && lateNightEvents.length > 0 && (
                <Text style={[styles.lastEventText, { color: '#F87171' }]}>
                  {lateNightEvents.length} late-night event(s) last night
                </Text>
              )}
            </View>
            <Badge
              label={bedtimeStatus === 'REST_MODE' ? 'Rest Mode' : bedtimeStatus === 'WIND_DOWN' ? 'Wind-Down' : 'Normal'}
              variant={bedtimeStatus === 'REST_MODE' ? 'neutral' : bedtimeStatus === 'WIND_DOWN' ? 'warning' : 'primary'}
              size="small"
            />
          </View>
        </Card>

        {/* Quick Guardian Device Controls */}
        <Text style={styles.sectionHeading}>Real-Time Device Controls</Text>
        <Card style={styles.controlsCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>🍽️ Dinner Mode (Family Pause)</Text>
              <Text style={styles.controlDesc}>
                Gently pauses entertainment apps during family meals.
              </Text>
            </View>
            <Button
              title={dinnerMode ? 'Active' : 'Turn On'}
              variant={dinnerMode ? 'danger' : 'outline'}
              size="small"
              onPress={toggleDinnerMode}
            />
          </View>

          <View style={[styles.controlRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={styles.controlInfo}>
              <Text style={styles.controlTitle}>🎁 Bonus Screen Time</Text>
              <Text style={styles.controlDesc}>
                Reward exceptional offline routines (+15 min).
              </Text>
            </View>
            <Button
              title="+15 Min"
              variant="secondary"
              size="small"
              onPress={handleGrantBonus}
            />
          </View>
        </Card>

        {/* Live Top Apps Glance (Synced with UnloadContext) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Active App Allowances</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.linkText}>View Activity</Text>
          </TouchableOpacity>
        </View>

        {(appsList || []).slice(0, 3).map((app) => (
          <Card key={app.id} style={styles.appCard}>
            <View style={styles.appRow}>
              <View style={[styles.appIconBox, { backgroundColor: `${app.color}20` }]}>
                <Text style={{ fontSize: 20 }}>{app.icon}</Text>
              </View>
              <View style={styles.appInfo}>
                <View style={styles.appHeaderRow}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <Text style={styles.appTime}>
                    {app.currentUsage} <Text style={{ color: colors.textMuted }}>/ {app.dailyLimit}m</Text>
                  </Text>
                </View>
                <ProgressBar
                  progress={app.percentageUsed}
                  color={app.isLimitReached ? colors.danger : app.isWarning ? colors.warning : app.color}
                  height={6}
                  style={{ marginVertical: 4 }}
                />
              </View>
            </View>
          </Card>
        ))}
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
  childrenRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  childPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  childPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  childAvatar: {
    fontSize: 20,
    marginRight: 8,
  },
  childPillText: {},
  childName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  childNameActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  childAge: {
    fontSize: 10,
    color: colors.textMuted,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  actualTimeBig: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  limitTimeText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 6,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  remainingBold: {
    fontWeight: '700',
    color: colors.primaryLight,
  },
  percentText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageBox: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stageSubtitle: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  streakBox: {
    alignItems: 'flex-end',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.warning,
  },
  savingsBox: {
    backgroundColor: colors.surfaceElevated,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  savingsHighlight: {
    fontWeight: '700',
    color: colors.primaryLight,
  },
  privacyCard: {
    padding: 14,
    marginBottom: 16,
    borderColor: colors.borderLight,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealLight,
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  locationCard: {
    padding: 16,
    marginBottom: 18,
  },
  locHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  locLink: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  lastEventText: {
    fontSize: 11,
    color: colors.tealLight,
    marginTop: 3,
    fontStyle: 'italic',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  controlsCard: {
    padding: 16,
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlInfo: {
    flex: 1,
    marginRight: 12,
  },
  controlTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  controlDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  appCard: {
    marginBottom: 8,
    padding: 12,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  appTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
