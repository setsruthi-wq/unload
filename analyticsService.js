/**
 * UNLOAD Digital Wellness Analytics Service
 * Developed by Team Safesprout
 *
 * Provides deterministic, privacy-friendly analytics derived from data
 * already collected by UNLOAD Steps 1–7.
 *
 * NO new tracking system. Uses:
 * - history[]            (progressive unloading history)
 * - baselineScreenTime   (daily baseline)
 * - currentDailyLimit    (current cap)
 * - actualDailyUsage     (today's usage)
 * - streak               (current streak)
 * - rewardHistory[]      (rewards/reflections/offline activities)
 * - bedtimeActivity      (wind-down, breathing, soundscape)
 * - lateNightEvents[]    (bedtime log)
 * - locationEvents[]     (safe-zone arrivals/departures)
 */

// ─── Usage Calculations ───────────────────────────────────────────────────────

/**
 * Calculate average daily usage from history array.
 * Falls back to actualDailyUsage if history is empty.
 */
export const calculateAverageUsage = (history = [], fallback = 0) => {
  if (!history || history.length === 0) return fallback;
  const total = history.reduce((sum, d) => sum + (d.used || 0), 0);
  return Math.round(total / history.length);
};

/**
 * Minutes saved vs baseline
 */
export const calculateUsageReduction = (baseline, currentUsage) => {
  return Math.max(0, baseline - currentUsage);
};

/**
 * Percentage reduction vs baseline (0–100)
 */
export const calculateReductionPercentage = (baseline, currentUsage) => {
  if (!baseline || baseline <= 0) return 0;
  const reduction = calculateUsageReduction(baseline, currentUsage);
  return Math.min(100, Math.round((reduction / baseline) * 100));
};

// ─── Weekly Usage ─────────────────────────────────────────────────────────────

/**
 * Returns the last N days of history entries for charting.
 * If history has fewer than N entries, pads with nulls.
 */
export const getWeeklyUsage = (history = [], days = 7) => {
  const result = [];
  for (let i = 0; i < days; i++) {
    const entry = history[i] || null;
    result.push(entry ? { day: entry.day, used: entry.used, limit: entry.limit, met: entry.met } : null);
  }
  return result;
};

/**
 * Returns a trend descriptor based on recent history.
 * 'improving' | 'stable' | 'increasing' | 'insufficient_data'
 */
export const getUsageTrend = (history = []) => {
  if (!history || history.length < 2) return 'insufficient_data';
  const recent = history.slice(-3);
  const first = recent[0]?.used || 0;
  const last = recent[recent.length - 1]?.used || 0;
  const delta = last - first;
  if (delta < -5) return 'improving';
  if (delta > 5) return 'increasing';
  return 'stable';
};

// ─── Limit Adherence ──────────────────────────────────────────────────────────

/**
 * Returns how many history days the limit was met.
 * Also returns breakdown: withinLimit, nearLimit, exceeded.
 */
export const getLimitAdherence = (history = [], warningThresholdPct = 80) => {
  if (!history || history.length === 0) {
    return {
      total: 0,
      withinLimit: 0,
      nearLimit: 0,
      exceeded: 0,
      adherenceRate: 0,
      adherencePct: 0,
    };
  }
  let withinLimit = 0;
  let nearLimit = 0;
  let exceeded = 0;
  history.forEach((d) => {
    if (!d) return;
    const pct = d.limit > 0 ? (d.used / d.limit) * 100 : 0;
    if (d.met || pct <= 100) {
      if (pct >= warningThresholdPct) nearLimit++;
      else withinLimit++;
    } else {
      exceeded++;
    }
  });
  const total = history.length;
  const metCount = withinLimit + nearLimit;
  return {
    total,
    withinLimit,
    nearLimit,
    exceeded,
    adherenceRate: `${metCount} / ${total} days`,
    adherencePct: Math.round((metCount / total) * 100),
  };
};

// ─── Reflection & Offline Activity Stats ─────────────────────────────────────

/**
 * Count how many reward history entries are reflections.
 */
export const getReflectionStats = (rewardHistory = []) => {
  const reflections = (rewardHistory || []).filter(
    (r) => r && r.type === 'REFLECTION_COMPLETED'
  );
  return {
    count: reflections.length,
    lastCompleted: reflections[0]?.timestamp || null,
  };
};

/**
 * Count offline activities from reward history.
 */
export const getOfflineActivityStats = (rewardHistory = []) => {
  const activities = (rewardHistory || []).filter(
    (r) => r && r.type === 'OFFLINE_ACTIVITY_COMPLETED'
  );
  return {
    count: activities.length,
    lastCompleted: activities[0]?.timestamp || null,
  };
};

// ─── Bedtime Consistency ──────────────────────────────────────────────────────

/**
 * Calculate bedtime routine consistency from bedtime activity + lateNightEvents.
 * Returns a consistency score 0–100 and descriptor.
 */
