import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api, HistoryItem } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius, anim } from '../../constants/theme';

const FEATURES = [
  { icon: '🕵️', label: 'Detects dark patterns', subtitle: 'Auto-renewal, forced consent, surveillance clauses' },
  { icon: '⚖️', label: 'Risk assessment', subtitle: 'High / Medium / Low risk rating per clause' },
  { icon: '💬', label: 'Plain English summary', subtitle: 'AI-generated explanation of what matters' },
];

const RISK_BORDER: Record<string, string> = {
  high: '#FF4757', medium: '#FFA726', low: '#66BB6A',
};

function FeatureCard({ icon, label, subtitle, delay }: { icon: string; label: string; subtitle: string; delay: number }) {
  const { theme } = useTheme();
  const { opacity, translateY } = useEntrance(delay);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: spacing.sm }}>
      <Card elevated>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{label}</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{subtitle}</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function RecentCard({ item, delay, onPress }: { item: HistoryItem; delay: number; onPress: () => void }) {
  const { theme } = useTheme();
  const { opacity, translateY } = useEntrance(delay);
  const borderColor = RISK_BORDER[item.risk_level] ?? theme.border;
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: spacing.sm }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Card elevated style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}>
          <View style={styles.recentRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.source_label}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={item.risk_level.toUpperCase()} variant={item.risk_level as any} />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  const shieldScale = useRef(new Animated.Value(0.7)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const { opacity: nameOpacity, translateY: nameY } = useEntrance(100);
  const { opacity: subtitleOpacity, translateY: subtitleY } = useEntrance(200);
  const { opacity: ctaOpacity, translateY: ctaY } = useEntrance(280);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(shieldScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      Animated.timing(shieldOpacity, { toValue: 1, duration: anim.normal, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    api.getHistory().then((h) => setRecent(h.slice(0, 3))).catch(() => {});
  }, []);

  const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting Hero */}
        <LinearGradient
          colors={[theme.gradients.hero[0] + '26', theme.gradients.hero[1] + '14', theme.background]}
          style={[styles.hero, { borderColor: theme.gradients.hero[0] + '33' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Animated.Text style={[styles.shield, { opacity: shieldOpacity, transform: [{ scale: shieldScale }] }]}>
            🛡️
          </Animated.Text>
          <Animated.Text style={[typography.h2, { color: theme.textPrimary, marginTop: spacing.sm, opacity: nameOpacity, transform: [{ translateY: nameY }] }]}>
            Hey, {name}!
          </Animated.Text>
          <Animated.Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs, textAlign: 'center', opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
            Know what you're agreeing to before you sign.
          </Animated.Text>
        </LinearGradient>

        {/* Gradient CTA */}
        <Animated.View style={[styles.ctaWrapper, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}>
          <LinearGradient
            colors={theme.gradients.hero}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.ctaInner}
              onPress={() => router.push('/upload' as any)}
              activeOpacity={0.85}
            >
              <Text style={[typography.bodyMedium, { color: '#FFFFFF', letterSpacing: 0.3 }]}>
                Analyze a Contract
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Features */}
        <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.xl }]}>
          WHAT EACV DOES
        </Text>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.label} {...f} delay={360 + i * 60} />
        ))}

        {/* Recent analyses */}
        {recent.length > 0 && (
          <>
            <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
              RECENT ANALYSES
            </Text>
            {recent.map((item, i) => (
              <RecentCard
                key={item.id}
                item={item}
                delay={500 + i * 60}
                onPress={() => router.push(`/result/${item.id}` as any)}
              />
            ))}
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  shield: { fontSize: 56 },
  ctaWrapper: { marginBottom: spacing.lg },
  ctaGradient: { borderRadius: radius.md, overflow: 'hidden' },
  ctaInner: { height: 52, alignItems: 'center', justifyContent: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
