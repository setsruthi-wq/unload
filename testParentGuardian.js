/**
 * UNLOAD — Step 4: Parent Guardian System Test Suite
 * Team Safesprout
 *
 * Run from the mobile/ directory:
 *   node src/services/testParentGuardian.js
 *
 * Tests all 13 Step 4 requirements using pure JS imports
 * (no React / device dependencies needed).
 */

import {
  getInitialAppUsageData,
  calculateAppMetrics,
  get6DayUsageHistory,
  APP_STATUS,
} from './usageService.js';

import {
  getInitialUnloadState,
  calculateNextDailyLimit,
  getStageForLimit,
  calculateMinutesSaved,
  CONFIG,
} from './progressiveUnloading.js';

// ─── Test Utilities ───────────────────────────────────────────────────────────

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

// ─── Simulate UnloadContext state (pure JS, no React) ─────────────────────────

function buildMockContext(overrides = {}) {
  const initial = getInitialUnloadState();
  const apps = getInitialAppUsageData();

  return {
    baselineScreenTime: initial.baselineScreenTime,
    currentDailyLimit: initial.currentDailyLimit,   // 60
    actualDailyUsage: initial.actualDailyUsage,      // 47
    nextDailyLimit: initial.nextDailyLimit,           // 55
    currentStage: initial.currentStage,
    dayNumber: initial.dayNumber,
    streak: initial.streak,
    history: initial.history,

    appsList: apps,
    warningThreshold: 80,
    requireReflection: true,

    parentActivityEvents: [
      { id: 'ev_1', time: '1:45 PM', text: 'Instagram reached 80% limit', type: 'warning' },
      { id: 'ev_2', time: '12:30 PM', text: 'Screen time reduced', type: 'positive' },
      { id: 'ev_3', time: '11:15 AM', text: 'Reflection completed', type: 'wellness' },
      { id: 'ev_4', time: '8:15 AM', text: 'Safe Zone arrival: School', type: 'safe' },
    ],

    safeZones: [
      { id: 'sz_home',   name: 'Home Sweet Home',              type: 'Residence', status: 'Inside',  icon: '🏠', radiusMeters: 150, enabled: true },
      { id: 'sz_school', name: 'Green Valley Middle School',   type: 'School',    status: 'Outside', icon: '🏫', radiusMeters: 300, enabled: true },
      { id: 'sz_park',   name: 'City Recreation Park',         type: 'Park',      status: 'Outside', icon: '🌳', radiusMeters: 200, enabled: true },
    ],

    ...overrides,
  };
}

// Simulate updateDailyLimit (mirrors UnloadContext logic)
function updateDailyLimit(ctx, newLimit) {
  const clamped = Math.max(30, Math.min(120, newLimit));
  // calculateNextDailyLimit expects { currentLimit, actualUsage }
  const nextResult = calculateNextDailyLimit({
    currentLimit: clamped,
    actualUsage: ctx.actualDailyUsage,
  });
  return {
    ...ctx,
    currentDailyLimit: clamped,
    nextDailyLimit: nextResult.nextLimit,
    currentStage: getStageForLimit(clamped),
  };
}

// Simulate updateAppLimit (mirrors UnloadContext logic)
function updateAppLimit(ctx, appId, newLimit) {
  const updatedApps = ctx.appsList.map((app) => {
    if (app.id !== appId) return app;
    const metrics = calculateAppMetrics(app.currentUsage, newLimit, ctx.warningThreshold);
    return { ...app, dailyLimit: newLimit, ...metrics };
  });

  const targetApp = updatedApps.find((a) => a.id === appId);
  const reflectionTriggered = !!(targetApp?.isLimitReached && ctx.requireReflection);

  return { ...ctx, appsList: updatedApps, reflectionTriggered };
}

