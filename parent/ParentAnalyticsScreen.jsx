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
  getAppUsageBreakdown,
  TREND_LABELS,
} from '../../services/analyticsService';

// ─── Mini bar chart ───────────────────────────────────────────────────────────
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
              <View style={[chartStyles.limitLine, { bottom: limitHeight }]} />
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
  container: { flexDirection: 'row', height: 120, marginTop: 8, alignItems: 'flex-end' },
  yLabels: { width: 36, height: 100, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 6, paddingBottom: 16 },
  yLabel: { fontSize: 9, color: colors.textMuted },
  barsArea: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
    borderLeftWidth: 1, borderLeftColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: 10,
  },
  barGroup: { alignItems: 'center', flex: 1, position: 'relative' },
  bar: { width: 14, backgroundColor: colors.sky, borderRadius: 3, opacity: 0.85 },
  barCurrent: { backgroundColor: '#38BDF8', opacity: 1 },
  barExceeded: { backgroundColor: colors.warning },
  limitLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.textMuted, opacity: 0.5 },
  barLabel: { fontSize: 8, color: colors.textMuted, marginTop: 2 },
});

// ─── App usage row ────────────────────────────────────────────────────────────
const AppUsageRow = ({ app }) => (
  <View style={appRowStyles.container}>
    <Text style={appRowStyles.icon}>{app.icon}</Text>
    <View style={{ flex: 1 }}>
      <View style={appRowStyles.labelRow}>
        <Text style={appRowStyles.name}>{app.appName}</Text>
        <Text style={appRowStyles.usage}>
          {app.currentUsage}m / {app.dailyLimit}m
        </Text>
      </View>
      <ProgressBar
        progress={app.limitPct / 100}
        color={app.isLimitReached ? colors.danger : app.isWarning ? colors.warning : colors.sky}
        height={5}
        style={{ marginTop: 4 }}
      />
    </View>
    <Text style={[appRowStyles.pct, { color: app.isWarning ? colors.warning : colors.textMuted }]}>
      {app.percentage}%
    </Text>
  </View>
);

const appRowStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { fontSize: 18, marginRight: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  usage: { fontSize: 12, color: colors.textSecondary },
  pct: { fontSize: 11, fontWeight: '700', marginLeft: 10, minWidth: 32, textAlign: 'right' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ParentAnalyticsScreen = () => {
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
  const appBreakdown = useMemo(() => getAppUsageBreakdown(appsList), [appsList]);

  const savedMinutes = calculateUsageReduction(baselineScreenTime, actualDailyUsage);
  const savedPct = calculateReductionPercentage(baselineScreenTime, actualDailyUsage);
  const avgUsage = calculateAverageUsage(history, actualDailyUsage);

  return (
    <View style={styles.container}>
      <Header
        title="Wellness Analytics 📊"
        subtitle="Child wellness data overview"
        showRoleBadge={true}
      />

      <ScrollView contentContainerStyle={styles.content}>

        {/* A. Child Wellness Overview */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>🌱 Child Overview</Text>
              <Text style={styles.cardSubtitle}>Day {dayNumber} • {currentStage.name}</Text>
            </View>
            <Badge text={`🔥 ${streak}d streak`} variant="success" />
          </View>

          <View style={styles.statRow}>
            <StatCard
              title="Daily Usage"
              value={`${actualDailyUsage}m`}
              subtitle={`of ${currentDailyLimit}m`}
              accentColor={colors.sky}
            />
            <StatCard
              title="Saved Today"
              value={`${savedMinutes}m`}
              subtitle={`${savedPct}% reduction`}
              accentColor={colors.primary}
            />
          </View>

          <View style={styles.statRow}>
            <StatCard
              title="7-Day Average"
              value={`${avgUsage}m`}
              subtitle="avg daily usage"
              accentColor={colors.textSecondary}
            />
            <StatCard
              title="Sprout Points"
              value={`${rewardPoints}`}
              subtitle="earned total"
              accentColor={colors.warning}
            />
          </View>

          <View style={styles.trendRow}>
            <Text style={styles.trendLabel}>Usage trend:</Text>
            <Text style={[styles.trendValue, { color: trend.color }]}>{trend.label}</Text>
          </View>
        </Card>

        {/* B. Weekly Usage Trend */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📅 Weekly Usage Trend</Text>
          <Text style={styles.cardSubtitle}>Usage vs daily limit per day (cap = grey line)</Text>

          <UsageBarChart
            history={history}
            currentUsage={actualDailyUsage}
            currentLimit={currentDailyLimit}
          />

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.sky }]} />
              <Text style={styles.legendText}>Usage</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Over cap</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendLine} />
              <Text style={styles.legendText}>Daily cap</Text>
            </View>
          </View>
        </Card>

        {/* C. App Usage Breakdown */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📱 App Usage Breakdown</Text>
          <Text style={styles.cardSubtitle}>Today's per-app screen time vs limits</Text>

          {appBreakdown.map((app) => (
            <AppUsageRow key={app.id} app={app} />
          ))}
        </Card>

        {/* D. Limit Adherence */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>📅 Limit Adherence</Text>
              <Text style={styles.cardSubtitle}>How consistently the daily limit was respected</Text>
            </View>
            <Badge
              text={`${adherence.adherencePct}%`}
              variant={adherence.adherencePct >= 80 ? 'success' : 'warning'}
            />
          </View>

          <ProgressBar
            progress={adherence.adherencePct / 100}
            color={adherence.adherencePct >= 80 ? colors.primary : colors.warning}
            style={{ marginBottom: 12 }}
          />

          <View style={styles.adherenceBreakdown}>
            <View style={styles.adherenceItem}>
              <Text style={[styles.adherenceCount, { color: colors.primary }]}>{adherence.withinLimit}</Text>
              <Text style={styles.adherenceItemLabel}>Within{'\n'}limit</Text>
            </View>
            <View style={styles.adherenceDivider} />
            <View style={styles.adherenceItem}>
              <Text style={[styles.adherenceCount, { color: colors.warning }]}>{adherence.nearLimit}</Text>
              <Text style={styles.adherenceItemLabel}>Near{'\n'}limit</Text>
            </View>
            <View style={styles.adherenceDivider} />
            <View style={styles.adherenceItem}>
              <Text style={[styles.adherenceCount, { color: colors.danger }]}>{adherence.exceeded}</Text>
              <Text style={styles.adherenceItemLabel}>Over{'\n'}limit</Text>
            </View>
            <View style={styles.adherenceDivider} />
            <View style={styles.adherenceItem}>
              <Text style={[styles.adherenceCount, { color: colors.textSecondary }]}>{adherence.total}</Text>
              <Text style={styles.adherenceItemLabel}>Total{'\n'}days</Text>
            </View>
          </View>
        </Card>

        {/* E. Healthy Routine Summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>🌟 Healthy Routine Summary</Text>
          <Text style={styles.cardSubtitle}>Wellness behavior patterns</Text>

          <View style={styles.routineGrid}>
            <View style={styles.routineItem}>
              <Text style={styles.routineIcon}>🧘</Text>
              <Text style={styles.routineValue}>{reflStats.count}</Text>
              <Text style={styles.routineLabel}>Reflections</Text>
            </View>
            <View style={styles.routineItem}>
              <Text style={styles.routineIcon}>🚶</Text>
              <Text style={styles.routineValue}>{offStats.count}</Text>
              <Text style={styles.routineLabel}>Offline Activities</Text>
            </View>
            <View style={styles.routineItem}>
              <Text style={styles.routineIcon}>🌙</Text>
              <Text style={styles.routineValue}>{btConsistency.score}%</Text>
              <Text style={styles.routineLabel}>Bedtime Routine</Text>
            </View>
            <View style={styles.routineItem}>
              <Text style={styles.routineIcon}>📍</Text>
              <Text style={styles.routineValue}>{szStats.safeZoneArrivals}</Text>
              <Text style={styles.routineLabel}>Zone Check-ins</Text>
            </View>
          </View>

          {btConsistency.lateNightCount > 0 && (
            <View style={styles.lateNightNote}>
              <Text style={styles.lateNightNoteText}>
                🌙 {btConsistency.lateNightCount} late-night event{btConsistency.lateNightCount !== 1 ? 's' : ''} detected. This is noted gently — not as punishment.
              </Text>
            </View>
          )}
        </Card>

        {/* F. Recent Wellness Insights */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>💡 Recent Wellness Insights</Text>
          <Text style={styles.cardSubtitle}>Based on observed behavior patterns</Text>

          {insights.slice(0, 5).map((insight) => (
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
              🔒 Guardian Privacy Note: Analytics show behavioral patterns only. Reflection content and personal notes are private to the child. No external data sharing.
            </Text>
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
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
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
  adherenceBreakdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  adherenceItem: { alignItems: 'center', flex: 1 },
  adherenceCount: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  adherenceItemLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  adherenceDivider: { width: 1, height: 40, backgroundColor: colors.border },
  routineGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 6 },
  routineItem: { width: '48%', backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 8 },
  routineIcon: { fontSize: 20, marginBottom: 4 },
  routineValue: { fontSize: 20, fontWeight: '700', color: colors.sky, marginBottom: 2 },
  routineLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  lateNightNote: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', marginTop: 8 },
  lateNightNoteText: { fontSize: 12, color: '#F87171', lineHeight: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  insightIcon: { fontSize: 18, marginRight: 10, marginTop: 1 },
  insightCategory: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  insightText: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  privacyNote: { marginTop: 14, padding: 10, backgroundColor: colors.surfaceLight, borderRadius: 8 },
  privacyNoteText: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});
