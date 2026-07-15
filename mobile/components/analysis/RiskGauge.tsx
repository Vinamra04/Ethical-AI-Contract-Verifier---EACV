import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/theme';

const SIZE = 200;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GLOW_STROKE = STROKE * 2.5;

const LEVEL_FILL: Record<string, number> = {
  low: 0.25,
  medium: 0.55,
  high: 0.85,
};

const LEVEL_LABEL: Record<string, string> = {
  low: 'LOW RISK',
  medium: 'MED RISK',
  high: 'HIGH RISK',
};

interface Props {
  level: 'low' | 'medium' | 'high';
}

export function RiskGauge({ level }: Props) {
  const { theme } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  const riskColor =
    level === 'high' ? theme.riskHigh : level === 'medium' ? theme.riskMedium : theme.riskLow;
  const fill = LEVEL_FILL[level] ?? 0.25;
  const levelLabel = LEVEL_LABEL[level] ?? 'LOW RISK';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: fill,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [fill]);

  return (
    <View style={styles.container}>
      {/* Track circle with outer glow ring */}
      <Svg width={SIZE} height={SIZE}>
        {/* Outer glow ring — static, decorative */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={riskColor} strokeWidth={GLOW_STROKE} fill="none"
          strokeOpacity={0.12}
        />
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
          stroke={theme.border} strokeWidth={STROKE} fill="none"
        />
      </Svg>

      {/* Center label */}
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[typography.label, { color: riskColor, letterSpacing: 1.5, textAlign: 'center' }]}>
          {levelLabel}
        </Text>
      </View>

      {/* Filled arc */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke={riskColor} strokeWidth={STROKE} fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fill)}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignSelf: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
