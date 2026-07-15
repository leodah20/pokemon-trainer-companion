import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './colors';
import { PokeballIcon } from './PokeballIcon';
import { DISPLAY_FONT, FONT_SIZE } from './typography';

/** Short logo wordmark shown next to the Poke Ball icon. The full product name
 * ("Pokemon Trainer Companion") is spelled out in README/store copy, not in-app UI chrome. */
export const APP_NAME = 'PTC';
export const APP_FULL_NAME = 'Pokemon Trainer Companion';

interface LogoProps {
  size?: 'sm' | 'lg';
  color?: string;
}

export function Logo({ size = 'lg', color = COLORS.brandGold }: LogoProps): React.JSX.Element {
  const iconSize = size === 'lg' ? 34 : 22;
  const fontSize = size === 'lg' ? FONT_SIZE.xl : FONT_SIZE.md;

  return (
    <View style={styles.row}>
      <PokeballIcon size={iconSize} />
      <Text style={[styles.wordmark, { color, fontSize }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontFamily: DISPLAY_FONT,
    letterSpacing: 1.5,
    textShadowColor: COLORS.outline,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
