import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, radius, spacing } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label && <Text style={[typography.label, { color: theme.textSecondary, marginBottom: spacing.xs }]}>{label}</Text>}
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: focused ? theme.accent : error ? theme.riskHigh : theme.border,
            color: theme.textPrimary,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
      />
      {error && <Text style={[typography.caption, { color: theme.riskHigh, marginTop: spacing.xs }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 52, borderRadius: radius.md, borderWidth: 1,
    paddingHorizontal: spacing.md, ...typography.body,
  },
});
