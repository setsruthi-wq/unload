import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
  timeStringToMinutes,
  formatTimeStr,
  SLEEP_CHECK_IN_OPTIONS,
} from '../../services/bedtimeService';

// Helper to convert minutes back to HH:MM
const minutesToTimeString = (totalMinutes) => {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const ParentBedtimeScreen = () => {
  const {
    bedtimeSettings,
    bedtimeStatus,
    bedtimeMessage,
    windDownProgress,
    bedtimeActivity,
    lateNightEvents,
    sleepCheckIn,
    updateBedtimeSettings,
    simulateBedtimeStatus,
    recordLateNightActivity,
  } = useUnload();

  const [savedBanner, setSavedBanner] = useState(false);

  const triggerSaveNotification = (msg) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleAdjustTime = (field, deltaMinutes) => {
    const currentMins = timeStringToMinutes(bedtimeSettings[field]);
    const newTime = minutesToTimeString(currentMins + deltaMinutes);
    updateBedtimeSettings({ [field]: newTime });
    triggerSaveNotification(`${field === 'windDownTime' ? 'Wind-Down' : field === 'restStartTime' ? 'Rest Start' : 'Rest End'} updated to ${formatTimeStr(newTime)}`);
  };

  const handleToggleEnabled = (val) => {
    updateBedtimeSettings({ enabled: val });
    triggerSaveNotification(val ? 'Bedtime schedule enabled' : 'Bedtime schedule paused');
  };

  // Resolve Sleep Check-In details if exists
  const checkInDetail = sleepCheckIn
    ? SLEEP_CHECK_IN_OPTIONS.find((o) => o.id === sleepCheckIn.optionId)
    : null;

  return (
    <View style={styles.container}>
      <Header
        title="Mindful Bedtime & Curfew"
        subtitle="Foster gentle, non-punitive sleep routines"
        showRoleBadge={true}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {savedBanner && (
          <View style={styles.saveAlert}>
            <Text style={styles.saveAlertText}>✅ {savedBanner}</Text>
          </View>
        )}

        {/* Live Child Bedtime Status Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>🌙 Live Child Rest Status</Text>
              <Text style={styles.cardSubtitle}>Real-time circadian sync</Text>
            </View>
            <Badge
              text={bedtimeStatus}
              variant={bedtimeStatus === BEDTIME_STATUS.REST_MODE ? 'neutral' : 'success'}
            />
          </View>

          <View style={styles.statusDisplayBox}>
            <Text style={styles.statusHeadline}>{bedtimeMessage.title}</Text>
            <Text style={styles.statusMessage}>{bedtimeMessage.subtitle}</Text>
            <Text style={styles.statusCountdown}>⏳ {bedtimeMessage.countdownText}</Text>
          </View>

          {/* Child Routine Checklist */}
          <View style={styles.routineChecklist}>
            <View style={styles.routineRow}>
              <Text style={styles.routineIcon}>
                {bedtimeActivity.soundscape ? '✅' : '⚪'}
              </Text>
              <Text style={styles.routineText}>
                Soundscape: {bedtimeActivity.soundscape ? `${bedtimeActivity.soundscape} (Active)` : 'Not set'}
              </Text>
            </View>

            <View style={styles.routineRow}>
              <Text style={styles.routineIcon}>
                {bedtimeActivity.breathingCompleted ? '✅' : '⚪'}
              </Text>
              <Text style={styles.routineText}>
                2-min Mindful Breathing: {bedtimeActivity.breathingCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>

            <View style={styles.routineRow}>
              <Text style={styles.routineIcon}>
                {bedtimeActivity.windDownCompleted ? '✅' : '⚪'}
              </Text>
              <Text style={styles.routineText}>
                Ready for Rest Confirmation: {bedtimeActivity.windDownCompleted ? 'Confirmed' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.prepProgressRow}>
            <Text style={styles.prepProgressLabel}>Sleep Preparation Progress</Text>
            <Text style={styles.prepProgressVal}>{windDownProgress.percentage}%</Text>
          </View>
          <ProgressBar
            progress={windDownProgress.percentage / 100}
            color={colors.primary}
            style={styles.progressBar}
          />
        </Card>

        {/* Bedtime Schedule & Curfew Rules */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>⏰ Bedtime Schedule</Text>
              <Text style={styles.cardSubtitle}>
                Consistent sleep-wake windows reduce cognitive fatigue
              </Text>
            </View>
            <Switch
              value={bedtimeSettings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ false: '#334155', true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {/* Wind-Down Time Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperInfo}>
              <Text style={styles.stepperLabel}>🌅 Wind-Down Time</Text>
              <Text style={styles.stepperDesc}>Warm screen tone & breathing reminder</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('windDownTime', -15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>-15m</Text>
              </TouchableOpacity>
              <Text style={styles.timeValueText}>
                {formatTimeStr(bedtimeSettings.windDownTime)}
              </Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('windDownTime', 15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>+15m</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rest Start Time Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperInfo}>
              <Text style={styles.stepperLabel}>🌙 Rest Mode Start</Text>
              <Text style={styles.stepperDesc}>Curfew begins, device quieted</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('restStartTime', -15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>-15m</Text>
              </TouchableOpacity>
              <Text style={styles.timeValueText}>
                {formatTimeStr(bedtimeSettings.restStartTime)}
              </Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('restStartTime', 15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>+15m</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rest End Time Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperInfo}>
              <Text style={styles.stepperLabel}>☀️ Rest Mode End</Text>
              <Text style={styles.stepperDesc}>Morning check-in unlocks</Text>
            </View>
            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('restEndTime', -15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>-15m</Text>
              </TouchableOpacity>
              <Text style={styles.timeValueText}>
                {formatTimeStr(bedtimeSettings.restEndTime)}
              </Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjustTime('restEndTime', 15)}
                disabled={!bedtimeSettings.enabled}
              >
                <Text style={styles.stepBtnText}>+15m</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Morning Sleep Quality Check-in Summary */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>☀️ Sleep Quality Reflection</Text>
          <Text style={styles.cardSubtitle}>
            Child's self-reported sleep feedback
          </Text>

          {sleepCheckIn ? (
            <View style={styles.checkInResultBox}>
              <Text style={styles.checkInEmoji}>{checkInDetail?.emoji || '😴'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.checkInLabel}>
                  {checkInDetail?.label || sleepCheckIn.optionId} • Recorded at {sleepCheckIn.timestamp}
                </Text>
                <Text style={styles.checkInFeedback}>{checkInDetail?.message}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCheckInBox}>
              <Text style={styles.emptyCheckInText}>
                No sleep check-in recorded for today yet. Check-ins unlock during morning hours (7:00 AM - 9:00 AM).
              </Text>
            </View>
          )}
        </Card>

        {/* Late-Night Activity Summary */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>📱 Late-Night Activity Log</Text>
              <Text style={styles.cardSubtitle}>
                {lateNightEvents.length === 0
                  ? 'No late-night events detected tonight 🎉'
                  : `${lateNightEvents.length} late-night event(s) recorded`}
              </Text>
            </View>
            <Badge
              text={lateNightEvents.length === 0 ? 'Peaceful' : 'Review'}
              variant={lateNightEvents.length === 0 ? 'success' : 'warning'}
            />
          </View>

          {lateNightEvents.length > 0 ? (
            <View style={styles.lateNightList}>
              {lateNightEvents.map((ev) => (
                <View key={ev.id} style={styles.lateNightRow}>
                  <Text style={styles.lateNightTime}>{ev.time}</Text>
                  <Text style={styles.lateNightDesc}>{ev.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.peacefulText}>
              Rest mode has been quiet. Restful nights restore daytime focus and emotional resilience.
            </Text>
          )}

          <View style={styles.guidanceBox}>
            <Text style={styles.guidanceTitle}>💡 Safesprout Guardian Insight</Text>
            <Text style={styles.guidanceText}>
              Late-night phone usage is handled gently as an opportunity for empathetic conversation, never as a punishable infraction or point deduction.
            </Text>
          </View>
        </Card>

        {/* Guardian Simulation & Demo Controls */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoTitle}>🧪 Curfew Simulation (Demo)</Text>
          <Text style={styles.demoSubtitle}>
            Test child bedtime states and evaluate guardian notifications
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

          <View style={styles.demoActionRow}>
            <TouchableOpacity
              style={styles.demoLateNightAction}
              onPress={() => {
                recordLateNightActivity();
                Alert.alert('Simulated Late-Night Activity', 'Logged event to child record and added notice to Guardian Activity feed.');
              }}
            >
              <Text style={styles.demoLateNightActionText}>Trigger Late-Night Activity Notice 🌙</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Privacy Note */}
        <View style={styles.privacyNoteBox}>
          <Text style={styles.privacyNoteText}>
            🔒 Privacy First: UNLOAD sleep schedules are mock simulations designed to model healthy family routines. We do not monitor microphones, cameras, or keystrokes.
          </Text>
        </View>
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
  saveAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  saveAlertText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusDisplayBox: {
    backgroundColor: colors.surfaceHover || '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  statusHeadline: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusCountdown: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  routineChecklist: {
    marginBottom: 14,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  routineIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  routineText: {
    fontSize: 13,
    color: colors.text,
  },
  prepProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  prepProgressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prepProgressVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    marginBottom: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepperInfo: {
    flex: 1,
    paddingRight: 10,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stepperDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    backgroundColor: colors.surfaceHover || '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  timeValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    width: 68,
    textAlign: 'center',
  },
  checkInResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 6,
  },
  checkInEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  checkInLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  checkInFeedback: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyCheckInBox: {
    backgroundColor: colors.surfaceHover || '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  emptyCheckInText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  lateNightList: {
    marginTop: 8,
  },
  lateNightRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lateNightTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
    width: 70,
  },
  lateNightDesc: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  peacefulText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  guidanceBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginTop: 14,
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A5B4FC',
    marginBottom: 4,
  },
  guidanceText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  demoCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
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
    marginBottom: 10,
  },
  demoButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  demoActionRow: {
    marginTop: 4,
  },
  demoLateNightAction: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  demoLateNightActionText: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
  },
  privacyNoteBox: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  privacyNoteText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
