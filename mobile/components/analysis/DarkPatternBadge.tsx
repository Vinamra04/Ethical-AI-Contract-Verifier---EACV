import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing, radius } from '../../constants/theme';

const LABELS: Record<string, string> = {
  data_selling: '💰 Data Selling',
  forced_consent: '⚠️ Forced Consent',
  auto_renewal: '🔄 Auto Renewal',
  unilateral_changes: '✏️ No-Notice Changes',
  binding_arbitration: '⚖️ Forced Arbitration',
  broad_surveillance: '👁️ Surveillance',
  third_party_sharing: '🔗 Third-Party Sharing',
};

export function DarkPatternBadge({ pattern }: { pattern: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.riskHigh + '18', borderColor: theme.riskHigh + '44' }]}>
      <Text style={[typography.caption, { color: theme.riskHigh }]}>
        {LABELS[pattern] ?? pattern}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
});
