# UI/UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the EACV mobile app to production-quality UI with bold gradients, entrance animations, swipe-to-delete history, expanded settings with delete account, and a Back-to-Home result screen button.

**Architecture:** Extend `constants/theme.ts` with gradient/shadow/animation tokens, create a shared `useEntrance` animation hook, upgrade base components (`Card`, `Button`, `SwipeableRow`), then apply these primitives across all screens. Backend adds a `DELETE /account` endpoint following the same `get_user_id` Depends pattern used in `analyze.py` and `history.py`.

**Tech Stack:** React Native (Expo), TypeScript, expo-linear-gradient, react-native-gesture-handler (Swipeable), FastAPI (Python), Supabase

---

## File Map

| Action | Path |
|--------|------|
| Modify | `EACV/mobile/constants/theme.ts` |
| Create | `EACV/mobile/hooks/useEntrance.ts` |
| Modify | `EACV/mobile/components/ui/Card.tsx` |
| Modify | `EACV/mobile/components/ui/Button.tsx` |
| Create | `EACV/mobile/components/ui/SwipeableRow.tsx` |
| Modify | `EACV/mobile/components/analysis/RiskGauge.tsx` |
| Modify | `EACV/mobile/app/(tabs)/index.tsx` |
| Modify | `EACV/mobile/app/result/[id].tsx` |
| Modify | `EACV/mobile/app/(tabs)/upload.tsx` |
| Modify | `EACV/mobile/app/(tabs)/history.tsx` |
| Create | `EACV/backend/api/routes/account.py` |
| Modify | `EACV/backend/main.py` |
| Modify | `EACV/mobile/lib/api.ts` |
| Modify | `EACV/mobile/context/AuthContext.tsx` |
| Modify | `EACV/mobile/app/(tabs)/settings.tsx` |
| Modify | `EACV/mobile/app/(tabs)/_layout.tsx` |

---

## Task 1: Extend Design Tokens in theme.ts

**Files:**
- Modify: `EACV/mobile/constants/theme.ts`

- [ ] **Step 1: Replace the full contents of `constants/theme.ts`**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd EACV/mobile && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to theme.ts).

- [ ] **Step 3: Commit**

```bash
git add EACV/mobile/constants/theme.ts
git commit -m "feat: extend theme tokens with gradients, shadows, and anim presets"
```

---

## Task 2: Create useEntrance Animation Hook

**Files:**
- Create: `EACV/mobile/hooks/useEntrance.ts`

- [ ] **Step 1: Create the hooks directory and file**

```typescript
// EACV/mobile/hooks/useEntrance.ts
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { anim } from '../constants/theme';

export function useEntrance(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: anim.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: anim.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY };
}
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/hooks/useEntrance.ts
git commit -m "feat: add useEntrance animation hook for staggered card entrances"
```

---

## Task 3: Upgrade Card Component

**Files:**
- Modify: `EACV/mobile/components/ui/Card.tsx`

- [ ] **Step 1: Replace full contents of `Card.tsx`**

```typescript
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: Props) {
  const { theme } = useTheme();

  if (elevated) {
    return (
      <LinearGradient
        colors={theme.gradients.surface}
        style={[styles.card, theme.shadow.elevated, { borderColor: theme.border, borderWidth: 1 }, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, theme.shadow.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd EACV/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add EACV/mobile/components/ui/Card.tsx
git commit -m "feat: add elevated prop to Card with gradient background and depth shadow"
```

---

## Task 4: Upgrade Button Component

**Files:**
- Modify: `EACV/mobile/components/ui/Button.tsx`

- [ ] **Step 1: Replace full contents of `Button.tsx`**

