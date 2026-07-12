import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from './colors';

interface PokeballIconProps {
  size?: number;
}

/** A Poke Ball drawn from plain Views (no image asset) — red top, white bottom, black band + button. */
export function PokeballIcon({ size = 32 }: PokeballIconProps): React.JSX.Element {
  const outlineWidth = Math.max(2, Math.round(size * 0.07));
  const bandHeight = Math.max(2, Math.round(size * 0.14));
  const buttonSize = Math.round(size * 0.34);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, borderWidth: outlineWidth },
      ]}
    >
      <View style={styles.half} />
      <View style={[styles.band, { height: bandHeight }]} />
      <View style={[styles.half, styles.bottomHalf]} />
      <View
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            marginTop: -buttonSize / 2,
            marginLeft: -buttonSize / 2,
            borderWidth: Math.max(2, Math.round(outlineWidth * 0.8)),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderColor: COLORS.outline,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  half: {
    flex: 1,
    backgroundColor: COLORS.brandRed,
  },
  bottomHalf: {
    backgroundColor: COLORS.surface,
  },
  band: {
    backgroundColor: COLORS.outline,
  },
  button: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.outline,
  },
});
