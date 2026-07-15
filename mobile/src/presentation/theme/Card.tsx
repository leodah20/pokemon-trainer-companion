import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from './colors';
import { RADIUS, SPACING } from './spacing';
import { SHADOW } from './shadows';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  /** Thin border accent color. Pass the Pokemon's type color for themed cards. */
  accentColor?: string;
  /** Fill color override — defaults to a translucent glass white. */
  backgroundColor?: string;
  /** Tiny alternating rotation gives a hand-placed feel; 0 (default) keeps it flat, matching the app's glass HUD look. */
  tilt?: number;
}

/**
 * A glass panel meant to float over the vivid gradient backgrounds: translucent fill, a thin
 * tinted border, and a soft diffuse shadow (SHADOW.lg) instead of the old hard cartoon-sticker
 * offset shadow — matches the Pokemon GO-style HUD redesign, not the earlier thick-ink-outline look.
 */
export function Card({
  children,
  style,
  accentColor = COLORS.glassBorder,
  backgroundColor = COLORS.glassSurface,
  tilt = 0,
}: CardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.card,
        { borderColor: accentColor, backgroundColor },
        tilt !== 0 && { transform: [{ rotate: `${tilt}deg` }] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: RADIUS.lg + 6,
    borderWidth: 1,
    padding: SPACING.lg,
    ...SHADOW.lg,
  },
});
