import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api, HistoryItem } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SwipeableRow } from '../../components/ui/SwipeableRow';
import { EmptyState } from '../../components/common/EmptyState';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing } from '../../constants/theme';

const RISK_BORDER: Record<string, string> = {
  high: '#FF4757', medium: '#FFA726', low: '#66BB6A',
};

function HistoryRow({ item, onDeleted, onPress, delay }: {
  item: HistoryItem;
  onDeleted: () => void;
  onPress: () => void;
  delay: number;
}) {
  const { theme } = useTheme();
  const { opacity: entranceOpacity, translateY } = useEntrance(delay);
  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const borderColor = RISK_BORDER[item.risk_level] ?? theme.border;

  const handleDelete = () => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.timing(deleteOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(async () => {
              await api.deleteAnalysis(item.id);
              onDeleted();
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={{
      opacity: Animated.multiply(entranceOpacity, deleteOpacity),
      transform: [{ translateY }],
    }}>
      <SwipeableRow onDelete={handleDelete}>
        <Card elevated style={[styles.row, { borderLeftWidth: 3, borderLeftColor: borderColor }]}>
          <TouchableOpacity onPress={onPress} style={styles.rowInner} activeOpacity={0.8}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.source_label}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={item.risk_level.toUpperCase()} variant={item.risk_level as any} />
          </TouchableOpacity>
        </Card>
      </SwipeableRow>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await api.getHistory()); } catch {}
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="History" />
      <ScrollView
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState icon="📋" title="No analyses yet" subtitle="Analyze a document to see your history here." />
        ) : (
          items.map((item, i) => (
            <HistoryRow
              key={item.id}
              item={item}
              delay={i * 50}
              onDeleted={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              onPress={() => router.push(`/result/${item.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.md },
  emptyContainer: { flex: 1 },
  row: { marginBottom: spacing.sm },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
