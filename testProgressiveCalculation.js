import {
  calculateNextDailyLimit,
  getStageForLimit,
  calculateMinutesSaved,
  CONFIG,
  STAGES,
} from './progressiveUnloading.js';

console.log('====================================================');
console.log('🧪 UNLOAD Progressive Unloading Engine - 5-Day Test');
console.log('====================================================\n');

let baseline = 120;
let currentLimit = 120;
let streak = 0;
let history = [];

// Simulated 5-day journey data:
// Day 1: Met goal (Used 115m of 120m limit)
// Day 2: Met goal (Used 102m of 110m limit)
// Day 3: Met goal (Used 95m of 100m limit)
// Day 4: Met goal (Used 85m of 90m limit)
// Day 5: Slight excess (Used 86m of 80m limit - within 15m grace)
// Day 6: Met goal after grace (Used 72m of 80m limit)
const simulatedDays = [
  { day: 1, usage: 115, expectedLimit: 120, description: 'Day 1: Within limit' },
  { day: 2, usage: 102, expectedLimit: 110, description: 'Day 2: Within limit' },
  { day: 3, usage: 95, expectedLimit: 100, description: 'Day 3: Within limit' },
  { day: 4, usage: 85, expectedLimit: 90, description: 'Day 4: Within limit' },
  { day: 5, usage: 86, expectedLimit: 80, description: 'Day 5: Slight excess (+6m) - Grace margin test' },
  { day: 6, usage: 72, expectedLimit: 80, description: 'Day 6: Goal achieved following grace period' },
];

let testPassed = true;

for (const sim of simulatedDays) {
  const stage = getStageForLimit(currentLimit);
  const saved = calculateMinutesSaved(baseline, sim.usage);

  console.log(`📅 Day ${sim.day}:`);
  console.log(`   Limit: ${currentLimit}m | Actual Usage: ${sim.usage}m | ${stage.name}`);
  console.log(`   Saved vs Baseline: ${saved.formatted} (${saved.savedMinutes}m)`);

  const result = calculateNextDailyLimit({
    currentLimit,
    actualUsage: sim.usage,
    baseline,
    safeMinimum: CONFIG.SAFE_MINIMUM_LIMIT,
    stepSize: 10, // 10 min reduction
    graceMargin: CONFIG.GRACE_MARGIN_MINUTES,
  });

  if (result.streakMaintained) {
    streak += result.streakIncrement;
  }

  console.log(`   Result: [${result.status}] -> ${result.message}`);
  console.log(`   Streak: ${streak} days | Next Limit: ${result.nextLimit}m\n`);

  history.push({
    day: sim.day,
    limit: currentLimit,
    usage: sim.usage,
    nextLimit: result.nextLimit,
    streak,
  });

  currentLimit = result.nextLimit;
}

// Verification checks
console.log('--- Verification Checks ---');
const day5Result = history[4];
if (day5Result.limit === 80 && day5Result.nextLimit === 80) {
  console.log('✅ PASS: Day 5 slight excess (86m vs 80m limit) was forgiven under grace margin and limit maintained without punishment.');
} else {
  console.log('❌ FAIL: Day 5 grace handling unexpected', day5Result);
  testPassed = false;
}

if (history[0].nextLimit === 110 && history[1].nextLimit === 100 && history[2].nextLimit === 90) {
  console.log('✅ PASS: Progressive reduction accurately stepped down from 120m -> 110m -> 100m -> 90m.');
} else {
  console.log('❌ FAIL: Progressive stepping failed.');
  testPassed = false;
}

// Safe Minimum Test: Ensure limits never decrease below safe minimum (30m)
let testMinLimit = 35;
const minResult = calculateNextDailyLimit({
  currentLimit: testMinLimit,
  actualUsage: 20,
  safeMinimum: 30,
  stepSize: 10,
});

if (minResult.nextLimit === 30) {
  console.log('✅ PASS: Safe minimum constraint enforced. Limit capped at safe minimum (30m).');
} else {
  console.log('❌ FAIL: Safe minimum violated:', minResult.nextLimit);
  testPassed = false;
}

console.log('\n====================================================');
console.log(testPassed ? '🎉 ALL 5-DAY PROGRESSIVE ENGINE TESTS PASSED' : '⚠️ SOME TESTS FAILED');
console.log('====================================================');
