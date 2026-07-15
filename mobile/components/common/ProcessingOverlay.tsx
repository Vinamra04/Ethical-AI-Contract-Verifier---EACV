import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { typography, spacing } from '../../constants/theme';

const STEPS = ['Extracting text', 'Analyzing clauses', 'Detecting patterns', 'Building report'];

export function ProcessingOverlay({ visible }: { visible: boolean }) {
  const { theme } = useTheme();
  const pulse = useSharedValue(0.4);

  useEffect(() => {
    if (visible) {
      pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    }
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.background + 'F0' }]}>
        <Animated.View style={[styles.iconWrap, pulseStyle, { backgroundColor: theme.accent + '22' }]}>
          <Text style={{ fontSize: 40 }}>🛡️</Text>
        </Animated.View>
        <Text style={[typography.h3, { color: theme.textPrimary, marginTop: spacing.xl }]}>Analyzing document…</Text>
        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <Text key={i} style={[typography.body, { color: theme.textMuted, marginTop: spacing.sm }]}>· {step}</Text>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconWrap: { width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  steps: { marginTop: spacing.lg, alignItems: 'center' },
});
