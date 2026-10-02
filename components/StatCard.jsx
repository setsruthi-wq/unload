import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors } from '../theme/colors';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = colors.primary,
  style,
}) => {
  return (
    <Card style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon ? <View style={[styles.iconBox, { backgroundColor: `${accentColor}20` }]}>{icon}</View> : null}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    minWidth: 140,
    marginHorizontal: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
