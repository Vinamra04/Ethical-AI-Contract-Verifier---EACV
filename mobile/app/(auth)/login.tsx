import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { typography, spacing, radius } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Login failed', error.message);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Must match one of the Redirect URLs in Supabase → Auth → URL Configuration.
      // With scheme "eacv" in app.json, Linking.createURL('/') produces "eacv:///".
      const redirectUrl = Linking.createURL('/');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (exchangeError) throw exchangeError;
      }
    } catch (e: any) {
      Alert.alert('Google login failed', e.message ?? 'Unknown error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Area */}
        <View style={styles.logoArea}>
          <LinearGradient
            colors={['#7C4DFF', '#4FC3F7']}
            style={styles.logoRing}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={[styles.logoInner, { backgroundColor: theme.background }]}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
          </LinearGradient>

          <Text style={[typography.h1, { color: theme.textPrimary, marginTop: spacing.lg, textAlign: 'center' }]}>
            Welcome back
          </Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            Sign in to protect your digital rights
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <View style={{ height: spacing.md }} />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="••••••••"
          />
          <View style={{ height: spacing.lg }} />
          <Button label="Sign In" onPress={handleLogin} loading={loading} />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[typography.caption, { color: theme.textMuted, marginHorizontal: spacing.sm }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google Login */}
          <Button
            label={googleLoading ? 'Opening Google…' : 'Continue with Google'}
            onPress={handleGoogleLogin}
            loading={googleLoading}
          />
        </View>

        {/* Switch to signup */}
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.switchRow}>
          <Text style={[typography.body, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: theme.accent, fontFamily: 'Inter_600SemiBold' }}>Create one</Text>
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: spacing.xl },
  logoRing: {
    width: 88, height: 88, borderRadius: radius.full,
    padding: 3, alignItems: 'center', justifyContent: 'center',
  },
  logoInner: {
    width: 82, height: 82, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  formCard: {
    borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1 },
  switchRow: { alignItems: 'center', paddingVertical: spacing.sm },
});
