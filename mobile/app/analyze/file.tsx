import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { typography, spacing } from '../../constants/theme';

export default function FileAnalyzeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [file, setFile] = useState<{ uri: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets[0]) {
      setFile({ uri: result.assets[0].uri, name: result.assets[0].name });
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await api.analyzeFile(file.uri, file.name);
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
      <Header title="Upload PDF" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Button label="Choose PDF File" onPress={pickFile} variant="secondary" />
        {file && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>📄 {file.name}</Text>
          </Card>
        )}
        <View style={{ height: spacing.lg }} />
        <Button label="Analyze PDF" onPress={handleAnalyze} loading={loading} disabled={!file} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, content: { padding: spacing.md } });