```typescript
import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { typography, radius, spacing } from '../../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  leftIcon?: string;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, leftIcon }: Props) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  const bg =
    variant === 'primary' ? theme.accent
    : variant === 'danger' ? theme.riskHigh
    : variant === 'secondary' ? theme.card
    : 'transparent';

  const textColor =
    variant === 'primary' ? '#080C14'
    : variant === 'danger' ? '#FFFFFF'
    : theme.textPrimary;

  const borderWidth = variant === 'secondary' ? 1 : 0;

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: disabled ? 0.5 : 1 }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.base, { backgroundColor: bg, borderColor: theme.border, borderWidth }, style]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.inner}>
            {leftIcon ? <Text style={[styles.icon, { color: textColor }]}>{leftIcon}</Text> : null}
            <Text style={[typography.bodyMedium, { color: textColor }]}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { fontSize: 16 },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/components/ui/Button.tsx
git commit -m "feat: add danger variant and leftIcon prop to Button"
```

---

## Task 5: Create SwipeableRow Component

**Files:**
- Create: `EACV/mobile/components/ui/SwipeableRow.tsx`

- [ ] **Step 1: Create the file**

```typescript
// EACV/mobile/components/ui/SwipeableRow.tsx
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { radius, spacing } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableRow({ children, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = (_: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const opacity = dragX.interpolate({
      inputRange: [-80, -40],
      outputRange: [1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.deletePanel, { opacity }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            swipeRef.current?.close();
            onDelete();
          }}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
          <Text style={styles.deleteLabel}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deletePanel: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4757',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 2,
  },
  deleteIcon: { fontSize: 20 },
  deleteLabel: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_500Medium' },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/components/ui/SwipeableRow.tsx
git commit -m "feat: add SwipeableRow component for swipe-to-delete pattern"
```

---

## Task 6: Upgrade RiskGauge

**Files:**
- Modify: `EACV/mobile/components/analysis/RiskGauge.tsx`

- [ ] **Step 1: Replace full contents of `RiskGauge.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../constants/theme';

const SIZE = 200;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GLOW_RADIUS = RADIUS;
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
      {/* Track circle */}
      <Svg width={SIZE} height={SIZE}>
        {/* Outer glow ring — static, purely decorative */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={GLOW_RADIUS}
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
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/components/analysis/RiskGauge.tsx
git commit -m "feat: add outer glow ring to RiskGauge and increase size to 200"
```

---

## Task 7: Upgrade Home Screen

**Files:**
- Modify: `EACV/mobile/app/(tabs)/index.tsx`

- [ ] **Step 1: Replace full contents of `app/(tabs)/index.tsx`**

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api, HistoryItem } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius, anim } from '../../constants/theme';

const FEATURES = [
  { icon: '🕵️', label: 'Detects dark patterns', subtitle: 'Auto-renewal, forced consent, surveillance clauses' },
  { icon: '⚖️', label: 'Risk assessment', subtitle: 'High / Medium / Low risk rating per clause' },
  { icon: '💬', label: 'Plain English summary', subtitle: 'AI-generated explanation of what matters' },
];

const RISK_BORDER: Record<string, string> = {
  high: '#FF4757', medium: '#FFA726', low: '#66BB6A',
};

