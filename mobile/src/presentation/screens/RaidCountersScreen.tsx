import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RaidBoss } from '../../domain/raids/types';
import { getCurrentRaidBosses } from '../../data/raids/raidsRepository';
import { getAllSpecies, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getRaidCounters } from '../../use-cases/getRaidCounters';
import { WEATHER_BOOSTS } from '../../data/type-effectiveness/weatherBoosts';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING, TypeBadge } from '../theme';
import { TranslationKeys, useTranslation } from '../../i18n';

const ALL_SPECIES = getAllSpecies();
const BOSSES = getCurrentRaidBosses();
const TIER_ORDER: readonly [1, 3, 5] = [1, 3, 5];
const WEATHER_OPTIONS = ['Any', ...WEATHER_BOOSTS.map((w) => w.weather)];

export function RaidCountersScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const [selectedBoss, setSelectedBoss] = useState<RaidBoss>(BOSSES[0]);
  const [weather, setWeather] = useState('Any');

  function weatherLabel(option: string): string {
    return option === 'Any' ? t('weather.any') : t(`weather.${option}` as keyof TranslationKeys);
  }

  const counters = useMemo(
    () => getRaidCounters(selectedBoss, ALL_SPECIES, weather === 'Any' ? undefined : weather),
    [selectedBoss, weather],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{t('raid.hint')}</Text>

        {TIER_ORDER.map((tier) => (
          <View key={tier} style={styles.tierSection}>
            <Text style={styles.tierTitle}>{t('raid.tierRaids', { tier })}</Text>
            <View style={styles.bossRow}>
              {BOSSES.filter((boss) => boss.tier === tier).map((boss) => (
                <Pressable
                  key={boss.id}
                  onPress={() => setSelectedBoss(boss)}
                  style={[
                    styles.bossChip,
                    boss.id === selectedBoss.id && styles.bossChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={boss.speciesName}
                  accessibilityState={{ selected: boss.id === selectedBoss.id }}
                >
                  <Image source={{ uri: getSpriteUrl(boss.speciesId) }} style={styles.bossSprite} resizeMode="contain" />
                  <Text style={[styles.bossChipText, boss.id === selectedBoss.id && styles.bossChipTextSelected]}>
                    {boss.speciesName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.tierTitle}>{t('raid.weather')}</Text>
        <View style={styles.weatherRow}>
          {WEATHER_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setWeather(option)}
              style={[styles.weatherChip, option === weather && styles.weatherChipSelected]}
              accessibilityRole="button"
              accessibilityLabel={weatherLabel(option)}
              accessibilityState={{ selected: option === weather }}
            >
              <Text style={[styles.weatherChipText, option === weather && styles.weatherChipTextSelected]}>
                {weatherLabel(option)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.resultsTitle}>{t('raid.topCountersVs', { boss: selectedBoss.speciesName })}</Text>
        {counters.map((counter, index) => (
          <View key={counter.speciesId} style={styles.counterRow}>
            <Text style={styles.counterRank}>#{index + 1}</Text>
            <Image source={{ uri: getSpriteUrl(counter.speciesId) }} style={styles.counterSprite} resizeMode="contain" />
            <View style={styles.counterInfo}>
              <Text style={styles.counterName}>{counter.speciesName}</Text>
              <View style={styles.counterTypes}>
                {counter.types.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </View>
            </View>
            <View style={styles.counterDpsBlock}>
              <Text style={styles.counterDps}>{counter.estimatedDps}</Text>
              <Text style={styles.counterDpsLabel}>{t('raid.estDps')}</Text>
              {counter.weatherBoosted && <Text style={styles.weatherBadge}>{t('raid.boosted')}</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  tierSection: {
    gap: SPACING.sm,
  },
  tierTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  bossRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bossChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
    ...SHADOW.sm,
  },
  bossChipSelected: {
    backgroundColor: COLORS.brandRed,
  },
  bossSprite: {
    width: 28,
    height: 28,
  },
  bossChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bossChipTextSelected: {
    color: COLORS.surface,
  },
  weatherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  weatherChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  weatherChipSelected: {
    backgroundColor: COLORS.brandBlue,
  },
  weatherChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  weatherChipTextSelected: {
    color: COLORS.surface,
  },
  resultsTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.lg + 6,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
    gap: SPACING.sm,
    ...SHADOW.md,
  },
  counterRank: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textMuted,
    width: 28,
  },
  counterSprite: {
    width: 44,
    height: 44,
  },
  counterInfo: {
    flex: 1,
  },
  counterName: {
    fontSize: FONT_SIZE.md,
    fontFamily: DISPLAY_FONT,
    color: COLORS.textPrimary,
  },
  counterTypes: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  counterDpsBlock: {
    alignItems: 'flex-end',
  },
  counterDps: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.brandRed,
  },
  counterDpsLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  weatherBadge: {
    fontSize: 10,
    color: COLORS.brandBlue,
    fontWeight: '700',
    marginTop: 2,
  },
});
