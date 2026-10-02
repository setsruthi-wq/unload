import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const ProgressBar = ({
  progress = 0, // 0 to 1 (or 0 to 100)
  color = colors.primary,
  height = 8,
  backgroundColor = colors.surfaceElevated,
  style,
}) => {
  // Normalize progress between 0 and 1
  const normalized = Math.min(Math.max(progress > 1 ? progress / 100 : progress, 0), 1);
  const widthPercent = `${Math.round(normalized * 100)}%`;

  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: widthPercent,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
