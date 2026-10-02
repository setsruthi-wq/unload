import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { useUnload } from '../../context/UnloadContext';
import { get6DayUsageHistory, APP_STATUS } from '../../services/usageService';

export const ParentActivityScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  const {
    actualDailyUsage,
    currentDailyLimit,
    appsList,
    parentActivityEvents,
  } = useUnload();

  const history6Days = get6DayUsageHistory();
  const maxHistoryMinutes = 120;

  return (
    <View style={styles.container}>
      <Header
        title="Child Activity"
        subtitle="Real-time app usage & tapering history"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Period Filter Tabs */}
        <View style={styles.periodTabs}>
          {['Today', 'Yesterday', 'Past 7 Days'].map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                styles.periodTab,
                selectedPeriod === period && styles.periodTabActive,
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Screen Time Total Overview Card */}
        <Card variant="primary" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Screen Time</Text>
            <Badge
              label={
                actualDailyUsage >= currentDailyLimit
                  ? 'Goal Reached'
                  : actualDailyUsage / currentDailyLimit >= 0.8
                  ? 'Near Limit'
                  : 'Within Limit'
              }
              variant={
                actualDailyUsage >= currentDailyLimit
                  ? 'danger'
                  : actualDailyUsage / currentDailyLimit >= 0.8
                  ? 'warning'
                  : 'primary'
              }
              size="small"
            />
          </View>
          <Text style={styles.summaryNumbers}>
            {actualDailyUsage} min <Text style={styles.summaryLimit}>/ {currentDailyLimit} min limit</Text>
          </Text>
          <ProgressBar
            progress={actualDailyUsage / currentDailyLimit}
            color={
              actualDailyUsage >= currentDailyLimit
                ? colors.danger
                : actualDailyUsage / currentDailyLimit >= 0.8
                ? colors.warning
                : colors.primary
            }
            height={8}
            style={{ marginVertical: 8 }}
          />
          <Text style={styles.summaryText}>
            {Math.max(0, currentDailyLimit - actualDailyUsage)} minutes remaining today.
          </Text>
        </Card>

        {/* Live App / Category Breakdown (Synchronized with UnloadContext) */}
        <Text style={styles.sectionHeading}>App & Category Breakdown</Text>
        <Text style={styles.sectionSub}>
          Live data synchronized from child's device & usage simulator:
        </Text>

        {(appsList || []).map((app) => {
          const isNear = app.status === APP_STATUS.NEAR_LIMIT;
          const isReached = app.status === APP_STATUS.GOAL_REACHED;

          const badgeVariant = isReached ? 'danger' : isNear ? 'warning' : 'neutral';
          const barColor = isReached ? colors.danger : isNear ? colors.warning : app.color;

          return (
            <Card key={app.id} style={styles.appCard}>
              <View style={styles.appRow}>
                <View style={[styles.appIconBox, { backgroundColor: `${app.color}20` }]}>
                  <Text style={{ fontSize: 22 }}>{app.icon}</Text>
                </View>

                <View style={styles.appBody}>
                  <View style={styles.appHeader}>
                    <Text style={styles.appName}>{app.appName}</Text>
                    <Text style={styles.appStats}>
                      {app.currentUsage} <Text style={{ color: colors.textMuted }}>/ {app.dailyLimit} min</Text>
                    </Text>
                  </View>

                  <ProgressBar
                    progress={app.percentageUsed}
                    color={barColor}
                    height={6}
                    style={{ marginVertical: 6 }}
                  />

                  <View style={styles.appFooter}>
                    <Text style={styles.appRemaining}>
                      {app.remainingTime === 0 ? 'Limit reached' : `${app.remainingTime}m remaining`} ({app.percentageUsed}%)
                    </Text>
                    <Badge label={app.status} variant={badgeVariant} size="small" />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* 6-Day Activity History Section */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>6-Day Activity History</Text>
        <Card style={styles.historyCard}>
          <View style={styles.historyHeadingRow}>
            <Text style={styles.historyTitle}>Screen time is gradually decreasing 🌱</Text>
            <Badge label="Progressive Tapering" variant="primary" size="small" />
          </View>
          <Text style={styles.historySub}>
            Daily entertainment allowances taper naturally without triggering bedtime arguments:
          </Text>

          <View style={styles.historyList}>
            {history6Days.map((item) => {
              const barPercent = Math.min(Math.round((item.usageMinutes / maxHistoryMinutes) * 100), 100);

              return (
                <View key={item.day} style={styles.historyRow}>
                  <Text style={styles.historyDay}>{item.label}</Text>
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
                  <Text style={styles.historyMins}>{item.usageMinutes}m</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Guardian Activity & Nudge Events Feed */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Guardian Activity & Nudge Feed</Text>

        {(parentActivityEvents || []).map((evt) => {
          const isReward =
            evt.text.includes('pts') ||
            evt.text.includes('challenge') ||
            evt.text.includes('streak') ||
            evt.text.includes('redeemed') ||
            evt.text.includes('achievement') ||
            evt.text.includes('Sprout Points');
          const isLocation =
            !isReward &&
            (evt.type === 'safe' ||
              evt.text.includes('arrived') ||
              evt.text.includes('left') ||
              evt.text.includes('Safe Zone'));
          const isWarning = evt.type === 'warning';
          const isWellness = evt.type === 'wellness';

          const icon = isReward
            ? evt.text.includes('streak')
              ? '🔥'
              : evt.text.includes('redeemed')
              ? '🎨'
              : evt.text.includes('achievement')
              ? '⭐'
              : evt.text.includes('challenge')
              ? '🏆'
              : '🌱'
            : isLocation
            ? evt.text.includes('School')
              ? '🏫'
              : evt.text.includes('Home')
              ? '🏠'
              : evt.text.includes('Park')
              ? '🌳'
              : evt.text.includes('left')
              ? '🚶'
              : '📍'
            : isWarning
            ? '⚠️'
            : isWellness
            ? '🧘'
            : 'ℹ️';

          const badgeLabel = isReward
            ? '🏆 Reward'
            : isLocation
            ? '📍 Location'
            : isWarning
            ? 'Screen Alert'
            : isWellness
            ? 'Wellness'
            : 'Routine';

          const badgeVariant = isReward
            ? 'teal'
            : isLocation
            ? 'primary'
            : isWarning
            ? 'warning'
            : isWellness
            ? 'sky'
            : 'neutral';

          return (
            <Card key={evt.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Text style={styles.eventIcon}>{icon}</Text>
                <View style={styles.eventInfo}>
                  <View style={styles.eventTop}>
                    <Text style={styles.eventText}>{evt.text}</Text>
                    <Text style={styles.eventTime}>{evt.time}</Text>
                  </View>
                  <View style={{ marginTop: 4, flexDirection: 'row' }}>
                    <Badge
                      label={badgeLabel}
                      variant={badgeVariant}
                      size="small"
                    />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}
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
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: colors.surfaceElevated,
  },
  periodText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  summaryCard: {
    padding: 18,
    marginBottom: 20,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  summaryNumbers: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  summaryLimit: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMuted,
  },
  summaryText: {
    fontSize: 12,
    color: colors.textPrimary,
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
  },
  appCard: {
    padding: 14,
    marginBottom: 10,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appBody: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appStats: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appRemaining: {
    fontSize: 11,
    color: colors.textMuted,
  },
  historyCard: {
    padding: 16,
    marginBottom: 18,
  },
  historyHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  historySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },
  historyList: {
    width: '100%',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDay: {
    width: 48,
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
  historyMins: {
    width: 40,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  eventCard: {
    padding: 12,
    marginBottom: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
