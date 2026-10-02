/**
 * UNLOAD Analytics Service — Test Suite
 * Step 8 regression + unit tests
 *
 * Tests 12 analytics behaviours + Steps 2–7 regressions.
 * Run with: node src/services/testAnalyticsService.js
 */

import {
  calculateAverageUsage,
  calculateUsageReduction,
  calculateReductionPercentage,
  getWeeklyUsage,
  getUsageTrend,
  getLimitAdherence,
  getReflectionStats,
  getOfflineActivityStats,
  getBedtimeConsistency,
  getSafeZoneRoutineStats,
  getWellnessSummary,
  generateWellnessInsights,
} from './analyticsService.js';

import {
  calculateNextDailyLimit,
  getStageForLimit,
  getInitialUnloadState,
  calculateMinutesSaved,
  CONFIG,
  STAGES,
} from './progressiveUnloading.js';

import { getInitialAppUsageData } from './usageService.js';

import {
  getCurrentMockLocation,
  getInitialSafeZones,
  calculateDistance,
  isInsideSafeZone,
} from './locationService.js';

import {
  REWARD_VALUES,
  getInitialRewardsState,
} from './rewardsService.js';

import {
  DEFAULT_BEDTIME_SETTINGS,
  getBedtimeStatus,
  getBedtimeMessage,
  isWithinRestPeriod,
  isWithinWindDownPeriod,
  calculateSleepPreparationProgress,
  BEDTIME_STATUS,
} from './bedtimeService.js';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ─── Step 8: Analytics Tests ──────────────────────────────────────────────────

console.log('\n📊 STEP 8 — ANALYTICS SERVICE TESTS\n');

const mockHistory = [
  { day: 1, limit: 120, used: 120, saved: 0, met: true },
  { day: 2, limit: 110, used: 108, saved: 12, met: true },
  { day: 3, limit: 100, used: 95, saved: 25, met: true },
  { day: 4, limit: 90, used: 88, saved: 32, met: true },
  { day: 5, limit: 80, used: 76, saved: 44, met: true },
];

// 1. Average usage calculation
const avg = calculateAverageUsage(mockHistory);
assert('1. Average usage is calculated correctly', avg === 97, `expected 97, got ${avg}`);

// 2. Usage reduction calculation
const reduction = calculateUsageReduction(120, 47);
assert('2. Usage reduction is baseline minus current', reduction === 73, `expected 73, got ${reduction}`);

// 3. Reduction percentage
const reductionPct = calculateReductionPercentage(120, 47);
assert('3. Reduction percentage rounds correctly', reductionPct === 61, `expected 61, got ${reductionPct}`);

// 4. Weekly trend — improving
const trend = getUsageTrend(mockHistory);
assert('4. Usage trend is improving on declining history', trend === 'improving', `got ${trend}`);

// 5. Limit adherence — all met
const adherence = getLimitAdherence(mockHistory);
assert('5. Limit adherence — 5/5 days met', adherence.adherencePct === 100, `got ${adherence.adherencePct}%`);

// 6. Reflection statistics
const mockRewardHistory = [
  { type: 'REFLECTION_COMPLETED', timestamp: 'now' },
  { type: 'REFLECTION_COMPLETED', timestamp: 'earlier' },
  { type: 'OFFLINE_ACTIVITY_COMPLETED', timestamp: 'now' },
  { type: 'DAILY_LIMIT_MET', timestamp: 'today' },
];
const reflectionStats = getReflectionStats(mockRewardHistory);
assert('6. Reflection stats count reflections correctly', reflectionStats.count === 2, `expected 2, got ${reflectionStats.count}`);

// 7. Offline activity statistics
const offlineStats = getOfflineActivityStats(mockRewardHistory);
assert('7. Offline activity stats count correctly', offlineStats.count === 1, `expected 1, got ${offlineStats.count}`);

// 8. Bedtime consistency — full routine
const bedtimeActivity = { windDownCompleted: true, breathingCompleted: true, soundscape: 'rain' };
const consistency = getBedtimeConsistency(bedtimeActivity, [], { optionId: 'great', timestamp: 'now' });
assert('8. Bedtime consistency — full routine scores >= 70', consistency.score >= 70, `got ${consistency.score}`);

// 9. Safe-zone routine stats
const mockLocationEvents = [
  { type: 'arrival', zoneName: 'Home' },
  { type: 'arrival', zoneName: 'School' },
  { type: 'departure', zoneName: 'School' },
];
const mockRouteRewards = [{ type: 'SAFE_ZONE_ROUTINE_COMPLETED' }];
const szStats = getSafeZoneRoutineStats(mockRouteRewards, mockLocationEvents);
assert('9. Safe-zone arrivals counted correctly', szStats.safeZoneArrivals === 2, `expected 2, got ${szStats.safeZoneArrivals}`);
assert('9b. Safe-zone routine completions counted', szStats.routineCompletions === 1, `expected 1, got ${szStats.routineCompletions}`);

// 10. Insight generation
const summary = getWellnessSummary({
  history: mockHistory,
  baseline: 120,
  currentDailyLimit: 60,
  actualDailyUsage: 47,
  streak: 6,
  rewardPoints: 125,
  rewardHistory: mockRewardHistory,
  achievements: [{ unlocked: true }, { unlocked: true }, { unlocked: false }],
  bedtimeActivity,
  lateNightEvents: [],
  sleepCheckIn: null,
  locationEvents: mockLocationEvents,
});
const insights = generateWellnessInsights(summary);
assert('10. Insights generated (non-empty)', insights.length > 0, `got ${insights.length}`);
assert('10b. All insights have text', insights.every((i) => typeof i.text === 'string' && i.text.length > 0));
assert('10c. All insights have positive flag', insights.every((i) => i.positive === true));

