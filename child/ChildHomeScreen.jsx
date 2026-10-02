import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useUnload } from '../../context/UnloadContext';
import { useAuth } from '../../context/AuthContext';
import { getNextAchievement } from '../../services/rewardsService';

export const ChildHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    baselineScreenTime,
    currentDailyLimit,
    actualDailyUsage,
    nextDailyLimit,
    currentStage,
    dayNumber,
    streak,
    isLimitReached,
    savedComparedToBaseline,
    appsList,
    reflectionTitle,
    addUsage,
    advanceToNextDay,
    resetToInitial,
    reflectionModalVisible,
    setReflectionModalVisible,
    selectedOfflineActivity,
    setSelectedOfflineActivity,
    currentMockLocation,
    activeSafeZone,
    locationRoutine,
    rewardPoints,
    achievements,
    completeOfflineActivityAction,
    completeReflectionAction,
    bedtimeStatus,
    bedtimeMessage,
  } = useUnload();

  const firstName = user?.firstName || 'there';
  const nextAch = achievements ? getNextAchievement(achievements) : null;

  const usagePercent = Math.min(
    Math.round((actualDailyUsage / currentDailyLimit) * 100),
    100
  );

  return (
    <View style={styles.container}>
      <Header
        title="UNLOAD 🌱"
        subtitle={`Good Evening, ${firstName}!`}
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Location & Routine Awareness Card (Step 5) */}
        <Card variant="light" style={styles.locationBannerCard}>
          <View style={styles.locationBannerRow}>
            <View style={styles.locationBadgeIcon}>
              <Text style={{ fontSize: 22 }}>{activeSafeZone?.icon || currentMockLocation?.icon || '📍'}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.locationBannerTitle}>
                {activeSafeZone ? `At ${activeSafeZone.name}` : `Currently at ${currentMockLocation?.name || 'Transit'}`}
              </Text>
              <Text style={styles.locationBannerMsg}>
                {locationRoutine?.message || 'Mindful screen balance'}
              </Text>
            </View>
            <Badge
              label={locationRoutine?.mode || 'Normal'}
              variant={locationRoutine?.mode === 'Focus Mode' ? 'sky' : 'primary'}
              size="small"
            />
          </View>
        </Card>

        {/* Compact Rewards Card (Step 6) */}
        <Card variant="surface" style={styles.rewardsCompactCard}>
          <View style={styles.rewardsCompactRow}>
            <View style={styles.rewardsIconPill}>
              <Text style={{ fontSize: 20 }}>🌱</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.rewardsPointsText}>{rewardPoints} Sprout Points</Text>
                <Text style={styles.rewardsStreakText}> • 🔥 {streak}d</Text>
              </View>
              <Text style={styles.rewardsNextAchText}>
                Next: {nextAch?.title || '7-Day Grower'}
              </Text>
            </View>
            <Button
              title="Rewards →"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('Rewards')}
              style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            />
          </View>
        </Card>

        {/* Mindful Bedtime & Curfew Card (Step 7) */}
        <Card variant="surface" style={styles.bedtimeCompactCard}>
          <View style={styles.bedtimeCompactRow}>
            <View style={styles.bedtimeIconPill}>
              <Text style={{ fontSize: 20 }}>
                {bedtimeStatus === 'REST_MODE' ? '🌙' : bedtimeStatus === 'WIND_DOWN' ? '🌅' : '🌙'}
              </Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.bedtimeStatusTitle}>
                {bedtimeStatus === 'REST_MODE' ? 'Rest Mode Active' : bedtimeStatus === 'WIND_DOWN' ? 'Wind-Down Active' : 'Mindful Bedtime'}
              </Text>
              <Text style={styles.bedtimeStatusSub} numberOfLines={1}>
                {bedtimeMessage?.countdownText || 'Rest: 9:00 PM'}
              </Text>
            </View>
            <Button
              title="Bedtime →"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('Bedtime')}
              style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            />
          </View>
        </Card>

        {/* Main Progressive Unloading Card */}
        <Card variant="surface" style={styles.mainProgressCard}>
          <Text style={styles.screenTimeHeading}>Today's Screen Time</Text>

          <View style={styles.timeDisplay}>
            <Text style={styles.actualTimeBig}>{actualDailyUsage} min</Text>
            <Text style={styles.limitTimeText}>/ {currentDailyLimit} min</Text>
          </View>

          {/* Clean Progress Bar with Percentage */}
          <View style={styles.progressSection}>
            <ProgressBar
              progress={usagePercent}
              color={isLimitReached ? colors.warning : colors.primary}
              height={14}
              style={styles.bar}
            />
            <View style={styles.percentRow}>
              <Text style={styles.percentText}>{usagePercent}% used</Text>
              <Text style={styles.remainingText}>
                {Math.max(0, currentDailyLimit - actualDailyUsage)} min remaining
              </Text>
            </View>
          </View>

          {/* Stage Badge & Title */}
          <View style={styles.stageRow}>
            <View style={styles.stageIconBox}>
              <Text style={{ fontSize: 22 }}>{currentStage.icon || '🌱'}</Text>
            </View>
            <View style={styles.stageTextBox}>
              <Text style={styles.stageTitle}>{currentStage.shortName}</Text>
              <Text style={styles.stageSubtitle}>{currentStage.subtitle}</Text>
            </View>
            <Badge
              label={`Day ${dayNumber}`}
              variant="neutral"
              size="small"
            />
          </View>

          {/* Today's Goal */}
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Today's Goal</Text>
            <Text style={styles.goalValue}>
              {currentDailyLimit} min → <Text style={styles.tomorrowHighlight}>{nextDailyLimit} min tomorrow</Text>
            </Text>
          </View>

          {/* Streak Indicator */}
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 {streak} Day Streak</Text>
          </View>

          {/* Saved Compared with Baseline */}
          <View style={styles.savedContainer}>
            <Text style={styles.savedHighlight}>
              You saved {savedComparedToBaseline}
            </Text>
            <Text style={styles.savedSub}>compared with your baseline ({baselineScreenTime}m)</Text>
          </View>

          {/* Chosen Offline Activity Indicator (if any) */}
          {selectedOfflineActivity && (
            <Card variant="teal" style={styles.chosenActCard}>
              <Text style={styles.chosenActTitle}>
                {selectedOfflineActivity.icon} Today's Offline Activity
              </Text>
              <Text style={styles.chosenActDesc}>{selectedOfflineActivity.title}</Text>
            </Card>
          )}

          {/* Start 2-Min Reset Action Button */}
          <Button
            title="[ Start 2-Min Reset ]"
            size="large"
            variant={isLimitReached ? 'primary' : 'outline'}
            onPress={() => setReflectionModalVisible(true)}
            style={styles.resetBtn}
          />
        </Card>

        {/* Interactive Engine Simulator (for testing Progressive Calculation) */}
        <Card variant="light" style={styles.simulatorCard}>
          <View style={styles.simHeader}>
            <Text style={styles.simTitle}>⚡ Progressive Engine Simulator</Text>
            <TouchableOpacity onPress={resetToInitial}>
              <Text style={styles.simReset}>Reset Demo</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.simSubtitle}>
            Test adding usage to hit the goal, or simulate advancing to tomorrow to see limits taper.
          </Text>

          <View style={styles.simButtonRow}>
            <Button
              title="+10m Usage"
              variant="secondary"
              size="small"
              onPress={() => addUsage(10)}
              style={styles.simBtn}
            />
            <Button
              title="+15m (Trigger Goal)"
              variant="secondary"
              size="small"
              onPress={() => addUsage(15)}
              style={styles.simBtn}
            />
            <Button
              title="Next Day →"
              variant="primary"
              size="small"
              onPress={() => advanceToNextDay()}
              style={styles.simBtn}
            />
          </View>
        </Card>

        {/* App-by-App Tapering Overview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's App Allowances</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Usage')}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        {(appsList || []).slice(0, 4).map((app) => (
          <Card key={app.id} style={styles.appCard}>
            <View style={styles.appRow}>
              <View style={[styles.appIconBox, { backgroundColor: `${app.color}20` }]}>
                <Text style={{ fontSize: 18 }}>{app.icon || '📱'}</Text>
              </View>
              <View style={styles.appInfo}>
                <View style={styles.appHeaderRow}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <Text style={styles.appTime}>
                    {app.currentUsage}m / {app.dailyLimit}m
                  </Text>
                </View>
                <ProgressBar
                  progress={app.currentUsage / app.dailyLimit}
                  color={app.isLimitReached ? colors.danger : app.isWarning ? colors.warning : app.color}
                  height={6}
                  style={{ marginVertical: 6 }}
                />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Reflection & Mindful Reset Experience Modal */}
      <ReflectionModal
        visible={reflectionModalVisible}
        onClose={completeReflectionAction}
        selectedActivity={selectedOfflineActivity}
        onActivitySelect={(activity) => completeOfflineActivityAction(activity)}
        title={reflectionTitle}
      />
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
  mainProgressCard: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 16,
    alignItems: 'center',
  },
  screenTimeHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actualTimeBig: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: -1,
  },
  limitTimeText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: -4,
  },
  progressSection: {
    width: '100%',
    marginBottom: 18,
  },
  bar: {
    marginBottom: 6,
  },
  percentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  remainingText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageIconBox: {
    marginRight: 10,
  },
  stageTextBox: {
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
    fontWeight: '500',
  },
  goalRow: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tomorrowHighlight: {
    color: colors.primaryLight,
  },
  streakContainer: {
    marginBottom: 12,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.warning,
    letterSpacing: 0.2,
  },
  savedContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  savedHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 2,
  },
  savedSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chosenActCard: {
    width: '100%',
    padding: 12,
    marginBottom: 14,
  },
  chosenActTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealLight,
    marginBottom: 2,
  },
  chosenActDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resetBtn: {
    width: '100%',
  },
  simulatorCard: {
    padding: 14,
    marginBottom: 18,
    borderColor: colors.borderLight,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  simTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  simReset: {
    fontSize: 12,
    color: colors.sky,
    fontWeight: '600',
  },
  simSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginBottom: 12,
  },
  simButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simBtn: {
    flex: 1,
    marginHorizontal: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
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
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  locationBannerCard: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
  },
  locationBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationBannerMsg: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rewardsCompactCard: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  rewardsCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsIconPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsPointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardsStreakText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  rewardsNextAchText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  bedtimeCompactCard: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  bedtimeCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bedtimeIconPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedtimeStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bedtimeStatusSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
