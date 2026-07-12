import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from './colors';
import { RADIUS, SPACING } from './spacing';
import { SHADOW } from './shadows';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  /** A thin accent bar along the top edge — used to color-code a card without a heavy border. */
  accentColor?: string;
}

export function Card({ children, style, backgroundColor = COLORS.surface, accentColor }: CardProps): React.JSX.Element {
  return (
    <View style={[styles.card, { backgroundColor }, SHADOW.md, style]}>
      {accentColor !== undefined && <View style={[styles.accentBar, { backgroundColor: accentColor }]} />}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  accentBar: {
    height: 5,
  },
  content: {
    padding: SPACING.lg,
  },
});
