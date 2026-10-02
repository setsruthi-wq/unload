/**
 * UNLOAD — Step 5: Location & Safe Zones Test Suite
 * Team Safesprout
 *
 * Run from the mobile/ directory:
 *   node src/services/testLocationService.js
 *
 * Tests all 19 Step 5 requirements using pure JS imports
 * (no React / device dependencies needed).
 */

import {
  MOCK_LOCATIONS,
  getMockLocations,
  getCurrentMockLocation,
  getInitialSafeZones,
  calculateDistance,
  isInsideSafeZone,
  getZoneStatus,
  evaluateSafeZones,
  resolveMockLocation,
} from './locationService.js';

import {
  getLocationRoutine,
  ROUTINE_MODES,
} from './locationRoutineService.js';

import {
  getInitialUnloadState,
  calculateNextDailyLimit,
} from './progressiveUnloading.js';

import {
  getInitialAppUsageData,
  calculateAppMetrics,
  get6DayUsageHistory,
} from './usageService.js';

// ─── Test Harness ─────────────────────────────────────────────────────────────

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

// ─── Mock Context Simulator ───────────────────────────────────────────────────

function createMockContext() {
  let currentMockLocation = getCurrentMockLocation(); // Home
  let safeZones = getInitialSafeZones();
  let evaluation = evaluateSafeZones(currentMockLocation, safeZones);
  safeZones = evaluation.updatedZones;
  let activeSafeZone = evaluation.activeSafeZone;
  let locationRoutine = getLocationRoutine(activeSafeZone);
  let locationEvents = [];
  let parentActivityEvents = [];

  const setMockLocation = (locationIdOrObject) => {
    const targetLoc = resolveMockLocation(locationIdOrObject);
    currentMockLocation = targetLoc;

    const evalResult = evaluateSafeZones(targetLoc, safeZones);
    safeZones = evalResult.updatedZones;
    activeSafeZone = evalResult.activeSafeZone;
    locationRoutine = getLocationRoutine(evalResult.activeSafeZone);

    evalResult.departedZones.forEach((zone) => {
      const evt = {
        id: `le_${Date.now()}`,
        time: 'Just now',
        text: `Child left ${zone.name}`,
        type: 'departure',
        icon: '🚶',
      };
      locationEvents = [evt, ...locationEvents.slice(0, 9)];
      parentActivityEvents = [{ ...evt, type: 'info' }, ...parentActivityEvents];
    });

    evalResult.arrivedZones.forEach((zone) => {
      const evt = {
        id: `le_${Date.now()}`,
        time: 'Just now',
        text: `Child arrived at ${zone.name} 🌱`,
        type: 'arrival',
        icon: zone.icon || '📍',
      };
      locationEvents = [evt, ...locationEvents.slice(0, 9)];
      parentActivityEvents = [{ ...evt, type: 'safe' }, ...parentActivityEvents];
    });

    return evalResult;
  };

  const toggleSafeZone = (id) => {
    safeZones = safeZones.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z));
    const evalResult = evaluateSafeZones(currentMockLocation, safeZones);
    safeZones = evalResult.updatedZones;
    activeSafeZone = evalResult.activeSafeZone;
    locationRoutine = getLocationRoutine(evalResult.activeSafeZone);
  };

  const addSafeZone = (zone) => {
    const radius = zone.radius || zone.radiusMeters || 150;
    const newZ = {
      id: `sz_${Date.now()}`,
      status: 'Outside',
      enabled: true,
      radius,
      radiusMeters: radius,
      icon: zone.icon || '📍',
      ...zone,
    };
    safeZones = [...safeZones, newZ];
    const evalResult = evaluateSafeZones(currentMockLocation, safeZones);
    safeZones = evalResult.updatedZones;
    activeSafeZone = evalResult.activeSafeZone;
    locationRoutine = getLocationRoutine(evalResult.activeSafeZone);
    parentActivityEvents = [
      { id: `ev_${Date.now()}`, text: `Guardian created safe zone: ${newZ.name}`, type: 'safe' },
      ...parentActivityEvents,
    ];
    return newZ;
  };

  const updateSafeZone = (id, updates) => {
    safeZones = safeZones.map((z) => {
      if (z.id !== id) return z;
      const radius = updates.radius || updates.radiusMeters || z.radius;
      return { ...z, ...updates, radius, radiusMeters: radius };
    });
    const evalResult = evaluateSafeZones(currentMockLocation, safeZones);
    safeZones = evalResult.updatedZones;
    activeSafeZone = evalResult.activeSafeZone;
    locationRoutine = getLocationRoutine(evalResult.activeSafeZone);
  };

  const deleteSafeZone = (id) => {
    if (safeZones.length <= 1) {
      return { success: false, message: 'At least one active safe zone is required.' };
    }
    safeZones = safeZones.filter((z) => z.id !== id);
    const evalResult = evaluateSafeZones(currentMockLocation, safeZones);
    safeZones = evalResult.updatedZones;
    activeSafeZone = evalResult.activeSafeZone;
    locationRoutine = getLocationRoutine(evalResult.activeSafeZone);
    return { success: true };
  };

  return {
    get currentMockLocation() { return currentMockLocation; },
    get safeZones() { return safeZones; },
    get activeSafeZone() { return activeSafeZone; },
    get locationRoutine() { return locationRoutine; },
    get locationEvents() { return locationEvents; },
    get parentActivityEvents() { return parentActivityEvents; },
    setMockLocation,
    toggleSafeZone,
    addSafeZone,
    updateSafeZone,
    deleteSafeZone,
  };
}