function FeatureCard({ icon, label, subtitle, delay }: { icon: string; label: string; subtitle: string; delay: number }) {
  const { theme } = useTheme();
  const { opacity, translateY } = useEntrance(delay);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: spacing.sm }}>
      <Card elevated>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{label}</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>{subtitle}</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function RecentCard({ item, delay, onPress }: { item: HistoryItem; delay: number; onPress: () => void }) {
  const { theme } = useTheme();
  const { opacity, translateY } = useEntrance(delay);
  const borderColor = RISK_BORDER[item.risk_level] ?? theme.border;
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: spacing.sm }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <Card elevated style={{ borderLeftWidth: 3, borderLeftColor: borderColor }}>
          <View style={styles.recentRow}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.source_label}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={item.risk_level.toUpperCase()} variant={item.risk_level as any} />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  const shieldScale = useRef(new Animated.Value(0.7)).current;
  const shieldOpacity = useRef(new Animated.Value(0)).current;
  const { opacity: nameOpacity, translateY: nameY } = useEntrance(100);
  const { opacity: subtitleOpacity, translateY: subtitleY } = useEntrance(200);
  const { opacity: ctaOpacity, translateY: ctaY } = useEntrance(280);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(shieldScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      Animated.timing(shieldOpacity, { toValue: 1, duration: anim.normal, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    api.getHistory().then((h) => setRecent(h.slice(0, 3))).catch(() => {});
  }, []);

  const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting Hero */}
        <LinearGradient
          colors={[theme.gradients.hero[0] + '26', theme.gradients.hero[1] + '14', theme.background]}
          style={[styles.hero, { borderColor: theme.gradients.hero[0] + '33' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <Animated.Text style={[styles.shield, { opacity: shieldOpacity, transform: [{ scale: shieldScale }] }]}>
            🛡️
          </Animated.Text>
          <Animated.Text style={[typography.h2, { color: theme.textPrimary, marginTop: spacing.sm, opacity: nameOpacity, transform: [{ translateY: nameY }] }]}>
            Hey, {name}!
          </Animated.Text>
          <Animated.Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs, textAlign: 'center', opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
            Know what you're agreeing to before you sign.
          </Animated.Text>
        </LinearGradient>

        {/* Gradient CTA */}
        <Animated.View style={[styles.ctaWrapper, { opacity: ctaOpacity, transform: [{ translateY: ctaY }] }]}>
          <LinearGradient
            colors={theme.gradients.hero}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={styles.ctaInner}
              onPress={() => router.push('/upload' as any)}
              activeOpacity={0.85}
            >
              <Text style={[typography.bodyMedium, { color: '#FFFFFF', letterSpacing: 0.3 }]}>
                Analyze a Contract
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Features */}
        <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.xl }]}>
          WHAT EACV DOES
        </Text>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.label} {...f} delay={360 + i * 60} />
        ))}

        {/* Recent analyses */}
        {recent.length > 0 && (
          <>
            <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
              RECENT ANALYSES
            </Text>
            {recent.map((item, i) => (
              <RecentCard
                key={item.id}
                item={item}
                delay={500 + i * 60}
                onPress={() => router.push(`/result/${item.id}` as any)}
              />
            ))}
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  shield: { fontSize: 56 },
  ctaWrapper: { marginBottom: spacing.lg },
  ctaGradient: { borderRadius: radius.md, overflow: 'hidden' },
  ctaInner: { height: 52, alignItems: 'center', justifyContent: 'center' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/(tabs)/index.tsx
git commit -m "feat: upgrade Home screen with gradient hero, staggered animations, and elevated cards"
```

---

## Task 8: Upgrade Result Screen

**Files:**
- Modify: `EACV/mobile/app/result/[id].tsx`

- [ ] **Step 1: Replace full contents of `app/result/[id].tsx`**

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { api, AnalysisResult } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { RiskGauge } from '../../components/analysis/RiskGauge';
import { ClauseCard } from '../../components/analysis/ClauseCard';
import { DarkPatternBadge } from '../../components/analysis/DarkPatternBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius } from '../../constants/theme';

const REC_CONFIG = {
  safe:    { icon: '✅', label: 'Safe to Proceed',              color: '#66BB6A' },
  caution: { icon: '⚠️', label: 'Proceed with Caution',         color: '#FFA726' },
  risky:   { icon: '🚨', label: 'High Risk — Review Carefully', color: '#FF4757' },
};

export default function ResultScreen() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Section entrance animations — called unconditionally (hooks must not be in loops)
  const s0 = useEntrance(100);
  const s1 = useEntrance(180);
  const s2 = useEntrance(260);
  const s3 = useEntrance(340);
  const s4 = useEntrance(420);

  useEffect(() => {
    if (data) {
      try { setResult(JSON.parse(data)); } catch {}
      setLoading(false);
    } else {
      api.getAnalysis(id).then(setResult).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header title="Analysis Result" showBack />
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.md }]}>
            Loading result…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Header title="Analysis Result" showBack />
        <View style={styles.center}>
          <Text style={{ fontSize: 40 }}>❌</Text>
          <Text style={[typography.h3, { color: theme.textPrimary, marginTop: spacing.md }]}>
            Result not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const rec = REC_CONFIG[result.recommendation];
  const riskColor =
    result.risk_level === 'high' ? theme.riskHigh
    : result.risk_level === 'medium' ? theme.riskMedium
    : theme.riskLow;

  const recGradient: [string, string] =
    result.recommendation === 'risky' ? theme.gradients.danger
    : result.recommendation === 'caution' ? theme.gradients.hero
    : theme.gradients.safe;

  const highRiskClauses = result.clause_results.filter((c) => c.risk === 'High Risk');
  const otherClauses = result.clause_results.filter((c) => c.risk !== 'High Risk');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="Analysis Result" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Risk Hero */}
        <LinearGradient
          colors={[riskColor + '28', riskColor + '08', theme.background]}
          style={[styles.hero, { borderColor: riskColor + '44' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <RiskGauge level={result.risk_level} />
        </LinearGradient>

        {/* Recommendation Banner */}
        <LinearGradient
          colors={[recGradient[0] + '22', recGradient[1] + '22']}
          style={[styles.recBanner, { borderColor: rec.color + '44' }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Text style={{ fontSize: 22 }}>{rec.icon}</Text>
          <Text style={[typography.bodyMedium, { color: rec.color, marginLeft: spacing.sm, flex: 1 }]}>
            {rec.label}
          </Text>
        </LinearGradient>

        {/* Summary — s0 */}
        <Animated.View style={{ opacity: s0.opacity, transform: [{ translateY: s0.translateY }] }}>
          <Card elevated style={styles.section}>
            <View style={styles.sectionTitle}>
              <Text style={{ fontSize: 16 }}>📋</Text>
              <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>SUMMARY</Text>
            </View>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.sm, lineHeight: 22 }]}>
              {result.explanation}
            </Text>
          </Card>
        </Animated.View>

        {/* Dark Patterns — s1 */}
        {result.dark_patterns_detected.length > 0 && (
          <Animated.View style={{ opacity: s1.opacity, transform: [{ translateY: s1.translateY }] }}>
            <Card elevated style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>🕵️</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  DARK PATTERNS ({result.dark_patterns_detected.length})
                </Text>
              </View>
              <View style={styles.patternRow}>
                {result.dark_patterns_detected.map((p) => <DarkPatternBadge key={p} pattern={p} />)}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Issues — s2 */}
        {result.issues.length > 0 && (
          <Animated.View style={{ opacity: s2.opacity, transform: [{ translateY: s2.translateY }] }}>
            <Card elevated style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  KEY ISSUES ({result.issues.length})
                </Text>
              </View>
              {result.issues.map((issue, i) => (
                <View key={i} style={[styles.issueRow, { borderLeftColor: theme.riskHigh }]}>
                  <Text style={[typography.body, { color: theme.textSecondary, flex: 1 }]}>{issue}</Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* High Risk Clauses — s3 */}
        {highRiskClauses.length > 0 && (
          <Animated.View style={{ opacity: s3.opacity, transform: [{ translateY: s3.translateY }] }}>
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>🔴</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  HIGH RISK CLAUSES ({highRiskClauses.length})
                </Text>
              </View>
              {highRiskClauses.map((c, i) => (
                <ClauseCard key={i} clause={c.clause} risk={c.risk as any} darkPatterns={c.dark_patterns} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Other Clauses — s4 */}
        {otherClauses.length > 0 && (
          <Animated.View style={{ opacity: s4.opacity, transform: [{ translateY: s4.translateY }] }}>
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Text style={{ fontSize: 16 }}>📄</Text>
                <Text style={[typography.label, { color: theme.textMuted, letterSpacing: 1, marginLeft: spacing.xs }]}>
                  ALL CLAUSES ({otherClauses.length})
                </Text>
              </View>
              {otherClauses.map((c, i) => (
                <ClauseCard key={i} clause={c.clause} risk={c.risk as any} darkPatterns={c.dark_patterns} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Back to Home */}
        <Button
          label="Back to Home"
          variant="secondary"
          onPress={() => router.replace('/' as any)}
          style={{ marginTop: spacing.lg }}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    borderRadius: radius.xl, borderWidth: 1,
    alignItems: 'center', paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  recBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.md },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  patternRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  issueRow: {
    borderLeftWidth: 3, paddingLeft: spacing.sm,
    marginTop: spacing.sm, paddingVertical: 2,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/result/[id].tsx
git commit -m "feat: upgrade Result screen with gradient banner, section animations, and Back to Home button"
```

---

## Task 9: Upgrade Upload Screen

**Files:**
- Modify: `EACV/mobile/app/(tabs)/upload.tsx`

- [ ] **Step 1: Replace full contents of `app/(tabs)/upload.tsx`**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius } from '../../constants/theme';

const INPUT_METHODS = [
  { id: 'text',  icon: '📝', label: 'Paste Text',   subtitle: 'Copy & paste T&C content directly' },
  { id: 'url',   icon: '🌐', label: 'From URL',      subtitle: 'Analyze any webpage or online policy' },
  { id: 'file',  icon: '📄', label: 'Upload PDF',    subtitle: 'From your documents or downloads' },
  { id: 'image', icon: '📷', label: 'Scan Image',    subtitle: 'Photo of a printed document' },
];

function MethodCard({ id, icon, label, subtitle, delay }: typeof INPUT_METHODS[number] & { delay: number }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { opacity, translateY } = useEntrance(delay);
  const scale = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }], width: '47%' }}>
      <TouchableOpacity
        onPress={() => router.push(`/analyze/${id}` as any)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <Card elevated style={styles.card}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[typography.bodyMedium, { color: theme.textPrimary, marginTop: spacing.sm }]}>
            {label}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
            {subtitle}
          </Text>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function UploadScreen() {
  const { theme } = useTheme();
  const { opacity: headerOpacity, translateY: headerY } = useEntrance(0);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <Text style={[typography.h2, { color: theme.textPrimary }]}>Analyze a Contract</Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            Choose how you'd like to provide the document
          </Text>
        </Animated.View>

        <View style={styles.grid}>
          {INPUT_METHODS.map((method, i) => (
            <MethodCard key={method.id} {...method} delay={80 + i * 60} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginTop: spacing.md, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { minHeight: 120 },
  icon: { fontSize: 32 },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/(tabs)/upload.tsx
git commit -m "feat: upgrade Upload screen with elevated cards and staggered entrance animations"
```

---

## Task 10: Upgrade History Screen

**Files:**
- Modify: `EACV/mobile/app/(tabs)/history.tsx`

- [ ] **Step 1: Replace full contents of `app/(tabs)/history.tsx`**

```typescript
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { api, HistoryItem } from '../../lib/api';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SwipeableRow } from '../../components/ui/SwipeableRow';
import { EmptyState } from '../../components/common/EmptyState';
import { useEntrance } from '../../hooks/useEntrance';
import { typography, spacing, radius } from '../../constants/theme';

const RISK_BORDER: Record<string, string> = {
  high: '#FF4757', medium: '#FFA726', low: '#66BB6A',
};

function HistoryRow({ item, onDeleted, onPress, delay }: {
  item: HistoryItem;
  onDeleted: () => void;
  onPress: () => void;
  delay: number;
}) {
  const { theme } = useTheme();
  const { opacity: entranceOpacity, translateY } = useEntrance(delay);
  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const borderColor = RISK_BORDER[item.risk_level] ?? theme.border;

  const handleDelete = () => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Animated.timing(deleteOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(async () => {
              await api.deleteAnalysis(item.id);
              onDeleted();
            });
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={{
      opacity: Animated.multiply(entranceOpacity, deleteOpacity),
      transform: [{ translateY }],
    }}>
      <SwipeableRow onDelete={handleDelete}>
        <Card elevated style={[styles.row, { borderLeftWidth: 3, borderLeftColor: borderColor }]}>
          <TouchableOpacity onPress={onPress} style={styles.rowInner} activeOpacity={0.8}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.source_label}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Badge label={item.risk_level.toUpperCase()} variant={item.risk_level as any} />
          </TouchableOpacity>
        </Card>
      </SwipeableRow>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await api.getHistory()); } catch {}
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <Header title="History" />
      <ScrollView
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState icon="📋" title="No analyses yet" subtitle="Analyze a document to see your history here." />
        ) : (
          items.map((item, i) => (
            <HistoryRow
              key={item.id}
              item={item}
              delay={i * 50}
              onDeleted={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              onPress={() => router.push(`/result/${item.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.md },
  emptyContainer: { flex: 1 },
  row: { marginBottom: spacing.sm },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/(tabs)/history.tsx
git commit -m "feat: upgrade History screen with swipe-to-delete, fade-out animation, and colored risk borders"
```

---

## Task 11: Add Backend DELETE /account Endpoint

**Files:**
- Create: `EACV/backend/api/routes/account.py`
- Modify: `EACV/backend/main.py`

- [ ] **Step 1: Create `account.py`**

```python
# EACV/backend/api/routes/account.py
import logging
from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase import get_client

logger = logging.getLogger(__name__)
router = APIRouter()
bearer = HTTPBearer()


def get_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    token = credentials.credentials
    res = get_client().auth.get_user(token)
    if not res.user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return res.user.id


@router.delete("")
def delete_account(user_id: str = Depends(get_user_id)):
    """Delete all analyses for the user, then delete the Supabase auth user."""
    client = get_client()
    try:
        client.table("analyses").delete().eq("user_id", user_id).execute()
        logger.info("Deleted all analyses for user=%s", user_id)
    except Exception as e:
        logger.error("Failed to delete analyses for user=%s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete user data")

    try:
        client.auth.admin.delete_user(user_id)
        logger.info("Deleted auth user=%s", user_id)
    except Exception as e:
        logger.error("Failed to delete auth user=%s: %s", user_id, e)
        raise HTTPException(status_code=500, detail="Failed to delete account")

    return Response(status_code=204)
```

- [ ] **Step 2: Register the router in `main.py`**

Replace the import line and `include_router` section in `EACV/backend/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.startup import load_model
from api.routes import analyze, history, account

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model(app)
    yield

app = FastAPI(title="EACV API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(history.router, prefix="/history", tags=["history"])
app.include_router(account.router, prefix="/account", tags=["account"])

@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 3: Write a test for the delete endpoint**

```python
# EACV/backend/tests/test_account.py
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _mock_bearer(user_id: str):
    """Return a patcher that makes get_user_id always return user_id."""
    from api.routes.account import get_user_id
    app.dependency_overrides[get_user_id] = lambda: user_id
    return user_id


def teardown_function():
    app.dependency_overrides.clear()


def test_delete_account_success():
    _mock_bearer("user-123")
    mock_client = MagicMock()
    mock_client.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock()
    mock_client.auth.admin.delete_user.return_value = MagicMock()

    with patch("api.routes.account.get_client", return_value=mock_client):
        resp = client.delete("/account", headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 204
    mock_client.table.assert_called_once_with("analyses")
    mock_client.auth.admin.delete_user.assert_called_once_with("user-123")


def test_delete_account_analyses_failure_returns_500():
    _mock_bearer("user-456")
    mock_client = MagicMock()
    mock_client.table.return_value.delete.return_value.eq.return_value.execute.side_effect = Exception("db error")

    with patch("api.routes.account.get_client", return_value=mock_client):
        resp = client.delete("/account", headers={"Authorization": "Bearer fake"})

    assert resp.status_code == 500
```

- [ ] **Step 4: Run the tests**

```bash
cd EACV/backend && python -m pytest tests/test_account.py -v
```

Expected output:
```
tests/test_account.py::test_delete_account_success PASSED
tests/test_account.py::test_delete_account_analyses_failure_returns_500 PASSED
```

- [ ] **Step 5: Commit**

```bash
git add EACV/backend/api/routes/account.py EACV/backend/main.py EACV/backend/tests/test_account.py
git commit -m "feat: add DELETE /account endpoint to delete user data and auth record"
```

---

## Task 12: Add deleteAccount to api.ts and AuthContext

**Files:**
- Modify: `EACV/mobile/lib/api.ts`
- Modify: `EACV/mobile/context/AuthContext.tsx`

- [ ] **Step 1: Add `deleteAccount` to `api.ts`**

Add the following method to the `api` object in `EACV/mobile/lib/api.ts` (after the `deleteAnalysis` method):

```typescript
  async deleteAccount(): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/account`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error('Failed to delete account');
  },
```

- [ ] **Step 2: Replace full contents of `context/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null, user: null, loading: true,
  signOut: async () => {},
  deleteAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  const deleteAccount = async () => {
    await api.deleteAccount();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 3: Commit**

```bash
git add EACV/mobile/lib/api.ts EACV/mobile/context/AuthContext.tsx
git commit -m "feat: add deleteAccount method to api.ts and AuthContext"
```

---

## Task 13: Upgrade Settings Screen

**Files:**
- Modify: `EACV/mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: Replace full contents of `app/(tabs)/settings.tsx`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/(tabs)/settings.tsx
git commit -m "feat: expand Settings screen with gradient avatar, danger zone, and delete account"
```

---

## Task 14: Upgrade Tab Bar

**Files:**
- Modify: `EACV/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Replace full contents of `app/(tabs)/_layout.tsx`**

```typescript
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

function TabIcon({ emoji, focused, gradients }: { emoji: string; focused: boolean; gradients: [string, string] }) {
  if (focused) {
    return (
      <LinearGradient
        colors={[gradients[0] + '33', gradients[1] + '33']}
        style={{ width: 36, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </LinearGradient>
    );
  }
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function AppLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_500Medium' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} gradients={theme.gradients.hero} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add EACV/mobile/app/(tabs)/_layout.tsx
git commit -m "feat: upgrade tab bar with gradient active pill, no border, upward shadow"
```

---

## Task 15: Final TypeScript Check

- [ ] **Step 1: Run TypeScript compiler across the mobile project**

```bash
cd EACV/mobile && npx tsc --noEmit 2>&1
```

Expected: zero new errors. If `theme.gradients` or `theme.shadow` show type errors due to `lightTheme` not being assignable to `Theme`, add a cast in `ThemeContext.tsx`:

```typescript
// In ThemeProvider, change:
const theme = isDark ? darkTheme : lightTheme;
// To:
const theme = (isDark ? darkTheme : lightTheme) as unknown as Theme;
```

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "fix: resolve any residual TypeScript errors after UI upgrade"
```

---

## Self-Review Checklist

| Spec requirement | Covered by |
|-----------------|------------|
| Back to Home button on result screen | Task 8 |
| Gradient hero section on home | Task 7 |
| Staggered entrance animations | Tasks 7–10 (useEntrance hook) |
| Elevated cards with shadows | Tasks 3, 7–10, 13 |
| Swipe-to-delete on history | Task 10 (SwipeableRow) |
| Confirmation dialog on delete | Task 10 (Alert in HistoryRow) |
| Fade-out animation on row removal | Task 10 (deleteOpacity animation) |
| Gradient avatar + account section | Task 13 |
| Logout in account section | Task 13 |
| Danger zone + delete account | Task 13 |
| Double-confirm delete account | Task 13 (nested Alert) |
| Backend DELETE /account endpoint | Task 11 |
| deleteAccount in AuthContext | Task 12 |
| Tab bar gradient active pill | Task 14 |
| Tab bar no border + upward shadow | Task 14 |
| Dark/light mode parity | All tasks (use theme.gradients.surface, theme.shadow) |
| `useNativeDriver: true` on all entrance animations | Task 2 |
| RiskGauge glow ring | Task 6 |
| Upload screen elevated + press depth | Task 9 |
