import { ViewStyle } from 'react-native';

export const anim = {
  fast: 200,
  normal: 320,
  slow: 500,
} as const;

export const darkTheme = {
  background: '#080C14',
  surface: '#0F1624',
  card: '#151D2E',
  border: '#1E2D47',
  accent: '#4FC3F7',
  accentSecondary: '#7C4DFF',
  riskHigh: '#FF4757',
  riskMedium: '#FFA726',
  riskLow: '#66BB6A',
  textPrimary: '#F0F4FF',
  textSecondary: '#8899BB',
  textMuted: '#4A5A78',
  gradient: ['#7C4DFF', '#4FC3F7'] as [string, string],
  gradients: {
    hero: ['#7C4DFF', '#4FC3F7'] as [string, string],
    danger: ['#FF4757', '#FFA726'] as [string, string],
    safe: ['#00BCD4', '#66BB6A'] as [string, string],
    surface: ['#1A2640', '#0F1624'] as [string, string],
  },
  shadow: {
    card: {
      shadowColor: '#4FC3F7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
    elevated: {
      shadowColor: '#4FC3F7',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,
  },
} as const;

export const lightTheme = {
  background: '#F0F4FF',
  surface: '#FFFFFF',
  card: '#F8FAFF',
  border: '#DDE3F0',
  accent: '#0288D1',
  accentSecondary: '#7C4DFF',
  riskHigh: '#FF4757',
  riskMedium: '#FFA726',
  riskLow: '#66BB6A',
  textPrimary: '#0A0F1E',
  textSecondary: '#4A5A78',
  textMuted: '#8899BB',
  gradient: ['#7C4DFF', '#4FC3F7'] as [string, string],
  gradients: {
    hero: ['#7C4DFF', '#4FC3F7'] as [string, string],
    danger: ['#FF4757', '#FFA726'] as [string, string],
    safe: ['#00BCD4', '#66BB6A'] as [string, string],
    surface: ['#FFFFFF', '#F0F4FF'] as [string, string],
  },
  shadow: {
    card: {
      shadowColor: '#1A1F38',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,
    elevated: {
      shadowColor: '#1A1F38',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    } as ViewStyle,
  },
} as const;

export type Theme = typeof darkTheme;

export const typography = {
  h1: { fontSize: 28, fontFamily: 'Inter_700Bold', lineHeight: 36 },
  h2: { fontSize: 22, fontFamily: 'Inter_600SemiBold', lineHeight: 30 },
  h3: { fontSize: 18, fontFamily: 'Inter_600SemiBold', lineHeight: 26 },
  body: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  caption: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
} as const;

export const spacing = {
  xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
} as const;
