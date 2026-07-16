import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getEvolutionChain } from '../../use-cases/getEvolutionChain';
import { EvolutionChainLink } from '../../domain/evolution/types';
import { COLORS, DISPLAY_FONT, FONT_SIZE, RADIUS, SHADOW, SPACING, TypeBadge } from '../theme';
import { RootStackScreenProps } from '../navigation/types';
import { useTranslation } from '../../i18n';

type Props = RootStackScreenProps<'EvolutionChain'>;

const ALL_SPECIES = getAllSpecies();

const STAT_KEYS: ReadonlyArray<{ key: 'baseAttack' | 'baseDefense' | 'baseStamina'; label: string }> = [
  { key: 'baseAttack', label: 'ATK' },
  { key: 'baseDefense', label: 'DEF' },
  { key: 'baseStamina', label: 'STA' },
];

export function EvolutionChainScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const chain = useMemo(
    () => getEvolutionChain(route.params.speciesId, ALL_SPECIES),
    [route.params.speciesId],
  );

  if (!chain) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <Text style={styles.emptyText}>{t('evolution.empty')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {chain.map((link, index) => (
          <View key={link.speciesId} style={styles.linkWrapper}>
            {index > 0 && (
              <View style={styles.arrowRow}>
                <Text style={styles.arrow}>↓</Text>
                {link.candyCost !== null && (
                  <Text style={styles.candyText}>{t('evolution.candy', { n: link.candyCost })}</Text>
                )}
              </View>
            )}
            <EvolutionCard link={link} onPress={() => navigation.navigate('PokemonDetail', { speciesId: link.speciesId })} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function EvolutionCard({ link, onPress }: { link: EvolutionChainLink; onPress: () => void }): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: getSpriteUrl(link.speciesId) }} style={styles.sprite} resizeMode="contain" />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{link.speciesName}</Text>
        <View style={styles.typeRow}>
          {link.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>
        <View style={styles.statsRow}>
          {STAT_KEYS.map(({ key, label }) => (
            <Text key={key} style={styles.statText}>
              {label} {link[key]}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
  },
  linkWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  arrowRow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  arrow: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  candyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.lg + 6,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOW.md,
  },
  sprite: {
    width: 64,
    height: 64,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