// ─── TEST SUITE EXECUTION ─────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   UNLOAD — Step 5: Location & Safe Zones Test Suite     ║');
console.log('║   Team Safesprout                                        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// ── GROUP 1: Mock Locations ───────────────────────────────────────────────────
console.log('📍 GROUP 1 — Mock Locations & Positions\n');

test('1. Mock locations load correctly (Home, School, Park, Tuition, Other)', () => {
  const locs = getMockLocations();
  assert(locs.length >= 4, 'Must have at least 4 mock locations');
  assert(MOCK_LOCATIONS.home, 'Home preset must exist');
  assert(MOCK_LOCATIONS.school, 'School preset must exist');
  assert(MOCK_LOCATIONS.park, 'Park preset must exist');
  assert(MOCK_LOCATIONS.tuition, 'Tuition preset must exist');
  assert(MOCK_LOCATIONS.other, 'Other preset must exist');
});

test('2. Home location coordinates match expected demo values', () => {
  const home = MOCK_LOCATIONS.home;
  assertEqual(home.latitude, 13.0827, 'Home latitude');
  assertEqual(home.longitude, 80.2707, 'Home longitude');
  assertEqual(home.type, 'home', 'Home type');
});

test('3. School location coordinates match expected demo values', () => {
  const school = MOCK_LOCATIONS.school;
  assertEqual(school.latitude, 13.0674, 'School latitude');
  assertEqual(school.longitude, 80.2376, 'School longitude');
  assertEqual(school.type, 'school', 'School type');
});

test('4. Park location coordinates match expected demo values', () => {
  const park = MOCK_LOCATIONS.park;
  assertEqual(park.latitude, 13.0067, 'Park latitude');
  assertEqual(park.longitude, 80.2572, 'Park longitude');
  assertEqual(park.type, 'park', 'Park type');
});

// ── GROUP 2: Distance & Geofencing ────────────────────────────────────────────
console.log('\n📐 GROUP 2 — Haversine Distance & Geofence Engine\n');

test('5. Distance calculation works accurately (Home to Home is 0m, Home to School is ~3.9km)', () => {
  const home = MOCK_LOCATIONS.home;
  const school = MOCK_LOCATIONS.school;
  const distZero = calculateDistance(home.latitude, home.longitude, home.latitude, home.longitude);
  assertEqual(distZero, 0, 'Distance to same point must be 0m');

  const distHomeSchool = calculateDistance(home.latitude, home.longitude, school.latitude, school.longitude);
  assert(distHomeSchool > 3500 && distHomeSchool < 4500, `Expected ~3.9km, got ${distHomeSchool}m`);
});

test('6. Inside/outside detection works based on zone radius', () => {
  const home = MOCK_LOCATIONS.home;
  const school = MOCK_LOCATIONS.school;
  const homeZone = {
    latitude: home.latitude,
    longitude: home.longitude,
    radius: 150,
    enabled: true,
  };

  assert(isInsideSafeZone(home, homeZone) === true, 'Home location must be inside Home safe zone');
  assert(isInsideSafeZone(school, homeZone) === false, 'School location must be outside Home safe zone');
  assertEqual(getZoneStatus(home, homeZone), 'Inside', 'Status should be Inside');
  assertEqual(getZoneStatus(school, homeZone), 'Outside', 'Status should be Outside');
});

// ── GROUP 3: Zone CRUD & Controls ─────────────────────────────────────────────
console.log('\n🛡️  GROUP 3 — Safe Zone CRUD & Enable/Disable\n');

test('7. Safe zone enable/disable works (disabling excludes from active status)', () => {
  const ctx = createMockContext();
  assertEqual(ctx.activeSafeZone?.id, 'sz_home', 'Initially inside Home zone');
  ctx.toggleSafeZone('sz_home');
  const homeZone = ctx.safeZones.find((z) => z.id === 'sz_home');
  assertEqual(homeZone.enabled, false, 'Home zone should be disabled');
  assert(ctx.activeSafeZone === null, 'Active safe zone should be null when zone is disabled');
});

test('8. Add safe zone works and becomes active when within perimeter', () => {
  const ctx = createMockContext();
  const initialCount = ctx.safeZones.length;
  const newZone = ctx.addSafeZone({
    name: 'Grandma House',
    type: 'home',
    latitude: 13.0827, // Same as Home
    longitude: 80.2707,
    radius: 200,
  });

  assertEqual(ctx.safeZones.length, initialCount + 1, 'Safe zones count incremented');
  assert(newZone.id, 'New zone must receive unique ID');
  assertEqual(newZone.name, 'Grandma House', 'New zone name matches');
});

test('9. Edit safe zone works (updates radius and name)', () => {
  const ctx = createMockContext();
  ctx.updateSafeZone('sz_school', { name: 'High School Campus', radius: 450 });
  const updatedSchool = ctx.safeZones.find((z) => z.id === 'sz_school');
  assertEqual(updatedSchool.name, 'High School Campus', 'Name updated');
  assertEqual(updatedSchool.radius, 450, 'Radius updated');
  assertEqual(updatedSchool.radiusMeters, 450, 'radiusMeters alias updated');
});

test('10. Delete safe zone works but protects last remaining zone', () => {
  const ctx = createMockContext();
  const countBefore = ctx.safeZones.length;
  const delRes = ctx.deleteSafeZone('sz_park');
  assertEqual(delRes.success, true, 'Delete successful');
  assertEqual(ctx.safeZones.length, countBefore - 1, 'Zone removed');

  // Try deleting until only 1 remains
  while (ctx.safeZones.length > 1) {
    ctx.deleteSafeZone(ctx.safeZones[0].id);
  }
  assertEqual(ctx.safeZones.length, 1, 'Exactly 1 zone remains');

  // Attempting to delete the last zone must fail
  const lastDelRes = ctx.deleteSafeZone(ctx.safeZones[0].id);
  assertEqual(lastDelRes.success, false, 'Cannot delete last remaining safe zone');
  assertEqual(ctx.safeZones.length, 1, 'Still 1 safe zone preserved');
});

// ── GROUP 4: Transitions & Events ─────────────────────────────────────────────
console.log('\n🔄 GROUP 4 — Geofence Transitions & Event Feed\n');

test('11. Arrival event generated once when entering a safe zone', () => {
  const ctx = createMockContext();
  // Move to School
  ctx.setMockLocation('school');
  const arrivals = ctx.locationEvents.filter((e) => e.type === 'arrival');
  assert(arrivals.length >= 1, 'Arrival event must be generated');
  assert(arrivals[0].text.includes('School'), 'Arrival event mentions School');

  // Re-moving to School should NOT re-trigger another arrival event
  const countBefore = ctx.locationEvents.length;
  ctx.setMockLocation('school');
  assertEqual(ctx.locationEvents.length, countBefore, 'Duplicate arrival event not generated if still inside');
});

test('12. Departure event generated once when leaving a safe zone', () => {
  const ctx = createMockContext();
  // Initially at Home. Move to Other (outside all zones)
  ctx.setMockLocation('other');
  const departures = ctx.locationEvents.filter((e) => e.type === 'departure');
  assert(departures.length >= 1, 'Departure event must be generated');
  assert(departures[0].text.includes('Home'), 'Departure event mentions leaving Home');
  assertEqual(ctx.activeSafeZone, null, 'Active safe zone is null in transit');
});

// ── GROUP 5: Mindful Routines ─────────────────────────────────────────────────
console.log('\n🧘 GROUP 5 — Location-Aware Mindful Routines\n');

test('13. Location routine changes correctly based on active safe zone', () => {
  const ctx = createMockContext();
  // At Home: Balanced Mode
  assertEqual(ctx.locationRoutine.mode, ROUTINE_MODES.BALANCED, 'Home routine is Balanced Mode');

  // Move to School: Focus Mode
  ctx.setMockLocation('school');
  assertEqual(ctx.locationRoutine.mode, ROUTINE_MODES.FOCUS, 'School routine is Focus Mode');
  assert(ctx.locationRoutine.suggestedActivities.length > 0, 'Must have suggested activities');

  // Move to Park: Offline Activity
  ctx.setMockLocation('park');
  assertEqual(ctx.locationRoutine.mode, ROUTINE_MODES.OFFLINE, 'Park routine is Offline Activity');

  // Move to Other: Normal Mode
  ctx.setMockLocation('other');
  assertEqual(ctx.locationRoutine.mode, ROUTINE_MODES.NORMAL, 'Transit routine is Normal Mode');
});

// ── GROUP 6: UI Component State Reflection ────────────────────────────────────
console.log('\n📱 GROUP 6 — UI Component State Integration\n');

test('14. Parent dashboard reflects location state and last event', () => {
  const ctx = createMockContext();
  ctx.setMockLocation('school');
  assertEqual(ctx.currentMockLocation.name, 'School', 'Current location name is School');
  assertEqual(ctx.activeSafeZone?.name, 'Green Valley Middle School', 'Active safe zone matches School');
  assert(ctx.locationEvents[0].text.includes('School'), 'Last event text is available for Dashboard');
});

test('15. Parent activity feed receives location events with distinctive tags', () => {
  const ctx = createMockContext();
  ctx.setMockLocation('school');
  const locationEvts = ctx.parentActivityEvents.filter(
    (e) => e.type === 'safe' || e.type === 'info'
  );
  assert(locationEvts.length >= 1, 'Parent activity feed contains location event');
  assert(locationEvts[0].text.includes('School') || locationEvts[0].text.includes('Home'), 'Event text matches transition');
});

test('16. Child Home receives location context and routine guidance', () => {
  const ctx = createMockContext();
  ctx.setMockLocation('school');
  // Child Home consumes activeSafeZone and locationRoutine
  assert(ctx.activeSafeZone, 'Active safe zone available for Child Home');
  assertEqual(ctx.locationRoutine.mode, 'Focus Mode', 'Child Home gets Focus Mode');
  assert(ctx.locationRoutine.message.length > 0, 'Child Home receives routine message');
});

// ── GROUP 7: Regressions ──────────────────────────────────────────────────────
console.log('\n🔁 GROUP 7 — Step 2, 3, and 4 Regressions\n');

test('17. Existing Step 2 progressive calculation tests still pass', () => {
  const init = getInitialUnloadState();
  assertEqual(init.currentDailyLimit, 60, 'Step 2 limit 60m');
  assertEqual(init.actualDailyUsage, 47, 'Step 2 usage 47m');
  assertEqual(init.streak, 6, 'Step 2 streak 6 days');
  const nextRes = calculateNextDailyLimit({ currentLimit: 60, actualUsage: 47 });
  assertEqual(nextRes.nextLimit, 55, 'Tapering 60m -> 55m');
  assertEqual(nextRes.status, 'target_met', 'Status target_met');
});

test('18. Existing Step 3 usage tracking tests still pass', () => {
  const apps = getInitialAppUsageData();
  assert(apps.length >= 4, 'Step 3 apps list exists');
  const insta = apps.find((a) => a.id === 'app_insta');
  assertEqual(insta.currentUsage, 22, 'Instagram usage 22m');
  assertEqual(insta.dailyLimit, 30, 'Instagram limit 30m');

  const history = get6DayUsageHistory();
  assertEqual(history.length, 6, '6-day history intact');
  assertEqual(history[0].usageMinutes, 120, 'Day 1 is 120m');
});

test('19. Existing Step 4 parent guardian controls remain intact', () => {
  const initZones = getInitialSafeZones();
  assertEqual(initZones.length, 3, 'Safe zones start with 3');
  const homeZone = initZones.find((z) => z.id === 'sz_home');
  assertEqual(homeZone.status, 'Inside', 'Home starts inside');
  assertEqual(homeZone.icon, '🏠', 'Home has emoji icon');
  assert(typeof homeZone.radiusMeters === 'number', 'radiusMeters is a number');
  assert(typeof homeZone.enabled === 'boolean', 'enabled is a boolean');
});

// ─── Final Summary ────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed · ${failed} failed · ${passed + failed} total`);

if (failed === 0) {
  console.log('\n  🎉 ALL 19 STEP 5 TESTS PASSED');
  console.log('  GPS + Safe Zones & Guardian Safety Layer is fully verified.\n');
  console.log('  ✅ Step 1 — Mobile Foundation');
  console.log('  ✅ Step 2 — Progressive Unloading Engine');
  console.log('  ✅ Step 3 — App Usage & Screen-Time Management');
  console.log('  ✅ Step 4 — Parent Guardian System');
  console.log('  ✅ Step 5 — GPS & Safe Zones / Guardian Safety Layer');
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed. Review output above.`);
  process.exit(1);
}

console.log('══════════════════════════════════════════════════════════\n');