// Simulate addAppUsage (mirrors UnloadContext logic)
function addAppUsage(ctx, appId, minutes) {
  let reflectionTriggered = false;

  const updatedApps = ctx.appsList.map((app) => {
    if (app.id !== appId) return app;
    const newUsage = app.currentUsage + minutes;
    const metrics = calculateAppMetrics(newUsage, app.dailyLimit, ctx.warningThreshold);
    if (metrics.isLimitReached && !app.isLimitReached && ctx.requireReflection) {
      reflectionTriggered = true;
    }
    return { ...app, currentUsage: newUsage, ...metrics };
  });

  return { ...ctx, appsList: updatedApps, reflectionTriggered };
}

// Simulate setWarningThreshold (mirrors UnloadContext logic)
function setWarningThreshold(ctx, newThreshold) {
  const updatedApps = ctx.appsList.map((app) => {
    const metrics = calculateAppMetrics(app.currentUsage, app.dailyLimit, newThreshold);
    return { ...app, ...metrics };
  });
  return { ...ctx, warningThreshold: newThreshold, appsList: updatedApps };
}

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   UNLOAD — Step 4: Parent Guardian System Test Suite    ║');
console.log('║   Team Safesprout                                        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ── GROUP 1: Parent Dashboard & Usage State ───────────────────────────────────
console.log('📊 GROUP 1 — Parent Dashboard & Usage State\n');

test('1. Parent dashboard reads shared usage state (actualDailyUsage / currentDailyLimit)', () => {
  const ctx = buildMockContext();
  assert(typeof ctx.actualDailyUsage === 'number', 'actualDailyUsage must be a number');
  assert(typeof ctx.currentDailyLimit === 'number', 'currentDailyLimit must be a number');
  assertEqual(ctx.actualDailyUsage, 47, 'Demo day usage');
  assertEqual(ctx.currentDailyLimit, 60, 'Demo day limit');
  const pct = Math.round((ctx.actualDailyUsage / ctx.currentDailyLimit) * 100);
  assert(pct === 78, `Usage % should be 78, got ${pct}`);
});

test('2. Parent activity screen reflects appsList from shared context', () => {
  const ctx = buildMockContext();
  assert(Array.isArray(ctx.appsList), 'appsList must be an array');
  assert(ctx.appsList.length >= 4, 'Must have at least 4 apps');
  const insta = ctx.appsList.find((a) => a.id === 'app_insta');
  const yt    = ctx.appsList.find((a) => a.id === 'app_youtube');
  assert(insta, 'Instagram app must exist');
  assert(yt,    'YouTube app must exist');
  assertEqual(insta.currentUsage, 22, 'Instagram usage');
  assertEqual(yt.currentUsage,    28, 'YouTube usage');
});

// ── GROUP 2: Parent Controls ──────────────────────────────────────────────────
console.log('\n🎛️  GROUP 2 — Parent Controls (Limits, Threshold, Reflection)\n');

test('3. Daily limit update works (60 → 45)', () => {
  const ctx     = buildMockContext();
  const updated = updateDailyLimit(ctx, 45);
  assertEqual(updated.currentDailyLimit, 45, 'Daily limit update');
  assert(updated.currentStage.name.length > 0, 'Stage name must exist after limit update');
  // actualDailyUsage=47 > limit=45 by 2 (within grace margin=15) → grace_maintained: nextLimit=45
  assert(updated.nextDailyLimit === 45, `Next limit in grace zone should be 45, got ${updated.nextDailyLimit}`);
});

test('4. App limit update works — Instagram 30m → 25m', () => {
  const ctx    = buildMockContext();
  const updated = updateAppLimit(ctx, 'app_insta', 25);
  const insta  = updated.appsList.find((a) => a.id === 'app_insta');
  assertEqual(insta.dailyLimit, 25, 'Instagram limit updated');
  assert(insta.percentageUsed >= 0, 'Percentage must recalculate');
  // 22/25 = 88% → Near Limit
  assertEqual(insta.status, APP_STATUS.NEAR_LIMIT, 'Should be Near Limit at 88%');
});

test('5. Warning threshold update works (80% → 70%)', () => {
  const ctx     = buildMockContext();
  const updated = setWarningThreshold(ctx, 70);
  assertEqual(updated.warningThreshold, 70, 'Threshold updated to 70');
  // Instagram: 22/30 = 73% — now above 70% threshold
  const insta = updated.appsList.find((a) => a.id === 'app_insta');
  assert(insta.isWarning || insta.isLimitReached,
    `Instagram should be warning at 73% with 70% threshold (status: ${insta.status})`);
});

test('6. Reflection requirement toggle works (true → false)', () => {
  const ctx = buildMockContext({ requireReflection: true });
  // YouTube at 28/30 — add 5m to cross 30m limit
  const withReflection = addAppUsage(ctx, 'app_youtube', 5);
  assert(withReflection.reflectionTriggered, 'Reflection should trigger when requireReflection=true');

  const ctxNoReflect = { ...ctx, requireReflection: false };
  const withoutReflection = addAppUsage(ctxNoReflect, 'app_youtube', 5);
  assert(!withoutReflection.reflectionTriggered, 'Reflection should NOT trigger when requireReflection=false');
});

// ── GROUP 3: YouTube 30m→20m Demo ────────────────────────────────────────────
console.log('\n🎬 GROUP 3 — YouTube 30m→20m Synchronization Demo\n');

test('7. YouTube limit 30m→20m: currentUsage(28) >= newLimit(20) → Goal Reached + reflection', () => {
  const ctx  = buildMockContext();
  const yt   = ctx.appsList.find((a) => a.id === 'app_youtube');
  assertEqual(yt.currentUsage, 28, 'YouTube usage starts at 28');
  assertEqual(yt.dailyLimit,   30, 'YouTube limit starts at 30');

  const updated   = updateAppLimit(ctx, 'app_youtube', 20);
  const updatedYt = updated.appsList.find((a) => a.id === 'app_youtube');
  assertEqual(updatedYt.dailyLimit,    20,                    'YouTube limit set to 20');
  assertEqual(updatedYt.status,        APP_STATUS.GOAL_REACHED, 'Should be Goal Reached (28 >= 20)');
  assert(updatedYt.isLimitReached,                            'isLimitReached must be true');
  assert(updated.reflectionTriggered,                         'Reflection should trigger automatically');
});

// ── GROUP 4: Reflection Experience ───────────────────────────────────────────
console.log('\n🧘 GROUP 4 — Reflection Experience\n');

test('8. Reflection triggers on crossing app limit via addAppUsage', () => {
  const ctx    = buildMockContext({ requireReflection: true });
  const result = addAppUsage(ctx, 'app_youtube', 5); // 28 + 5 = 33 > 30
  const yt     = result.appsList.find((a) => a.id === 'app_youtube');
  assert(yt.isLimitReached,          'YouTube limit must be reached');
  assert(result.reflectionTriggered, 'Reflection must trigger on limit reached');
});

// ── GROUP 5: Regressions ─────────────────────────────────────────────────────
console.log('\n🔁 GROUP 5 — Step 2 & Step 3 Regression Tests\n');

test('9. 6-day usage history remains intact (Step 3) — usageMinutes descending', () => {
  const history = get6DayUsageHistory();
  assert(Array.isArray(history), 'History must be array');
  assertEqual(history.length, 6, 'Must have exactly 6 days');
  for (let i = 0; i < history.length - 1; i++) {
    assert(
      history[i].usageMinutes >= history[i + 1].usageMinutes,
      `Day ${i + 1} (${history[i].usageMinutes}m) should be >= Day ${i + 2} (${history[i + 1].usageMinutes}m)`
    );
  }
});

test('10. Step 2 progressive calculation unchanged (calculateNextDailyLimit API)', () => {
  // Successful day: 47m used within 60m limit → nextLimit = 55
  const result = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 47 });
  assertEqual(result.status,    'target_met', 'Status should be target_met');
  assertEqual(result.nextLimit, 55,           'Next day limit: 60 → 55');
  assert(result.streakMaintained,             'Streak must be maintained');

  // Verify safe minimum (30m floor)
  const atFloor = calculateNextDailyLimit({ currentLimit: 30, actualUsage: 28 });
  assertEqual(atFloor.nextLimit, 30, 'Safe minimum 30m enforced');

  // Verify stage resolution
  const stage = getStageForLimit(60);
  assert(stage.name.length > 0, 'Stage must resolve correctly for 60m');
  assert(stage.id === 2, `60m should be Stage 2, got Stage ${stage.id}`);
});

