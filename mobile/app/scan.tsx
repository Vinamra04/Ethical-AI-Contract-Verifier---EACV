import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, radius } from '../constants/theme';

const INPUT_CARDS = [
  {
    id: 'text',
    icon: '📝',
    label: 'Paste Text',
    subtitle: 'Copy & paste any T&C or policy text',
    colors: ['#7C4DFF', '#5C35CC'] as [string, string],
  },
  {
    id: 'url',
    icon: '🌐',
    label: 'From URL',
    subtitle: 'Analyze any webpage directly',
    colors: ['#4FC3F7', '#0288D1'] as [string, string],
  },
  {
    id: 'file',
    icon: '📄',
    label: 'Upload PDF',
    subtitle: 'Pick a PDF from your files',
    colors: ['#FF7043', '#E64A19'] as [string, string],
  },
  {
    id: 'image',
    icon: '📷',
    label: 'Scan Image',
    subtitle: 'Photograph a printed document',
    colors: ['#66BB6A', '#388E3C'] as [string, string],
  },
];

export default function ScanScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.titleArea}>
          <Text style={[typography.h1, { color: theme.textPrimary }]}>Choose Input</Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            How would you like to provide the document?
          </Text>
        </View>

        <View style={styles.grid}>
          {INPUT_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.cardWrapper}
              onPress={() => router.push(`/analyze/${card.id}` as any)}
              activeOpacity={0.85}
            >
              <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <LinearGradient
                  colors={card.colors}
                  style={styles.iconCircle}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.icon}>{card.icon}</Text>
                </LinearGradient>
                <Text style={[typography.bodyMedium, { color: theme.textPrimary, marginTop: spacing.md }]}>
                  {card.label}
                </Text>
                <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4, lineHeight: 16 }]}>
                  {card.subtitle}
                </Text>
                <View style={[styles.arrow, { backgroundColor: theme.surface }]}>
                  <Text style={{ color: theme.accent, fontSize: 14 }}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.tipBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={{ fontSize: 16 }}>💡</Text>
          <Text style={[typography.caption, { color: theme.textSecondary, flex: 1, marginLeft: spacing.sm }]}>
            Our AI scans every clause for privacy risks, dark patterns, and hidden obligations.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  titleArea: { marginTop: spacing.sm, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardWrapper: { width: '48.5%' },
  card: {
    borderRadius: radius.xl, padding: spacing.md,
    borderWidth: 1, minHeight: 170,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 24 },
  arrow: {
    alignSelf: 'flex-end', marginTop: spacing.sm,
    width: 28, height: 28, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  tipBox: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.lg, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1,
  },
});