export const getBedtimeConsistency = (bedtimeActivity = {}, lateNightEvents = [], sleepCheckIn = null) => {
  let score = 0;
  const details = [];

  if (bedtimeActivity?.soundscape) {
    score += 30;
    details.push('Soundscape selected');
  }
  if (bedtimeActivity?.breathingCompleted) {
    score += 35;
    details.push('Breathing completed');
  }
  if (bedtimeActivity?.windDownCompleted) {
    score += 25;
    details.push('Wind-down confirmed');
  }
  if (sleepCheckIn) {
    score += 10;
    details.push('Morning check-in completed');
  }

  const lateNightCount = lateNightEvents?.length || 0;
  // Gentle: late night events reduce score slightly but not harshly
  const lateNightPenalty = Math.min(30, lateNightCount * 10);
  score = Math.max(0, score - lateNightPenalty);

  let descriptor = 'Getting started';
  if (score >= 80) descriptor = 'Consistent';
  else if (score >= 50) descriptor = 'Building habits';
  else if (score >= 25) descriptor = 'Early stage';

  return {
    score,
    descriptor,
    details,
    lateNightCount,
    hasCheckIn: !!sleepCheckIn,
  };
};

// ─── Safe-Zone Routine Stats ──────────────────────────────────────────────────

/**
 * Derive safe-zone routine completions from reward history and location events.
 */
export const getSafeZoneRoutineStats = (rewardHistory = [], locationEvents = []) => {
  const routineRewards = (rewardHistory || []).filter(
    (r) => r && r.type === 'SAFE_ZONE_ROUTINE_COMPLETED'
  );
  const arrivalCount = (locationEvents || []).filter(
    (e) => e && e.type === 'arrival'
  ).length;
  return {
    routineCompletions: routineRewards.length,
    safeZoneArrivals: arrivalCount,
  };
};

// ─── Wellness Summary ─────────────────────────────────────────────────────────

/**
 * Build a complete wellness summary object from all available data.
 */
export const getWellnessSummary = ({
  history = [],
  baseline = 120,
  currentDailyLimit = 60,
  actualDailyUsage = 0,
  streak = 0,
  rewardPoints = 0,
  rewardHistory = [],
  achievements = [],
  bedtimeActivity = {},
  lateNightEvents = [],
  sleepCheckIn = null,
  locationEvents = [],
}) => {
  const avgUsage = calculateAverageUsage(history, actualDailyUsage);
  const reduction = calculateUsageReduction(baseline, actualDailyUsage);
  const reductionPct = calculateReductionPercentage(baseline, actualDailyUsage);
  const trend = getUsageTrend(history);
  const adherence = getLimitAdherence(history);
  const reflectionStats = getReflectionStats(rewardHistory);
  const offlineStats = getOfflineActivityStats(rewardHistory);
  const bedtimeConsistency = getBedtimeConsistency(bedtimeActivity, lateNightEvents, sleepCheckIn);
  const safeZoneStats = getSafeZoneRoutineStats(rewardHistory, locationEvents);
  const unlockedAchievements = (achievements || []).filter((a) => a?.unlocked).length;

  return {
    avgUsage,
    reduction,
    reductionPct,
    trend,
    adherence,
    reflectionStats,
    offlineStats,
    bedtimeConsistency,
    safeZoneStats,
    streak,
    rewardPoints,
    unlockedAchievements,
    totalAchievements: (achievements || []).length,
  };
};

// ─── Insight Generation ───────────────────────────────────────────────────────

/**
 * Generate deterministic, supportive wellness insight strings.
 * Language is always positive, neutral, and non-shaming.
 */
