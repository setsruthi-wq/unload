/**
 * UNLOAD UsageService
 * Developed by Team Safesprout
 *
 * ARCHITECTURAL BRIDGE:
 * ============================================================================
 *   Mock UsageService
 *          ↓
 *   Future Android UsageStatsManager (Native Module / Expo Config Plugin)
 *          ↓
 *   Real device app usage tracking
 * ============================================================================
 *
 * NOTE: This is a modular mock service for the UNLOAD prototype.
 * It simulates app-level screen-time allowances and progressive limits without
 * requiring native Android UsageStatsManager APIs or root permissions.
 * In production, this service interface will connect directly to Android's
 * UsageStatsManager / AppOpsManager system service.
 */

export const APP_STATUS = {
  WITHIN_LIMIT: 'Within Limit',
  NEAR_LIMIT: 'Near Limit',
  GOAL_REACHED: 'Goal Reached',
};

/**
 * Calculate the app usage status and percentage
 * Warning trigger: Approximately 80% of daily limit
 * Reflection trigger: >= 100% of daily limit
 */
export const calculateAppMetrics = (currentUsage, dailyLimit, warningThreshold = 80) => {
  const percentageUsed = Math.min(
    Math.round((currentUsage / dailyLimit) * 100),
    100
  );
  const remainingTime = Math.max(0, dailyLimit - currentUsage);

  let status = APP_STATUS.WITHIN_LIMIT;
  let isWarning = false;
  let isLimitReached = false;

  if (currentUsage >= dailyLimit) {
    status = APP_STATUS.GOAL_REACHED;
    isLimitReached = true;
  } else if (percentageUsed >= warningThreshold) {
    status = APP_STATUS.NEAR_LIMIT;
    isWarning = true;
  }

  return {
    percentageUsed,
    remainingTime,
    status,
    isWarning,
    isLimitReached,
  };
};

/**
 * Initial mock apps catalogue aligned with prompt requirements:
 * - Instagram: Limit 30m, Usage 22m, Status: Within Limit
 * - YouTube: Limit 30m, Usage 28m, Status: Near Limit (80%+)
 * - Games: Limit 20m, Usage 10m, Status: Within Limit
 * Plus Social Media, Entertainment, and Other categories.
 */
export const getInitialAppUsageData = () => {
  const rawApps = [
    {
      id: 'app_insta',
      appName: 'Instagram',
      category: 'Social Media',
      icon: '📸',
      color: '#EC4899',
      dailyLimit: 30,
      currentUsage: 22,
    },
    {
      id: 'app_youtube',
      appName: 'YouTube',
      category: 'Entertainment',
      icon: '📺',
      color: '#EF4444',
      dailyLimit: 30,
      currentUsage: 28,
    },
    {
      id: 'app_games',
      appName: 'Games',
      category: 'Games',
      icon: '🎮',
      color: '#F59E0B',
      dailyLimit: 20,
      currentUsage: 10,
    },
    {
      id: 'app_social_other',
      appName: 'Social Media (Other)',
      category: 'Social Media',
      icon: '💬',
      color: '#8B5CF6',
      dailyLimit: 15,
      currentUsage: 4,
    },
    {
      id: 'app_entertainment_other',
      appName: 'Entertainment (Other)',
      category: 'Entertainment',
      icon: '🍿',
      color: '#06B6D4',
      dailyLimit: 25,
      currentUsage: 8,
    },
    {
      id: 'app_other',
      appName: 'Other / Tools',
      category: 'Other',
      icon: '📱',
      color: '#10B981',
      dailyLimit: 30,
      currentUsage: 5,
    },
  ];

  return rawApps.map((app) => {
    const metrics = calculateAppMetrics(app.currentUsage, app.dailyLimit);
    return {
      ...app,
      ...metrics,
    };
  });
};

/**
 * Realistic daily history for previous 6 days as requested:
 * Day 1 → 120m
 * Day 2 → 110m
 * Day 3 → 100m
 * Day 4 → 90m
 * Day 5 → 80m
 * Day 6 → 72m
 */
export const get6DayUsageHistory = () => {
  return [
    { day: 1, label: 'Day 1', usageMinutes: 120, limitMinutes: 120 },
    { day: 2, label: 'Day 2', usageMinutes: 110, limitMinutes: 110 },
    { day: 3, label: 'Day 3', usageMinutes: 100, limitMinutes: 100 },
    { day: 4, label: 'Day 4', usageMinutes: 90, limitMinutes: 90 },
    { day: 5, label: 'Day 5', usageMinutes: 80, limitMinutes: 80 },
    { day: 6, label: 'Day 6', usageMinutes: 72, limitMinutes: 75 },
  ];
};

/**
 * 20-20-20 Habit Coaching message
 */
export const HABIT_COACHING_20_20_20 = {
  title: '👁️ 20-20-20 Habit Coaching',
  message:
    'Your eyes have been focused for 20 minutes. Look at something 20 feet away for 20 seconds.',
  subtitle: 'Relieves digital eye strain and promotes effortless mindful disengagement.',
};
