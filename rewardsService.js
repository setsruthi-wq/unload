/**
 * UNLOAD Rewards & Gamification Service
 * Developed by Team Safesprout
 *
 * Rewarding BEHAVIOR CHANGE and healthy digital routines:
 * - Staying within daily limits
 * - Completing mindful reflections
 * - Completing offline activities
 * - Maintaining healthy streaks
 * - Completing daily challenges
 * - Following location-aware routines
 *
 * NOTE: Prototype only. No real money, purchases, ads, or competitive leaderboards.
 */

// ─── Reward Action Types & Values ─────────────────────────────────────────────

export const REWARD_ACTIONS = {
  DAILY_LIMIT_MET: 'DAILY_LIMIT_MET',
  REFLECTION_COMPLETED: 'REFLECTION_COMPLETED',
  OFFLINE_ACTIVITY_COMPLETED: 'OFFLINE_ACTIVITY_COMPLETED',
  STREAK_MILESTONE: 'STREAK_MILESTONE',
  DAILY_CHALLENGE_COMPLETED: 'DAILY_CHALLENGE_COMPLETED',
  SAFE_ZONE_ROUTINE_COMPLETED: 'SAFE_ZONE_ROUTINE_COMPLETED',
  REWARD_REDEEMED: 'REWARD_REDEEMED',
};

export const REWARD_VALUES = {
  DAILY_LIMIT_MET: 10,
  REFLECTION_COMPLETED: 5,
  OFFLINE_ACTIVITY_COMPLETED: 10,
  STREAK_3_DAYS: 15,
  STREAK_7_DAYS: 30,
  STREAK_14_DAYS: 50,
  STREAK_30_DAYS: 100,
  DAILY_CHALLENGE_COMPLETED: 10,
  SAFE_ZONE_ROUTINE_COMPLETED: 5,
};

// ─── Initial Achievements Definition ──────────────────────────────────────────

export const INITIAL_ACHIEVEMENTS = [
  {
    id: 'ach_first_sprout',
    title: '🌱 First Sprout',
    description: 'Complete your first healthy day.',
    icon: '🌱',
    requirement: 1,
    progress: 1,
    unlocked: true,
    rewardPoints: 10,
  },
  {
    id: 'ach_streak_3',
    title: '🔥 3-Day Grower',
    description: 'Maintain a 3-day healthy streak.',
    icon: '🔥',
    requirement: 3,
    progress: 3,
    unlocked: true,
    rewardPoints: 15,
  },
  {
    id: 'ach_streak_7',
    title: '🔥 7-Day Grower',
    description: 'Maintain a 7-day healthy streak.',
    icon: '🔥',
    requirement: 7,
    progress: 6,
    unlocked: false,
    rewardPoints: 30,
  },
  {
    id: 'ach_mindful_user',
    title: '🧘 Mindful User',
    description: 'Complete 5 mindful reflections.',
    icon: '🧘',
    requirement: 5,
    progress: 3,
    unlocked: false,
    rewardPoints: 20,
  },
  {
    id: 'ach_offline_explorer',
    title: '🚶 Offline Explorer',
    description: 'Complete 5 offline activities.',
    icon: '🚶',
    requirement: 5,
    progress: 2,
    unlocked: false,
    rewardPoints: 25,
  },
  {
    id: 'ach_screen_champion',
    title: '📱 Screen-Time Champion',
    description: 'Stay within your daily limit for 7 days.',
    icon: '📱',
    requirement: 7,
    progress: 5,
    unlocked: false,
    rewardPoints: 35,
  },
  {
    id: 'ach_safe_zone_star',
    title: '📍 Safe Zone Star',
    description: 'Complete 5 healthy location-based routines.',
    icon: '📍',
    requirement: 5,
    progress: 2,
    unlocked: false,
    rewardPoints: 20,
  },
];

// ─── Initial Daily Challenges ─────────────────────────────────────────────────

