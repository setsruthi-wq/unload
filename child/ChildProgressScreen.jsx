import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { useUnload } from '../../context/UnloadContext';
import { mockChildData } from '../../data/mockData';

export const ChildProgressScreen = () => {
  const {
    baselineScreenTime,
    currentDailyLimit,
    actualDailyUsage,
    nextDailyLimit,
    currentStage,
    dayNumber,
    streak,
    history,
    savedComparedToBaseline,
  } = useUnload();

  const { stagesJourney } = mockChildData;

  // Maximum baseline for scaling horizontal bars (120 minutes)
  const maxBaseline = Math.max(baselineScreenTime, 120);

  // Combine past history with today (Day 6)
  const allDays = [
    ...history,
    {
      day: dayNumber,
      limit: currentDailyLimit,
      used: actualDailyUsage,
      isToday: true,
      met: actualDailyUsage <= currentDailyLimit,
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Your Unload Journey"
        subtitle="Progressive tapering towards digital freedom"
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Core Journey Card */}
        <Card variant="surface" style={styles.journeyCard}>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>YOUR UNLOAD JOURNEY</Text>
            <Badge label={`🔥 ${streak} Day Streak`} variant="warning" size="small" />
          </View>

          <Text style={styles.journeySubtitle}>
            Watch your daily allowance gradually taper down as your self-regulation expands.
          </Text>

          {/* Daily Progression Horizontal Bar Chart */}
          <View style={styles.barsContainer}>
            {allDays.map((item) => {
              const barPercent = Math.min(Math.round((item.limit / maxBaseline) * 100), 100);
              const isToday = item.isToday;

              return (
                <View key={`day-${item.day}`} style={styles.dayRow}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    Day {item.day} {isToday ? '🌱' : ''}
                  </Text>

                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${barPercent}%`,
                          backgroundColor: isToday ? colors.primaryLight : colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text style={[styles.limitValue, isToday && styles.limitValueToday]}>
                    {item.limit}m
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Arrow Progression down to Digital Zen */}
          <View style={styles.zenArrowContainer}>
            <Text style={styles.downArrow}>↓</Text>
            <View style={styles.zenBadgeContainer}>
              <Text style={styles.zenBadgeText}>Digital Zen 🌱</Text>
            </View>
            <Text style={styles.zenSubtext}>Safe Minimum Target: 30–45m / day</Text>
          </View>
        </Card>

        {/* Baseline vs Current & Next Target Stat Cards */}
        <View style={styles.comparisonRow}>
          <Card style={styles.statBox}>
            <Text style={styles.statLabel}>Baseline vs Now</Text>
            <Text style={styles.statValue}>
              {baselineScreenTime}m → <Text style={styles.highlightText}>{currentDailyLimit}m</Text>
            </Text>
            <Text style={styles.statSub}>Saved {savedComparedToBaseline} daily</Text>
          </Card>

          <Card style={styles.statBox}>
            <Text style={styles.statLabel}>Next Target</Text>
            <Text style={styles.statValue}>
              {nextDailyLimit}m <Text style={styles.statSubSmall}>tomorrow</Text>
            </Text>
            <Text style={styles.statSub}>-5m gentle reduction</Text>
          </Card>
        </View>

        {/* Current Active Stage Overview */}
        <Card variant="primary" style={styles.activeStageCard}>
          <View style={styles.activeStageHeader}>
            <Text style={styles.activeStageIcon}>{currentStage.icon || '🌱'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeStageName}>{currentStage.name}</Text>
              <Text style={styles.activeStageDesc}>{currentStage.description}</Text>
            </View>
            <Badge label="Active Stage" variant="primary" size="small" />
          </View>
        </Card>

        {/* 4-Stage Progressive Unload Roadmap */}
        <Text style={styles.sectionHeading}>Progressive Unloading Stages</Text>
        <Text style={styles.sectionSubtitle}>
          Each stage gently lowers your screen quota as your mindful self-regulation expands.
        </Text>

        {stagesJourney.map((stage) => {
          const isCurrent = stage.stage === currentStage.id;
          const isCompleted = stage.stage < currentStage.id || stage.status === 'Completed';

          return (
            <Card
              key={stage.stage}
              style={[
                styles.stageCard,
                isCurrent && styles.stageCardCurrent,
              ]}
            >
              <View style={styles.stageHeader}>
                <View style={styles.stageNumberCircle}>
                  <Text style={styles.stageNumberText}>{stage.stage}</Text>
                </View>
                <View style={styles.stageTitleBox}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stageTarget}>Daily Cap: {stage.targetDaily}</Text>
                </View>
                <Badge
                  label={isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Locked'}
                  variant={isCompleted ? 'primary' : isCurrent ? 'teal' : 'neutral'}
                  size="small"
                />
              </View>

              <View style={styles.stageFooter}>
                <Text style={styles.stageBadge}>{stage.badge}</Text>
                <Text style={styles.stageReward}>+{stage.reward}</Text>
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
  journeyCard: {
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  journeyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  journeySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 20,
  },
  barsContainer: {
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayLabel: {
    width: 60,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  barWrapper: {
    flex: 1,
    height: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 7,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 7,
  },
  limitValue: {
    width: 44,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  limitValueToday: {
    color: colors.primaryLight,
  },
  zenArrowContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  downArrow: {
    fontSize: 22,
    color: colors.primaryLight,
    marginBottom: 4,
  },
  zenBadgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 4,
  },
  zenBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  zenSubtext: {
    fontSize: 11,
    color: colors.textMuted,
  },
  comparisonRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 14,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  highlightText: {
    color: colors.primaryLight,
  },
  statSubSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  statSub: {
    fontSize: 11,
    color: colors.primaryLight,
  },
  activeStageCard: {
    padding: 16,
    marginBottom: 20,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  activeStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStageIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  activeStageName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  activeStageDesc: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },
  stageCard: {
    padding: 14,
    marginBottom: 8,
  },
  stageCardCurrent: {
    borderColor: colors.tealLight,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stageNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  stageNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stageTitleBox: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stageTarget: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stageBadge: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  stageReward: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
});
