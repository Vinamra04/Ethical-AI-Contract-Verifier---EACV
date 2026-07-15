import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { typography, spacing, radius } from '../../constants/theme';

type ThemeMode = 'system' | 'dark' | 'light';
const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: '⚙️ System', value: 'system' },
  { label: '🌙 Dark',   value: 'dark' },
  { label: '☀️ Light',  value: 'light' },
];

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();

  const initial = (user?.user_metadata?.display_name ?? user?.email ?? 'U')[0].toUpperCase();
  const displayName = user?.user_metadata?.display_name ?? 'User';
  const email = user?.email ?? '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your analyses will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                    } catch {
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Account */}
        <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginBottom: spacing.sm }]}>
          ACCOUNT
        </Text>
        <Card elevated style={styles.section}>
          <View style={styles.accountRow}>
            <LinearGradient
              colors={theme.gradients.hero}
              style={styles.avatar}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: theme.textPrimary }]}>{displayName}</Text>
              <Text style={[typography.body, { color: theme.textSecondary, marginTop: 2 }]}>{email}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Button label="Sign Out" onPress={handleSignOut} variant="secondary" />
        </Card>

        {/* Appearance */}
        <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          APPEARANCE
        </Text>
        <Card elevated style={styles.section}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setMode(opt.value)}
                style={[styles.themeBtn, {
                  backgroundColor: mode === opt.value ? theme.accent + '22' : theme.surface,
                  borderColor: mode === opt.value ? theme.accent : theme.border,
                }]}
              >
                <Text style={[typography.label, { color: mode === opt.value ? theme.accent : theme.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Danger Zone */}
        <Text style={[typography.label, { color: theme.riskHigh, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          DANGER ZONE
        </Text>
        <Card elevated style={[styles.section, { borderLeftWidth: 3, borderLeftColor: theme.riskHigh }]}>
          <Text style={[typography.body, { color: theme.textSecondary, marginBottom: spacing.md }]}>
            Permanently delete your account and all associated analyses. This action cannot be undone.
          </Text>
          <Button label="Delete Account" onPress={handleDeleteAccount} variant="danger" />
        </Card>

        <Text style={[typography.caption, { color: theme.textMuted, textAlign: 'center', marginTop: spacing.xl }]}>
          EACV v1.0.0
        </Text>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  section: { marginBottom: spacing.sm },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatar: {
    width: 52, height: 52, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, marginVertical: spacing.md },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeBtn: { flex: 1, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center' },
});
