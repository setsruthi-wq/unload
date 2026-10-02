import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const Badge = ({
  label,
  variant = 'primary', // 'primary' | 'teal' | 'warning' | 'danger' | 'neutral' | 'sky'
  size = 'small',
  style,
  textStyle,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'teal':
        return {
          bg: colors.tealSubtle,
          text: colors.tealLight,
          border: 'rgba(20, 184, 166, 0.3)',
        };
      case 'warning':
        return {
          bg: colors.warningSubtle,
          text: colors.warning,
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'danger':
        return {
          bg: colors.dangerSubtle,
          text: colors.danger,
          border: 'rgba(239, 68, 68, 0.3)',
        };
      case 'sky':
        return {
          bg: colors.skySubtle,
          text: colors.sky,
          border: 'rgba(56, 189, 248, 0.3)',
        };
      case 'neutral':
        return {
          bg: colors.surfaceElevated,
          text: colors.textSecondary,
          border: colors.border,
        };
      case 'primary':
      default:
        return {
          bg: colors.primarySubtle,
          text: colors.primaryLight,
          border: 'rgba(16, 185, 129, 0.3)',
        };
    }
  };

  const currentTheme = getStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          paddingVertical: size === 'small' ? 3 : 5,
          paddingHorizontal: size === 'small' ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentTheme.text,
            fontSize: size === 'small' ? 11 : 13,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
