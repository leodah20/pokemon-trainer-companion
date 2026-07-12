import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, getTypeColor } from './colors';
import { FONT_SIZE, PIXEL_FONT } from './typography';

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, { backgroundColor: getTypeColor(type) }]}>
      <Text style={styles.text}>{type.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderColor: COLORS.ink,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  text: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
  },
});