export const INITIAL_DAILY_CHALLENGES = [
  {
    id: 'ch_daily_goal',
    title: 'Stay Within Your Limit',
    description: "Complete today's screen-time goal.",
    icon: '🌱',
    rewardPoints: 10,
    requirement: 1,
    progress: 0,
    completed: false,
  },
  {
    id: 'ch_digital_break',
    title: 'Take a Digital Break',
    description: 'Complete one offline activity.',
    icon: '🚶',
    rewardPoints: 10,
    requirement: 1,
    progress: 0,
    completed: false,
  },
  {
    id: 'ch_mindful_moment',
    title: 'Mindful Moment',
    description: 'Complete one Reflection Experience.',
    icon: '🧘',
    rewardPoints: 5,
    requirement: 1,
    progress: 0,
    completed: false,
  },
];

// ─── Virtual Reward Catalog ───────────────────────────────────────────────────

export const REWARD_CATALOG = [
  {
    id: 'cat_theme',
    title: 'Custom Profile Theme',
    description: 'Personalize your UNLOAD dashboard with calming emerald hues.',
    category: 'Customization',
    icon: '🎨',
    cost: 50,
  },
  {
    id: 'cat_badge',
    title: 'Special Sprout Badge',
    description: 'Showcase an exclusive gold leaf badge on your profile.',
    category: 'Badges',
    icon: '⭐',
    cost: 75,
  },
  {
    id: 'cat_accessory',
    title: 'Avatar Accessory',
    description: 'Unlock playful sprout caps and mindful accessories.',
    category: 'Avatar',
    icon: '🧢',
    cost: 100,
  },
  {
    id: 'cat_frame',
    title: 'Achievement Frame',
    description: 'Encase your streaks in an ornate digital wellness border.',
    category: 'Frames',
    icon: '🖼️',
    cost: 150,
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Returns streak bonus points for reaching specific milestones (once per milestone)
 */
export const getStreakMilestoneBonus = (streakDays) => {
  if (streakDays === 3) return { milestone: 3, points: REWARD_VALUES.STREAK_3_DAYS };
  if (streakDays === 7) return { milestone: 7, points: REWARD_VALUES.STREAK_7_DAYS };
  if (streakDays === 14) return { milestone: 14, points: REWARD_VALUES.STREAK_14_DAYS };
  if (streakDays === 30) return { milestone: 30, points: REWARD_VALUES.STREAK_30_DAYS };
  return null;
};

/**
 * Identify the next locked achievement to display progress for
 */
export const getNextAchievement = (achievements = INITIAL_ACHIEVEMENTS) => {
  return achievements.find((ach) => !ach.unlocked) || achievements[achievements.length - 1];
};

/**
 * Check if the user has sufficient points to redeem an item
 */
export const canAffordReward = (currentPoints, cost) => {
  return typeof currentPoints === 'number' && currentPoints >= cost;
};

/**
 * Format structured reward transaction record
 */
export const createRewardTransaction = (type, title, description, points) => {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type,
    title,
    description,
    points,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

/**
 * Get initial reward state for UnloadContext
 */
export const getInitialRewardsState = () => {
  return {
    rewardPoints: 125, // Initial demo points matching prompt
    achievements: INITIAL_ACHIEVEMENTS,
    dailyChallenges: INITIAL_DAILY_CHALLENGES,
    redeemedRewards: [],
    rewardHistory: [
      {
        id: 'tx_init_1',
        type: REWARD_ACTIONS.DAILY_LIMIT_MET,
        title: 'Daily Goal Met',
        description: 'Stayed within 80m limit on Day 5.',
        points: 10,
        timestamp: 'Yesterday',
      },
      {
        id: 'tx_init_2',
        type: REWARD_ACTIONS.STREAK_MILESTONE,
        title: '🔥 3-Day Grower Bonus',
        description: 'Reached 3-day healthy unloading streak.',
        points: 15,
        timestamp: '3 days ago',
      },
      {
        id: 'tx_init_3',
        type: REWARD_ACTIONS.REFLECTION_COMPLETED,
        title: 'Mindful Reset',
        description: 'Completed 2-min breathing exercise.',
        points: 5,
        timestamp: 'Yesterday',
      },
    ],
    awardedMilestones: [3], // Track awarded streak milestones to prevent duplicates
    parentRewardSettings: {
      rewardsEnabled: true,
      challengeRewards: true,
      safeZoneRewards: true,
    },
  };
};
