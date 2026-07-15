import React from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: Props) {
  const { theme } = useTheme();

  if (elevated) {
    return (
      <LinearGradient
        colors={theme.gradients.surface}
        style={[styles.card, theme.shadow.elevated, { borderColor: theme.border, borderWidth: 1 }, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, theme.shadow.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md },
});