export const generateWellnessInsights = (summary) => {
  const insights = [];

  if (!summary) return insights;

  const {
    avgUsage,
    reduction,
    reductionPct,
    trend,
    adherence,
    reflectionStats,
    offlineStats,
    bedtimeConsistency,
    safeZoneStats,
    streak,
    rewardPoints,
    unlockedAchievements,
  } = summary;

  // Screen time reduction insights
  if (reduction > 0) {
    insights.push({
      id: 'usage_reduction',
      icon: '📉',
      category: 'Screen Time',
      text: `Your screen time is ${reduction} minutes lower than your starting baseline — that's meaningful progress.`,
      positive: true,
    });
  }

  if (reductionPct >= 30) {
    insights.push({
      id: 'reduction_pct',
      icon: '🌱',
      category: 'Screen Time',
      text: `You've reduced screen time by ${reductionPct}% from your baseline. Your focus time is growing!`,
      positive: true,
    });
  }

  // Limit adherence
  if (adherence.adherencePct >= 80) {
    insights.push({
      id: 'adherence_high',
      icon: '✅',
      category: 'Daily Goals',
      text: `You stayed within your daily limit on ${adherence.adherenceRate}. Excellent self-regulation!`,
      positive: true,
    });
  } else if (adherence.adherencePct >= 50) {
    insights.push({
      id: 'adherence_mid',
      icon: '🌿',
      category: 'Daily Goals',
      text: `You met your daily limit on ${adherence.adherenceRate}. Small daily wins build big habits.`,
      positive: true,
    });
  }

  // Streak
  if (streak >= 7) {
    insights.push({
      id: 'streak_high',
      icon: '🔥',
      category: 'Streak',
      text: `You've maintained a ${streak}-day healthy streak. Consistency is your superpower!`,
      positive: true,
    });
  } else if (streak >= 3) {
    insights.push({
      id: 'streak_mid',
      icon: '🔥',
      category: 'Streak',
      text: `You're on a ${streak}-day streak. Keep the momentum going!`,
      positive: true,
    });
  }

  // Reflections
  if (reflectionStats.count >= 5) {
    insights.push({
      id: 'reflection_high',
      icon: '🧘',
      category: 'Mindfulness',
      text: `You've completed ${reflectionStats.count} mindful reflections. Reflection is a sign of real growth.`,
      positive: true,
    });
  } else if (reflectionStats.count > 0) {
    insights.push({
      id: 'reflection_any',
      icon: '🧘',
      category: 'Mindfulness',
      text: `You've completed ${reflectionStats.count} mindful reflection${reflectionStats.count !== 1 ? 's' : ''} — a great foundation.`,
      positive: true,
    });
  }

  // Offline activities
  if (offlineStats.count > 0) {
    insights.push({
      id: 'offline_activities',
      icon: '🚶',
      category: 'Offline Life',
      text: `You completed ${offlineStats.count} offline activit${offlineStats.count !== 1 ? 'ies' : 'y'} — your screen-free time is building real-world energy.`,
      positive: true,
    });
  }

  // Bedtime consistency
  if (bedtimeConsistency.score >= 70) {
    insights.push({
      id: 'bedtime_consistent',
      icon: '🌙',
      category: 'Sleep Wellness',
      text: `Your bedtime wind-down routine has been consistent (${bedtimeConsistency.score}% complete). Quality sleep powers everything.`,
      positive: true,
    });
  } else if (bedtimeConsistency.score >= 30) {
    insights.push({
      id: 'bedtime_building',
      icon: '🌙',
      category: 'Sleep Wellness',
      text: `You're building a bedtime routine. Even small wind-down habits can meaningfully improve your sleep.`,
      positive: true,
    });
  }

  // Safe zone routines
  if (safeZoneStats.safeZoneArrivals > 0) {
    insights.push({
      id: 'safe_zone',
      icon: '📍',
      category: 'Location Routines',
      text: `Your safe-zone check-ins have been tracked ${safeZoneStats.safeZoneArrivals} time${safeZoneStats.safeZoneArrivals !== 1 ? 's' : ''}. Location-aware routines strengthen healthy habits.`,
      positive: true,
    });
  }

  // Trend
  if (trend === 'improving') {
    insights.push({
      id: 'trend_improving',
      icon: '📈',
      category: 'Progress Trend',
      text: 'Your recent screen time shows a downward trend — you are making real progress.',
      positive: true,
    });
  } else if (trend === 'stable') {
    insights.push({
      id: 'trend_stable',
      icon: '⚖️',
      category: 'Progress Trend',
      text: 'Your usage has been stable. Maintaining consistency is a genuine achievement.',
      positive: true,
    });
  }

  // Rewards
  if (rewardPoints >= 100) {
    insights.push({
      id: 'reward_high',
      icon: '🌱',
      category: 'Sprout Points',
      text: `You've earned ${rewardPoints} Sprout Points through healthy choices — your wellness is showing!`,
      positive: true,
    });
  }

  // Achievements
  if (unlockedAchievements >= 3) {
    insights.push({
      id: 'achievements',
      icon: '🏆',
      category: 'Achievements',
      text: `You've unlocked ${unlockedAchievements} achievements. Each one represents a real behavior change.`,
      positive: true,
    });
  }

  // Always return at least one insight
  if (insights.length === 0) {
    insights.push({
      id: 'getting_started',
      icon: '🌱',
      category: 'Getting Started',
      text: 'Every healthy digital journey starts with a single step. You\'ve already taken it by being here.',
      positive: true,
    });
  }

  return insights;
};

// ─── App Usage Breakdown ──────────────────────────────────────────────────────

/**
 * Build per-app analytics from the apps list.
 */
export const getAppUsageBreakdown = (appsList = []) => {
  if (!appsList || appsList.length === 0) return [];
  const total = appsList.reduce((sum, a) => sum + (a.currentUsage || 0), 0);
  return appsList.map((app) => ({
    id: app.id,
    appName: app.appName,
    icon: app.icon || '📱',
    currentUsage: app.currentUsage || 0,
    dailyLimit: app.dailyLimit || 0,
    percentage: total > 0 ? Math.round(((app.currentUsage || 0) / total) * 100) : 0,
    limitPct: app.dailyLimit > 0 ? Math.min(100, Math.round(((app.currentUsage || 0) / app.dailyLimit) * 100)) : 0,
    isWarning: app.isWarning || false,
    isLimitReached: app.isLimitReached || false,
  })).sort((a, b) => b.currentUsage - a.currentUsage);
};

// ─── Trend Labels ─────────────────────────────────────────────────────────────

export const TREND_LABELS = {
  improving: { label: 'Improving ↓', color: '#10B981' },
  stable: { label: 'Stable →', color: '#38BDF8' },
  increasing: { label: 'Increasing ↑', color: '#F59E0B' },
  insufficient_data: { label: 'Tracking…', color: '#94A3B8' },
};
