import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { typography, spacing } from '../../constants/theme';

export default function SignupScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name) { Alert.alert('Missing fields', 'Please fill in all fields.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
    setLoading(false);
    if (error) Alert.alert('Signup failed', error.message);
    else Alert.alert('Check your email', 'We sent you a confirmation link.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logoArea}>
        <LinearGradient colors={theme.gradient} style={styles.logoMark} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.logoIcon}>🛡️</Text>
        </LinearGradient>
        <Text style={[typography.h1, { color: theme.textPrimary, marginTop: spacing.md }]}>Create Account</Text>
      </View>
      <View style={styles.form}>
        <Input label="Display Name" value={name} onChangeText={setName} placeholder="Your name" />
        <View style={{ height: spacing.md }} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <View style={{ height: spacing.md }} />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <View style={{ height: spacing.lg }} />
        <Button label="Create Account" onPress={handleSignup} loading={loading} />
      </View>
      <TouchableOpacity onPress={() => router.back()} style={styles.switchRow}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>
          Already have an account? <Text style={{ color: theme.accent }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logoArea: { alignItems: 'center', marginBottom: spacing.xxl },
  logoMark: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 32 },
  form: {},
  switchRow: { marginTop: spacing.xl, alignItems: 'center' },
});
