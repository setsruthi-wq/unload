/**
 * UNLOAD Progressive Unloading Engine
 * Developed by Team Safesprout
 *
 * Core Concept:
 * The app does not abruptly block screen usage. It gradually reduces excessive
 * screen usage using a Progressive Unloading model and helps users develop self-regulation.
 */

export const STAGES = {
  STAGE_1: {
    id: 1,
    name: 'Stage 1 — Awareness',
    shortName: 'Stage 1',
    subtitle: 'Awareness',
    icon: '👀',
    description: 'Establishing digital baseline and mindful screen habits.',
    minLimit: 95,
  },
  STAGE_2: {
    id: 2,
    name: 'Stage 2 — Gentle Tapering',
    shortName: 'Stage 2',
    subtitle: 'Gentle Tapering',
    icon: '🌱',
    description: 'Gradually stepping down screen allowances without sudden cutoffs.',
    minLimit: 60,
  },
  STAGE_3: {
    id: 3,
    name: 'Stage 3 — Focused Flow',
    shortName: 'Stage 3',
    subtitle: 'Focused Flow',
    icon: '⚡',
    description: 'Refined self-regulation with consolidated media windows.',
    minLimit: 45,
  },
  STAGE_4: {
    id: 4,
    name: 'Stage 4 — Digital Zen',
    shortName: 'Stage 4',
    subtitle: 'Digital Zen 🌱',
    icon: '🧘',
    description: 'Balanced digital wellness with natural self-regulation.',
    minLimit: 30,
  },
};

export const CONFIG = {
  DEFAULT_BASELINE: 120,    // 120 minutes baseline screen time
  SAFE_MINIMUM_LIMIT: 30,  // Never reduce below 30 minutes
  DEFAULT_STEP_REDUCTION: 5, // 5-10 min reduction per successful day
  GRACE_MARGIN_MINUTES: 15, // Slight excess within 15m is forgiven without punishment
};

/**
 * Determine the Progressive Unloading stage based on current daily limit
 */
export const getStageForLimit = (limitMinutes) => {
  if (limitMinutes >= STAGES.STAGE_1.minLimit) return STAGES.STAGE_1;
  if (limitMinutes >= STAGES.STAGE_2.minLimit) return STAGES.STAGE_2;
  if (limitMinutes >= STAGES.STAGE_3.minLimit) return STAGES.STAGE_3;
  return STAGES.STAGE_4;
};

/**
 * Calculate the next day's screen-time limit using Progressive Unloading principles:
 * - If usage stays within limit: reduce next day's limit by stepSize (down to safe minimum).
 * - If usage slightly exceeds limit: do NOT punish or reset. Maintain limit or apply slight adjustment.
 * - Never reduce below safe minimum.
 */
export const calculateNextDailyLimit = ({
  currentLimit,
  actualUsage,
  baseline = CONFIG.DEFAULT_BASELINE,
  safeMinimum = CONFIG.SAFE_MINIMUM_LIMIT,
  stepSize = CONFIG.DEFAULT_STEP_REDUCTION,
  graceMargin = CONFIG.GRACE_MARGIN_MINUTES,
}) => {
  // Case 1: User stayed within daily limit
  if (actualUsage <= currentLimit) {
    const nextLimit = Math.max(safeMinimum, currentLimit - stepSize);
    return {
      nextLimit,
      status: 'target_met',
      message: `Goal met! Tomorrow's limit is gently tapered to ${nextLimit} min.`,
      streakMaintained: true,
      streakIncrement: 1,
    };
  }

  // Case 2: User slightly exceeded limit (within grace margin)
  const excess = actualUsage - currentLimit;
  if (excess <= graceMargin) {
    // Maintain current limit without harsh punishment
    return {
      nextLimit: currentLimit,
      status: 'grace_maintained',
      message: `Close call! You exceeded by ${excess}m. We will maintain your ${currentLimit}m limit tomorrow without punishment.`,
      streakMaintained: true,
      streakIncrement: 0,
    };
  }

  // Case 3: Exceeded beyond grace margin - gentle stabilization (not harsh reset)
  // Give a slight buffer (e.g. +5m) but never exceed baseline
  const stabilizedLimit = Math.min(baseline, currentLimit + 5);
  return {
    nextLimit: stabilizedLimit,
    status: 'needs_stabilization',
    message: `A bump in the road. Limit adjusted slightly to ${stabilizedLimit}m to help you regain balance.`,
    streakMaintained: false,
    streakIncrement: 0,
  };
};

/**
 * Format minutes into readable strings (e.g. 75 -> "1h 15m", 47 -> "47 min")
 */
export const formatMinutes = (minutes) => {
  const mins = Math.max(0, Math.round(minutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Calculate minutes saved compared with baseline
 */
export const calculateMinutesSaved = (baseline, actualUsage) => {
  const saved = Math.max(0, baseline - actualUsage);
  return {
    savedMinutes: saved,
    formatted: formatMinutes(saved),
  };
};

/**
 * Generate initial 6-day history aligned with the prompt requirements:
 * Day 1: 120m limit
 * Day 2: 110m limit
 * Day 3: 100m limit
 * Day 4: 90m limit
 * Day 5: 80m limit
 * Day 6 (Today): 60m limit, 47m used, Next: 55m tomorrow, 6-day streak
 */
export const getInitialUnloadState = () => {
  const baseline = 120;
  const history = [
    { day: 1, limit: 120, used: 120, saved: 0, met: true },
    { day: 2, limit: 110, used: 108, saved: 12, met: true },
    { day: 3, limit: 100, used: 95, saved: 25, met: true },
    { day: 4, limit: 90, used: 88, saved: 32, met: true },
    { day: 5, limit: 80, used: 76, saved: 44, met: true },
  ];

  const currentDailyLimit = 60;
  const actualDailyUsage = 47;
  const dayNumber = 6;
  const streak = 6;
  const nextDailyLimit = 55; // 60 min -> 55 min tomorrow

  const currentStage = getStageForLimit(currentDailyLimit);
  const savedComparedToBaseline = calculateMinutesSaved(baseline, actualDailyUsage);

  return {
    baselineScreenTime: baseline,
    currentDailyLimit,
    actualDailyUsage,
    nextDailyLimit,
    currentStage,
    dayNumber,
    streak,
    history,
    savedComparedToBaseline: savedComparedToBaseline.formatted, // "1h 15m"
    savedMinutes: savedComparedToBaseline.savedMinutes, // 73 mins
  };
};

/**
 * Offline Activity Suggestions for when the daily goal is reached
 */
export const OFFLINE_ACTIVITIES = [
  { id: '1', title: 'Read a Book', icon: '📖', desc: 'Dive into an exciting novel or comic' },
  { id: '2', title: 'Go for a Walk', icon: '🚶‍♂️', desc: 'Get fresh air and stretch your legs' },
  { id: '3', title: 'Draw or Sketch', icon: '🎨', desc: 'Express your creativity with paper and pens' },
  { id: '4', title: 'Play a Board Game', icon: '🎲', desc: 'Challenge family or friends' },
  { id: '5', title: 'Call a Friend', icon: '📞', desc: 'Catch up with a real-voice conversation' },
  { id: '6', title: 'Help with Dinner', icon: '🥗', desc: 'Learn a new recipe and share a meal' },
];
