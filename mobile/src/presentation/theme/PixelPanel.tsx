import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from './colors';

interface PixelPanelProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

/** Sharp corners + thick dark border + offset shadow block, mimicking a Game Boy-era UI panel. */
export function PixelPanel({ children, style, backgroundColor = COLORS.cream }: PixelPanelProps): React.JSX.Element {
  return (
    <View style={styles.shadowWrapper}>
      <View style={[styles.panel, { backgroundColor }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    // The dark background peeking out on the bottom/right edges reads as a hard pixel shadow.
    backgroundColor: COLORS.ink,
  },
  panel: {
    borderWidth: 3,
    borderColor: COLORS.ink,
    borderRadius: 0,
    marginBottom: 4,
    marginRight: 4,
    padding: 12,
  },
});
