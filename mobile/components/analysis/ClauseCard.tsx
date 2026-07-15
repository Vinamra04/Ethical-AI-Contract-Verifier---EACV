import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DarkPatternBadge } from './DarkPatternBadge';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/theme';

type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';
const VARIANT_MAP: Record<RiskLevel, 'low' | 'medium' | 'high'> = {
  'Low Risk': 'low', 'Medium Risk': 'medium', 'High Risk': 'high',
};

interface Props {
  clause: string;
  risk: RiskLevel;
  darkPatterns: string[];
}

export function ClauseCard({ clause, risk, darkPatterns }: Props) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const preview = clause.length > 120 ? clause.slice(0, 120) + '…' : clause;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Badge label={risk} variant={VARIANT_MAP[risk]} />
      </View>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.sm }]}>
          {expanded ? clause : preview}
        </Text>
        {clause.length > 120 && (
          <Text style={[typography.label, { color: theme.accent, marginTop: spacing.xs }]}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        )}
      </TouchableOpacity>
      {darkPatterns.length > 0 && (
        <View style={styles.patterns}>
          {darkPatterns.map((p) => <DarkPatternBadge key={p} pattern={p} />)}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center' },
  patterns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
});
