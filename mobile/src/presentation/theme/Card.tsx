import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from './colors';
import { RADIUS, SPACING } from './spacing';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  /** Border + title-strip color. Pass the Pokemon's type color for themed cards. */
  accentColor?: string;
  /** Fill color override — defaults to COLORS.surface (white). */
  backgroundColor?: string;
  /** Tiny alternating rotation gives a hand-placed sticker feel; 0 disables it. */
  tilt?: number;
}

/**
 * A "sticker" panel meant to sit on top of the vivid gradient backgrounds: solid white fill so
 * content always has contrast, a thick ink outline, a hard offset shadow, and an optional slight
 * rotation. The shadow is drawn by an absolutely-positioned twin so the card itself keeps its
 * natural full width (the previous wrapper-based approach broke width: '100%' on children).
 */
export function Card({
  children,
  style,
  accentColor = COLORS.outline,
  backgroundColor = COLORS.surface,
  tilt = 0,
}: CardProps): React.JSX.Element {
  return (
    <View style={[styles.container, tilt !== 0 && { transform: [{ rotate: `${tilt}deg` }] }, style]}>
      <View style={styles.shadowTwin} />
      <View style={[styles.card, { borderColor: accentColor, backgroundColor }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  shadowTwin: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: COLORS.outline,
    borderRadius: RADIUS.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.lg,
  },
});
