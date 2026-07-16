import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getTopRanking, RANKING_CATEGORIES, RankingCategory } from '../../use-cases/rankTopPokemon';
import { COLORS, FONT_SIZE, RADIUS, SHADOW, SPACING, TypeBadge } from '../theme';
import { TabScreenProps } from '../navigation/types';
import { TranslationKeys, useTranslation } from '../../i18n';

const ALL_SPECIES = getAllSpecies();

const CATEGORY_LABEL_KEYS: Record<RankingCategory, keyof TranslationKeys> = {
  attack: 'rankings.category.attack',
  defense: 'rankings.category.defense',
  stamina: 'rankings.category.stamina',
  bulk: 'rankings.category.bulk',
  cp: 'rankings.category.cp',
  'pvp-great': 'rankings.category.pvpGreat',
  'pvp-ultra': 'rankings.category.pvpUltra',
  'pvp-master': 'rankings.category.pvpMaster',
};

type Props = TabScreenProps<'Rankings'>;

export function TopRankingsScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [category, setCategory] = useState<RankingCategory>('attack');

  const activeOption = RANKING_CATEGORIES.find((option) => option.category === category)!;
  const rankings = useMemo(() => getTopRanking(category, ALL_SPECIES), [category]);

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.categoryRow}>
        {RANKING_CATEGORIES.map((option) => (
          <Pressable
            key={option.category}
            onPress={() => setCategory(option.category)}
            style={[styles.categoryChip, option.category === category && styles.categoryChipSelected]}
            accessibilityRole="button"
            accessibilityLabel={t(CATEGORY_LABEL_KEYS[option.category])}
            accessibilityState={{ selected: option.category === category }}
          >
            <Text
              style={[styles.categoryChipText, option.category === category && styles.categoryChipTextSelected]}
            >
              {t(CATEGORY_LABEL_KEYS[option.category])}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rankings}
        keyExtractor={(entry) => String(entry.species.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('rankings.emptyText')}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('PokemonDetail', { speciesId: item.species.id })}
            accessibilityRole="button"
            accessibilityLabel={`#${item.rank} ${item.species.name}, ${Math.round(item.value)} ${activeOption.unit}`}
          >
            <Text style={styles.rank}>#{item.rank}</Text>
            <Image
              source={{ uri: getSpriteUrl(item.species.id) }}
              style={styles.sprite}
              resizeMode="contain"
            />
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.species.name}</Text>
              <View style={styles.rowTypes}>
                {item.species.types.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </View>
            </View>
            <Text style={styles.rowValue}>
              {Math.round(item.value)}
              <Text style={styles.rowValueUnit}> {activeOption.unit}</Text>
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
    ...SHADOW.sm,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.brandRed,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  categoryChipTextSelected: {
    color: COLORS.surface,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.lg + 6,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  rank: {
    width: 34,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  sprite: {
    width: 44,
    height: 44,
  },
  rowInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  rowName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rowTypes: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  rowValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.brandRed,
  },
  rowValueUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textSecondary,
  },
});
