# UI/UX Upgrade — Design Spec
**Date:** 2026-04-24
**Status:** Approved

---

## Overview

Full production-quality polish pass on the EACV mobile app. Design direction: bold fintech/health aesthetic — rich gradients, strong typographic hierarchy, native-feeling slide+fade entrance animations. Full dark/light mode parity throughout. No unnecessary looping animations; all transitions must run on the UI thread via `useNativeDriver: true`.

---

## 1. Design System Foundation (`constants/theme.ts` + new hook)

### New tokens added to both `darkTheme` and `lightTheme`

**Shadow tokens:**
- `shadow.card` — subtle: `shadowOffset {0,4}`, `shadowRadius 8`, `shadowOpacity 0.12` (dark: black; light: `#8899BB`)
- `shadow.elevated` — strong: `shadowOffset {0,8}`, `shadowRadius 16`, `shadowOpacity 0.20`

**Gradient tokens** (new `gradients` key — separate from existing `gradient` to preserve backward compatibility with `signup.tsx`):
- `gradients.hero` — `['#7C4DFF', '#4FC3F7']`
- `gradients.danger` — `['#FF4757', '#FFA726']`
- `gradients.safe` — `['#00BCD4', '#66BB6A']`
- `gradients.surface` — dark: `['#1A2640', '#0F1624']`; light: `['#FFFFFF', '#F0F4FF']`

Existing `theme.gradient` key is unchanged.

**Spacing token:**
- `spacing.xxs: 2`

**Animation presets:**
- `anim.fast: 200`
- `anim.normal: 320`
- `anim.slow: 500`

### `hooks/useEntrance.ts` (new file)

- Accepts `{ delay?: number }` param
- Returns `{ opacity: Animated.Value, translateY: Animated.Value }` already triggered
- Animates: `opacity` 0→1, `translateY` 16→0, duration `anim.normal`, `useNativeDriver: true`
- Default delay: 0ms. Cards pass `delay={index * 60}` for stagger.

---

## 2. Component Upgrades

### `Card` (`components/ui/Card.tsx`)
- New `elevated?: boolean` prop
- When `elevated=true`: applies `shadow.elevated` token + `LinearGradient` background using `gradients.surface` colors instead of flat `theme.card`
- Default behaviour unchanged

### `Button` (`components/ui/Button.tsx`)
- New `danger` variant: solid `theme.riskHigh` background, white text
- New `leftIcon?: string` prop: rendered left of label with `spacing.sm` gap

### `SwipeableRow` (`components/ui/SwipeableRow.tsx`) — new component
- Wraps `react-native-gesture-handler`'s `Swipeable`
- Swipe-left reveals red delete panel (width 80px) with trash icon + "Delete" label
- Accepts `onDelete: () => void` callback
- All swipe gesture logic lives here; screens stay clean

### `RiskGauge` (`components/analysis/RiskGauge.tsx`)
- Outer glow ring: second SVG `Circle` rendered statically at 20% opacity of risk color, radius + 8px — purely decorative, no animation (SVG stroke properties cannot use `useNativeDriver`)
- The existing arc animation already runs on the JS thread; no new animation thread is added

---

## 3. Home Screen (`app/(tabs)/index.tsx`)

- Greeting card: `LinearGradient` background (`gradients.hero` at 15% opacity), shield icon animates fade+scale on mount (delay 0ms)
- Username renders with `useEntrance({ delay: 100 })`, subtitle at 200ms
- CTA button: full-width gradient — implemented as a `LinearGradient` wrapper (`gradients.hero`) with `Button variant="ghost"` (transparent background) inside, so the existing Button press animation still works
- Feature cards: staggered `useEntrance` at 0 / 60 / 120ms delays
- Recent analyses rows: staggered `useEntrance`; each row has `borderLeftWidth: 3, borderLeftColor: riskColor` matching the row's risk level

---

## 4. Result Screen (`app/result/[id].tsx`)

- `RiskGauge` SIZE increased: 180→200
- Recommendation banner: `LinearGradient` background (`gradients.danger` for high / `gradients.hero` for medium / `gradients.safe` for low risk) at 15% opacity
- Each section card (SUMMARY, DARK PATTERNS, KEY ISSUES, HIGH RISK CLAUSES, ALL CLAUSES) gets `useEntrance` staggered by section index × 80ms
- **Back to Home button**: full-width `Button` (variant `secondary`, label "Back to Home") placed at the bottom of `ScrollView` content, navigates to `/(tabs)/` — always reachable after scrolling

---

## 5. Upload Screen (`app/(tabs)/upload.tsx`)

- Method cards get `elevated` prop
- Press scale deepens to 0.94 (currently 0.96)
- Each card gets `useEntrance` with stagger (0 / 60 / 120 / 180ms)

---

## 6. History Screen (`app/(tabs)/history.tsx`)

- Each row wrapped in `SwipeableRow` with `onDelete` → confirmation Alert → height-collapse animation (250ms) → remove from state
- Row cards get `elevated` prop + `borderLeftWidth: 3, borderLeftColor: riskColor` matching the row's risk level
- Empty state gets `useEntrance` fade+slide

---

## 7. Settings Screen (`app/(tabs)/settings.tsx`)

### Account section (elevated Card):
- Gradient avatar circle (initial letter) using `LinearGradient` + `Text`
- Display name (`typography.h3`) + email (`typography.body`, `textSecondary`)
- Logout button (`variant="secondary"`) directly inside the card

### Appearance section: unchanged

### Danger Zone section (elevated Card, 3px `riskHigh` left border):
- Label "DANGER ZONE" in `riskHigh` color, `typography.label`
- "Delete Account" button (`variant="danger"`)
- **Two-step confirmation:**
  1. Alert: "Delete your account?" — Cancel / Continue
  2. Alert: "All your analyses will be permanently deleted. This cannot be undone." — Cancel / Delete Account
- On confirm: calls `deleteAccount()` from `AuthContext`

### `AuthContext` addition:
- New `deleteAccount: () => Promise<void>` method
- Calls `DELETE /account` backend route (authenticated)
- Backend deletes all analyses for user, then calls Supabase Admin API to delete user record
- Frontend signs out on completion

### Backend addition (`api/routes/account.py`):
- `DELETE /account` endpoint — auth-gated
- Deletes all rows in `analyses` table where `user_id = current_user`
- Calls `supabase.auth.admin.delete_user(user_id)`
- Returns `204 No Content`

---

## 8. Tab Bar (`app/(tabs)/_layout.tsx`)

- Height: 60→70px, `paddingBottom`: 8→12px
- `borderTopWidth: 0`, upward shadow applied instead
- Active tab: gradient pill background (`gradients.hero` at 20% opacity, `borderRadius: 999`, 36×28px) — implemented via custom `tabBarIcon` render: when `focused=true`, wrap the emoji in a `LinearGradient` View of that size; when `focused=false`, render emoji directly

---

## Architecture Notes

- All animations use `useNativeDriver: true` — no layout-thread blocking
- `SwipeableRow` requires `react-native-gesture-handler` (already installed via Expo)
- `LinearGradient` via `expo-linear-gradient` (already used in result screen)
- No new third-party dependencies required
- `deleteAccount` backend route is the only backend file change in this spec
