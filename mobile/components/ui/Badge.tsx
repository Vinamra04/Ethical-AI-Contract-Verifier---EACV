import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, radius, spacing } from '../../constants/theme';

type Variant = 'high' | 'medium' | 'low' | 'safe' | 'caution' | 'risky' | 'default';

export function Badge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  const { theme } = useTheme();

  const colorMap: Record<Variant, { bg: string; text: string }> = {
    high: { bg: theme.riskHigh + '22', text: theme.riskHigh },
    risky: { bg: theme.riskHigh + '22', text: theme.riskHigh },
    medium: { bg: theme.riskMedium + '22', text: theme.riskMedium },
    caution: { bg: theme.riskMedium + '22', text: theme.riskMedium },
    low: { bg: theme.riskLow + '22', text: theme.riskLow },
    safe: { bg: theme.riskLow + '22', text: theme.riskLow },
    default: { bg: theme.border, text: theme.textSecondary },
  };

  const { bg, text } = colorMap[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[typography.caption, { color: text, fontFamily: 'Inter_600SemiBold' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
});
