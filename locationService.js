/**
 * UNLOAD Location & Safe Zone Service
 * Developed by Team Safesprout
 *
 * ARCHITECTURAL BRIDGE:
 * ============================================================================
 * CURRENT PROTOTYPE:
 *   MockLocationService (Preset Coordinates & Haversine Distance Engine)
 *          ↓
 *   SafeZoneEngine (evaluateSafeZones, arrival/departure event triggers)
 *          ↓
 *   UnloadContext (Single Source of Truth for Child & Guardian UI)
 *          ↓
 *   Parent / Child UI Screens
 *
 * FUTURE PRODUCTION:
 *   Android Location Provider (expo-location / Android FusedLocationProviderClient)
 *          ↓
 *   LocationService (Standardized Lat/Lng coordinates adapter)
 *          ↓
 *   SafeZoneEngine (Reuses existing distance and geofence evaluation logic)
 *          ↓
 *   UnloadContext
 *          ↓
 *   Parent / Child UI Screens
 * ============================================================================
 *
 * NOTE: This is a modular mock service for the UNLOAD prototype.
 * It simulates realistic device positions, geofences, and arrival/departure
 * transitions without requesting Android GPS permissions or background location.
 */

// ─── Preset Demo Locations ───────────────────────────────────────────────────

export const MOCK_LOCATIONS = {
  home: {
    id: 'home',
    name: 'Home',
    type: 'home',
    latitude: 13.0827,
    longitude: 80.2707,
    icon: '🏠',
    description: 'Home Sweet Home',
  },
  school: {
    id: 'school',
    name: 'School',
    type: 'school',
    latitude: 13.0674,
    longitude: 80.2376,
    icon: '🏫',
    description: 'Green Valley Middle School',
  },
  park: {
    id: 'park',
    name: 'Park',
    type: 'park',
    latitude: 13.0067,
    longitude: 80.2572,
    icon: '🌳',
    description: 'City Recreation Park',
  },
  tuition: {
    id: 'tuition',
    name: 'Tuition',
    type: 'tuition',
    latitude: 13.0500,
    longitude: 80.2500,
    icon: '📚',
    description: 'After-school Learning Center',
  },
  other: {
    id: 'other',
    name: 'Other',
    type: 'other',
    latitude: 13.0200,
    longitude: 80.2200,
    icon: '📍',
    description: 'Downtown / Transit Area',
  },
};

/**
 * Returns all available preset mock locations
 */
export const getMockLocations = () => Object.values(MOCK_LOCATIONS);

/**
 * Returns default starting location for demo (Home)
 */
export const getCurrentMockLocation = () => MOCK_LOCATIONS.home;

/**
 * Resolve a location by preset ID or coordinate object
 */
export const resolveMockLocation = (locationIdOrObject) => {
  if (typeof locationIdOrObject === 'string') {
    const key = locationIdOrObject.toLowerCase();
    return MOCK_LOCATIONS[key] || {
      id: key,
      name: locationIdOrObject,
      type: 'other',
      latitude: 13.0200,
      longitude: 80.2200,
      icon: '📍',
      description: 'Custom Location',
    };
  }
  return locationIdOrObject;
};

// ─── Initial Safe Zones ───────────────────────────────────────────────────────

export const getInitialSafeZones = () => [
  {
    id: 'sz_home',
    name: 'Home Sweet Home',
    type: 'home',
    latitude: 13.0827,
    longitude: 80.2707,
    radius: 150,
    radiusMeters: 150,
    enabled: true,
    status: 'Inside',
    icon: '🏠',
  },
  {
    id: 'sz_school',
    name: 'Green Valley Middle School',
    type: 'school',
    latitude: 13.0674,
    longitude: 80.2376,
    radius: 300,
    radiusMeters: 300,
    enabled: true,
    status: 'Outside',
    icon: '🏫',
  },
  {
    id: 'sz_park',
    name: 'City Recreation Park',
    type: 'park',
    latitude: 13.0067,
    longitude: 80.2572,
    radius: 200,
    radiusMeters: 200,
    enabled: true,
    status: 'Outside',
    icon: '🌳',
  },
];

// ─── Distance Calculation (Haversine Formula) ─────────────────────────────────

/**
 * Calculates Haversine distance in meters between two lat/lng coordinates
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined
  ) {
    return 0;
  }

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// ─── Geofence Evaluation ─────────────────────────────────────────────────────

/**
 * Check if a location is inside a given safe zone
 */
export const isInsideSafeZone = (location, zone) => {
  if (!zone || !zone.enabled || !location) return false;
  const radius = zone.radius || zone.radiusMeters || 100;
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    zone.latitude,
    zone.longitude
  );
  return distance <= radius;
};

/**
 * Determine zone status ('Inside' | 'Outside')
 */
export const getZoneStatus = (location, zone) => {
  return isInsideSafeZone(location, zone) ? 'Inside' : 'Outside';
};

/**
 * Evaluate all safe zones against the current location
 * Returns: {
 *   updatedZones: SafeZone[],
 *   activeSafeZone: SafeZone | null,
 *   arrivedZones: SafeZone[],
 *   departedZones: SafeZone[]
 * }
 */
export const evaluateSafeZones = (currentLocation, safeZones = []) => {
  const arrivedZones = [];
  const departedZones = [];

  const updatedZones = safeZones.map((zone) => {
    const wasInside = (zone.status || '').toLowerCase() === 'inside';
    const isNowInside = isInsideSafeZone(currentLocation, zone);
    const newStatus = isNowInside ? 'Inside' : 'Outside';

    if (!wasInside && isNowInside && zone.enabled) {
      arrivedZones.push({ ...zone, status: newStatus });
    } else if (wasInside && !isNowInside) {
      departedZones.push({ ...zone, status: newStatus });
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      zone.latitude,
      zone.longitude
    );

    return {
      ...zone,
      status: newStatus,
      currentDistance: distance,
    };
  });

  const activeSafeZone = updatedZones.find((z) => z.status === 'Inside' && z.enabled) || null;

  return {
    updatedZones,
    activeSafeZone,
    arrivedZones,
    departedZones,
  };
};

/**
 * Format timestamp for mock events (e.g., "3:42 PM")
 */
export const getDemoTimeString = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minStr} ${ampm}`;
};
