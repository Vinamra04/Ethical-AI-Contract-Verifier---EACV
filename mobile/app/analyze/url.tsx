import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { spacing } from '../../constants/theme';

export default function UrlAnalyzeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!url.startsWith('http')) { Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://'); return; }
    setLoading(true);
    try {
      const result = await api.analyzeUrl(url);
      router.push({
        pathname: '/result/[id]',
        params: { id: result.id, data: JSON.stringify(result) },
      } as any);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="Analyze URL" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Website URL" value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" placeholder="https://example.com/terms" />
        <View style={{ height: spacing.lg }} />
        <Button label="Fetch & Analyze" onPress={handleAnalyze} loading={loading} disabled={!url} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: spacing.md } });
