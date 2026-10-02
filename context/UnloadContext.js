import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getInitialUnloadState,
  calculateNextDailyLimit,
  getStageForLimit,
  calculateMinutesSaved,
  CONFIG,
} from '../services/progressiveUnloading';
import {
  getInitialAppUsageData,
  calculateAppMetrics,
  APP_STATUS,
} from '../services/usageService';
import {
  getCurrentMockLocation,
  getInitialSafeZones,
  resolveMockLocation,
  evaluateSafeZones,
  getDemoTimeString,
  calculateDistance,
  isInsideSafeZone,
} from '../services/locationService';
import {
  getLocationRoutine,
} from '../services/locationRoutineService';
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
} from '../services/rewardsService';
import {
  BEDTIME_STATUS,
  DEFAULT_BEDTIME_SETTINGS,
  getBedtimeStatus,
  getBedtimeMessage,
  calculateSleepPreparationProgress,
  formatTimeStr,
} from '../services/bedtimeService';

const UnloadContext = createContext();

export const UnloadProvider = ({ children }) => {
  const initial = getInitialUnloadState();

  const [baselineScreenTime, setBaselineScreenTime] = useState(initial.baselineScreenTime);
  const [currentDailyLimit, setCurrentDailyLimit] = useState(initial.currentDailyLimit);
  const [actualDailyUsage, setActualDailyUsage] = useState(initial.actualDailyUsage);
  const [nextDailyLimit, setNextDailyLimit] = useState(initial.nextDailyLimit);
  const [currentStage, setCurrentStage] = useState(initial.currentStage);
  const [dayNumber, setDayNumber] = useState(initial.dayNumber);
  const [streak, setStreak] = useState(initial.streak);
  const [history, setHistory] = useState(initial.history);

  // App Usage & Warning State (Step 3)
  const [appsList, setAppsList] = useState(getInitialAppUsageData());
  const [activeAppWarning, setActiveAppWarning] = useState(null);
  const [reflectionTitle, setReflectionTitle] = useState('Your screen-time goal is complete 🌱');

  // Reflection / Mindful Reset State
  const [reflectionModalVisible, setReflectionModalVisible] = useState(false);
  const [selectedOfflineActivity, setSelectedOfflineActivity] = useState(null);

  // Parent Guardian Controls & State (Step 4)
  const [warningThreshold, setWarningThresholdState] = useState(80); // 70%, 80%, 90%
  const [requireReflection, setRequireReflectionState] = useState(true); // Default ON

  const [parentActivityEvents, setParentActivityEvents] = useState([
    { id: 'ev_1', time: '1:45 PM', text: 'Instagram reached 80% of its daily limit 🌱', type: 'warning' },
    { id: 'ev_2', time: '12:30 PM', text: 'Screen time reduced compared with baseline', type: 'positive' },
    { id: 'ev_3', time: '11:15 AM', text: 'Completed 2-min mindful breathing reset', type: 'wellness' },
    { id: 'ev_4', time: '8:15 AM', text: 'Safe Zone arrival: Green Valley Middle School 🌱', type: 'safe' },
  ]);

  // ─── GPS & Safe Zones State (Step 5) ────────────────────────────────────────
  const initialZones = getInitialSafeZones();
  const initialLocation = getCurrentMockLocation();

  const [currentMockLocation, setCurrentMockLocation] = useState(initialLocation);
  const [safeZones, setSafeZones] = useState(initialZones);
  const [activeSafeZone, setActiveSafeZone] = useState(initialZones[0]); // Home
  const [locationRoutine, setLocationRoutine] = useState(getLocationRoutine('home'));

  const [locationEvents, setLocationEvents] = useState([
    { id: 'le_1', time: '8:15 AM', text: 'Child arrived at Green Valley Middle School 🌱', type: 'arrival', icon: '🏫', zoneName: 'Green Valley Middle School' },
    { id: 'le_2', time: '3:42 PM', text: 'Child left Green Valley Middle School', type: 'departure', icon: '🚶', zoneName: 'Green Valley Middle School' },
    { id: 'le_3', time: '4:01 PM', text: 'Child arrived at City Recreation Park 🌳', type: 'arrival', icon: '🌳', zoneName: 'City Recreation Park' },
    { id: 'le_4', time: '5:30 PM', text: 'Child arrived at Home Sweet Home 🏠', type: 'arrival', icon: '🏠', zoneName: 'Home Sweet Home' },
  ]);

  // ─── Rewards & Gamification State (Step 6) ──────────────────────────────────
  const initialRewards = getInitialRewardsState();
  const [rewardPoints, setRewardPoints] = useState(initialRewards.rewardPoints); // 125
  const [achievements, setAchievements] = useState(initialRewards.achievements);
  const [dailyChallenges, setDailyChallenges] = useState(initialRewards.dailyChallenges);
  const [rewardHistory, setRewardHistory] = useState(initialRewards.rewardHistory);
  const [redeemedRewards, setRedeemedRewards] = useState(initialRewards.redeemedRewards);
  const [awardedMilestones, setAwardedMilestones] = useState(initialRewards.awardedMilestones);
  const [parentRewardSettings, setParentRewardSettings] = useState(initialRewards.parentRewardSettings);
  const [rewardFeedback, setRewardFeedback] = useState(null);

  // ─── Bedtime & Curfew State (Step 7) ────────────────────────────────────────
  const [bedtimeSettings, setBedtimeSettings] = useState({ ...DEFAULT_BEDTIME_SETTINGS });
  const [simulatedBedtimeStatus, setSimulatedBedtimeStatus] = useState(null);
  const [bedtimeActivity, setBedtimeActivity] = useState({
    windDownCompleted: false,
    breathingCompleted: false,
    soundscape: 'rain',
  });
  const [lateNightEvents, setLateNightEvents] = useState([]);
  const [sleepCheckIn, setSleepCheckIn] = useState(null);

  // Derived Bedtime Status & Messages
  const now = new Date();
  const currentClockStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const bedtimeStatus = simulatedBedtimeStatus || getBedtimeStatus(currentClockStr, bedtimeSettings);
  const bedtimeMessage = getBedtimeMessage(bedtimeStatus, bedtimeSettings);
  const windDownProgress = calculateSleepPreparationProgress({
    status: bedtimeStatus,
    breathingCompleted: bedtimeActivity.breathingCompleted,
    soundscape: bedtimeActivity.soundscape,
    windDownCompleted: bedtimeActivity.windDownCompleted,
  });

  // Derived state
  const isLimitReached = actualDailyUsage >= currentDailyLimit;
  const savedComparedToBaseline = calculateMinutesSaved(baselineScreenTime, actualDailyUsage).formatted;

  // Whenever currentDailyLimit changes, ensure currentStage updates
  useEffect(() => {
    setCurrentStage(getStageForLimit(currentDailyLimit));
  }, [currentDailyLimit]);

  // Check for any apps currently in warning (>= warningThreshold) on init or change
  useEffect(() => {
    const warningApp = appsList.find((app) => app.isWarning && !app.isLimitReached);
    if (warningApp) {
      setActiveAppWarning(`You're getting close to your ${warningApp.appName} limit 🌱`);
    } else {
      setActiveAppWarning(null);
    }
  }, [appsList, warningThreshold]);

  /**
   * Append an activity event to the guardian feed
   */
  const addParentActivityEvent = (text, type = 'info') => {
    const newEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: 'Just now',
      text,
      type,
    };
    setParentActivityEvents((prev) => [newEvent, ...prev]);
  };

  /**
   * Add screen time usage to general bucket
   */
  const addUsage = (minutes) => {
    setActualDailyUsage((prev) => {
      const newUsage = prev + minutes;
      if (newUsage >= currentDailyLimit && prev < currentDailyLimit) {
        if (requireReflection) {
          setReflectionTitle('Your screen-time goal is complete 🌱');
          setReflectionModalVisible(true);
        }
        addParentActivityEvent('Daily screen-time goal completed 🌱', 'wellness');
      }
      return newUsage;
    });
  };

  /**
   * Add usage to an individual app (Step 3 simulator)
   */
  const addAppUsage = (appId, minutes) => {
    setAppsList((prevApps) => {
      let newlyWarned = false;
      let newlyCompleted = false;
      let targetAppName = '';
      let targetLimit = 0;

      const updated = prevApps.map((app) => {
        if (app.id === appId) {
          targetAppName = app.appName;
          targetLimit = app.dailyLimit;
          const newUsage = app.currentUsage + minutes;
          const metrics = calculateAppMetrics(newUsage, app.dailyLimit, warningThreshold);

          if (metrics.isWarning && !app.isWarning) {
            newlyWarned = true;
          }
          if (metrics.isLimitReached && !app.isLimitReached) {
            newlyCompleted = true;
          }

          return {
            ...app,
            currentUsage: newUsage,
            ...metrics,
          };
        }
        return app;
      });

      if (newlyWarned) {
        addParentActivityEvent(
          `${targetAppName} reached ${warningThreshold}% of its daily limit 🌱`,
          'warning'
        );
      }

      if (newlyCompleted) {
        if (requireReflection) {
          setReflectionTitle(`Your ${targetAppName} limit is complete 🌱`);
          setReflectionModalVisible(true);
        }
        addParentActivityEvent(
          `${targetAppName} daily limit completed (${targetLimit}m) 🌱`,
          'wellness'
        );
      }

      return updated;
    });

    setActualDailyUsage((prev) => {
      const newTotal = prev + minutes;
      if (newTotal >= currentDailyLimit && prev < currentDailyLimit) {
        if (requireReflection) {
          setReflectionTitle('Your screen-time goal is complete 🌱');
          setReflectionModalVisible(true);
        }
      }
      return newTotal;
    });
  };

  /**
   * Parent Limit Control: Change overall daily limit (30 min - 120 min)
   */
  const updateDailyLimit = (newLimit) => {
    const safeLimit = Math.max(30, Math.min(120, newLimit));
    setCurrentDailyLimit(safeLimit);
    setNextDailyLimit(calculateNextDailyLimit({
      currentLimit: safeLimit,
      actualUsage: actualDailyUsage,
    }).nextLimit);
    addParentActivityEvent(`Guardian adjusted daily screen limit to ${safeLimit}m`, 'settings');
  };

  /**
   * Parent Limit Control: Change individual app limit
   */
  const updateAppLimit = (appId, newLimit) => {
    const safeLimit = Math.max(5, Math.min(120, newLimit));
    let shouldTriggerReflection = false;
    let appName = '';

    setAppsList((prevApps) =>
      prevApps.map((app) => {
        if (app.id === appId) {
          appName = app.appName;
          const metrics = calculateAppMetrics(app.currentUsage, safeLimit, warningThreshold);
          if (metrics.isLimitReached && !app.isLimitReached && requireReflection) {
            shouldTriggerReflection = true;
          }
          return {
            ...app,
            dailyLimit: safeLimit,
            ...metrics,
          };
        }
        return app;
      })
    );

    addParentActivityEvent(`Guardian adjusted ${appName || 'app'} limit to ${safeLimit}m`, 'settings');

    if (shouldTriggerReflection) {
      setReflectionTitle(`Your ${appName} limit is complete 🌱`);
      setReflectionModalVisible(true);
      addParentActivityEvent(`${appName} reached newly configured guardian limit (${safeLimit}m)`, 'warning');
    }
  };

  /**
   * Parent Limit Control: Change warning threshold (70%, 80%, 90%)
   */
  const setWarningThreshold = (threshold) => {
    setWarningThresholdState(threshold);
    setAppsList((prevApps) =>
      prevApps.map((app) => ({
        ...app,
        ...calculateAppMetrics(app.currentUsage, app.dailyLimit, threshold),
      }))
    );
    addParentActivityEvent(`Guardian set non-blocking warning threshold to ${threshold}%`, 'settings');
  };

  /**
   * Parent Limit Control: Toggle reflection requirement
   */
  const setRequireReflection = (required) => {
    setRequireReflectionState(required);
    addParentActivityEvent(
      `Guardian ${required ? 'enabled' : 'disabled'} reflection requirement on limit completion`,
      'settings'
    );
  };

  // ─── Step 5: Location & Safe Zone Actions ───────────────────────────────────

  const evaluateSafeZonesState = (location, zones = safeZones) => {
    return evaluateSafeZones(location, zones);
  };

  const setMockLocation = (locationIdOrObject) => {
    const targetLocation = resolveMockLocation(locationIdOrObject);
    setCurrentMockLocation(targetLocation);

    const evaluation = evaluateSafeZones(targetLocation, safeZones);
    setSafeZones(evaluation.updatedZones);
    setActiveSafeZone(evaluation.activeSafeZone);
    setLocationRoutine(getLocationRoutine(evaluation.activeSafeZone));

    // Handle departure events first (once per departure)
    evaluation.departedZones.forEach((zone) => {
      const event = {
        id: `le_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        time: getDemoTimeString(),
        text: `Child left ${zone.name}`,
        type: 'departure',
        icon: '🚶',
        zoneName: zone.name,
      };
      setLocationEvents((prev) => [event, ...prev.slice(0, 9)]);
      addParentActivityEvent(event.text, 'info');
    });

    // Handle arrival events second (so arrival is the latest/topmost event)
    evaluation.arrivedZones.forEach((zone) => {
      const event = {
        id: `le_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        time: getDemoTimeString(),
        text: `Child arrived at ${zone.name} 🌱`,
        type: 'arrival',
        icon: zone.icon || '📍',
        zoneName: zone.name,
      };
      setLocationEvents((prev) => [event, ...prev.slice(0, 9)]);
      addParentActivityEvent(event.text, 'safe');
    });

    return evaluation;
  };

  const toggleSafeZone = (id) => {
    setSafeZones((prev) => {
      const updated = prev.map((zone) => (zone.id === id ? { ...zone, enabled: !zone.enabled } : zone));
      const evaluation = evaluateSafeZones(currentMockLocation, updated);
      setActiveSafeZone(evaluation.activeSafeZone);
      setLocationRoutine(getLocationRoutine(evaluation.activeSafeZone));
      return evaluation.updatedZones;
    });

    const target = safeZones.find((z) => z.id === id);
    if (target) {
      addParentActivityEvent(
        `Guardian ${!target.enabled ? 'enabled' : 'paused'} safe zone: ${target.name}`,
        'settings'
      );
    }
  };

  const addSafeZone = (newZone) => {
    const radius = Number(newZone.radius || newZone.radiusMeters || 150);
    const zoneWithId = {
      id: `sz_${Date.now()}`,
      name: newZone.name || 'New Safe Zone',
      type: newZone.type || 'other',
      latitude: newZone.latitude !== undefined ? newZone.latitude : 13.0200,
      longitude: newZone.longitude !== undefined ? newZone.longitude : 80.2200,
      radius,
      radiusMeters: radius,
      enabled: true,
      status: 'Outside',
      icon: newZone.icon || '📍',
      ...newZone,
    };

    setSafeZones((prev) => {
      const updated = [...prev, zoneWithId];
      const evaluation = evaluateSafeZones(currentMockLocation, updated);
      setActiveSafeZone(evaluation.activeSafeZone);
      setLocationRoutine(getLocationRoutine(evaluation.activeSafeZone));
      return evaluation.updatedZones;
    });

    addParentActivityEvent(`Guardian created safe zone: ${zoneWithId.name}`, 'safe');
    return zoneWithId;
  };

  const updateSafeZone = (zoneId, updates) => {
    setSafeZones((prev) => {
      const updated = prev.map((zone) => {
        if (zone.id !== zoneId) return zone;
        const radius = Number(
          updates.radius !== undefined ? updates.radius :
          (updates.radiusMeters !== undefined ? updates.radiusMeters : zone.radius)
        );
        return {
          ...zone,
          ...updates,
          radius,
          radiusMeters: radius,
        };
      });

      const evaluation = evaluateSafeZones(currentMockLocation, updated);
      setActiveSafeZone(evaluation.activeSafeZone);
      setLocationRoutine(getLocationRoutine(evaluation.activeSafeZone));
      return evaluation.updatedZones;
    });

    addParentActivityEvent('Guardian updated safe zone settings', 'settings');
  };

  const deleteSafeZone = (zoneId) => {
    if (safeZones.length <= 1) {
      return { success: false, message: 'At least one active safe zone is required.' };
    }

    const target = safeZones.find((z) => z.id === zoneId);
    setSafeZones((prev) => {
      const filtered = prev.filter((z) => z.id !== zoneId);
      const evaluation = evaluateSafeZones(currentMockLocation, filtered);
      setActiveSafeZone(evaluation.activeSafeZone);
      setLocationRoutine(getLocationRoutine(evaluation.activeSafeZone));
      return evaluation.updatedZones;
    });

    if (target) {
      addParentActivityEvent(`Guardian removed safe zone: ${target.name}`, 'settings');
    }
    return { success: true };
  };

  // ─── Step 6: Rewards & Gamification Actions ─────────────────────────────────

  const addRewardPoints = (points, transactionData) => {
    if (!parentRewardSettings.rewardsEnabled && points > 0) {
      return { success: false, message: 'Rewards are currently paused by your guardian.' };
    }

    setRewardPoints((prev) => Math.max(0, prev + points));

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...transactionData,
      points,
    };

    setRewardHistory((prev) => [tx, ...prev]);

    if (points > 0) {
      setRewardFeedback({
        title: transactionData.title || 'Points Earned!',
        points,
        icon: transactionData.icon || '🌱',
      });
      setTimeout(() => setRewardFeedback(null), 3500);
    }

    return { success: true, transaction: tx };
  };

  const completeChallenge = (challengeId) => {
    let earnedPoints = 0;
    let challengeTitle = '';

    setDailyChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === challengeId && !ch.completed) {
          challengeTitle = ch.title;
          earnedPoints = ch.rewardPoints;
          return { ...ch, progress: ch.requirement, completed: true };
        }
        return ch;
      })
    );

    if (earnedPoints > 0) {
      addRewardPoints(earnedPoints, {
        type: REWARD_ACTIONS.DAILY_CHALLENGE_COMPLETED,
        title: `Challenge: ${challengeTitle}`,
        description: `Completed daily challenge and earned +${earnedPoints} Sprout Points.`,
        icon: '🏆',
      });
      addParentActivityEvent(`🏆 Child completed daily challenge: "${challengeTitle}" (+${earnedPoints} pts)`, 'safe');
    }
  };

  const incrementAchievementProgress = (achievementId, incrementBy = 1) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id !== achievementId || ach.unlocked) return ach;
        const newProgress = Math.min(ach.requirement, ach.progress + incrementBy);
        const newlyUnlocked = newProgress >= ach.requirement;

        if (newlyUnlocked) {
          addRewardPoints(ach.rewardPoints, {
            type: 'ACHIEVEMENT_UNLOCKED',
            title: `Achievement: ${ach.title}`,
            description: `Unlocked! Earned +${ach.rewardPoints} bonus points.`,
            icon: ach.icon || '⭐',
          });
          addParentActivityEvent(`⭐ Child unlocked achievement: "${ach.title}" (+${ach.rewardPoints} pts)`, 'positive');
        }

        return {
          ...ach,
          progress: newProgress,
          unlocked: newlyUnlocked,
        };
      })
    );
  };

  const checkStreakMilestones = (currentStreak) => {
    const bonus = getStreakMilestoneBonus(currentStreak);
    if (bonus && !awardedMilestones.includes(bonus.milestone)) {
      setAwardedMilestones((prev) => [...prev, bonus.milestone]);
      addRewardPoints(bonus.points, {
        type: REWARD_ACTIONS.STREAK_MILESTONE,
        title: `🔥 ${bonus.milestone}-Day Streak Bonus!`,
        description: `Earned +${bonus.points} Sprout Points for maintaining a healthy streak.`,
        icon: '🔥',
      });
      addParentActivityEvent(`🔥 Child reached a ${bonus.milestone}-day streak milestone! (+${bonus.points} pts)`, 'positive');

      if (bonus.milestone === 3) incrementAchievementProgress('ach_streak_3', 3);
      if (bonus.milestone === 7) incrementAchievementProgress('ach_streak_7', 7);
    }
  };

  const completeOfflineActivityAction = (activity) => {
    setSelectedOfflineActivity(activity);

    if (parentRewardSettings.rewardsEnabled) {
      addRewardPoints(REWARD_VALUES.OFFLINE_ACTIVITY_COMPLETED, {
        type: REWARD_ACTIONS.OFFLINE_ACTIVITY_COMPLETED,
        title: `Offline Activity: ${activity.title}`,
        description: 'Stepped away from the screen for healthy real-world engagement.',
        icon: activity.icon || '🚶',
      });
    }

    if (parentRewardSettings.challengeRewards) {
      completeChallenge('ch_digital_break');
    }

    incrementAchievementProgress('ach_offline_explorer', 1);
    addParentActivityEvent(`🚶 Child engaged in offline activity: ${activity.title} (+10 pts)`, 'wellness');
  };

  const completeReflectionAction = () => {
    setReflectionModalVisible(false);

    if (parentRewardSettings.rewardsEnabled) {
      addRewardPoints(REWARD_VALUES.REFLECTION_COMPLETED, {
        type: REWARD_ACTIONS.REFLECTION_COMPLETED,
        title: 'Mindful Reset',
        description: 'Completed 2-minute mindful breathing & self-regulation reset.',
        icon: '🧘',
      });
    }

    if (parentRewardSettings.challengeRewards) {
      completeChallenge('ch_mindful_moment');
    }

    incrementAchievementProgress('ach_mindful_user', 1);
    addParentActivityEvent('🧘 Child completed mindful reflection reset (+5 pts)', 'wellness');
  };

  const completeRoutineAction = (zoneOrType) => {
    if (parentRewardSettings.safeZoneRewards) {
      const type = typeof zoneOrType === 'string' ? zoneOrType : (zoneOrType?.type || 'safe zone');
      addRewardPoints(REWARD_VALUES.SAFE_ZONE_ROUTINE_COMPLETED, {
        type: REWARD_ACTIONS.SAFE_ZONE_ROUTINE_COMPLETED,
        title: 'Healthy Routine Followed',
        description: `Engaged with healthy routine at ${type}.`,
        icon: '📍',
      });
      incrementAchievementProgress('ach_safe_zone_star', 1);
      addParentActivityEvent(`📍 Child followed healthy routine at ${type} (+5 pts)`, 'safe');
    }
  };

  const redeemReward = (reward) => {
    if (!canAffordReward(rewardPoints, reward.cost)) {
      return {
        success: false,
        message: `You need ${reward.cost - rewardPoints} more Sprout Points to redeem this perk!`,
      };
    }

    setRewardPoints((prev) => prev - reward.cost);
    setRedeemedRewards((prev) => [...prev, reward.id]);

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: REWARD_ACTIONS.REWARD_REDEEMED,
      title: `Redeemed: ${reward.title}`,
      description: `Spent ${reward.cost} Sprout Points.`,
      points: -reward.cost,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setRewardHistory((prev) => [tx, ...prev]);
    addParentActivityEvent(`🎨 Child redeemed virtual reward: "${reward.title}" (-${reward.cost} pts)`, 'settings');

    return {
      success: true,
      message: `${reward.title} unlocked! 🌱`,
    };
  };

  const updateParentRewardSettings = (updates) => {
    setParentRewardSettings((prev) => {
      const next = { ...prev, ...updates };
      addParentActivityEvent('Guardian updated rewards & challenge settings', 'settings');
      return next;
    });
  };

  const resetRewards = () => {
    const initR = getInitialRewardsState();
    setRewardPoints(initR.rewardPoints);
    setAchievements(initR.achievements);
    setDailyChallenges(initR.dailyChallenges);
    setRewardHistory(initR.rewardHistory);
    setRedeemedRewards(initR.redeemedRewards);
    setAwardedMilestones(initR.awardedMilestones);
    setParentRewardSettings(initR.parentRewardSettings);
  };

  /**
   * Reset all app usages and return to initial demo state
   */
  const resetAppUsage = () => {
    setAppsList(getInitialAppUsageData());
    setActualDailyUsage(initial.actualDailyUsage);
    setActiveAppWarning(null);
    setReflectionModalVisible(false);
    addParentActivityEvent('Screen time and app usages reset to demo baseline', 'info');
  };

  /**
   * Advance to next day
   */
  const advanceToNextDay = (simulatedUsage = null) => {
    const usageForToday = simulatedUsage !== null ? simulatedUsage : actualDailyUsage;

    const result = calculateNextDailyLimit({
      currentLimit: currentDailyLimit,
      actualUsage: usageForToday,
      baseline: baselineScreenTime,
      safeMinimum: CONFIG.SAFE_MINIMUM_LIMIT,
      stepSize: CONFIG.DEFAULT_STEP_REDUCTION,
    });

    const todayLog = {
      day: dayNumber,
      limit: currentDailyLimit,
      used: usageForToday,
      saved: Math.max(0, baselineScreenTime - usageForToday),
      met: usageForToday <= currentDailyLimit,
    };

    setHistory((prev) => [...prev, todayLog]);

    let newStreak = streak;
    if (result.streakMaintained) {
      newStreak = streak + result.streakIncrement;
      setStreak(newStreak);
    }

    // Award Daily Goal points if met
    if (usageForToday <= currentDailyLimit && parentRewardSettings.rewardsEnabled) {
      addRewardPoints(REWARD_VALUES.DAILY_LIMIT_MET, {
        type: REWARD_ACTIONS.DAILY_LIMIT_MET,
        title: 'Daily Goal Complete 🌱',
        description: 'You stayed within today’s screen-time goal.',
        icon: '🌱',
      });
      completeChallenge('ch_daily_goal');
      incrementAchievementProgress('ach_screen_champion', 1);
      checkStreakMilestones(newStreak);
    }

    // Reset daily challenges for the new day
    setDailyChallenges((prev) =>
      prev.map((ch) => ({ ...ch, progress: 0, completed: false }))
    );

    const newDay = dayNumber + 1;
    const newCurrentLimit = result.nextLimit;
    const projectedNext = Math.max(CONFIG.SAFE_MINIMUM_LIMIT, newCurrentLimit - CONFIG.DEFAULT_STEP_REDUCTION);

    setDayNumber(newDay);
    setCurrentDailyLimit(newCurrentLimit);
    setNextDailyLimit(projectedNext);
    setActualDailyUsage(0);
    setReflectionModalVisible(false);
    setSelectedOfflineActivity(null);
    setAppsList(
      getInitialAppUsageData().map((a) => ({
        ...a,
        currentUsage: 0,
        percentageUsed: 0,
        remainingTime: a.dailyLimit,
        status: APP_STATUS.WITHIN_LIMIT,
        isWarning: false,
        isLimitReached: false,
      }))
    );

    addParentActivityEvent(`Advanced to Day ${newDay} - Daily limit adjusted to ${newCurrentLimit}m`, 'positive');

    return result;
  };

  // ─── Bedtime Helper Actions (Step 7) ─────────────────────────────────────────

  const updateBedtimeSettings = (newSettings) => {
    setBedtimeSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      addParentActivityEvent('Bedtime schedule updated', 'wellness');
      return updated;
    });
  };

  const simulateBedtimeStatus = (status) => {
    setSimulatedBedtimeStatus(status);
  };

  const completeWindDown = () => {
    setBedtimeActivity((prev) => ({ ...prev, windDownCompleted: true }));
    addRewardPoints(5, 'Wind-Down Ready 🌱', 'Completed wind-down routine before rest.');
    addParentActivityEvent('Completed evening wind-down routine 🌙', 'wellness');
  };

  const completeBedtimeBreathing = () => {
    setBedtimeActivity((prev) => ({ ...prev, breathingCompleted: true }));
    addRewardPoints(5, 'Bedtime Breathing 🧘', 'Completed mindful breathing before rest.');
    addParentActivityEvent('Completed bedtime breathing reset 🌙', 'wellness');
  };

  const selectBedtimeSoundscape = (soundscapeId) => {
    setBedtimeActivity((prev) => ({ ...prev, soundscape: soundscapeId }));
  };

  const recordLateNightActivity = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLateNightEvent = {
      id: `lne_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: timeStr,
      text: 'Late-night activity detected during rest mode.',
    };
    setLateNightEvents((prev) => [newLateNightEvent, ...prev]);
    // Gentle wellness notification for parents - non-punitive, NO points deduction, NO streak reset
    addParentActivityEvent('Late-night activity detected during rest mode.', 'warning');
  };

  const submitSleepCheckIn = (optionId, notes = '') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const checkInData = {
      optionId,
      notes,
      timestamp: timeStr,
    };
    setSleepCheckIn(checkInData);
    addRewardPoints(5, 'Morning Check-In ☀️', 'Checked in on sleep quality.');
    addParentActivityEvent(`Morning sleep check-in submitted: ${optionId} ☀️`, 'wellness');
  };

  const resetBedtimeData = () => {
    setBedtimeActivity({
      windDownCompleted: false,
      breathingCompleted: false,
      soundscape: 'rain',
    });
    setSimulatedBedtimeStatus(null);
    setLateNightEvents([]);
    setSleepCheckIn(null);
    setBedtimeSettings({ ...DEFAULT_BEDTIME_SETTINGS });
  };

  /**
   * Reset everything to initial baseline
   */
  const resetToInitial = () => {
    const init = getInitialUnloadState();
    setBaselineScreenTime(init.baselineScreenTime);
    setCurrentDailyLimit(init.currentDailyLimit);
    setActualDailyUsage(init.actualDailyUsage);
    setNextDailyLimit(init.nextDailyLimit);
    setCurrentStage(init.currentStage);
    setDayNumber(init.dayNumber);
    setStreak(init.streak);
    setHistory(init.history);
    setAppsList(getInitialAppUsageData());
    setWarningThresholdState(80);
    setRequireReflectionState(true);
    setActiveAppWarning(null);
    setReflectionModalVisible(false);
    setSelectedOfflineActivity(null);

    // Reset location & safe zones
    setCurrentMockLocation(getCurrentMockLocation());
    const initZones = getInitialSafeZones();
    setSafeZones(initZones);
    setActiveSafeZone(initZones[0]);
    setLocationRoutine(getLocationRoutine('home'));

    // Reset rewards
    resetRewards();

    // Reset bedtime
    resetBedtimeData();
  };

  return (
    <UnloadContext.Provider
      value={{
        baselineScreenTime,
        setBaselineScreenTime,
        currentDailyLimit,
        setCurrentDailyLimit,
        actualDailyUsage,
        setActualDailyUsage,
        nextDailyLimit,
        currentStage,
        dayNumber,
        streak,
        history,
        isLimitReached,
        savedComparedToBaseline,
        addUsage,
        appsList,
        addAppUsage,
        resetAppUsage,
        activeAppWarning,
        reflectionTitle,
        warningThreshold,
        requireReflection,
        parentActivityEvents,
        safeZones,
        updateDailyLimit,
        updateAppLimit,
        setWarningThreshold,
        setRequireReflection,
        addParentActivityEvent,
        toggleSafeZone,
        addSafeZone,
        updateSafeZone,
        deleteSafeZone,
        // Step 5 Location & Safe Zone Exports
        currentMockLocation,
        activeSafeZone,
        locationRoutine,
        locationEvents,
        setMockLocation,
        evaluateSafeZones: evaluateSafeZonesState,
        // Step 6 Rewards & Gamification Exports
        rewardPoints,
        achievements,
        dailyChallenges,
        rewardHistory,
        redeemedRewards,
        parentRewardSettings,
        rewardFeedback,
        addRewardPoints,
        completeChallenge,
        redeemReward,
        resetRewards,
        updateParentRewardSettings,
        completeOfflineActivityAction,
        completeReflectionAction,
        completeRoutineAction,
        advanceToNextDay,
        resetToInitial,
        reflectionModalVisible,
        setReflectionModalVisible,
        selectedOfflineActivity,
        setSelectedOfflineActivity,
        // Step 7 Bedtime & Curfew Exports
        bedtimeSettings,
        bedtimeStatus,
        bedtimeMessage,
        windDownProgress,
        bedtimeActivity,
        lateNightEvents,
        sleepCheckIn,
        updateBedtimeSettings,
        simulateBedtimeStatus,
        completeWindDown,
        completeBedtimeBreathing,
        selectBedtimeSoundscape,
        recordLateNightActivity,
        submitSleepCheckIn,
        resetBedtimeData,
      }}
    >
      {children}
    </UnloadContext.Provider>
  );
};

export const useUnload = () => {
  const context = useContext(UnloadContext);
  if (!context) {
    throw new Error('useUnload must be used within an UnloadProvider');
  }
  return context;
};