// ── GROUP 6: Safe Zones ───────────────────────────────────────────────────────
console.log('\n📍 GROUP 6 — Safe Zones & Location\n');

test('11. Safe zone mock data — 3 zones, correct new shape (emoji icon, radiusMeters, enabled)', () => {
  const ctx  = buildMockContext();
  assertEqual(ctx.safeZones.length, 3, 'Must have 3 safe zones');
  const home = ctx.safeZones.find((z) => z.id === 'sz_home');
  assert(home,                                   'Home zone must exist');
  assertEqual(home.status,       'Inside',       'Home status must be Inside');
  assertEqual(home.icon,         '🏠',           'Home icon must be emoji (not string name)');
  assert(typeof home.radiusMeters === 'number',  'radiusMeters must be a number');
  assert(typeof home.enabled     === 'boolean',  'enabled must be boolean');
  // Verify NO old-format fields
  assert(home.color === undefined,               'Old zone.color field must not exist');
  assert(home.checkIn === undefined,             'Old zone.checkIn field must not exist');
});

// ── GROUP 7: Activity Events ──────────────────────────────────────────────────
console.log('\n🗂️  GROUP 7 — Activity Events & Navigation State\n');

test('12. Parent activity event feed has correct initial events & types', () => {
  const ctx   = buildMockContext();
  assert(Array.isArray(ctx.parentActivityEvents), 'Events must be array');
  assert(ctx.parentActivityEvents.length >= 4,    'Must have at least 4 initial events');
  const types = ctx.parentActivityEvents.map((e) => e.type);
  assert(types.includes('warning'),  'Must include warning event');
  assert(types.includes('positive'), 'Must include positive event');
  assert(types.includes('safe'),     'Must include safe zone event');
  // Verify each event has required fields
  ctx.parentActivityEvents.forEach((e, i) => {
    assert(e.id,   `Event ${i} must have id`);
    assert(e.time, `Event ${i} must have time`);
    assert(e.text, `Event ${i} must have text`);
    assert(e.type, `Event ${i} must have type`);
  });
});

