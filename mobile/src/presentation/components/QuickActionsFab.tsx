import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { COLORS, PokeballIcon, SHADOW } from '../theme';

const PULSE_MIN_SCALE = 1;
const PULSE_MAX_SCALE = 1.08;
const PULSE_DURATION_MS = 1100;
const PRESS_SCALE = 0.9;

interface QuickActionsFabProps {
  onPress: () => void;
}

/**
 * The floating circular action button (Poke Ball-styled) in the bottom-right thumb zone.
 * Two independent animated values stacked on the same node: a slow continuous "breathing" pulse
 * (idle, loops forever) and a quick press-scale (interrupts nothing — Animated.spring on release
 * just settles the press scale back to 1, the pulse loop keeps running underneath).
 */
export function QuickActionsFab({ onPress }: QuickActionsFabProps): React.JSX.Element {
  const pulseScale = useRef(new Animated.Value(PULSE_MIN_SCALE)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: PULSE_MAX_SCALE,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: PULSE_MIN_SCALE,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseScale]);

  function handlePressIn(): void {
    Animated.spring(pressScale, { toValue: PRESS_SCALE, friction: 5, tension: 120, useNativeDriver: true }).start();
  }

  function handlePressOut(): void {
    Animated.spring(pressScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: Animated.multiply(pulseScale, pressScale) }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.button}
        accessibilityLabel="Open quick actions"
        accessibilityRole="button"
      >
        <PokeballIcon size={34} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
  },
});
