import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { StatCard } from '../../components/StatCard';
import { useUnload } from '../../context/UnloadContext';
import {
  calculateAverageUsage,
  calculateUsageReduction,
  calculateReductionPercentage,
  getLimitAdherence,
  getUsageTrend,
  getReflectionStats,
  getOfflineActivityStats,
  getBedtimeConsistency,
  getSafeZoneRoutineStats,
  getWellnessSummary,
  generateWellnessInsights,
  TREND_LABELS,
} from '../../services/analyticsService';
import { formatMinutes } from '../../services/progressiveUnloading';

// ─── Minimal bar chart renderer ───────────────────────────────────────────────
const UsageBarChart = ({ history = [], currentUsage, currentLimit }) => {
  const allEntries = [
    ...history.map((d) => ({ ...d, isCurrent: false })),
    { day: (history.length || 0) + 1, used: currentUsage, limit: currentLimit, isCurrent: true },
  ];
  const maxVal = Math.max(...allEntries.map((d) => Math.max(d.used || 0, d.limit || 0)), 10);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.yLabels}>
        <Text style={chartStyles.yLabel}>{maxVal}m</Text>
        <Text style={chartStyles.yLabel}>{Math.round(maxVal / 2)}m</Text>
        <Text style={chartStyles.yLabel}>0</Text>
      </View>
      <View style={chartStyles.barsArea}>
        {allEntries.map((entry, idx) => {
          const usedHeight = Math.max(4, Math.round(((entry.used || 0) / maxVal) * 90));
          const limitHeight = Math.max(4, Math.round(((entry.limit || 0) / maxVal) * 90));
          const withinLimit = (entry.used || 0) <= (entry.limit || Infinity);
          return (
            <View key={idx} style={chartStyles.barGroup}>
              {/* Limit marker line */}
              <View style={[chartStyles.limitLine, { bottom: limitHeight }]} />
              {/* Usage bar */}
              <View
                style={[
                  chartStyles.bar,
                  { height: usedHeight },
                  entry.isCurrent && chartStyles.barCurrent,
                  !withinLimit && chartStyles.barExceeded,
                ]}
              />
              <Text style={chartStyles.barLabel}>
                {entry.isCurrent ? 'Today' : `D${entry.day}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 120,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  yLabels: {
    width: 36,
    height: 100,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingBottom: 16,
  },
  yLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  barsArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 10,
    marginBottom: 0,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  bar: {
    width: 14,
    backgroundColor: colors.primary,
    borderRadius: 3,
    opacity: 0.8,
  },
  barCurrent: {
    backgroundColor: colors.primaryLight,
    opacity: 1,
  },
  barExceeded: {
    backgroundColor: colors.warning,
  },
  limitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  barLabel: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ChildAnalyticsScreen = () => {
  const {
    history,
    baselineScreenTime,
    currentDailyLimit,
    actualDailyUsage,
    nextDailyLimit,
    streak,
    currentStage,
    dayNumber,
    rewardPoints,
    rewardHistory,
    achievements,
    appsList,
    bedtimeActivity,
    lateNightEvents,
    sleepCheckIn,
    locationEvents,
  } = useUnload();

  const summary = useMemo(
    () =>
      getWellnessSummary({
        history,
        baseline: baselineScreenTime,
        currentDailyLimit,
        actualDailyUsage,
        streak,
        rewardPoints,
        rewardHistory,
        achievements,
        bedtimeActivity,
        lateNightEvents,
        sleepCheckIn,
        locationEvents,
      }),
    [history, baselineScreenTime, currentDailyLimit, actualDailyUsage, streak, rewardPoints, rewardHistory, achievements, bedtimeActivity, lateNightEvents, sleepCheckIn, locationEvents]
  );

  const insights = useMemo(() => generateWellnessInsights(summary), [summary]);
  const trend = TREND_LABELS[summary.trend] || TREND_LABELS.insufficient_data;
  const adherence = summary.adherence;
  const reflStats = summary.reflectionStats;
  const offStats = summary.offlineStats;
  const btConsistency = summary.bedtimeConsistency;
  const szStats = summary.safeZoneStats;

  // Progress toward Digital Zen (Stage 4 = 30 min)
  const zenTarget = 30;
  const progressToZen = Math.min(100, Math.round(((baselineScreenTime - currentDailyLimit) / (baselineScreenTime - zenTarget)) * 100));

  return (
    <View style={styles.container}>
      <Header
        title="Wellness Analytics 📊"
        subtitle="Your digital wellbeing progress"
        showRoleBadge={true}
      />

      <ScrollView contentContainerStyle={styles.content}>

        {/* A. Wellness Overview */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>🌱 Wellness Overview</Text>
              <Text style={styles.cardSubtitle}>Day {dayNumber} • {currentStage.name}</Text>
            </View>
            <Badge text={`🔥 ${streak}d streak`} variant="success" />
          </View>

          <View style={styles.statRow}>
            <StatCard
              title="Today's Usage"
              value={`${actualDailyUsage}m`}
              subtitle={`of ${currentDailyLimit}m limit`}
              accentColor={colors.primary}
            />
            <StatCard
              title="Saved Today"
              value={`${calculateUsageReduction(baselineScreenTime, actualDailyUsage)}m`}
              subtitle="vs baseline"
              accentColor={colors.teal}
            />
          </View>

          <View style={styles.statRow}>
            <StatCard
              title="Baseline"
              value={`${baselineScreenTime}m`}
              subtitle="starting point"
              accentColor={colors.textSecondary}
            />
            <StatCard
              title="Reduced By"
              value={`${summary.reductionPct}%`}
              subtitle="from baseline"
              accentColor={colors.primaryLight}
            />
          </View>

          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Recent trend:</Text>
            <Text style={[styles.trendValue, { color: trend.color }]}>{trend.label}</Text>
          </View>
        </Card>

        {/* B. Weekly Screen-Time Chart */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📅 Usage History</Text>
          <Text style={styles.cardSubtitle}>Daily usage vs limit (grey line = limit)</Text>

          <UsageBarChart
            history={history}
            currentUsage={actualDailyUsage}
            currentLimit={currentDailyLimit}
          />

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Usage</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Over limit</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine]} />
              <Text style={styles.legendText}>Daily cap</Text>
            </View>
          </View>
        </Card>

        {/* C. Progress Card toward Digital Zen */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🧘 Journey to Digital Zen</Text>
          <Text style={styles.cardSubtitle}>Stage 4 goal: 30 min daily limit</Text>

          <View style={styles.progressTable}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Baseline</Text>
              <Text style={styles.progressValue}>{baselineScreenTime} min</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Current Limit</Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>{currentDailyLimit} min</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Tomorrow</Text>
              <Text style={[styles.progressValue, { color: colors.primaryLight }]}>{nextDailyLimit} min</Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Zen Target</Text>
              <Text style={[styles.progressValue, { color: colors.tealLight }]}>{zenTarget} min</Text>
            </View>
          </View>

          <View style={styles.zenProgressRow}>
            <Text style={styles.zenProgressLabel}>Progress to Digital Zen</Text>
            <Text style={[styles.zenProgressPct, { color: colors.teal }]}>{progressToZen}%</Text>
          </View>
          <ProgressBar progress={progressToZen / 100} color={colors.teal} style={{ marginTop: 4 }} />
          <Text style={styles.zenHint}>
            {currentStage.icon} {currentStage.description}
          </Text>
        </Card>

        {/* D. Healthy Habit Stats */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🌟 Healthy Habit Stats</Text>
          <Text style={styles.cardSubtitle}>Activity built through UNLOAD this week</Text>

          <View style={styles.habitGrid}>
            <View style={styles.habitItem}>
              <Text style={styles.habitIcon}>🧘</Text>
              <Text style={styles.habitValue}>{reflStats.count}</Text>
              <Text style={styles.habitLabel}>Reflections</Text>
            </View>
            <View style={styles.habitItem}>
              <Text style={styles.habitIcon}>🚶</Text>
              <Text style={styles.habitValue}>{offStats.count}</Text>
              <Text style={styles.habitLabel}>Offline Activities</Text>
            </View>
            <View style={styles.habitItem}>
              <Text style={styles.habitIcon}>🌙</Text>
              <Text style={styles.habitValue}>{btConsistency.score}%</Text>
              <Text style={styles.habitLabel}>Bedtime Routine</Text>
            </View>
            <View style={styles.habitItem}>
              <Text style={styles.habitIcon}>📍</Text>
              <Text style={styles.habitValue}>{szStats.safeZoneArrivals}</Text>
              <Text style={styles.habitLabel}>Zone Check-ins</Text>
            </View>
          </View>

          {/* Limit Adherence */}
          <View style={styles.adherenceBox}>
            <View style={styles.adherenceRow}>
              <Text style={styles.adherenceTitle}>📅 Daily Limit Adherence</Text>
              <Text style={[styles.adherencePct, { color: adherence.adherencePct >= 80 ? colors.primary : colors.warning }]}>
                {adherence.adherencePct}%
              </Text>
            </View>
            <ProgressBar
              progress={adherence.adherencePct / 100}
              color={adherence.adherencePct >= 80 ? colors.primary : colors.warning}
              style={{ marginTop: 6 }}
            />
            <Text style={styles.adherenceSubtext}>
              {adherence.withinLimit} easy days • {adherence.nearLimit} near-limit days • {adherence.exceeded} over-limit days
            </Text>
          </View>
        </Card>

        {/* E. Wellness Insights */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>💡 Your Wellness Insights</Text>
          <Text style={styles.cardSubtitle}>Personalised observations from your data</Text>

          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightRow}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightCategory}>{insight.category}</Text>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            </View>
          ))}

          <View style={styles.privacyNote}>
            <Text style={styles.privacyNoteText}>
              🔒 All insights are derived from your local UNLOAD activity only. No external data processing.
            </Text>
          </View>
        </Card>

        {/* Sprout Points summary */}
        <Card style={[styles.card, styles.pointsCard]}>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsIcon}>🌱</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.pointsTitle}>{rewardPoints} Sprout Points Earned</Text>
              <Text style={styles.pointsSubtitle}>
                {summary.unlockedAchievements} / {summary.totalAchievements} achievements unlocked
              </Text>
            </View>
          </View>
        </Card>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 16, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary },
  statRow: { flexDirection: 'row', marginBottom: 8 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  trendLabel: { fontSize: 13, color: colors.textSecondary, marginRight: 8 },
  trendValue: { fontSize: 14, fontWeight: '700' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLine: { width: 16, height: 1.5, backgroundColor: colors.textMuted, opacity: 0.5 },
  legendText: { fontSize: 11, color: colors.textMuted },
  progressTable: { marginVertical: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  progressLabel: { fontSize: 14, color: colors.textSecondary },
  progressValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  zenProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  zenProgressLabel: { fontSize: 13, color: colors.textSecondary },
  zenProgressPct: { fontSize: 13, fontWeight: '700' },
  zenHint: { fontSize: 12, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },
  habitGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 14 },
  habitItem: { width: '48%', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 8 },
  habitIcon: { fontSize: 22, marginBottom: 4 },
  habitValue: { fontSize: 22, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  habitLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  adherenceBox: { backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, marginTop: 4 },
  adherenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adherenceTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  adherencePct: { fontSize: 16, fontWeight: '700' },
  adherenceSubtext: { fontSize: 11, color: colors.textMuted, marginTop: 8 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  insightIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  insightCategory: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  insightText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  privacyNote: { marginTop: 14, padding: 10, backgroundColor: colors.surfaceLight, borderRadius: 8 },
  privacyNoteText: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  pointsCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: colors.primary, borderWidth: 1 },
  pointsRow: { flexDirection: 'row', alignItems: 'center' },
  pointsIcon: { fontSize: 32 },
  pointsTitle: { fontSize: 17, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  pointsSubtitle: { fontSize: 12, color: colors.textSecondary },
});
