import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useUnload } from '../../context/UnloadContext';
import { MOCK_LOCATIONS } from '../../services/locationService';

const ZONE_PRESETS = [
  { id: 'home', name: 'Home', type: 'home', icon: '🏠', lat: 13.0827, lng: 80.2707, defaultRadius: 150 },
  { id: 'school', name: 'School', type: 'school', icon: '🏫', lat: 13.0674, lng: 80.2376, defaultRadius: 300 },
  { id: 'park', name: 'Park', type: 'park', icon: '🌳', lat: 13.0067, lng: 80.2572, defaultRadius: 200 },
  { id: 'tuition', name: 'Tuition', type: 'tuition', icon: '📚', lat: 13.0500, lng: 80.2500, defaultRadius: 150 },
  { id: 'other', name: 'Other', type: 'other', icon: '📍', lat: 13.0200, lng: 80.2200, defaultRadius: 100 },
];

export const ParentLocationScreen = () => {
  const {
    currentMockLocation,
    activeSafeZone,
    safeZones,
    locationEvents,
    locationRoutine,
    setMockLocation,
    toggleSafeZone,
    addSafeZone,
    updateSafeZone,
    deleteSafeZone,
  } = useUnload();

  // Add Safe Zone Modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(ZONE_PRESETS[0]);
  const [newZoneName, setNewZoneName] = useState(ZONE_PRESETS[0].name);
  const [newZoneRadius, setNewZoneRadius] = useState(String(ZONE_PRESETS[0].defaultRadius));

  // Edit Safe Zone Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneRadius, setEditZoneRadius] = useState('');
  const [editZoneType, setEditZoneType] = useState('other');

  // Simulator Handler
  const handleSimulateLocation = (locId) => {
    setMockLocation(locId);
  };

  // Add Zone Handler
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setNewZoneName(preset.name);
    setNewZoneRadius(String(preset.defaultRadius));
  };

  const handleCreateZone = () => {
    if (!newZoneName.trim()) {
      Alert.alert('Zone Name Required', 'Please enter a name for this safe zone.');
      return;
    }
    const radiusNum = parseInt(newZoneRadius, 10);
    if (isNaN(radiusNum) || radiusNum < 50 || radiusNum > 1000) {
      Alert.alert('Invalid Radius', 'Please enter a radius between 50 and 1000 metres.');
      return;
    }

    addSafeZone({
      name: newZoneName.trim(),
      type: selectedPreset.type,
      latitude: selectedPreset.lat,
      longitude: selectedPreset.lng,
      radius: radiusNum,
      radiusMeters: radiusNum,
      icon: selectedPreset.icon,
      enabled: true,
    });

    setAddModalVisible(false);
  };

  // Edit Zone Handlers
  const handleOpenEdit = (zone) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.name);
    setEditZoneRadius(String(zone.radius || zone.radiusMeters || 150));
    setEditZoneType(zone.type || 'other');
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editZoneName.trim()) {
      Alert.alert('Zone Name Required', 'Please enter a name for this safe zone.');
      return;
    }
    const radiusNum = parseInt(editZoneRadius, 10);
    if (isNaN(radiusNum) || radiusNum < 50 || radiusNum > 1000) {
      Alert.alert('Invalid Radius', 'Please enter a radius between 50 and 1000 metres.');
      return;
    }

    updateSafeZone(editingZoneId, {
      name: editZoneName.trim(),
      type: editZoneType,
      radius: radiusNum,
      radiusMeters: radiusNum,
    });

    setEditModalVisible(false);
    setEditingZoneId(null);
  };

  // Delete Zone Handler
  const handleDelete = (zoneId, zoneName) => {
    if (safeZones.length <= 1) {
      Alert.alert('Cannot Delete', 'At least one active safe zone is required for child safety.');
      return;
    }

    Alert.alert(
      'Remove Safe Zone',
      `Are you sure you want to remove "${zoneName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const res = deleteSafeZone(zoneId);
            if (!res.success) {
              Alert.alert('Notice', res.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Safe Zones & Location"
        subtitle="Transparent geofencing & arrival updates"
        showRoleBadge={true}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Radar Map Canvas */}
        <Card style={styles.mapCard}>
          <View style={styles.mockMapCanvas}>
            {/* Concentric geofence radar rings */}
            <View style={styles.radarRingOuter}>
              <View style={styles.radarRingMid}>
                <View style={styles.radarRingInner}>
                  <View style={styles.pinPoint}>
                    <Text style={styles.pinEmoji}>{currentMockLocation?.icon || '📍'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Radar zone icons */}
            <Text style={styles.radarZoneLabel1}>🏠</Text>
            <Text style={styles.radarZoneLabel2}>🏫</Text>
            <Text style={styles.radarZoneLabel3}>🌳</Text>

            {/* Coordinate pill */}
            <View style={styles.mapOverlayPill}>
              <Text style={styles.mapOverlayText}>
                {currentMockLocation?.latitude?.toFixed(4)}° N, {currentMockLocation?.longitude?.toFixed(4)}° E
              </Text>
              <Text style={styles.mapAccuracyText}>• Mock GPS</Text>
            </View>
          </View>

          {/* Current Status Footer */}
          <View style={styles.mapFooter}>
            <View style={styles.statusIndicatorRow}>
              <View style={[styles.statusDot, activeSafeZone ? styles.dotGreen : styles.dotAmber]} />
              <Text style={styles.statusCurrent}>
                {activeSafeZone ? `Inside ${activeSafeZone.name}` : `Outside Safe Zones (${currentMockLocation?.name || 'On the move'})`}
              </Text>
            </View>
            <Text style={styles.updatedSub}>
              Routine: {locationRoutine?.mode || 'Normal Mode'} • {locationRoutine?.message || 'Mindful screen balance'}
            </Text>
          </View>
        </Card>

        {/* ── Demo Location Simulator ── */}
        <Card variant="surface" style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <Text style={styles.simulatorTitle}>🎮 Demo Location Simulator</Text>
            <Badge label="Interactive" variant="sky" size="small" />
          </View>
          <Text style={styles.simulatorSubtitle}>
            Tap a location to move the child’s device and test geofence transitions:
          </Text>

          <View style={styles.simButtonGrid}>
            {['home', 'school', 'park', 'other'].map((locKey) => {
              const loc = MOCK_LOCATIONS[locKey];
              const isActive = (currentMockLocation?.id || '').toLowerCase() === locKey;

              return (
                <TouchableOpacity
                  key={locKey}
                  style={[styles.simBtn, isActive && styles.simBtnActive]}
                  onPress={() => handleSimulateLocation(locKey)}
                >
                  <Text style={styles.simBtnIcon}>{loc.icon}</Text>
                  <Text style={[styles.simBtnText, isActive && styles.simBtnTextActive]}>
                    {loc.name}
                  </Text>
                  {isActive && <Text style={styles.activeCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Current Location Summary Card */}
        <Card variant="light" style={styles.currentLocationCard}>
          <View style={styles.currentLocHeader}>
            <Text style={styles.currentLocLabel}>CURRENT LOCATION</Text>
            <Badge
              label={activeSafeZone ? 'Inside Safe Zone' : 'Outside Safe Zone'}
              variant={activeSafeZone ? 'primary' : 'neutral'}
              size="small"
            />
          </View>
          <Text style={styles.currentLocName}>
            {currentMockLocation?.icon || '📍'} {currentMockLocation?.name}
          </Text>
          <Text style={styles.currentLocDesc}>
            {activeSafeZone
              ? `Child is within the ${activeSafeZone.radius || activeSafeZone.radiusMeters}m perimeter of ${activeSafeZone.name}.`
              : 'Child is currently outside all configured safe zones. Screen-time guidelines remain active.'}
          </Text>
        </Card>

        {/* Safe Zones List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Configured Safe Zones</Text>
          <Button
            title="+ Add Zone"
            variant="ghost"
            size="small"
            onPress={() => setAddModalVisible(true)}
          />
        </View>

        {safeZones.map((zone) => {
          const isInside = (zone.status || '').toLowerCase() === 'inside';
          const radius = zone.radius || zone.radiusMeters || 150;

          return (
            <Card key={zone.id} style={[styles.zoneCard, !zone.enabled && styles.zoneCardDisabled]}>
              <View style={styles.zoneRow}>
                {/* Zone Icon Circle */}
                <View
                  style={[
                    styles.zoneIconCircle,
                    { backgroundColor: isInside ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.1)' },
                  ]}
                >
                  <Text style={styles.zoneIcon}>{zone.icon || '📍'}</Text>
                </View>

                {/* Zone Info */}
                <View style={styles.zoneInfo}>
                  <Text style={[styles.zoneName, !zone.enabled && styles.textDisabled]}>
                    {zone.name}
                  </Text>
                  <Text style={styles.zoneMeta}>
                    {zone.type} · {radius}m radius
                  </Text>
                </View>

                {/* Status Badge & Toggle */}
                <View style={styles.zoneControls}>
                  <Badge
                    label={isInside ? 'Inside ✓' : 'Outside'}
                    variant={isInside ? 'primary' : 'neutral'}
                    size="small"
                  />
                  <Switch
                    value={zone.enabled}
                    onValueChange={() => toggleSafeZone(zone.id)}
                    trackColor={{ false: colors.surfaceElevated, true: colors.primary }}
                    thumbColor={colors.textPrimary}
                    style={styles.zoneSwitch}
                  />
                </View>
              </View>

              {/* Action Buttons for Edit & Delete */}
              <View style={styles.zoneActionRow}>
                <TouchableOpacity
                  style={styles.zoneActionBtn}
                  onPress={() => handleOpenEdit(zone)}
                >
                  <Text style={styles.zoneActionText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.zoneActionBtn}
                  onPress={() => handleDelete(zone.id, zone.name)}
                >
                  <Text style={[styles.zoneActionText, { color: colors.danger }]}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>

              {!zone.enabled && (
                <Text style={styles.disabledLabel}>Safe zone monitoring paused</Text>
              )}
            </Card>
          );
        })}

        {/* Recent Location Activity Feed */}
        <Text style={[styles.sectionHeading, { marginTop: 20, marginBottom: 10 }]}>
          Recent Location Activity
        </Text>

        {locationEvents.slice(0, 10).map((evt) => (
          <Card key={evt.id} style={styles.eventCard}>
            <View style={styles.eventRow}>
              <Text style={styles.eventBullet}>{evt.icon || '📍'}</Text>
              <View style={styles.eventContent}>
                <Text style={styles.eventText}>{evt.text}</Text>
                <Text style={styles.eventTime}>{evt.time} · Today</Text>
              </View>
              <Badge
                label={evt.type === 'arrival' ? 'Arrival' : evt.type === 'departure' ? 'Departure' : 'Update'}
                variant={evt.type === 'arrival' ? 'primary' : 'neutral'}
                size="small"
              />
            </View>
          </Card>
        ))}

        {/* Privacy Design Statement */}
        <Card variant="light" style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyHeading}>Guardian-Controlled Privacy</Text>
            <Text style={styles.privacyText}>
              Location sharing is guardian-controlled and used only for safety and healthy routine features.
            </Text>
            <Text style={[styles.privacyText, { marginTop: 4, color: colors.tealLight }]}>
              Demo mode uses simulated locations. Real device location is not enabled.
            </Text>
          </View>
        </Card>

        {/* Future Architecture Bridge Note */}
        <Card variant="light" style={styles.noteCard}>
          <Text style={styles.noteTitle}>🗺️ Future Architecture Integration</Text>
          <Text style={styles.noteText}>
            This prototype separates the mock location provider from the SafeZoneEngine.
            When native Android GPS is integrated via{' '}
            <Text style={styles.codeSpan}>expo-location</Text>, the SafeZoneEngine will evaluate
            real coordinates using the exact same geofence algorithms without changing this UI.
          </Text>
        </Card>
      </ScrollView>

      {/* ── Add Safe Zone Modal ── */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📍 Add Safe Zone</Text>
            <Text style={styles.modalSubtitle}>
              Select a preset location or customize a new safe perimeter.
            </Text>

            {/* Preset Selector */}
            <Text style={styles.inputLabel}>Preset Location</Text>
            <View style={styles.presetRow}>
              {ZONE_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.presetChip,
                    selectedPreset.id === preset.id && styles.presetChipActive,
                  ]}
                  onPress={() => handleSelectPreset(preset)}
                >
                  <Text style={styles.presetChipIcon}>{preset.icon}</Text>
                  <Text
                    style={[
                      styles.presetChipText,
                      selectedPreset.id === preset.id && styles.presetChipTextActive,
                    ]}
                  >
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Zone Name */}
            <Text style={styles.inputLabel}>Zone Name</Text>
            <TextInput
              style={styles.textInput}
              value={newZoneName}
              onChangeText={setNewZoneName}
              placeholder="e.g. Grandma's House"
              placeholderTextColor={colors.textMuted}
              maxLength={40}
            />

            {/* Radius */}
            <Text style={styles.inputLabel}>Perimeter Radius (metres)</Text>
            <TextInput
              style={styles.textInput}
              value={newZoneRadius}
              onChangeText={setNewZoneRadius}
              keyboardType="numeric"
              placeholder="150"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />

            <Text style={styles.modalNote}>
              ℹ️ Demo coordinates: {selectedPreset.lat.toFixed(4)}° N, {selectedPreset.lng.toFixed(4)}° E.
              No GPS permissions needed.
            </Text>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                size="medium"
                onPress={() => setAddModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Create Zone"
                variant="primary"
                size="medium"
                onPress={handleCreateZone}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Edit Safe Zone Modal ── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>✏️ Edit Safe Zone</Text>
            <Text style={styles.modalSubtitle}>
              Update the name or perimeter radius for this zone.
            </Text>

            {/* Zone Name */}
            <Text style={styles.inputLabel}>Zone Name</Text>
            <TextInput
              style={styles.textInput}
              value={editZoneName}
              onChangeText={setEditZoneName}
              placeholder="Zone Name"
              placeholderTextColor={colors.textMuted}
              maxLength={40}
            />

            {/* Radius */}
            <Text style={styles.inputLabel}>Perimeter Radius (metres)</Text>
            <TextInput
              style={styles.textInput}
              value={editZoneRadius}
              onChangeText={setEditZoneRadius}
              keyboardType="numeric"
              placeholder="150"
              placeholderTextColor={colors.textMuted}
              maxLength={4}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                size="medium"
                onPress={() => setEditModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Changes"
                variant="primary"
                size="medium"
                onPress={handleSaveEdit}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Map canvas
  mapCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mockMapCanvas: {
    height: 190,
    backgroundColor: '#0A1628',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarRingOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingMid: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.65)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPoint: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: {
    fontSize: 24,
  },
  radarZoneLabel1: {
    position: 'absolute',
    top: 28,
    left: 60,
    fontSize: 18,
  },
  radarZoneLabel2: {
    position: 'absolute',
    top: 50,
    right: 44,
    fontSize: 18,
  },
  radarZoneLabel3: {
    position: 'absolute',
    bottom: 36,
    left: 50,
    fontSize: 18,
  },
  mapOverlayPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mapOverlayText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  mapAccuracyText: {
    fontSize: 11,
    color: colors.primaryLight,
    marginLeft: 4,
  },
  mapFooter: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: colors.primary,
  },
  dotAmber: {
    backgroundColor: colors.warning,
  },
  statusCurrent: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  updatedSub: {
    fontSize: 12,
    color: colors.textMuted,
  },

  // Simulator Card
  simulatorCard: {
    padding: 16,
    marginBottom: 16,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  simulatorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  simulatorSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  simButtonGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  simBtn: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  simBtnActive: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderColor: colors.primary,
  },
  simBtnIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  simBtnText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  simBtnTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  activeCheck: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Current Location Card
  currentLocationCard: {
    padding: 16,
    marginBottom: 20,
  },
  currentLocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentLocLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  currentLocName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  currentLocDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Zone Card
  zoneCard: {
    padding: 14,
    marginBottom: 10,
  },
  zoneCardDisabled: {
    opacity: 0.55,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  zoneIcon: {
    fontSize: 22,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  zoneMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  zoneControls: {
    alignItems: 'flex-end',
    gap: 4,
  },
  zoneSwitch: {
    marginTop: 4,
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  zoneActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  zoneActionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  zoneActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  disabledLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  textDisabled: {
    color: colors.textMuted,
  },

  // Event Feed
  eventCard: {
    padding: 12,
    marginBottom: 6,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventBullet: {
    fontSize: 18,
    marginRight: 10,
  },
  eventContent: {
    flex: 1,
  },
  eventText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Privacy & Note
  privacyCard: {
    padding: 14,
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  privacyHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  noteCard: {
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.tealLight,
    marginBottom: 5,
  },
  noteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  codeSpan: {
    fontFamily: 'monospace',
    color: colors.sky,
    fontSize: 11,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  presetChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  modalNote: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 2,
    marginBottom: 18,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
  },
});
