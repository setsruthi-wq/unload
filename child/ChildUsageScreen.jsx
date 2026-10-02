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
import { get6DayUsageHistory, HABIT_COACHING_20_20_20, APP_STATUS } from '../../services/usageService';

export const ChildUsageScreen = () => {
  const {
    actualDailyUsage,
    currentDailyLimit,
    appsList,
    addAppUsage,
    resetAppUsage,
    activeAppWarning,
    reflectionModalVisible,
    setReflectionModalVisible,
    reflectionTitle,
    selectedOfflineActivity,
    setSelectedOfflineActivity,
  } = useUnload();

  const history6Days = get6DayUsageHistory();
  const maxHistoryMinutes = 120;

  return (
    <View style={styles.container}>
      <Header
        title="App Usage"
        subtitle="Transparent breakdown of your digital time"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY'S SCREEN TIME Top Overview Card */}
        <Card variant="primary" style={styles.topCard}>
          <Text style={styles.topCardHeading}>TODAY'S SCREEN TIME</Text>
          <View style={styles.topTimeRow}>
            <Text style={styles.topTimeBig}>{actualDailyUsage} min</Text>
            <Text style={styles.topTimeLimit}>/ {currentDailyLimit} min</Text>
          </View>
          <ProgressBar
            progress={Math.min(actualDailyUsage / currentDailyLimit, 1)}
            color={actualDailyUsage >= currentDailyLimit ? colors.warning : colors.primary}
            height={8}
            style={{ marginTop: 8, marginBottom: 6 }}
          />
          <Text style={styles.topTimeSub}>
            {Math.max(0, currentDailyLimit - actualDailyUsage)} min allowance remaining today
          </Text>
        </Card>

        {/* 80%+ Non-blocking Warning Banner */}
        {activeAppWarning && (
          <Card variant="warning" style={styles.warningCard}>
            <View style={styles.warningRow}>
              <Text style={styles.warningEmoji}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>{activeAppWarning}</Text>
                <Text style={styles.warningDesc}>
                  Gentle heads up: Consider saving your remaining minutes for later today.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* USAGE SIMULATOR Controls */}
        <Card variant="light" style={styles.simCard}>
          <View style={styles.simHeader}>
            <Text style={styles.simHeading}>⚡ Usage Simulator (Interactive Demo)</Text>
            <TouchableOpacity onPress={resetAppUsage}>
              <Text style={styles.simReset}>Reset Usage</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.simDesc}>
            Simulate live app usage to test 80% warnings and the mindful reflection trigger.
          </Text>

          <View style={styles.simControlsRow}>
            <Button
              title="+5m Instagram"
              variant="outline"
              size="small"
              onPress={() => addAppUsage('app_insta', 5)}
              style={styles.simBtn}
            />
            <Button
              title="+5m YouTube"
              variant="outline"
              size="small"
              onPress={() => addAppUsage('app_youtube', 5)}
              style={styles.simBtn}
            />
            <Button
              title="+10m Games"
              variant="outline"
              size="small"
              onPress={() => addAppUsage('app_games', 10)}
              style={styles.simBtn}
            />
          </View>
        </Card>

        {/* App / Category Cards */}
        <Text style={styles.sectionHeading}>App Allowances & Limits</Text>

        {(appsList || []).map((app) => {
          const isNear = app.status === APP_STATUS.NEAR_LIMIT;
          const isReached = app.status === APP_STATUS.GOAL_REACHED;

          const badgeVariant = isReached ? 'danger' : isNear ? 'warning' : 'neutral';
          const barColor = isReached ? colors.danger : isNear ? colors.warning : app.color;

          return (
            <Card key={app.id} style={styles.appCard}>
              <View style={styles.appRow}>
                <View style={[styles.appIconCircle, { backgroundColor: `${app.color}20` }]}>
                  <Text style={{ fontSize: 24 }}>{app.icon}</Text>
                </View>

                <View style={styles.appBody}>
                  <View style={styles.appTitleRow}>
                    <Text style={styles.appName}>{app.appName}</Text>
                    <Text style={styles.appStats}>
                      {app.currentUsage} <Text style={styles.appLimitText}>/ {app.dailyLimit} min</Text>
                    </Text>
                  </View>

                  <ProgressBar
                    progress={app.percentageUsed}
                    color={barColor}
                    height={8}
                    style={{ marginVertical: 8 }}
                  />

                  <View style={styles.appMetaRow}>
                    <Text style={styles.remainingText}>
                      {app.remainingTime === 0
                        ? 'Limit reached'
                        : `${app.remainingTime} min remaining`}
                    </Text>

                    <Badge
                      label={app.status}
                      variant={badgeVariant}
                      size="small"
                    />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* 6-Day Usage History Chart */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Previous 6 Days Screen Time</Text>
        <Card style={styles.historyCard}>
          <Text style={styles.historySubtitle}>
            Consistent progressive reduction over the past week:
          </Text>

          <View style={styles.historyList}>
            {history6Days.map((item) => {
              const barPercent = Math.min(Math.round((item.usageMinutes / maxHistoryMinutes) * 100), 100);

              return (
                <View key={item.day} style={styles.historyRow}>
                  <Text style={styles.historyDayLabel}>{item.label}</Text>

                  <View style={styles.historyBarTrack}>
                    <View
                      style={[
                        styles.historyBarFill,
                        {
                          width: `${barPercent}%`,
                          backgroundColor: item.day === 6 ? colors.primaryLight : colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.historyMinutesLabel}>{item.usageMinutes}m</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* 20-20-20 Habit Coaching Feature */}
        <Card variant="light" style={styles.coachingCard}>
          <Text style={styles.coachingTitle}>{HABIT_COACHING_20_20_20.title}</Text>
          <Text style={styles.coachingMessage}>"{HABIT_COACHING_20_20_20.message}"</Text>
          <Text style={styles.coachingSub}>{HABIT_COACHING_20_20_20.subtitle}</Text>
        </Card>
      </ScrollView>

      {/* Reflection Modal */}
      <ReflectionModal
        visible={reflectionModalVisible}
        onClose={() => setReflectionModalVisible(false)}
        selectedActivity={selectedOfflineActivity}
        onActivitySelect={(act) => setSelectedOfflineActivity(act)}
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
  topCard: {
    padding: 18,
    marginBottom: 16,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  topCardHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  topTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  topTimeBig: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  topTimeLimit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: 6,
  },
  topTimeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  warningCard: {
    padding: 14,
    marginBottom: 14,
    borderColor: colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningEmoji: {
    fontSize: 22,
    marginRight: 10,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  simCard: {
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
  simHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  simReset: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sky,
  },
  simDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
  },
  simControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simBtn: {
    flex: 1,
    marginHorizontal: 3,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  appCard: {
    padding: 14,
    marginBottom: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appBody: {
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
  appStats: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appLimitText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  appMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  historyCard: {
    padding: 16,
    marginBottom: 18,
  },
  historySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
  },
  historyList: {
    width: '100%',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDayLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  historyBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  historyBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  historyMinutesLabel: {
    width: 40,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  coachingCard: {
    padding: 16,
    marginTop: 4,
    marginBottom: 20,
    borderColor: colors.tealLight,
  },
  coachingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.tealLight,
    marginBottom: 4,
  },
  coachingMessage: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  coachingSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
});
