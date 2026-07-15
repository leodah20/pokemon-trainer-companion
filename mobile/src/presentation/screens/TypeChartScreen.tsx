import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EffectivenessBucket, TypeMatchup } from '../../domain/type-effectiveness/types';
import { ALL_TYPE_NAMES, getMatchupsForAttacker } from '../../data/type-effectiveness/typeEffectivenessRepository';
import { COLORS, FONT_SIZE, getTypeColor, RADIUS, SPACING, TypeBadge } from '../theme';

const BUCKET_LABELS: Record<EffectivenessBucket, string> = {
  superEffective: 'Super effective',
  notVeryEffective: 'Not very effective',
  noEffect: 'No effect',
  neutral: 'Normal damage',
};

const BUCKET_ORDER: EffectivenessBucket[] = ['superEffective', 'notVeryEffective', 'noEffect'];

export function TypeChartScreen(): React.JSX.Element {
  const [attackerType, setAttackerType] = useState<string>(ALL_TYPE_NAMES[0]);

  const matchups = useMemo(() => getMatchupsForAttacker(attackerType), [attackerType]);

  const groups = useMemo(() => {
    const byBucket = new Map<EffectivenessBucket, TypeMatchup[]>();
    for (const matchup of matchups) {
      const existing = byBucket.get(matchup.bucket) ?? [];
      existing.push(matchup);
      byBucket.set(matchup.bucket, existing);
    }
    return byBucket;
  }, [matchups]);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <Text style={styles.hint}>Pick an attacking type to see what it's strong and weak against.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeRow}
        contentContainerStyle={styles.typeRowContent}
      >
        {ALL_TYPE_NAMES.map((type) => (
          <Pressable
            key={type}
            onPress={() => setAttackerType(type)}
            style={[
              styles.typeChip,
              { backgroundColor: type === attackerType ? getTypeColor(type) : COLORS.surface },
            ]}
          >
            <Text style={[styles.typeChipText, type === attackerType && styles.typeChipTextSelected]}>
              {type}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.resultsContent}>
        {BUCKET_ORDER.map((bucket) => {
          const bucketMatchups = groups.get(bucket);
          if (!bucketMatchups || bucketMatchups.length === 0) {
            return null;
          }
          return (
            <View key={bucket} style={styles.bucketSection}>
              <Text style={styles.bucketTitle}>
                {BUCKET_LABELS[bucket]} ({formatMultiplier(bucketMatchups[0].multiplier)})
              </Text>
              <View style={styles.bucketBadges}>
                {bucketMatchups.map((matchup) => (
                  <TypeBadge key={matchup.type} type={matchup.type} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMultiplier(multiplier: number): string {
  return `×${multiplier}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  typeRow: {
    marginTop: SPACING.md,
    flexGrow: 0,
  },
  typeRowContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  typeChip: {
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.outline,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  typeChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  typeChipTextSelected: {
    color: COLORS.surface,
  },
  resultsContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  bucketSection: {
    gap: SPACING.sm,
  },
  bucketTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  bucketBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
});
