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

export default function TextAnalyzeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (text.trim().length < 50) { Alert.alert('Too short', 'Please paste at least 50 characters of text.'); return; }
    setLoading(true);
    try {
      const result = await api.analyzeText(text);
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
      <Header title="Paste Text" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Terms & Conditions or Privacy Policy"
          value={text}
          onChangeText={setText}
          multiline
          style={{ height: 300, textAlignVertical: 'top', paddingTop: spacing.sm }}
          placeholder="Paste the full text here..."
        />
        <View style={{ height: spacing.lg }} />
        <Button label="Analyze Document" onPress={handleAnalyze} loading={loading} disabled={text.length < 50} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
});
