import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'medium',     // 'small' | 'medium' | 'large'
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyles = () => {
    const base = [styles.button, styles[`size_${size}`]];
    
    switch (variant) {
      case 'secondary':
        base.push(styles.btnSecondary);
        break;
      case 'outline':
        base.push(styles.btnOutline);
        break;
      case 'ghost':
        base.push(styles.btnGhost);
        break;
      case 'danger':
        base.push(styles.btnDanger);
        break;
      case 'primary':
      default:
        base.push(styles.btnPrimary);
        break;
    }

    if (disabled) {
      base.push(styles.disabled);
    }

    return base;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.textInverse;
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      default:
        return colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={[styles.text, styles[`textSize_${size}`], { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  size_medium: {
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  size_large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textSize_small: {
    fontSize: 13,
  },
  textSize_medium: {
    fontSize: 15,
  },
  textSize_large: {
    fontSize: 17,
  },
});
