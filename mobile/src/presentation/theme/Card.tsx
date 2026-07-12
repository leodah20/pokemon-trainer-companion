import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, tintTowardWhite } from './colors';
import { RADIUS, SPACING } from './spacing';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  /** Drives both the border color and a light tinted fill — pass a bold color, it gets tamed automatically. */
  accentColor?: string;
}

/**
 * A "sticker" card: thick cartoon-ink border, a clearly tinted (not washed-out) fill, and a hard
 * offset shadow block instead of a soft blur — soft shadows read as generic SaaS UI, a crisp
 * offset block reads more like a game/comic panel and renders identically on iOS and Android.
 */
export function Card({ children, style, accentColor = COLORS.brandBlue }: CardProps): React.JSX.Element {
  const fillColor = tintTowardWhite(accentColor, 0.82);

  return (
    <View style={styles.shadowBlock}>
      <View style={[styles.card, { backgroundColor: fillColor, borderColor: accentColor }, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowBlock: {
    backgroundColor: COLORS.outline,
    borderRadius: RADIUS.lg,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    padding: SPACING.lg,
    marginBottom: 5,
    marginRight: 5,
  },
});
