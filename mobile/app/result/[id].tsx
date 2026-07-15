import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { api, AnalysisResult } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { RiskGauge } from '../../components/analysis/RiskGauge';
import { ClauseCard } from '../../components/analysis/ClauseCard';
import { DarkPatternBadge } from '../../components/analysis/DarkPatternBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius } from '../../constants/theme';

const REC_CONFIG = {
  safe:    { icon: '✅', label: 'Safe to Proceed',              color: '#66BB6A' },
  caution: { icon: '⚠️', label: 'Proceed with Caution',         color: '#FFA726' },
  risky:   { icon: '🚨', label: 'High Risk — Review Carefully', color: '#FF4757' },
};

export default function ResultScreen() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Section entrance animations — called unconditionally (hooks must not be in loops)
  const s0 = useEntrance(100);
  const s1 = useEntrance(180);
  const s2 = useEntrance(260);
  const s3 = useEntrance(340);
  const s4 = useEntrance(420);

  useEffect(() => {
    if (data) {
      try { setResult(JSON.parse(data)); } catch {}
      setLoading(false);
    } else {
      api.getAnalysis(id).then(setResult).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header title="Analysis Result" showBack />
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.md }]}>
            Loading result…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header title="Analysis Result" showBack />
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>❌</Text>
          <Text style={[typography.h3, { color: theme.textPrimary, marginTop: spacing.md }]}>
            Result not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const rec = REC_CONFIG[result.recommendation];
  const riskColor =
    result.risk_level === 'high' ? theme.riskHigh
    : result.risk_level === 'medium' ? theme.riskMedium
    : theme.riskLow;

  const recGradient: [string, string] =
    result.recommendation === 'risky' ? theme.gradients.danger
    : result.recommendation === 'caution' ? theme.gradients.hero
    : theme.gradients.safe;

  const highRiskClauses = result.clause_results.filter((c) => c.risk === 'High Risk');
  const otherClauses = result.clause_results.filter((c) => c.risk !== 'High Risk');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="Analysis Result" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Risk Hero */}
        <LinearGradient
          colors={[riskColor + '28', riskColor + '08', theme.background]}
          style={[styles.hero, { borderColor: riskColor + '44' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <RiskGauge level={result.risk_level} />
        </LinearGradient>

        {/* Recommendation Banner */}
        <LinearGradient
          colors={[recGradient[0] + '22', recGradient[1] + '22']}
          style={[styles.recBanner, { borderColor: rec.color + '44' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Text style={{ fontSize: 22 }}>{rec.icon}</Text>
          <Text style={[typography.bodyMedium, { color: rec.color, marginLeft: spacing.sm, flex: 1 }]}>
            {rec.label}
          </Text>
        </LinearGradient>

        {/* Summary — s0 */}
        <Animated.View style={{ opacity: s0.opacity, transform: [{ translateY: s0.translateY }] }}>
          <Card elevated style={styles.section}>
            <View style={styles.sectionTitle}>
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>SUMMARY</Text>
            </View>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.sm, lineHeight: 22 }]}>
              {result.explanation}
            </Text>
          </Card>
        </Animated.View>

        {/* Dark Patterns — s1 */}
        {result.dark_patterns_detected.length > 0 && (
          <Animated.View style={{ opacity: s1.opacity, transform: [{ translateY: s1.translateY }] }}>
            <Card elevated style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>🕵️</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  DARK PATTERNS ({result.dark_patterns_detected.length})
                </Text>
              </View>
              <View style={styles.patternRow}>
                {result.dark_patterns_detected.map((p) => <DarkPatternBadge key={p} pattern={p} />)}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Issues — s2 */}
        {result.issues.length > 0 && (
          <Animated.View style={{ opacity: s2.opacity, transform: [{ translateY: s2.translateY }] }}>
            <Card elevated style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  KEY ISSUES ({result.issues.length})
                </Text>
              </View>
              {result.issues.map((issue, i) => (
                <View key={i} style={[styles.issueRow, { borderLeftColor: theme.riskHigh }]}>
                  <Text style={[typography.body, { color: theme.textSecondary, flex: 1 }]}>{issue}</Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* High Risk Clauses — s3 */}
        {highRiskClauses.length > 0 && (
          <Animated.View style={{ opacity: s3.opacity, transform: [{ translateY: s3.translateY }] }}>
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>🔴</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  HIGH RISK CLAUSES ({highRiskClauses.length})
                </Text>
              </View>
              {highRiskClauses.map((c, i) => (
                <ClauseCard key={i} clause={c.clause} risk={c.risk as any} darkPatterns={c.dark_patterns} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Other Clauses — s4 */}
        {otherClauses.length > 0 && (
          <Animated.View style={{ opacity: s4.opacity, transform: [{ translateY: s4.translateY }] }}>
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>📄</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  ALL CLAUSES ({otherClauses.length})
                </Text>
              </View>
              {otherClauses.map((c, i) => (
                <ClauseCard key={i} clause={c.clause} risk={c.risk as any} darkPatterns={c.dark_patterns} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Back to Home */}
        <Button
          label="Back to Home"
          variant="secondary"
          onPress={() => router.replace('/' as any)}
          style={{ marginTop: spacing.lg }}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    borderRadius: radius.xl, borderWidth: 1,
    alignItems: 'center', paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  recBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.md },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  patternRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  issueRow: {
    borderLeftWidth: 3, paddingLeft: spacing.sm,
    marginTop: spacing.sm, paddingVertical: 2,
  },
});
