/**
 * UNLOAD Location-Aware Routine Service
 * Developed by Team Safesprout
 *
 * Maps safe zone contexts to mindful digital routines without modifying
 * the underlying Progressive Unloading screen-time limits.
 * Location provides gentle contextual guidance, not harsh restrictions.
 */

export const ROUTINE_MODES = {
  FOCUS: 'Focus Mode',
  BALANCED: 'Balanced Mode',
  OFFLINE: 'Offline Activity',
  NORMAL: 'Normal Mode',
};

export const ROUTINE_PRESETS = {
  school: {
    mode: ROUTINE_MODES.FOCUS,
    title: 'Focus Mode Active 🌱',
    badgeVariant: 'sky',
    icon: '🏫',
    message: 'Keep entertainment usage low during study hours.',
    coachingTip: 'Study intervals work best when social apps stay tucked away.',
    suggestedActivities: [
      'Read textbook chapters',
      'Library research',
      'Collaborate with classmates',
      'Review lecture notes',
    ],
  },
  home: {
    mode: ROUTINE_MODES.BALANCED,
    title: 'Balanced Home Routine 🏡',
    badgeVariant: 'primary',
    icon: '🏠',
    message: 'Take regular offline breaks and enjoy family time.',
    coachingTip: 'Evening screen wind-down helps ensure restful sleep.',
    suggestedActivities: [
      'Share a family meal',
      'Read a novel or graphic book',
      'Play a board game',
      'Help around the house',
    ],
  },
  park: {
    mode: ROUTINE_MODES.OFFLINE,
    title: 'Outdoor & Wellness Zone 🌳',
    badgeVariant: 'primary',
    icon: '🌳',
    message: 'Great time for walking, drawing, or playing outdoors.',
    coachingTip: 'Being outside naturally recharges dopamine and focus.',
    suggestedActivities: [
      'Take a brisk nature walk',
      'Sketch trees and scenery',
      'Play sports or toss a frisbee',
      'Enjoy fresh air and deep breaths',
    ],
  },
  tuition: {
    mode: ROUTINE_MODES.FOCUS,
    title: 'Study & Enrichment Focus 📚',
    badgeVariant: 'sky',
    icon: '📚',
    message: 'Stay engaged with your learning session.',
    coachingTip: 'Deep work mode: single-tasking yields double the retention.',
    suggestedActivities: [
      'Practice problem sets',
      'Clarify questions with tutors',
      'Review formulas and flashcards',
      'Take 5-min eye rest breaks',
    ],
  },
  other: {
    mode: ROUTINE_MODES.NORMAL,
    title: 'Mindful Digital Exploration 📍',
    badgeVariant: 'neutral',
    icon: '📍',
    message: 'Stay aware of your surroundings while on the move.',
    coachingTip: 'Keep your eyes up and device pocketed during travel.',
    suggestedActivities: [
      'Observe city life and nature',
      'Listen to an educational podcast',
      'Pocket your phone during transit',
      'Practice 20-20-20 eye relaxation',
    ],
  },
};

/**
 * Returns routine guidance based on an active safe zone or zone type
 */
export const getLocationRoutine = (zoneOrType) => {
  if (!zoneOrType) {
    return ROUTINE_PRESETS.other;
  }

  const typeKey = typeof zoneOrType === 'string'
    ? zoneOrType.toLowerCase()
    : (zoneOrType.type || 'other').toLowerCase();

  return ROUTINE_PRESETS[typeKey] || ROUTINE_PRESETS.other;
};
