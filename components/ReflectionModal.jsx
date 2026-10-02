import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { OFFLINE_ACTIVITIES } from '../services/progressiveUnloading';

export const ReflectionModal = ({
  visible,
  onClose,
  onActivitySelect,
  selectedActivity,
  title = 'Your screen-time goal is complete 🌱',
}) => {
  const [activeTab, setActiveTab] = useState('reset'); // 'reset' | 'reflect' | 'activities'
  const [breathPhase, setBreathPhase] = useState('Inhale slowly (4s)...');
  const [mood, setMood] = useState(null);

  const handleNextBreathing = () => {
    setBreathPhase('Inhale calmness... (4s)');
    setTimeout(() => setBreathPhase('Hold gently... (4s)'), 3000);
    setTimeout(() => setBreathPhase('Exhale tension... (4s)'), 6000);
    setTimeout(() => setBreathPhase('Rest your eyes... (4s)'), 9000);
  };

  const moods = [
    { emoji: '😌', label: 'Relaxed' },
    { emoji: '🥱', label: 'Tired' },
    { emoji: '🧠', label: 'Overloaded' },
    { emoji: '🔋', label: 'Recharged' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.sproutBadge}>
              <Text style={{ fontSize: 32 }}>🌱</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              You stayed within today’s Progressive Unload target. Take a moment to wind down.
            </Text>
          </View>

          {/* Stepper Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('reset')}
              style={[styles.tab, activeTab === 'reset' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'reset' && styles.tabTextActive]}>
                1. 2-Min Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('reflect')}
              style={[styles.tab, activeTab === 'reflect' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'reflect' && styles.tabTextActive]}>
                2. Reflect
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('activities')}
              style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
                3. Offline Fun
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: 2-Min Breathing Reset */}
          {activeTab === 'reset' && (
            <View style={styles.tabContent}>
              <View style={styles.breathingCircle}>
                <Text style={styles.breathEmoji}>🌿</Text>
                <Text style={styles.breathText}>{breathPhase}</Text>
              </View>

              <Text style={styles.breatheSub}>
                Drop your shoulders, soften your gaze, and let your eyes rest from the screen.
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  title="Cycle Breath"
                  variant="outline"
                  size="small"
                  onPress={handleNextBreathing}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Next: Reflect →"
                  size="small"
                  onPress={() => setActiveTab('reflect')}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          )}

          {/* Tab 2: Mindful Reflection */}
          {activeTab === 'reflect' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionPrompt}>How is your body feeling right now?</Text>
              <View style={styles.moodGrid}>
                {moods.map((m) => {
                  const isChosen = mood === m.label;
                  return (
                    <TouchableOpacity
                      key={m.label}
                      onPress={() => setMood(m.label)}
                      style={[styles.moodCard, isChosen && styles.moodCardActive]}
                    >
                      <Text style={{ fontSize: 28, marginBottom: 4 }}>{m.emoji}</Text>
                      <Text style={[styles.moodLabel, isChosen && styles.moodLabelActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Card variant="teal" style={{ padding: 12, marginVertical: 12 }}>
                <Text style={styles.coachingText}>
                  "Acknowledging when screens drain energy is the foundation of genuine self-regulation."
                </Text>
              </Card>

              <Button
                title="Next: Choose Offline Activity →"
                size="small"
                onPress={() => setActiveTab('activities')}
                style={{ width: '100%' }}
              />
            </View>
          )}

          {/* Tab 3: Offline Activities */}
          {activeTab === 'activities' && (
            <ScrollView style={styles.activitiesScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionPrompt}>Pick an offline activity to transition to:</Text>
              {OFFLINE_ACTIVITIES.map((act) => {
                const isSelected = selectedActivity?.id === act.id;
                return (
                  <TouchableOpacity
                    key={act.id}
                    onPress={() => onActivitySelect(act)}
                    style={[styles.activityRow, isSelected && styles.activityRowActive]}
                  >
                    <Text style={styles.actIcon}>{act.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actTitle, isSelected && styles.actTitleActive]}>
                        {act.title}
                      </Text>
                      <Text style={styles.actDesc}>{act.desc}</Text>
                    </View>
                    {isSelected && <Badge label="Selected" variant="primary" size="small" />}
                  </TouchableOpacity>
                );
              })}

              <Button
                title="Finish & Live Freely 🌱"
                size="medium"
                onPress={onClose}
                style={{ marginTop: 14, marginBottom: 8 }}
              />
            </ScrollView>
          )}

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Return to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  sproutBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: colors.surfaceElevated,
  },
  tabText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primaryLight,
  },
  tabContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 12,
  },
  breathEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  breathText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
    textAlign: 'center',
  },
  breatheSub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  sectionPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  moodCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  moodLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moodLabelActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  coachingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.tealLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  activitiesScroll: {
    maxHeight: 280,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  actIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actTitleActive: {
    color: colors.primaryLight,
  },
  actDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
