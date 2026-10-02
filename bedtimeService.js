/**
 * UNLOAD Mindful Curfew & Bedtime Wind-Down Service
 * Developed by Team Safesprout
 *
 * Core Concept:
 * Encourages healthy nighttime digital habits and circadian rhythm alignment
 * without harsh blocking, shame, or punishment.
 *
 * States:
 * - NORMAL: Daytime / active digital wellness window
 * - WIND_DOWN: Evening calm-down window before sleep (e.g., 8:30 PM - 9:00 PM)
 * - REST_MODE: Overnight restorative rest period (e.g., 9:00 PM - 7:00 AM)
 * - MORNING_CHECK_IN: Morning wellness & sleep quality reflection (7:00 AM - 9:00 AM)
 */

export const BEDTIME_STATUS = {
  NORMAL: 'NORMAL',
  WIND_DOWN: 'WIND_DOWN',
  REST_MODE: 'REST_MODE',
  MORNING_CHECK_IN: 'MORNING_CHECK_IN',
};

export const DEFAULT_BEDTIME_SETTINGS = {
  windDownTime: '20:30', // 8:30 PM
  restStartTime: '21:00', // 9:00 PM
  restEndTime: '07:00',   // 7:00 AM
  enabled: true,
};

export const SOUNDSCAPES = [
  { id: 'rain', name: 'Rain', icon: '🌧', desc: 'Gentle rainfall on leaves' },
  { id: 'forest', name: 'Forest', icon: '🌲', desc: 'Calming woodland night breeze' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', desc: 'Rhythmic, slow tidal waves' },
  { id: 'silent', name: 'Silent', icon: '🔇', desc: 'Quiet, undistracted rest' },
];

export const SLEEP_CHECK_IN_OPTIONS = [
  { id: 'great', label: 'Great', emoji: '😴', message: 'Wonderful! You gave your brain full restorative rest.' },
  { id: 'okay', label: 'Okay', emoji: '🙂', message: 'Good rest. A consistent wind-down builds deeper energy.' },
  { id: 'not_great', label: 'Not great', emoji: '😐', message: 'Rest can fluctuate. Tonight is a fresh chance to wind down early.' },
  { id: 'poor', label: 'Poor', emoji: '😫', message: 'Be gentle with yourself today. Try setting your screen aside 15m earlier tonight.' },
];

// ─── Time Helper Functions ───────────────────────────────────────────────────

/**
 * Converts "HH:MM" string to minutes from midnight (0 - 1439)
 */
export const timeStringToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
};

/**
 * Converts minutes from midnight to 12-hour formatted string (e.g., 1230 -> "8:30 PM")
 */
