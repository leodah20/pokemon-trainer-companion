import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EffectivenessBucket, TypeMatchup } from '../../domain/type-effectiveness/types';
import { ALL_TYPE_NAMES, getMatchupsForAttacker } from '../../data/type-effectiveness/typeEffectivenessRepository';
import { COLORS, FONT_SIZE, getTypeColor, RADIUS, SHADOW, SPACING, TypeBadge } from '../theme';
import { useTranslation } from '../../i18n';

const BUCKET_ORDER: EffectivenessBucket[] = ['superEffective', 'notVeryEffective', 'noEffect'];

export function TypeChartScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [attackerType, setAttackerType] = useState<string>(ALL_TYPE_NAMES[0]);

  const bucketLabels: Record<EffectivenessBucket, string> = {
    superEffective: t('typeChart.superEffective'),
    notVeryEffective: t('typeChart.notVeryEffective'),
    noEffect: t('typeChart.noEffect'),
    neutral: t('typeChart.neutral'),
  };

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
      <Text style={styles.hint}>{t('typeChart.hint')}</Text>

      <View style={styles.typeRow}>
        {ALL_TYPE_NAMES.map((type) => (
          <Pressable
            key={type}
            onPress={() => setAttackerType(type)}
            style={[
              styles.typeChip,
              { backgroundColor: type === attackerType ? getTypeColor(type) : COLORS.glassSurface },
            ]}
            accessibilityRole="button"
            accessibilityLabel={type}
            accessibilityState={{ selected: type === attackerType }}
          >
            <Text style={[styles.typeChipText, type === attackerType && styles.typeChipTextSelected]}>
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.resultsContent}>
        {BUCKET_ORDER.map((bucket) => {
          const bucketMatchups = groups.get(bucket);
          if (!bucketMatchups || bucketMatchups.length === 0) {
            return null;
          }
          return (
            <View key={bucket} style={styles.bucketSection}>
              <Text style={styles.bucketTitle}>
                {bucketLabels[bucket]} ({formatMultiplier(bucketMatchups[0].multiplier)})
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  typeChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
    ...SHADOW.sm,
  },
  typeChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
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
