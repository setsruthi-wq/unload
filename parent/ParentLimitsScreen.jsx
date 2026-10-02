import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useUnload } from '../../context/UnloadContext';

export const ParentLimitsScreen = () => {
  const {
    currentDailyLimit,
    updateDailyLimit,
    appsList,
    updateAppLimit,
    warningThreshold,
    setWarningThreshold,
    requireReflection,
    setRequireReflection,
    currentStage,
    rewardPoints,
    achievements,
    dailyChallenges,
    redeemedRewards,
    parentRewardSettings,
    updateParentRewardSettings,
  } = useUnload();

  const [savedBanner, setSavedBanner] = useState(false);

  const triggerSaveNotification = (msg) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleAdjustDailyLimit = (delta) => {
    const newLimit = currentDailyLimit + delta;
    updateDailyLimit(newLimit);
    triggerSaveNotification(`Daily limit updated to ${newLimit} min`);
  };

  const handleAdjustAppLimit = (appId, delta, currentLim) => {
    const newLim = Math.max(5, currentLim + delta);
    updateAppLimit(appId, newLim);
    triggerSaveNotification(`App limit adjusted to ${newLim} min`);
  };

  // Apps to feature primarily in guardian limit controls
  const focusApps = (appsList || []).filter((a) =>
    ['app_insta', 'app_youtube', 'app_games'].includes(a.id)
  );

  return (
    <View style={styles.container}>
      <Header
        title="Guardian Limits"
        subtitle="Configure daily caps & app allowances"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Real-time sync confirmation banner */}
        {savedBanner && (
          <Card variant="primary" style={styles.toastBanner}>
            <Text style={styles.toastText}>✓ {savedBanner}</Text>
          </Card>
        )}

        {/* Philosophy Note */}
        <Card variant="primary" style={styles.philosophyCard}>
          <Text style={styles.philTitle}>🌱 Progressive Tapering Controls</Text>
          <Text style={styles.philDesc}>
            Adjust limits gradually. When children participate in setting these gentle boundaries, resistance dissolves and self-regulation grows.
          </Text>
        </Card>

        {/* SECTION A: Overall Daily Screen-Time Limit */}
        <Text style={styles.sectionHeading}>A. Daily Screen-Time Allowance</Text>
        <Card style={styles.stepperCard}>
          <View style={styles.stepperTop}>
            <View>
              <Text style={styles.stepperTitle}>Overall Daily Cap</Text>
              <Text style={styles.stepperSubtitle}>{currentStage.name}</Text>
            </View>
            <Badge label={`${currentDailyLimit} min / day`} variant="primary" size="medium" />
          </View>

          <View style={styles.stepperControlsRow}>
            <TouchableOpacity
              onPress={() => handleAdjustDailyLimit(-5)}
              style={styles.stepperBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>- 5m</Text>
            </TouchableOpacity>

            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValueText}>{currentDailyLimit}</Text>
              <Text style={styles.stepperUnitText}>minutes</Text>
            </View>

            <TouchableOpacity
              onPress={() => handleAdjustDailyLimit(5)}
              style={styles.stepperBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>+ 5m</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION B: App Limits (Instagram, YouTube, Games) */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>B. App Allowances</Text>
        <Text style={styles.sectionSub}>
          Adjust allowances for specific entertainment apps. Changes synchronize instantly to the child device:
        </Text>

        {focusApps.map((app) => (
          <Card key={app.id} style={styles.appLimitCard}>
            <View style={styles.appRow}>
              <View style={[styles.appIconBox, { backgroundColor: `${app.color}20` }]}>
                <Text style={{ fontSize: 24 }}>{app.icon}</Text>
              </View>

              <View style={styles.appInfo}>
                <View style={styles.appTitleRow}>
                  <Text style={styles.appName}>{app.appName}</Text>
                  <Badge
                    label={app.status}
                    variant={app.isLimitReached ? 'danger' : app.isWarning ? 'warning' : 'neutral'}
                    size="small"
                  />
                </View>
                <Text style={styles.appUsageSub}>
                  Current usage: {app.currentUsage} min
                </Text>
              </View>
            </View>

            <View style={styles.appStepperRow}>
              <Text style={styles.appLimitLabel}>Daily Limit:</Text>
              <View style={styles.miniStepper}>
                <TouchableOpacity
                  onPress={() => handleAdjustAppLimit(app.id, -5, app.dailyLimit)}
                  style={styles.miniBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.miniBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.miniValueText}>{app.dailyLimit} min</Text>

                <TouchableOpacity
                  onPress={() => handleAdjustAppLimit(app.id, 5, app.dailyLimit)}
                  style={styles.miniBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.miniBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        {/* SECTION C: Warning Threshold Selector */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>C. Non-Blocking Warning Threshold</Text>
        <Text style={styles.sectionSub}>
          Delivers a gentle, non-punitive mindful nudge before the limit is reached:
        </Text>

        <Card style={styles.thresholdCard}>
          <Text style={styles.thresholdPrompt}>
            Alert when app reaches: <Text style={styles.thresholdHighlight}>{warningThreshold}%</Text> of limit
          </Text>

          <View style={styles.chipsRow}>
            {[70, 80, 90].map((percent) => {
              const isSelected = warningThreshold === percent;
              return (
                <TouchableOpacity
                  key={percent}
                  onPress={() => {
                    setWarningThreshold(percent);
                    triggerSaveNotification(`Warning threshold set to ${percent}%`);
                  }}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {percent}% {percent === 80 ? '(Default)' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* SECTION D: Reflection Requirement Toggle */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>D. Mindful Reflection Setting</Text>
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>Require reflection when limit is reached</Text>
              <Text style={styles.toggleDesc}>
                Instead of harsh blocking, prompts a 2-minute reset, mood check-in, and offline activity selection.
              </Text>
            </View>
            <Switch
              value={requireReflection}
              onValueChange={(val) => {
                setRequireReflection(val);
                triggerSaveNotification(`Reflection requirement ${val ? 'enabled' : 'disabled'}`);
              }}
              trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </Card>

        {/* SECTION E: Guardian Rewards & Gamification (Step 6) */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>E. Guardian Rewards & Gamification</Text>

        <Card style={styles.rewardsSummaryCard}>
          <View style={styles.rewardsSummaryHeader}>
            <View>
              <Text style={styles.rewardsSummaryLabel}>Child's Sprout Points</Text>
              <Text style={styles.rewardsSummaryPoints}>🌱 {rewardPoints} Points</Text>
            </View>
            <Badge
              label={`${(achievements || []).filter((a) => a.unlocked).length} / ${(achievements || []).length} Achievements`}
              variant="primary"
              size="small"
            />
          </View>
          <View style={styles.rewardsStatsRow}>
            <Text style={styles.rewardsStatText}>
              Completed Challenges: {(dailyChallenges || []).filter((c) => c.completed).length} / {(dailyChallenges || []).length}
            </Text>
            <Text style={styles.rewardsStatText}>
              Redeemed Perks: {(redeemedRewards || []).length}
            </Text>
          </View>
        </Card>

        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>Rewards System Enabled</Text>
              <Text style={styles.toggleDesc}>
                Allows the child to earn Sprout Points for self-regulation and healthy habits.
              </Text>
            </View>
            <Switch
              value={parentRewardSettings?.rewardsEnabled ?? true}
              onValueChange={(val) => {
                updateParentRewardSettings({ rewardsEnabled: val });
                triggerSaveNotification(`Rewards system ${val ? 'enabled' : 'paused'}`);
              }}
              trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={[styles.toggleRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>Daily Challenge Rewards</Text>
              <Text style={styles.toggleDesc}>
                Awards bonus points when completing daily digital detox challenges.
              </Text>
            </View>
            <Switch
              value={parentRewardSettings?.challengeRewards ?? true}
              onValueChange={(val) => {
                updateParentRewardSettings({ challengeRewards: val });
                triggerSaveNotification(`Challenge rewards ${val ? 'enabled' : 'paused'}`);
              }}
              trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={[styles.toggleRow, { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleTitle}>Safe Zone Routine Rewards</Text>
              <Text style={styles.toggleDesc}>
                Awards points when following focus routines at School or outdoor activities at Parks.
              </Text>
            </View>
            <Switch
              value={parentRewardSettings?.safeZoneRewards ?? true}
              onValueChange={(val) => {
                updateParentRewardSettings({ safeZoneRewards: val });
                triggerSaveNotification(`Safe zone routine rewards ${val ? 'enabled' : 'paused'}`);
              }}
              trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </Card>

        {/* Night-Time Curfew (Preserved) */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Night-Time Curfew & Wind-Down</Text>
        <Card style={styles.curfewCard}>
          <View style={styles.curfewRow}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.curfewTitle}>Bedtime Wind-Down: 9:00 PM – 7:00 AM</Text>
              <Text style={styles.curfewDesc}>
                Warm screen tint and calming reminder begins 30 mins before sleep (8:30 PM).
              </Text>
            </View>
            <Badge label="Active" variant="teal" size="small" />
          </View>
        </Card>
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
  toastBanner: {
    padding: 12,
    marginBottom: 12,
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
    textAlign: 'center',
  },
  philosophyCard: {
    padding: 16,
    marginBottom: 16,
  },
  philTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    marginBottom: 4,
  },
  philDesc: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  stepperCard: {
    padding: 16,
    marginBottom: 16,
  },
  stepperTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepperTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperSubtitle: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  stepperControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 6,
  },
  stepperBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  stepperUnitText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -2,
  },
  appLimitCard: {
    padding: 14,
    marginBottom: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
  },
  appTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appUsageSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  appStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  appLimitLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  miniStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: 4,
  },
  miniBtn: {
    backgroundColor: colors.surfaceLight,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  miniValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    paddingHorizontal: 12,
  },
  thresholdCard: {
    padding: 16,
    marginBottom: 16,
  },
  thresholdPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  thresholdHighlight: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  toggleCard: {
    padding: 16,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  curfewCard: {
    padding: 14,
    marginBottom: 10,
  },
  curfewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  curfewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  curfewDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rewardsSummaryCard: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
  },
  rewardsSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardsSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  rewardsSummaryPoints: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  rewardsStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  rewardsStatText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
