import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Badge } from './Badge';

export const Header = ({
  title,
  subtitle,
  onBack,
  showRoleBadge = true,
  rightElement,
}) => {
  const { role, switchRole } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightElement ? (
          rightElement
        ) : showRoleBadge && role ? (
          <TouchableOpacity
            onPress={switchRole}
            activeOpacity={0.7}
            style={styles.roleToggleWrapper}
          >
            <Badge
              label={role === 'child' ? 'Child 🌱' : 'Parent 👩‍💼'}
              variant={role === 'child' ? 'primary' : 'sky'}
              size="small"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  roleToggleWrapper: {
    paddingVertical: 2,
  },
});