// 11. Empty data handling
const emptyAvg = calculateAverageUsage([], 55);
assert('11. Empty history uses fallback value', emptyAvg === 55, `expected 55, got ${emptyAvg}`);
const emptyAdherence = getLimitAdherence([]);
assert('11b. Empty adherence returns 0 total', emptyAdherence.total === 0);
const emptyInsights = generateWellnessInsights(null);
assert('11c. Null summary returns empty insights array', Array.isArray(emptyInsights) && emptyInsights.length === 0);

// ─── Steps 2–7: Regression Tests ─────────────────────────────────────────────

console.log('\n🔁 REGRESSION — Steps 2–7\n');

// Step 2: Progressive Unloading
const initState = getInitialUnloadState();
assert('R1. getInitialUnloadState returns baseline 120', initState.baselineScreenTime === 120);
assert('R2. Initial day is 6', initState.dayNumber === 6);
assert('R3. Current limit is 60', initState.currentDailyLimit === 60);
assert('R4. Streak is 6', initState.streak === 6);

const limitMet = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 47, baseline: 120 });
assert('R5. Target met status when usage < limit', limitMet.status === 'target_met');
assert('R6. Next limit decreases by step size', limitMet.nextLimit === 55);

const limitGrace = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 68, baseline: 120 });
assert('R7. Grace maintained when within 15m margin', limitGrace.status === 'grace_maintained');

const limitExceeded = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 90, baseline: 120 });
assert('R8. Stabilization applied when exceeded beyond grace', limitExceeded.status === 'needs_stabilization');

// Stage classification
assert('R9. Stage 1 at 95+ minutes', getStageForLimit(100).id === 1);
assert('R10. Stage 2 at 60+ minutes', getStageForLimit(70).id === 2);
assert('R11. Stage 3 at 45+ minutes', getStageForLimit(50).id === 3);
assert('R12. Stage 4 at < 45 minutes', getStageForLimit(30).id === 4);

// Step 3: Usage Service
const apps = getInitialAppUsageData();
assert('R13. getInitialAppUsageData returns array', Array.isArray(apps) && apps.length > 0);
assert('R14. Each app has appName', apps.every((a) => typeof a.appName === 'string'));

// Step 5: Location Service
const loc = getCurrentMockLocation();
assert('R15. getCurrentMockLocation returns object', loc && typeof loc === 'object');
assert('R16. Location has lat and lng', typeof loc.lat === 'number' && typeof loc.lng === 'number');

const zones = getInitialSafeZones();
assert('R17. getInitialSafeZones returns array', Array.isArray(zones) && zones.length > 0);
assert('R18. Each zone has id and radius', zones.every((z) => z.id && z.radius));

const dist = calculateDistance(13.0827, 80.2707, 13.0827, 80.2707);
assert('R19. Distance from same point is 0', dist === 0);

const inside = isInsideSafeZone({ lat: 13.0827, lng: 80.2707 }, { latitude: 13.0827, longitude: 80.2707, radius: 100 });
assert('R20. isInsideSafeZone — same point is inside', inside === true);

// Step 6: Rewards
const rewardsInit = getInitialRewardsState();
assert('R21. getInitialRewardsState returns rewardPoints >= 0', rewardsInit.rewardPoints >= 0);
assert('R22. Initial achievements array is non-empty', Array.isArray(rewardsInit.achievements) && rewardsInit.achievements.length > 0);
assert('R23. REWARD_VALUES.DAILY_LIMIT_MET is 10', REWARD_VALUES.DAILY_LIMIT_MET === 10);
assert('R24. REWARD_VALUES.REFLECTION_COMPLETED is 5', REWARD_VALUES.REFLECTION_COMPLETED === 5);

// Step 7: Bedtime
const btStatus = getBedtimeStatus('14:00', DEFAULT_BEDTIME_SETTINGS);
assert('R25. 14:00 is NORMAL status', btStatus === BEDTIME_STATUS.NORMAL);

const restStatus = getBedtimeStatus('22:00', DEFAULT_BEDTIME_SETTINGS);
assert('R26. 22:00 is REST_MODE status', restStatus === BEDTIME_STATUS.REST_MODE);

const windStatus = getBedtimeStatus('20:45', DEFAULT_BEDTIME_SETTINGS);
assert('R27. 20:45 is WIND_DOWN status', windStatus === BEDTIME_STATUS.WIND_DOWN);

const btMessage = getBedtimeMessage(BEDTIME_STATUS.REST_MODE, DEFAULT_BEDTIME_SETTINGS);
assert('R28. getBedtimeMessage returns title string', typeof btMessage.title === 'string' && btMessage.title.length > 0);

const sleepProgress = calculateSleepPreparationProgress({
  status: BEDTIME_STATUS.WIND_DOWN,
  breathingCompleted: true,
  soundscape: 'rain',
  windDownCompleted: false,
});
assert('R29. Sleep preparation progress is 0–100', sleepProgress.percentage >= 0 && sleepProgress.percentage <= 100);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`UNLOAD Analytics Test Results:`);
console.log(`  ✅ Passed: ${passed}`);
if (failed > 0) console.log(`  ❌ Failed: ${failed}`);
console.log(`  📊 Total:  ${passed + failed}`);
console.log(`${'─'.repeat(50)}\n`);

if (failed > 0) process.exit(1);
