import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { useUnload } from '../../context/UnloadContext';
import { REWARD_CATALOG, getNextAchievement } from '../../services/rewardsService';

export const ChildRewardsScreen = () => {
  const {
    rewardPoints,
    streak,
    achievements,
    dailyChallenges,
    rewardHistory,
    redeemedRewards,
    rewardFeedback,
    completeChallenge,
    completeOfflineActivityAction,
    completeReflectionAction,
    redeemReward,
  } = useUnload();

  const nextAch = getNextAchievement(achievements) || achievements[2];
  const nextAchProgress = Math.min(
    100,
    Math.round((nextAch.progress / nextAch.requirement) * 100)
  );

  const handleRedeem = (item) => {
    if (rewardPoints < item.cost) {
      Alert.alert(
        'Points Needed',
        `You need ${item.cost - rewardPoints} more Sprout Points to unlock "${item.title}". Keep up your healthy habits!`
      );
      return;
    }

    Alert.alert(
      'Redeem Virtual Perk',
      `Unlock "${item.title}" for ${item.cost} Sprout Points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock 🌱',
          onPress: () => {
            const res = redeemReward(item);
            if (res.success) {
              Alert.alert('🎉 Success!', res.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Sprout Rewards 🌱"
        subtitle="Earn points through healthy digital habits"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lightweight Reward Feedback Banner */}
        {rewardFeedback && (
          <Card variant="teal" style={styles.toastBanner}>
            <View style={styles.toastRow}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>{rewardFeedback.icon || '🌱'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.toastTitle}>+{rewardFeedback.points} Sprout Points!</Text>
                <Text style={styles.toastDesc}>{rewardFeedback.title}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* ── Top Section: SPROUT POINTS Card ── */}
        <Card variant="primary" style={styles.pointsHeroCard}>
          <Text style={styles.pointsLabel}>🌱 SPROUT POINTS</Text>
          <View style={styles.pointsHeroRow}>
            <Text style={styles.pointsBig}>{rewardPoints}</Text>
            <View style={styles.streakHeroPill}>
              <Text style={styles.streakHeroText}>🔥 {streak} Day Streak</Text>
            </View>
          </View>
          <Text style={styles.pointsEncourage}>
            "You are growing healthier digital habits every day."
          </Text>

          {/* Next Milestone Progress */}
          <View style={styles.nextMilestoneBox}>
            <View style={styles.nextMilestoneHeader}>
              <Text style={styles.nextMilestoneTitle}>
                Next Milestone: {nextAch.title}
              </Text>
              <Text style={styles.nextMilestoneCount}>
                {nextAch.progress} / {nextAch.requirement}
              </Text>
            </View>
            <ProgressBar
              progress={nextAchProgress}
              color={colors.primaryLight}
              height={8}
              style={{ marginTop: 6 }}
            />
          </View>
        </Card>

        {/* ── Today's Challenges Section ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>TODAY'S CHALLENGES</Text>
          <Badge label="Daily Reset" variant="sky" size="small" />
        </View>

        {dailyChallenges.map((ch) => {
          const isDone = ch.completed;

          return (
            <Card key={ch.id} style={[styles.challengeCard, isDone && styles.challengeDone]}>
              <View style={styles.challengeRow}>
                <View
                  style={[
                    styles.challengeIconBox,
                    { backgroundColor: isDone ? 'rgba(16,185,129,0.2)' : 'rgba(56,189,248,0.12)' },
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{isDone ? '✓' : ch.icon}</Text>
                </View>

                <View style={styles.challengeInfo}>
                  <Text style={[styles.challengeTitle, isDone && styles.textDone]}>
                    {ch.title}
                  </Text>
                  <Text style={styles.challengeDesc}>{ch.description}</Text>
                  <View style={styles.challengeMetaRow}>
                    <Text style={styles.challengeProgressText}>
                      Progress: {ch.progress} / {ch.requirement}
                    </Text>
                    <Text style={styles.challengeRewardTag}>+{ch.rewardPoints} 🌱</Text>
                  </View>
                </View>

                <View style={styles.challengeActionCol}>
                  {isDone ? (
                    <Badge label="Completed" variant="primary" size="small" />
                  ) : (
                    <Button
                      title="Test Complete"
                      variant="outline"
                      size="small"
                      onPress={() => completeChallenge(ch.id)}
                      style={{ paddingHorizontal: 8 }}
                    />
                  )}
                </View>
              </View>
            </Card>
          );
        })}

        {/* ── Virtual Rewards Catalog ── */}
        <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
          <Text style={styles.sectionHeading}>VIRTUAL REWARD CATALOG</Text>
          <Badge label="Self-Regulation" variant="neutral" size="small" />
        </View>
        <Text style={styles.sectionSub}>
          Redeem your points for digital accessories & wellness themes:
        </Text>

        {REWARD_CATALOG.map((item) => {
          const isClaimed = redeemedRewards.includes(item.id);
          const canAfford = rewardPoints >= item.cost;

          return (
            <Card key={item.id} style={styles.catalogCard}>
              <View style={styles.catalogRow}>
                <View style={styles.catalogIconBox}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>

                <View style={styles.catalogInfo}>
                  <View style={styles.catalogHeaderRow}>
                    <Text style={styles.catalogTitle}>{item.title}</Text>
                    <Badge
                      label={`🌱 ${item.cost}`}
                      variant={canAfford ? 'primary' : 'neutral'}
                      size="small"
                    />
                  </View>
                  <Text style={styles.catalogDesc}>{item.description}</Text>

                  <View style={styles.catalogFooter}>
                    {isClaimed ? (
                      <Badge label="✓ Unlocked & Active" variant="teal" size="small" />
                    ) : (
                      <Button
                        title={canAfford ? 'Redeem Item' : `Need ${item.cost - rewardPoints} pts`}
                        size="small"
                        variant={canAfford ? 'primary' : 'secondary'}
                        disabled={!canAfford}
                        onPress={() => handleRedeem(item)}
                        style={styles.redeemBtn}
                      />
                    )}
                  </View>
                </View>
              </View>
            </Card>
          );
        })}

        {/* ── Achievements Section ── */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={styles.sectionHeading}>ACHIEVEMENTS</Text>
          <Text style={styles.achieveCounter}>
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </Text>
        </View>

        <View style={styles.achievementsList}>
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const pct = Math.min(100, Math.round((ach.progress / ach.requirement) * 100));

            return (
              <Card
                key={ach.id}
                style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}
              >
                <View style={styles.achievementRow}>
                  <View
                    style={[
                      styles.achievementIconCircle,
                      isUnlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked,
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{ach.icon}</Text>
                  </View>

                  <View style={styles.achievementBody}>
                    <View style={styles.achievementTitleRow}>
                      <Text style={[styles.achievementTitle, !isUnlocked && styles.textLocked]}>
                        {ach.title}
                      </Text>
                      <Badge
                        label={isUnlocked ? 'Unlocked ✓' : `+${ach.rewardPoints} 🌱`}
                        variant={isUnlocked ? 'primary' : 'neutral'}
                        size="small"
                      />
                    </View>
                    <Text style={styles.achievementDesc}>{ach.description}</Text>

                    {!isUnlocked && (
                      <View style={{ marginTop: 8 }}>
                        <ProgressBar
                          progress={pct}
                          color={colors.primary}
                          height={5}
                        />
                        <Text style={styles.achievementProgressText}>
                          {ach.progress} / {ach.requirement} ({pct}%)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* ── Points History ── */}
        <Text style={[styles.sectionHeading, { marginTop: 24, marginBottom: 10 }]}>
          RECENT REWARD ACTIVITY
        </Text>

        {rewardHistory.slice(0, 5).map((evt) => (
          <Card key={evt.id} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>
                {evt.points > 0 ? '🌱' : '🎨'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{evt.title}</Text>
                <Text style={styles.historyDesc}>{evt.description}</Text>
                <Text style={styles.historyTime}>{evt.timestamp}</Text>
              </View>
              <Text
                style={[
                  styles.historyPoints,
                  { color: evt.points > 0 ? colors.primary : colors.sky },
                ]}
              >
                {evt.points > 0 ? `+${evt.points}` : evt.points}
              </Text>
            </View>
          </Card>
        ))}

        {/* Wellness Gamification Note */}
        <Card variant="light" style={styles.wellnessNoteCard}>
          <Text style={styles.wellnessNoteTitle}>🌿 Healthy Gamification Promise</Text>
          <Text style={styles.wellnessNoteText}>
            UNLOAD rewards gradual behavior change, mindful breathing, and offline creativity.
            We never use punishments, pressure, leaderboards, or real money. Every step toward
            balance is celebrated.
          </Text>
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
    paddingBottom: 40,
  },

  // Toast
  toastBanner: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 12,
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  toastDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Hero Card
  pointsHeroCard: {
    padding: 20,
    marginBottom: 20,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },
  pointsHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  pointsBig: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
  },
  streakHeroPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakHeroText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  pointsEncourage: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    marginBottom: 14,
  },
  nextMilestoneBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextMilestoneTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  nextMilestoneCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  achieveCounter: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Challenges
  challengeCard: {
    padding: 14,
    marginBottom: 10,
  },
  challengeDone: {
    opacity: 0.85,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textDone: {
    color: colors.primaryLight,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  challengeProgressText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  challengeRewardTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  challengeActionCol: {
    marginLeft: 8,
  },

  // Catalog
  catalogCard: {
    padding: 14,
    marginBottom: 10,
  },
  catalogRow: {
    flexDirection: 'row',
  },
  catalogIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catalogInfo: {
    flex: 1,
  },
  catalogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catalogTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catalogDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  catalogFooter: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
  redeemBtn: {
    paddingHorizontal: 14,
  },

  // Achievements
  achievementsList: {
    gap: 10,
  },
  achievementCard: {
    padding: 14,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleUnlocked: {
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  iconCircleLocked: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementBody: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  textLocked: {
    color: colors.textSecondary,
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  achievementProgressText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'right',
  },

  // History
  historyCard: {
    padding: 12,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  historyTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  historyPoints: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 10,
  },

  // Wellness Note
  wellnessNoteCard: {
    padding: 14,
    marginTop: 16,
    marginBottom: 10,
  },
  wellnessNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.tealLight,
    marginBottom: 4,
  },
  wellnessNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
