export const mockChildData = {
  id: 'child_1',
  name: 'Leo Jenkins',
  age: 13,
  avatar: '🌱',
  grade: '8th Grade',
  familyCode: 'SPROUT-8492',
  guardianName: 'Sarah Jenkins (Mom)',
  guardianPhone: '+1 (555) 234-5678',
  
  // Progressive Unloading Status
  unloadingPlan: {
    currentStage: 2,
    totalStages: 4,
    stageTitle: 'Stage 2: Gentle Tapering',
    stageDescription: 'Soft reduction of 20 min/day from your 4.5h baseline. Focusing on social & video balance.',
    baselineDailyTimeMinutes: 270, // 4h 30m
    todayTargetMinutes: 195,        // 3h 15m
    todayUsedMinutes: 125,          // 2h 05m
    remainingMinutes: 70,           // 1h 10m
    reductionAchievedPercent: 28,
  },
  
  // Streak & Habits
  streak: {
    currentDays: 6,
    bestDays: 14,
    status: 'On Fire! 🔥',
    lastMindfulBreakTime: '25 mins ago',
    weeklyAdherence: [
      { day: 'Mon', target: 210, used: 190, met: true },
      { day: 'Tue', target: 210, used: 205, met: true },
      { day: 'Wed', target: 200, used: 180, met: true },
      { day: 'Thu', target: 200, used: 195, met: true },
      { day: 'Fri', target: 195, used: 185, met: true },
      { day: 'Sat', target: 220, used: 215, met: true },
      { day: 'Sun', target: 195, used: 125, met: true }, // Today
    ],
  },
  
  // App Usage Breakdown
  appUsage: [
    {
      id: 'app_1',
      name: 'YouTube',
      category: 'Entertainment',
      usedMinutes: 45,
      allocatedMinutes: 60,
      icon: 'videocam',
      color: '#EF4444',
      status: 'Normal',
    },
    {
      id: 'app_2',
      name: 'Instagram',
      category: 'Social Media',
      usedMinutes: 38,
      allocatedMinutes: 40,
      icon: 'camera',
      color: '#EC4899',
      status: 'Approaching Nudge',
    },
    {
      id: 'app_3',
      name: 'Roblox',
      category: 'Gaming',
      usedMinutes: 25,
      allocatedMinutes: 45,
      icon: 'game-controller',
      color: '#F59E0B',
      status: 'Normal',
    },
    {
      id: 'app_4',
      name: 'Khan Academy',
      category: 'Education',
      usedMinutes: 17,
      allocatedMinutes: 120,
      icon: 'school',
      color: '#10B981',
      status: 'Unlimited Growth',
    },
  ],
  
  // Progressive Unloading Journey Stages
  stagesJourney: [
    {
      stage: 1,
      name: 'Awareness & Baseline',
      targetDaily: '4h 00m',
      status: 'Completed',
      unlockedDate: 'Sept 10',
      badge: '👀 Mindful Eye',
      reward: '50 Sprout Coins',
    },
    {
      stage: 2,
      name: 'Gentle Tapering (Active)',
      targetDaily: '3h 15m',
      status: 'In Progress',
      daysRemaining: 3,
      badge: '🌱 Steady Sprout',
      reward: '100 Sprout Coins',
    },
    {
      stage: 3,
      name: 'Focused Flow',
      targetDaily: '2h 30m',
      status: 'Locked',
      daysRemaining: 7,
      badge: '⚡ Deep Focus',
      reward: '150 Sprout Coins',
    },
    {
      stage: 4,
      name: 'Digital Zen & Mastery',
      targetDaily: '1h 45m',
      status: 'Locked',
      daysRemaining: 14,
      badge: '🧘 Zen Master',
      reward: '250 Sprout Coins',
    },
  ],

  // Rewards & Gamification
  rewards: {
    sproutCoins: 480,
    badges: [
      { id: 'b1', name: 'Focus Sprout', icon: 'leaf', description: 'Met daily unloading target 5 days in a row', date: 'Earned 2d ago', rarity: 'Gold' },
      { id: 'b2', name: 'Zen Breather', icon: 'water', description: 'Completed 10 mindful pause exercises', date: 'Earned 4d ago', rarity: 'Silver' },
      { id: 'b3', name: 'Night Owl Tamer', icon: 'moon', description: 'Put phone to bed before 9:00 PM for 3 days', date: 'Earned 1w ago', rarity: 'Emerald' },
      { id: 'b4', name: 'Digital Explorer', icon: 'compass', description: 'Linked with Guardian and set initial goals', date: 'Earned 2w ago', rarity: 'Bronze' },
    ],
    redeemablePerks: [
      { id: 'p1', title: '30-Min Extra Weekend Gaming', cost: 150, available: true, category: 'Fun Time' },
      { id: 'p2', title: 'Pick Friday Family Movie Night', cost: 200, available: true, category: 'Family Perk' },
      { id: 'p3', title: 'Ice Cream Parlor Outing', cost: 350, available: true, category: 'Real-World Reward' },
      { id: 'p4', title: 'Weekend Roller-skate Pass', cost: 500, available: false, category: 'Adventure' },
    ],
  },
};

