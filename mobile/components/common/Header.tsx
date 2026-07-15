import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/theme';

interface Props {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function Header({ title, showBack, right }: Props) {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      {showBack
        ? <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={[typography.h3, { color: theme.accent }]}>←</Text>
          </TouchableOpacity>
        : <View style={styles.back} />
      }
      <Text style={[typography.h3, { color: theme.textPrimary }]}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1 },
  back: { width: 40 },
  right: { width: 40, alignItems: 'flex-end' },
});
