import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, radius, spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  leftIcon?: string;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, leftIcon }: Props) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const bg =
    variant === 'primary' ? theme.accent
    : variant === 'danger' ? theme.riskHigh
    : variant === 'secondary' ? theme.card
    : 'transparent';

  const textColor =
    variant === 'primary' ? '#080C14'
    : variant === 'danger' ? '#FFFFFF'
    : theme.textPrimary;

  const borderWidth = variant === 'secondary' ? 1 : 0;

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, { backgroundColor: bg, borderColor: theme.border, borderWidth }, style]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.inner}>
            {leftIcon ? <Text style={[styles.icon, { color: textColor }]}>{leftIcon}</Text> : null}
            <Text style={[typography.bodyMedium, { color: textColor }]}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 16 },
});
