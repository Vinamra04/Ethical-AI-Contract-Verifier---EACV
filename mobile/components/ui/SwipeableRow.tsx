import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
