import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const Card = ({ children, style, variant = 'surface', ...props }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'light':
        return colors.surfaceLight;
      case 'primary':
        return colors.primarySubtle;
      case 'teal':
        return colors.tealSubtle;
      case 'surface':
      default:
        return colors.surface;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 6,
  },
});
