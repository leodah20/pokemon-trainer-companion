import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const STAGGER_DELAY_MS = 45;

export interface BottomSheetMenuItem {
  key: string;
  emoji: string;
  label: string;
  onPress: () => void;
}

interface BottomSheetMenuProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: readonly BottomSheetMenuItem[];
}

/**
 * A slide-up sheet with spring physics (a slight overshoot-and-settle bounce on open) plus a
 * staggered fade/slide-in for its menu items. Built on RN core `Animated`, not Reanimated —
 * this app deliberately avoids Reanimated to keep the Android build native-module-free (see
 * docs/dev-setup.md build history). `Animated.spring` still runs on the native thread via
 * `useNativeDriver: true` for transform/opacity, so it's not a JS-thread-bound approximation.
 */
export function BottomSheetMenu({ visible, onClose, title, items }: BottomSheetMenuProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // The spring physics: lower friction / higher tension = snappier with more bounce.
        // See the tuning notes below the component for how to adjust the feel.
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + SPACING.lg, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.grabber} />
        <Text style={styles.title}>{title}</Text>

        <View style={styles.itemsGrid}>
          {items.map((item, index) => (
            <StaggeredItem key={item.key} index={index} active={visible}>
              <Pressable
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <View style={styles.itemIconCircle}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            </StaggeredItem>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

interface StaggeredItemProps {
  index: number;
  active: boolean;
  children: React.ReactNode;
}

/** Fades + slides one grid item in, delayed by its index — the "staggered" entrance from the brief. */
function StaggeredItem({ index, active, children }: StaggeredItemProps): React.JSX.Element {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        delay: index * STAGGER_DELAY_MS,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const ITEM_WIDTH = '31%';

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: COLORS.scrimBackdrop,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.glassSurface,
    borderTopLeftRadius: RADIUS.lg + 8,
    borderTopRightRadius: RADIUS.lg + 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.glassBorder,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    ...SHADOW.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemIconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  itemEmoji: {
    fontSize: 26,
  },
  itemLabel: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
