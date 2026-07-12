import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, getTypeColor } from './colors';
import { RADIUS, SPACING } from './spacing';

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
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.outline,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: COLORS.surface,
  },
});
