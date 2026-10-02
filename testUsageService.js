import {
  getInitialAppUsageData,
  calculateAppMetrics,
  get6DayUsageHistory,
  HABIT_COACHING_20_20_20,
  APP_STATUS,
} from './usageService.js';

console.log('====================================================');
console.log('🧪 UNLOAD UsageService & App-Tracking Engine - Tests');
console.log('====================================================\n');

let allPassed = true;

// 1. Initial State Test
const initialApps = getInitialAppUsageData();
const insta = initialApps.find((a) => a.id === 'app_insta');
const youtube = initialApps.find((a) => a.id === 'app_youtube');
const games = initialApps.find((a) => a.id === 'app_games');

console.log('1. Checking Initial App Allowances:');
console.log(`   Instagram: ${insta.currentUsage}m / ${insta.dailyLimit}m -> ${insta.status}`);
console.log(`   YouTube:   ${youtube.currentUsage}m / ${youtube.dailyLimit}m -> ${youtube.status}`);
console.log(`   Games:     ${games.currentUsage}m / ${games.dailyLimit}m -> ${games.status}`);

if (insta.currentUsage === 22 && insta.dailyLimit === 30 && insta.status === APP_STATUS.WITHIN_LIMIT) {
  console.log('   ✅ PASS: Instagram initial values match (22/30m, Within Limit)');
} else {
  console.log('   ❌ FAIL: Instagram initial values mismatch');
  allPassed = false;
}

if (youtube.currentUsage === 28 && youtube.dailyLimit === 30 && youtube.status === APP_STATUS.NEAR_LIMIT) {
  console.log('   ✅ PASS: YouTube initial values match (28/30m, Near Limit at 93%)');
} else {
  console.log('   ❌ FAIL: YouTube initial values mismatch');
  allPassed = false;
}

// 2. Add 5 minutes to Instagram
console.log('\n2. Testing Adding 5 Minutes to Instagram:');
const updatedInstaUsage = insta.currentUsage + 5; // 22 + 5 = 27 min
const instaMetrics = calculateAppMetrics(updatedInstaUsage, insta.dailyLimit);
console.log(`   New Instagram Usage: ${updatedInstaUsage}m / ${insta.dailyLimit}m (${instaMetrics.percentageUsed}%)`);
console.log(`   Status: [${instaMetrics.status}] | IsWarning: ${instaMetrics.isWarning}`);

if (updatedInstaUsage === 27 && instaMetrics.percentageUsed === 90 && instaMetrics.isWarning && instaMetrics.status === APP_STATUS.NEAR_LIMIT) {
  console.log('   ✅ PASS: Instagram updated to 27m, 90% reached, warning triggered');
} else {
  console.log('   ❌ FAIL: Instagram 5-min increment failed');
  allPassed = false;
}

// 3. Push YouTube to its limit (28 + 5 = 33m >= 30m limit)
console.log('\n3. Testing Limit Reached Trigger (YouTube +5m):');
const updatedYoutubeUsage = youtube.currentUsage + 5; // 28 + 5 = 33 min
const youtubeMetrics = calculateAppMetrics(updatedYoutubeUsage, youtube.dailyLimit);
console.log(`   New YouTube Usage: ${updatedYoutubeUsage}m / ${youtube.dailyLimit}m`);
console.log(`   Status: [${youtubeMetrics.status}] | IsLimitReached: ${youtubeMetrics.isLimitReached}`);

if (youtubeMetrics.isLimitReached && youtubeMetrics.status === APP_STATUS.GOAL_REACHED) {
  console.log('   ✅ PASS: Limit reached detected correctly, triggers reflection experience without hard-block');
} else {
  console.log('   ❌ FAIL: Limit reached not detected correctly');
  allPassed = false;
}

// 4. Test 6-Day History
console.log('\n4. Testing Previous 6 Days Usage History:');
const history = get6DayUsageHistory();
console.log(`   History items: ${history.length} days`);
const expectedHistory = [120, 110, 100, 90, 80, 72];
let historyMatches = true;

history.forEach((h, idx) => {
  console.log(`   ${h.label} → ${h.usageMinutes}m`);
  if (h.usageMinutes !== expectedHistory[idx]) {
    historyMatches = false;
  }
});

if (historyMatches && history.length === 6) {
  console.log('   ✅ PASS: Previous 6 days history matches Day 1 -> 120m to Day 6 -> 72m');
} else {
  console.log('   ❌ FAIL: History values do not match requirements');
  allPassed = false;
}

// 5. Test 20-20-20 Habit Coaching
console.log('\n5. Testing 20-20-20 Habit Coaching:');
console.log(`   Message: "${HABIT_COACHING_20_20_20.message}"`);
if (HABIT_COACHING_20_20_20.message.includes('20 minutes') && HABIT_COACHING_20_20_20.message.includes('20 feet away')) {
  console.log('   ✅ PASS: 20-20-20 habit coaching text accurate');
} else {
  console.log('   ❌ FAIL: 20-20-20 habit coaching text invalid');
  allPassed = false;
}

console.log('\n====================================================');
console.log(allPassed ? '🎉 ALL STEP 3 USAGE SERVICE TESTS PASSED' : '⚠️ SOME TESTS FAILED');
console.log('====================================================');
