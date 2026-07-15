import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius } from '../../constants/theme';

const INPUT_METHODS = [
  { id: 'text',  icon: '📝', label: 'Paste Text',   subtitle: 'Copy & paste T&C content directly' },
  { id: 'url',   icon: '🌐', label: 'From URL',      subtitle: 'Analyze any webpage or online policy' },
  { id: 'file',  icon: '📄', label: 'Upload PDF',    subtitle: 'From your documents or downloads' },
  { id: 'image', icon: '📷', label: 'Scan Image',    subtitle: 'Photo of a printed document' },
];

function MethodCard({ id, icon, label, subtitle, delay }: typeof INPUT_METHODS[number] & { delay: number }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { opacity, translateY } = useEntrance(delay);
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }], width: '47%' }}>
      <TouchableOpacity
        onPress={() => router.push(`/analyze/${id}` as any)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Card elevated style={styles.card}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[typography.bodyMedium, { color: theme.textPrimary, marginTop: spacing.sm }]}>
            {label}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
            {subtitle}
          </Text>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function UploadScreen() {
  const { theme } = useTheme();
  const { opacity: headerOpacity, translateY: headerY } = useEntrance(0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <Text style={[typography.h2, { color: theme.textPrimary }]}>Analyze a Contract</Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            Choose how you'd like to provide the document
          </Text>
        </Animated.View>

        <View style={styles.grid}>
          {INPUT_METHODS.map((method, i) => (
            <MethodCard key={method.id} {...method} delay={80 + i * 60} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginTop: spacing.md, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { minHeight: 120 },
  icon: { fontSize: 32 },
});
