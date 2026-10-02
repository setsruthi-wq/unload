import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ProgressBar } from '../../components/ProgressBar';
import { useUnload } from '../../context/UnloadContext';
import {
  BEDTIME_STATUS,
  SOUNDSCAPES,
  SLEEP_CHECK_IN_OPTIONS,
  formatTimeStr,
} from '../../services/bedtimeService';

export const ChildBedtimeScreen = () => {
  const {
    bedtimeSettings,
    bedtimeStatus,
    bedtimeMessage,
    windDownProgress,
    bedtimeActivity,
    lateNightEvents,
    sleepCheckIn,
    simulateBedtimeStatus,
    completeWindDown,
    completeBedtimeBreathing,
    selectBedtimeSoundscape,
    recordLateNightActivity,
    submitSleepCheckIn,
  } = useUnload();

  // Breathing exercise state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Ready'); // 'Inhale', 'Hold', 'Exhale'
  const [breathSeconds, setBreathSeconds] = useState(120); // 2 minutes

  useEffect(() => {
    let timer;
    if (breathingActive && breathSeconds > 0) {
      timer = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathingActive(false);
            completeBedtimeBreathing();
            Alert.alert('🧘 Well done!', 'You finished 2 minutes of mindful evening breathing! (+5 Sprout Points 🌱)');
            return 0;
          }
          const elapsed = 120 - (prev - 1);
          const cycle = elapsed % 12; // 4s inhale, 4s hold, 4s exhale
          if (cycle < 4) setBreathPhase('Inhale slowly...');
          else if (cycle < 8) setBreathPhase('Hold gently...');
          else setBreathPhase('Exhale peacefully...');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathSeconds]);

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
    } else {
      if (breathSeconds === 0) setBreathSeconds(120);
      setBreathingActive(true);
      setBreathPhase('Inhale slowly...');
    }
  };

  const handleReadyForRest = () => {
    completeWindDown();
    Alert.alert(
      '🌙 Rest Well',
      'You are all set for a restful night. Screens off gives your brain time to recharge! (+5 Sprout Points 🌱)'
    );
  };

  const handleSleepCheckIn = (optionId) => {
    submitSleepCheckIn(optionId);
    const selected = SLEEP_CHECK_IN_OPTIONS.find((o) => o.id === optionId);
    Alert.alert('☀️ Check-In Recorded', `${selected?.message || 'Thank you for checking in!'} (+5 Sprout Points 🌱)`);
  };

  // Color styling based on Bedtime Status
  const getStatusColorConfig = () => {
    switch (bedtimeStatus) {
      case BEDTIME_STATUS.WIND_DOWN:
        return {
          bannerBg: '#78350F',
          bannerBorder: '#D97706',
          accent: '#F59E0B',
          glowTag: 'WARM AMBER FILTER ACTIVE',
          icon: '🌅',
        };
      case BEDTIME_STATUS.REST_MODE:
        return {
          bannerBg: '#1E1B4B',
          bannerBorder: '#4F46E5',
          accent: '#818CF8',
          glowTag: 'REST MODE ACTIVE',
          icon: '🌙',
        };
      case BEDTIME_STATUS.MORNING_CHECK_IN:
        return {
          bannerBg: '#064E3B',
          bannerBorder: '#10B981',
          accent: '#34D399',
          glowTag: 'MORNING CHECK-IN',
          icon: '☀️',
        };
      default:
        return {
          bannerBg: colors.surface,
          bannerBorder: colors.border,
          accent: colors.primary,
          glowTag: 'DAYTIME WELLNESS',
          icon: '🌱',
        };
    }
  };

  const statusTheme = getStatusColorConfig();

  return (
    <View style={styles.container}>
      <Header
        title="Mindful Bedtime 🌙"
        subtitle="Wind down gently for deep, restorative sleep"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dynamic Status Banner */}
        <Card style={[styles.statusBanner, { backgroundColor: statusTheme.bannerBg, borderColor: statusTheme.bannerBorder }]}>
          <View style={styles.statusHeaderRow}>
            <View style={styles.statusBadgeRow}>
              <Text style={styles.statusIcon}>{statusTheme.icon}</Text>
              <Text style={[styles.statusGlowTag, { color: statusTheme.accent }]}>
                {statusTheme.glowTag}
              </Text>
            </View>
            <Badge
              text={bedtimeStatus}
              variant={bedtimeStatus === BEDTIME_STATUS.REST_MODE ? 'neutral' : 'success'}
            />
          </View>

          <Text style={styles.statusTitle}>{bedtimeMessage.title}</Text>
          <Text style={styles.statusSubtitle}>{bedtimeMessage.subtitle}</Text>
          <Text style={[styles.statusCountdown, { color: statusTheme.accent }]}>
            ⏳ {bedtimeMessage.countdownText}
          </Text>

          {/* Schedule indicator */}
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleText}>
              🌅 Wind-Down: {formatTimeStr(bedtimeSettings.windDownTime)}
            </Text>
            <Text style={styles.scheduleDivider}>•</Text>
            <Text style={styles.scheduleText}>
              🌙 Rest: {formatTimeStr(bedtimeSettings.restStartTime)} - {formatTimeStr(bedtimeSettings.restEndTime)}
            </Text>
          </View>
        </Card>

        {/* Morning Wellness Check-In Card */}
        {(bedtimeStatus === BEDTIME_STATUS.MORNING_CHECK_IN || sleepCheckIn) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>☀️ Morning Sleep Check-In</Text>
            <Text style={styles.sectionSubtitle}>
              How did you feel waking up today? Tuning in builds better sleep rhythms.
            </Text>

            {sleepCheckIn ? (
              <View style={styles.completedCheckInBox}>
                <Text style={styles.checkInDoneEmoji}>
                  {SLEEP_CHECK_IN_OPTIONS.find((o) => o.id === sleepCheckIn.optionId)?.emoji || '✨'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkInDoneTitle}>
                    Logged as "{SLEEP_CHECK_IN_OPTIONS.find((o) => o.id === sleepCheckIn.optionId)?.label}" at {sleepCheckIn.timestamp}
                  </Text>
                  <Text style={styles.checkInDoneDesc}>
                    {SLEEP_CHECK_IN_OPTIONS.find((o) => o.id === sleepCheckIn.optionId)?.message}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.checkInGrid}>
                {SLEEP_CHECK_IN_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.checkInBtn}
                    onPress={() => handleSleepCheckIn(opt.id)}
                  >
                    <Text style={styles.checkInEmoji}>{opt.emoji}</Text>
                    <Text style={styles.checkInLabel}>{opt.label}</Text>
                    <Text style={styles.checkInPoints}>+5 🌱</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Sleep Preparation Progress */}
        <Card style={styles.sectionCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.sectionTitle}>🌙 Sleep Preparation Routine</Text>
            <Text style={styles.progressPctText}>{windDownProgress.percentage}%</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {windDownProgress.summary}
          </Text>

          <ProgressBar
            progress={windDownProgress.percentage / 100}
            color={colors.primary}
            style={styles.routineProgressBar}
          />

          <View style={styles.checklist}>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistCheck}>
                {bedtimeActivity.soundscape ? '✅' : '⚪'}
              </Text>
              <Text style={styles.checklistLabel}>Select a calming evening soundscape</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistCheck}>
                {bedtimeActivity.breathingCompleted ? '✅' : '⚪'}
              </Text>
              <Text style={styles.checklistLabel}>2-minute mindful breathing reset</Text>
            </View>
            <View style={styles.checklistItem}>
              <Text style={styles.checklistCheck}>
                {bedtimeActivity.windDownCompleted ? '✅' : '⚪'}
              </Text>
              <Text style={styles.checklistLabel}>Ready for rest confirmation</Text>
            </View>
          </View>

          <Button
            title={bedtimeActivity.windDownCompleted ? 'Ready for Rest Completed ✅' : "I'm Ready for Rest 🌙 (+5 🌱)"}
            onPress={handleReadyForRest}
            disabled={bedtimeActivity.windDownCompleted}
            variant="primary"
            style={styles.readyBtn}
          />
        </Card>

        {/* Mindful Breathing Exercise Card */}
        <Card style={styles.sectionCard}>
          <View style={styles.breathingHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>🧘 2-Minute Breathing Reset</Text>
              <Text style={styles.sectionSubtitle}>
                Calm your nervous system before sleeping
              </Text>
            </View>
            {bedtimeActivity.breathingCompleted && (
              <Badge text="Completed ✅" variant="success" />
            )}
          </View>

          <View style={styles.breathingOrbContainer}>
            <View
              style={[
                styles.breathingOrb,
                breathingActive && styles.breathingOrbActive,
              ]}
            >
              <Text style={styles.breathingOrbText}>{breathPhase}</Text>
              <Text style={styles.breathingTimerText}>
                {Math.floor(breathSeconds / 60)}:
                {breathSeconds % 60 < 10 ? `0${breathSeconds % 60}` : breathSeconds % 60}
              </Text>
            </View>
          </View>

          <View style={styles.breathingActions}>
            <Button
              title={breathingActive ? 'Pause Exercise' : breathSeconds < 120 && breathSeconds > 0 ? 'Resume Breathing' : 'Start 2-Min Breathing 🌬'}
              onPress={toggleBreathing}
              variant={breathingActive ? 'secondary' : 'primary'}
            />
          </View>
        </Card>

        {/* Calming Soundscapes Card */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎶 Calming Soundscapes</Text>
          <Text style={styles.sectionSubtitle}>
            Gentle background sounds to ease your mind (Simulated)
          </Text>

          <View style={styles.soundscapeGrid}>
            {SOUNDSCAPES.map((sound) => {
              const isSelected = bedtimeActivity.soundscape === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundscapeItem,
                    isSelected && styles.soundscapeItemSelected,
                  ]}
                  onPress={() => selectBedtimeSoundscape(sound.id)}
                >
                  <Text style={styles.soundscapeIcon}>{sound.icon}</Text>
                  <Text style={[styles.soundscapeName, isSelected && styles.soundscapeNameSelected]}>
                    {sound.name}
                  </Text>
                  <Text style={styles.soundscapeDesc}>{sound.desc}</Text>
                  {isSelected && (
                    <Text style={styles.soundscapePlaying}>Playing 🎵</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Gentle Notice / Late Night Activity Feed */}
        {lateNightEvents.length > 0 && (
          <Card style={styles.lateNightCard}>
            <Text style={styles.lateNightTitle}>🌙 Gentle Reminder</Text>
            <Text style={styles.lateNightDesc}>
              Late-night activity was recorded. Unload does not punish you or reset your streak — we're here to help you get the rest you deserve whenever you are ready.
            </Text>
            {lateNightEvents.map((ev) => (
              <View key={ev.id} style={styles.lateNightItem}>
                <Text style={styles.lateNightTime}>{ev.time}</Text>
                <Text style={styles.lateNightText}>{ev.text}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Prototype Demo Simulation Controls */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoTitle}>🧪 Bedtime Simulator (Demo)</Text>
          <Text style={styles.demoSubtitle}>
            Simulate different times of evening & night to test transitions
          </Text>

          <View style={styles.demoButtonGroup}>
            <TouchableOpacity
              style={[styles.demoBtn, bedtimeStatus === BEDTIME_STATUS.NORMAL && styles.demoBtnActive]}
              onPress={() => simulateBedtimeStatus(BEDTIME_STATUS.NORMAL)}
            >
              <Text style={styles.demoBtnText}>☀️ Normal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, bedtimeStatus === BEDTIME_STATUS.WIND_DOWN && styles.demoBtnActive]}
              onPress={() => simulateBedtimeStatus(BEDTIME_STATUS.WIND_DOWN)}
            >
              <Text style={styles.demoBtnText}>🌅 Wind-Down</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, bedtimeStatus === BEDTIME_STATUS.REST_MODE && styles.demoBtnActive]}
              onPress={() => simulateBedtimeStatus(BEDTIME_STATUS.REST_MODE)}
            >
              <Text style={styles.demoBtnText}>🌙 Rest Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, bedtimeStatus === BEDTIME_STATUS.MORNING_CHECK_IN && styles.demoBtnActive]}
              onPress={() => simulateBedtimeStatus(BEDTIME_STATUS.MORNING_CHECK_IN)}
            >
              <Text style={styles.demoBtnText}>☀️ Morning</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoExtraRow}>
            <TouchableOpacity
              style={styles.demoLateNightBtn}
              onPress={() => {
                recordLateNightActivity();
                Alert.alert('Simulated Late-Night Activity', 'Gentle wellness notification triggered for parent. No points deducted.');
              }}
            >
              <Text style={styles.demoLateNightText}>📱 Simulate Late-Night Usage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoResetBtn}
              onPress={() => simulateBedtimeStatus(null)}
            >
              <Text style={styles.demoResetText}>🔄 Live Clock</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  statusGlowTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  statusCountdown: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  scheduleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scheduleDivider: {
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPctText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  routineProgressBar: {
    marginVertical: 10,
  },
  checklist: {
    marginVertical: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistCheck: {
    fontSize: 16,
    marginRight: 10,
  },
  checklistLabel: {
    fontSize: 14,
    color: colors.text,
  },
  readyBtn: {
    marginTop: 10,
  },
  breathingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breathingOrbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  breathingOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  breathingOrbActive: {
    borderColor: '#A5B4FC',
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  breathingOrbText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  breathingTimerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  breathingActions: {
    marginTop: 8,
  },
  soundscapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  soundscapeItem: {
    width: '48%',
    backgroundColor: colors.surfaceHover || '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  soundscapeItemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  soundscapeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  soundscapeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  soundscapeNameSelected: {
    color: colors.primary,
  },
  soundscapeDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  soundscapePlaying: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  checkInGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  checkInBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHover || '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkInEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  checkInLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  checkInPoints: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  completedCheckInBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  checkInDoneEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  checkInDoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  checkInDoneDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  lateNightCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  lateNightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 4,
  },
  lateNightDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  lateNightItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  lateNightTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
    width: 70,
  },
  lateNightText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  demoCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  demoButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  demoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  demoBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  demoExtraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  demoLateNightBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  demoLateNightText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '600',
  },
  demoResetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  demoResetText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