export const mockParentData = {
  id: 'parent_1',
  name: 'Sarah Jenkins',
  email: 'sarah.j@safesprout.org',
  phone: '+1 (555) 234-5678',
  avatar: '👩‍💼',
  familyId: 'FAM-SAFESPROUT-90',
  
  children: [
    { id: 'child_1', name: 'Leo', age: 13, avatar: '🌱', status: 'In School Safe Zone', battery: 84 },
    { id: 'child_2', name: 'Maya', age: 9, avatar: '🌸', status: 'Home Safe Zone', battery: 96 },
  ],
  
  selectedChildId: 'child_1',
  
  // Wellbeing Index
  wellbeingScore: 84,
  wellbeingLabel: 'Progressive Unload On-Track',
  summaryText: 'Leo has reduced screen usage by 28% over the past 10 days using Progressive Tapering.',
  
  // Real-time Controls
  controls: {
    dinnerModeActive: false,
    bedtimeCurfewActive: false,
    gentleNudgesEnabled: true,
  },
  
  // Safe Zones & Mock Location
  locationData: {
    currentStatus: 'Inside Safe Zone: Green Valley Middle School',
    lastUpdated: '3 minutes ago',
    batteryLevel: '84%',
    mockCoordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 'Within 15 meters',
    },
    safeZones: [
      { id: 'sz_1', name: 'Green Valley Middle School', type: 'School', status: 'Active (Inside)', icon: 'school', color: '#10B981', checkIn: '8:15 AM today' },
      { id: 'sz_2', name: 'Home Sweet Home', type: 'Residence', status: 'Safe', icon: 'home', color: '#3B82F6', checkIn: 'Left at 7:52 AM' },
      { id: 'sz_3', name: 'City Public Library', type: 'Study Center', status: 'Safe', icon: 'book', color: '#8B5CF6', checkIn: 'Yesterday 4:45 PM' },
    ],
    recentEvents: [
      { id: 'e1', time: '8:15 AM', text: 'Arrived safely at Green Valley Middle School zone', type: 'safe' },
      { id: 'e2', time: '7:52 AM', text: 'Departed Home Sweet Home', type: 'info' },
      { id: 'e3', time: 'Yesterday 9:02 PM', text: 'Bedtime Progressive Wind-down completed smoothly', type: 'wellness' },
    ],
  },
  
  // Progressive Unloading & Limit Configuration
  limitsConfig: {
    currentStage: 2,
    stageName: 'Stage 2: Gentle Tapering',
    taperingRateMinutes: 20, // 20 mins reduced each stage
    dailyMaxScreenMinutes: 195,
    bedtimeStart: '21:00', // 9:00 PM
    bedtimeEnd: '07:00',   // 7:00 AM
    windDownLeadMinutes: 30, // 30 min gentle yellow tint & calming reminder
    categories: [
      { name: 'Social Media', limitMinutes: 40, usedMinutes: 38, icon: 'chatbubbles', restricted: false },
      { name: 'Video & Streaming', limitMinutes: 60, usedMinutes: 45, icon: 'play-circle', restricted: false },
      { name: 'Gaming', limitMinutes: 45, usedMinutes: 25, icon: 'game-controller', restricted: false },
      { name: 'Educational & Reading', limitMinutes: 180, usedMinutes: 17, icon: 'book', restricted: false },
    ],
  },
};
