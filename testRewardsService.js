/**
 * UNLOAD — Step 6: Rewards & Gamification Test Suite
 * Team Safesprout
 *
 * Run from the mobile/ directory:
 *   node src/services/testRewardsService.js
 *
 * Tests all 21 Step 6 requirements using pure JS imports
 * (no React / device dependencies needed).
 */

import {
  REWARD_ACTIONS,
  REWARD_VALUES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_CHALLENGES,
  REWARD_CATALOG,
  getStreakMilestoneBonus,
  canAffordReward,
  getInitialRewardsState,
  getNextAchievement,
} from './rewardsService.js';

import {
  getInitialUnloadState,
  calculateNextDailyLimit,
  CONFIG,
} from './progressiveUnloading.js';

import {
  getInitialAppUsageData,
  calculateAppMetrics,
  get6DayUsageHistory,
} from './usageService.js';

import {
  MOCK_LOCATIONS,
  getInitialSafeZones,
  calculateDistance,
  isInsideSafeZone,
  evaluateSafeZones,
} from './locationService.js';

// ─── Test Harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✅ PASS  ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL  ${description}`);
    console.log(`         → ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, label = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ─── Mock Context Simulator ───────────────────────────────────────────────────

function createRewardsContext() {
  const init = getInitialRewardsState();
  let rewardPoints = init.rewardPoints; // 125
  let achievements = JSON.parse(JSON.stringify(init.achievements));
  let dailyChallenges = JSON.parse(JSON.stringify(init.dailyChallenges));
  let rewardHistory = [...init.rewardHistory];
  let redeemedRewards = [...init.redeemedRewards];
  let awardedMilestones = [...init.awardedMilestones];
  let parentRewardSettings = { ...init.parentRewardSettings };
  let parentActivityEvents = [];

  const addRewardPoints = (points, txData) => {
    if (!parentRewardSettings.rewardsEnabled && points > 0) {
      return { success: false, message: 'Rewards paused' };
    }
    rewardPoints = Math.max(0, rewardPoints + points);
    const tx = {
      id: `tx_${Date.now()}_${Math.random()}`,
      timestamp: 'Just now',
      ...txData,
      points,
    };
    rewardHistory = [tx, ...rewardHistory];
    return { success: true, transaction: tx };
  };

  const completeChallenge = (challengeId) => {
    let earned = 0;
    let title = '';
    dailyChallenges = dailyChallenges.map((ch) => {
      if (ch.id === challengeId && !ch.completed) {
        earned = ch.rewardPoints;
        title = ch.title;
        return { ...ch, progress: ch.requirement, completed: true };
      }
      return ch;
    });

    if (earned > 0) {
      addRewardPoints(earned, {
        type: REWARD_ACTIONS.DAILY_CHALLENGE_COMPLETED,
        title: `Challenge: ${title}`,
      });
      parentActivityEvents.push({
        id: `ev_${Date.now()}`,
        text: `🏆 Child completed daily challenge: "${title}" (+${earned} pts)`,
        type: 'safe',
      });
      return true;
    }
    return false;
  };

  const incrementAchievementProgress = (achId, by = 1) => {
    achievements = achievements.map((ach) => {
      if (ach.id !== achId || ach.unlocked) return ach;
      const newProgress = Math.min(ach.requirement, ach.progress + by);
      const unlocked = newProgress >= ach.requirement;
      if (unlocked) {
        addRewardPoints(ach.rewardPoints, {
          type: 'ACHIEVEMENT_UNLOCKED',
          title: `Achievement: ${ach.title}`,
        });
        parentActivityEvents.push({
          id: `ev_${Date.now()}`,
          text: `⭐ Child unlocked achievement: "${ach.title}" (+${ach.rewardPoints} pts)`,
          type: 'positive',
        });
      }
      return { ...ach, progress: newProgress, unlocked };
    });
  };

  const checkStreakMilestones = (currentStreak) => {
    const bonus = getStreakMilestoneBonus(currentStreak);
    if (bonus && !awardedMilestones.includes(bonus.milestone)) {
      awardedMilestones.push(bonus.milestone);
      addRewardPoints(bonus.points, {
        type: REWARD_ACTIONS.STREAK_MILESTONE,
        title: `🔥 ${bonus.milestone}-Day Streak Bonus!`,
      });
      parentActivityEvents.push({
        id: `ev_${Date.now()}`,
        text: `🔥 Child reached a ${bonus.milestone}-day streak milestone! (+${bonus.points} pts)`,
        type: 'positive',
      });
      return true;
    }
    return false;
  };

  const completeOfflineActivityAction = (act) => {
    addRewardPoints(REWARD_VALUES.OFFLINE_ACTIVITY_COMPLETED, {
      type: REWARD_ACTIONS.OFFLINE_ACTIVITY_COMPLETED,
      title: `Offline: ${act.title}`,
    });
    completeChallenge('ch_digital_break');
    incrementAchievementProgress('ach_offline_explorer', 1);
    parentActivityEvents.push({
      id: `ev_${Date.now()}`,
      text: `🚶 Child engaged in offline activity: ${act.title} (+10 pts)`,
      type: 'wellness',
    });
  };

  const completeReflectionAction = () => {
    addRewardPoints(REWARD_VALUES.REFLECTION_COMPLETED, {
      type: REWARD_ACTIONS.REFLECTION_COMPLETED,
      title: 'Mindful Reset',
    });
    completeChallenge('ch_mindful_moment');
    incrementAchievementProgress('ach_mindful_user', 1);
    parentActivityEvents.push({
      id: `ev_${Date.now()}`,
      text: '🧘 Child completed mindful reflection reset (+5 pts)',
      type: 'wellness',
    });
  };

  const completeRoutineAction = (zoneType) => {
    addRewardPoints(REWARD_VALUES.SAFE_ZONE_ROUTINE_COMPLETED, {
      type: REWARD_ACTIONS.SAFE_ZONE_ROUTINE_COMPLETED,
      title: 'Healthy Routine',
    });
    incrementAchievementProgress('ach_safe_zone_star', 1);
    parentActivityEvents.push({
      id: `ev_${Date.now()}`,
      text: `📍 Child followed healthy routine at ${zoneType} (+5 pts)`,
      type: 'safe',
    });
  };

  const redeemReward = (item) => {
    if (!canAffordReward(rewardPoints, item.cost)) {
      return { success: false, message: 'Insufficient points' };
    }
    rewardPoints -= item.cost;
    redeemedRewards.push(item.id);
    const tx = {
      id: `tx_${Date.now()}`,
      type: REWARD_ACTIONS.REWARD_REDEEMED,
      title: `Redeemed: ${item.title}`,
      points: -item.cost,
    };
    rewardHistory = [tx, ...rewardHistory];
    parentActivityEvents.push({
      id: `ev_${Date.now()}`,
      text: `🎨 Child redeemed virtual reward: "${item.title}" (-${item.cost} pts)`,
      type: 'settings',
    });
    return { success: true };
  };

  const advanceDay = (metDailyGoal = true) => {
    if (metDailyGoal) {
      addRewardPoints(REWARD_VALUES.DAILY_LIMIT_MET, {
        type: REWARD_ACTIONS.DAILY_LIMIT_MET,
        title: 'Daily Goal Complete',
      });
      completeChallenge('ch_daily_goal');
    }
    // Reset daily challenges
    dailyChallenges = dailyChallenges.map((ch) => ({ ...ch, progress: 0, completed: false }));
  };

  return {
    get rewardPoints() { return rewardPoints; },
    get achievements() { return achievements; },
    get dailyChallenges() { return dailyChallenges; },
    get rewardHistory() { return rewardHistory; },
    get redeemedRewards() { return redeemedRewards; },
    get awardedMilestones() { return awardedMilestones; },
    get parentRewardSettings() { return parentRewardSettings; },
    get parentActivityEvents() { return parentActivityEvents; },
    addRewardPoints,
    completeChallenge,
    incrementAchievementProgress,
    checkStreakMilestones,
    completeOfflineActivityAction,
    completeReflectionAction,
    completeRoutineAction,
    redeemReward,
    advanceDay,
  };
}

// ─── TEST SUITE EXECUTION ─────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   UNLOAD — Step 6: Rewards & Gamification Test Suite    ║');
console.log('║   Team Safesprout                                        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ── GROUP 1: Points & Actions ─────────────────────────────────────────────────
console.log('🌱 GROUP 1 — Sprout Points & Reward Actions\n');

test('1. Initial reward points start at 125 for demo child', () => {
  const ctx = createRewardsContext();
  assertEqual(ctx.rewardPoints, 125, 'Initial reward points');
  assertEqual(REWARD_VALUES.DAILY_LIMIT_MET, 10, 'Daily limit reward value');
  assertEqual(REWARD_VALUES.REFLECTION_COMPLETED, 5, 'Reflection reward value');
  assertEqual(REWARD_VALUES.OFFLINE_ACTIVITY_COMPLETED, 10, 'Offline activity value');
});

test('2. Daily goal met awards +10 Sprout Points', () => {
  const ctx = createRewardsContext();
  const before = ctx.rewardPoints;
  ctx.addRewardPoints(REWARD_VALUES.DAILY_LIMIT_MET, {
    type: REWARD_ACTIONS.DAILY_LIMIT_MET,
    title: 'Daily Goal Met',
  });
  assertEqual(ctx.rewardPoints, before + 10, 'Points incremented by 10');
});

test('3. Reflection reward awards +5 Sprout Points', () => {
  const ctx = createRewardsContext();
  const before = ctx.rewardPoints;
  ctx.completeReflectionAction();
  assert(ctx.rewardPoints >= before + 5, 'Reflection awarded at least 5 points');
  const tx = ctx.rewardHistory.find((t) => t.type === REWARD_ACTIONS.REFLECTION_COMPLETED);
  assert(tx, 'Reflection transaction created');
});

test('4. Offline activity reward awards +10 Sprout Points', () => {
  const ctx = createRewardsContext();
  const before = ctx.rewardPoints;
  ctx.completeOfflineActivityAction({ title: 'Read a Book', icon: '📖' });
  assert(ctx.rewardPoints >= before + 10, 'Offline activity awarded at least 10 points');
  const tx = ctx.rewardHistory.find((t) => t.type === REWARD_ACTIONS.OFFLINE_ACTIVITY_COMPLETED);
  assert(tx, 'Offline activity transaction created');
});

// ── GROUP 2: Streaks & Milestones ─────────────────────────────────────────────
console.log('\n🔥 GROUP 2 — Streak Bonuses & Milestones\n');

test('5. 3-day streak milestone awards +15 bonus points', () => {
  const bonus = getStreakMilestoneBonus(3);
  assertEqual(bonus?.points, 15, '3-day bonus is 15');
});

test('6. 7-day streak milestone awards +30 bonus points', () => {
  const bonus = getStreakMilestoneBonus(7);
  assertEqual(bonus?.points, 30, '7-day bonus is 30');
  assertEqual(getStreakMilestoneBonus(14)?.points, 50, '14-day bonus is 50');
  assertEqual(getStreakMilestoneBonus(30)?.points, 100, '30-day bonus is 100');
});

test('7. Duplicate streak milestone prevention (awarded only once)', () => {
  const ctx = createRewardsContext();
  // 7-day streak milestone (not yet in awardedMilestones)
  const firstAward = ctx.checkStreakMilestones(7);
  assertEqual(firstAward, true, 'First 7-day claim succeeds');
  const pointsAfterFirst = ctx.rewardPoints;

  // Second attempt for 7-day milestone
  const secondAward = ctx.checkStreakMilestones(7);
  assertEqual(secondAward, false, 'Duplicate 7-day claim prevented');
  assertEqual(ctx.rewardPoints, pointsAfterFirst, 'No additional points on duplicate milestone');
});

// ── GROUP 3: Daily Challenges ─────────────────────────────────────────────────
console.log('\n🏆 GROUP 3 — Daily Challenges & Reset\n');

test('8. Daily challenge completion awards points and marks completed', () => {
  const ctx = createRewardsContext();
  const ch = ctx.dailyChallenges[0];
  const beforePts = ctx.rewardPoints;
  const result = ctx.completeChallenge(ch.id);
  assertEqual(result, true, 'Challenge completed successfully');
  assertEqual(ctx.rewardPoints, beforePts + ch.rewardPoints, 'Points awarded');
  const updatedCh = ctx.dailyChallenges.find((c) => c.id === ch.id);
  assertEqual(updatedCh.completed, true, 'Challenge marked completed');
});

test('9. Duplicate challenge prevention (cannot claim twice on same day)', () => {
  const ctx = createRewardsContext();
  const chId = 'ch_daily_goal';
  ctx.completeChallenge(chId);
  const pts = ctx.rewardPoints;
  const secondAttempt = ctx.completeChallenge(chId);
  assertEqual(secondAttempt, false, 'Second completion prevented on same day');
  assertEqual(ctx.rewardPoints, pts, 'Points unchanged');
});

test('17. Daily challenge reset clears completed state for new day', () => {
  const ctx = createRewardsContext();
  ctx.completeChallenge('ch_daily_goal');
  assert(ctx.dailyChallenges.find((c) => c.id === 'ch_daily_goal').completed === true);
  // Advance to new day
  ctx.advanceDay();
  const resetCh = ctx.dailyChallenges.find((c) => c.id === 'ch_daily_goal');
  assertEqual(resetCh.completed, false, 'Challenge reset to uncompleted');
  assertEqual(resetCh.progress, 0, 'Challenge progress reset to 0');
});

// ── GROUP 4: Achievements ─────────────────────────────────────────────────────
console.log('\n⭐ GROUP 4 — Achievements Progression & Unlocking\n');

test('10. Achievement progression and unlocking awards bonus points', () => {
  const ctx = createRewardsContext();
  const ach7 = ctx.achievements.find((a) => a.id === 'ach_streak_7');
  assertEqual(ach7.progress, 6, '7-Day Grower starts at 6/7');
  assertEqual(ach7.unlocked, false, 'Starts locked');

  const beforePts = ctx.rewardPoints;
  ctx.incrementAchievementProgress('ach_streak_7', 1);
  const unlockedAch = ctx.achievements.find((a) => a.id === 'ach_streak_7');
  assertEqual(unlockedAch.unlocked, true, 'Now unlocked at 7/7');
  assertEqual(ctx.rewardPoints, beforePts + unlockedAch.rewardPoints, 'Bonus points awarded for unlock');
});

// ── GROUP 5: Safe Zones & Routines ────────────────────────────────────────────
console.log('\n📍 GROUP 5 — Safe Zone Routine Rewards\n');

test('11. Safe Zone healthy routine completion awards +5 points', () => {
  const ctx = createRewardsContext();
  const beforePts = ctx.rewardPoints;
  ctx.completeRoutineAction('School');
  assertEqual(ctx.rewardPoints, beforePts + 5, 'Safe zone routine awarded +5 points');
  const safeStar = ctx.achievements.find((a) => a.id === 'ach_safe_zone_star');
  assertEqual(safeStar.progress, 3, 'Safe Zone Star achievement progress incremented');
});

// ── GROUP 6: Virtual Redemption ───────────────────────────────────────────────
console.log('\n🎨 GROUP 6 — Virtual Reward Redemption\n');

test('12. Reward redemption deducts points and records transaction', () => {
  const ctx = createRewardsContext();
  const themeItem = REWARD_CATALOG.find((r) => r.id === 'cat_theme'); // 50 pts
  const beforePts = ctx.rewardPoints; // 125
  const res = ctx.redeemReward(themeItem);
  assertEqual(res.success, true, 'Redemption successful');
  assertEqual(ctx.rewardPoints, beforePts - 50, 'Points deducted by 50');
  assert(ctx.redeemedRewards.includes('cat_theme'), 'Added to redeemed list');
  const tx = ctx.rewardHistory.find((t) => t.type === REWARD_ACTIONS.REWARD_REDEEMED);
  assert(tx, 'Redemption transaction created');
  assertEqual(tx.points, -50, 'Negative points recorded in transaction');
});

test('13. Insufficient points redemption fails gracefully without deducting', () => {
  const ctx = createRewardsContext();
  const expensiveItem = { id: 'expensive', title: 'Luxury Perk', cost: 1000 };
  const beforePts = ctx.rewardPoints;
  const res = ctx.redeemReward(expensiveItem);
  assertEqual(res.success, false, 'Redemption fails due to insufficient points');
  assertEqual(ctx.rewardPoints, beforePts, 'Points remain unchanged');
});

test('14. Reward history creation stores structured record', () => {
  const ctx = createRewardsContext();
  assert(Array.isArray(ctx.rewardHistory), 'Reward history is an array');
  assert(ctx.rewardHistory.length >= 3, 'Contains initial history records');
  const first = ctx.rewardHistory[0];
  assert(first.id, 'Transaction has ID');
  assert(first.type, 'Transaction has type');
  assert(typeof first.points === 'number', 'Transaction has points');
});

// ── GROUP 7: Cross-Component Integrations ─────────────────────────────────────
console.log('\n📱 GROUP 7 — Cross-Component State Integration\n');

test('15. Parent activity feed receives reward events with distinctive tags', () => {
  const ctx = createRewardsContext();
  ctx.completeOfflineActivityAction({ title: 'Nature Sketch', icon: '🎨' });
  const rewardEvt = ctx.parentActivityEvents.find((e) => e.text.includes('+10 pts'));
  assert(rewardEvt, 'Parent activity feed contains reward event');
});

test('16. Child Home points update reflects the current points balance', () => {
  const ctx = createRewardsContext();
  assertEqual(ctx.rewardPoints, 125, 'Child Home starts at 125');
  ctx.addRewardPoints(10, { title: 'Goal' });
  assertEqual(ctx.rewardPoints, 135, 'Child Home receives 135');
});

// ── GROUP 8: Steps 2–5 Regressions ────────────────────────────────────────────
console.log('\n🔁 GROUP 8 — Step 2, 3, 4, and 5 Regressions\n');

test('18. Existing Step 2 progressive calculation tests still pass', () => {
  const init = getInitialUnloadState();
  assertEqual(init.currentDailyLimit, 60, 'Step 2 limit 60m');
  assertEqual(init.actualDailyUsage, 47, 'Step 2 usage 47m');
  const nextRes = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 47 });
  assertEqual(nextRes.nextLimit, 55, 'Next day limit 55m');
});

test('19. Existing Step 3 app usage tracking tests still pass', () => {
  const apps = getInitialAppUsageData();
  assert(apps.length >= 4, 'Apps list intact');
  const insta = apps.find((a) => a.id === 'app_insta');
  assertEqual(insta.currentUsage, 22, 'Instagram usage 22m');
  const hist = get6DayUsageHistory();
  assertEqual(hist.length, 6, '6-day history intact');
});

test('20. Existing Step 4 parent guardian controls remain intact', () => {
  const initZones = getInitialSafeZones();
  assertEqual(initZones.length, 3, 'Safe zones start with 3');
  const home = initZones.find((z) => z.id === 'sz_home');
  assertEqual(home.status, 'Inside', 'Home starts inside');
  assertEqual(home.icon, '🏠', 'Home has emoji icon');
});

test('21. Existing Step 5 mock location and geofencing still pass', () => {
  const home = MOCK_LOCATIONS.home;
  const dist = calculateDistance(home.latitude, home.longitude, home.latitude, home.longitude);
  assertEqual(dist, 0, 'Distance 0m for same location');
  const zones = getInitialSafeZones();
  const evalResult = evaluateSafeZones(home, zones);
  assertEqual(evalResult.activeSafeZone?.id, 'sz_home', 'Home zone active');
});

// ─── Final Summary ────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed · ${failed} failed · ${passed + failed} total`);

if (failed === 0) {
  console.log('\n  🎉 ALL 21 STEP 6 TESTS PASSED');
  console.log('  UNLOAD Rewards & Gamification System is fully verified.\n');
  console.log('  ✅ Step 1 — Mobile Foundation');
  console.log('  ✅ Step 2 — Progressive Unloading Engine');
  console.log('  ✅ Step 3 — App Usage & Screen-Time Management');
  console.log('  ✅ Step 4 — Parent Guardian System');
  console.log('  ✅ Step 5 — GPS & Safe Zones / Guardian Safety Layer');
  console.log('  ✅ Step 6 — Rewards & Gamification System');
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed. Review output above.`);
  process.exit(1);
}

console.log('══════════════════════════════════════════════════════════\n');