export const formatMinutesTo12Hour = (totalMinutes) => {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minStr} ${ampm}`;
};

/**
 * Formats "HH:MM" to "8:30 PM"
 */
export const formatTimeStr = (timeStr) => {
  return formatMinutesTo12Hour(timeStringToMinutes(timeStr));
};

// ─── Bedtime State Evaluation ─────────────────────────────────────────────────

/**
 * Check if given time is within the wind-down window (windDownTime to restStartTime)
 */
export const isWithinWindDownPeriod = (timeStr, settings = DEFAULT_BEDTIME_SETTINGS) => {
  if (!settings.enabled) return false;
  const cur = timeStringToMinutes(timeStr);
  const start = timeStringToMinutes(settings.windDownTime);
  const end = timeStringToMinutes(settings.restStartTime);

  if (start < end) {
    return cur >= start && cur < end;
  }
  // Overnight crossover
  return cur >= start || cur < end;
};

/**
 * Check if given time is within rest mode (restStartTime to restEndTime, crossing midnight)
 */
export const isWithinRestPeriod = (timeStr, settings = DEFAULT_BEDTIME_SETTINGS) => {
  if (!settings.enabled) return false;
  const cur = timeStringToMinutes(timeStr);
  const start = timeStringToMinutes(settings.restStartTime);
  const end = timeStringToMinutes(settings.restEndTime);

  // Example: 21:00 (1260) to 07:00 (420)
  if (start > end) {
    return cur >= start || cur < end;
  }
  return cur >= start && cur < end;
};

/**
 * Minutes remaining until wind-down starts today
 */
export const getMinutesUntilWindDown = (timeStr, settings = DEFAULT_BEDTIME_SETTINGS) => {
  const cur = timeStringToMinutes(timeStr);
  const target = timeStringToMinutes(settings.windDownTime);
  if (isWithinWindDownPeriod(timeStr, settings) || isWithinRestPeriod(timeStr, settings)) {
    return 0;
  }
  let diff = target - cur;
  if (diff < 0) diff += 1440;
  return diff;
};

/**
 * Minutes remaining until rest mode starts
 */
export const getMinutesUntilRest = (timeStr, settings = DEFAULT_BEDTIME_SETTINGS) => {
  const cur = timeStringToMinutes(timeStr);
  const target = timeStringToMinutes(settings.restStartTime);
  if (isWithinRestPeriod(timeStr, settings)) {
    return 0;
  }
  let diff = target - cur;
  if (diff < 0) diff += 1440;
  return diff;
};

/**
 * Determine bedtime status based on time string and settings, with support for simulation overrides
 */
export const getBedtimeStatus = (
  timeStr,
  settings = DEFAULT_BEDTIME_SETTINGS,
  simulatedOverride = null
) => {
  if (simulatedOverride && BEDTIME_STATUS[simulatedOverride]) {
    return simulatedOverride;
  }

  if (!settings.enabled) {
    return BEDTIME_STATUS.NORMAL;
  }

  const cur = timeStringToMinutes(timeStr);
  const restEnd = timeStringToMinutes(settings.restEndTime);

  // Morning check-in window: restEnd up to restEnd + 120 mins (e.g. 7:00 AM to 9:00 AM)
  if (cur >= restEnd && cur < restEnd + 120) {
    return BEDTIME_STATUS.MORNING_CHECK_IN;
  }

  if (isWithinRestPeriod(timeStr, settings)) {
    return BEDTIME_STATUS.REST_MODE;
  }

  if (isWithinWindDownPeriod(timeStr, settings)) {
    return BEDTIME_STATUS.WIND_DOWN;
  }

  return BEDTIME_STATUS.NORMAL;
};

/**
 * Get friendly status text and supportive message
 */
export const getBedtimeMessage = (status, settings = DEFAULT_BEDTIME_SETTINGS) => {
  switch (status) {
    case BEDTIME_STATUS.WIND_DOWN:
      return {
        title: '🌅 Wind-Down in Progress',
        headline: 'Time to Slow Down 🌙',
        subtext: `Rest mode begins at ${formatTimeStr(settings.restStartTime)}. Start shifting focus offline with mindful breathing or a relaxing soundscape.`,
        badgeVariant: 'warning',
      };
    case BEDTIME_STATUS.REST_MODE:
      return {
        title: '🌙 Rest Mode Active',
        headline: 'Rest Mode is Active 😴',
        subtext: `Bedtime window until ${formatTimeStr(settings.restEndTime)}. Screens take a pause to protect your sleep and circadian rhythm.`,
        badgeVariant: 'sky',
      };
    case BEDTIME_STATUS.MORNING_CHECK_IN:
      return {
        title: '🌱 Morning Reflection',
        headline: 'Good Morning! 🌱',
        subtext: 'How did you sleep last night? A quick check-in helps celebrate mindful bedtime habits.',
        badgeVariant: 'primary',
      };
    case BEDTIME_STATUS.NORMAL:
    default:
      return {
        title: '☀️ Daytime Wellness Mode',
        headline: `Wind-Down starts at ${formatTimeStr(settings.windDownTime)}`,
        subtext: 'Your daytime digital guidelines and Progressive Unloading limits are active.',
        badgeVariant: 'neutral',
      };
  }
};

/**
 * Calculates sleep preparation progress (0% - 100%)
 */
export const calculateSleepPreparationProgress = ({
  status = BEDTIME_STATUS.NORMAL,
  breathingCompleted = false,
  soundscape = null,
  windDownCompleted = false,
} = {}) => {
  let progress = 0;
  if (status === BEDTIME_STATUS.WIND_DOWN || status === BEDTIME_STATUS.REST_MODE) {
    progress += 25; // In wind-down or rest
  }
  if (breathingCompleted) {
    progress += 25; // Completed breathing
  }
  if (soundscape && soundscape !== 'silent') {
    progress += 25; // Calming soundscape chosen
  }
  if (windDownCompleted) {
    progress += 25; // Marked ready for rest
  }
  return Math.min(100, progress);
};
