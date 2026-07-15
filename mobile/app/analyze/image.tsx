import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/ui/Button';
import { spacing, radius } from '../../constants/theme';

export default function ImageAnalyzeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) setImage({ uri: result.assets[0].uri });
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Camera access is required.'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled) setImage({ uri: result.assets[0].uri });
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const filename = `scan_${Date.now()}.jpg`;
      const result = await api.analyzeImage(image.uri, filename);
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
      <Header title="Scan Image" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.btnRow}>
          <Button label="📷 Camera" onPress={takePhoto} variant="secondary" style={{ flex: 1 }} />
          <View style={{ width: spacing.sm }} />
          <Button label="🖼️ Gallery" onPress={pickImage} variant="secondary" style={{ flex: 1 }} />
        </View>
        {image && <Image source={{ uri: image.uri }} style={[styles.preview, { borderColor: theme.border }]} resizeMode="contain" />}
        <View style={{ height: spacing.lg }} />
        <Button label="Analyze Image" onPress={handleAnalyze} loading={loading} disabled={!image} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  btnRow: { flexDirection: 'row' },
  preview: { height: 240, borderRadius: radius.lg, marginTop: spacing.md, borderWidth: 1 },
});
