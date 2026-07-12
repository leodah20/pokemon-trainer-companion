import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from './colors';
import { PokeballIcon } from './PokeballIcon';
import { DISPLAY_FONT, FONT_SIZE } from './typography';

export const APP_NAME = 'PokeBuddy';

interface LogoProps {
  size?: 'sm' | 'lg';
  color?: string;
}

export function Logo({ size = 'lg', color = COLORS.brandRed }: LogoProps): React.JSX.Element {
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
  },
});