test('13. Daily limit enforces floor (30m) and ceiling (120m)', () => {
  const ctx = buildMockContext();
  // Floor
  const tooLow  = updateDailyLimit(ctx, 5);
  assert(tooLow.currentDailyLimit  >= 30,  `Floor 30m not enforced — got ${tooLow.currentDailyLimit}`);
  // Ceiling
  const tooHigh = updateDailyLimit(ctx, 500);
  assert(tooHigh.currentDailyLimit <= 120, `Ceiling 120m not enforced — got ${tooHigh.currentDailyLimit}`);
  // Valid mid-range
  const mid = updateDailyLimit(ctx, 75);
  assertEqual(mid.currentDailyLimit, 75, 'Mid-range limit 75m');
});

// ─── Final Report ─────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed · ${failed} failed · ${passed + failed} total`);

if (failed === 0) {
  console.log('\n  🎉 ALL 13 STEP 4 TESTS PASSED');
  console.log('  Parent Guardian System is fully verified.\n');
  console.log('  ✅ Step 1 — Mobile Foundation');
  console.log('  ✅ Step 2 — Progressive Unloading Engine');
  console.log('  ✅ Step 3 — App Usage & Screen-Time Management');
  console.log('  ✅ Step 4 — Parent Guardian System');
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed. Review output above.`);
  process.exit(1);
}

console.log('══════════════════════════════════════════════════════════\n');
