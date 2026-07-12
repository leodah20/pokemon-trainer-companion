import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getPvpRankingsForSpecies } from '../../data/pvp/pvpRepository';
import { formatMoveName, PVP_LEAGUE_LABELS, PvpLeague } from '../../domain/pvp';
import { COLORS, FONT_SIZE, PixelPanel, PIXEL_FONT, TypeBadge } from '../theme';
import { RootStackParamList } from '../navigation/types';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;

const MAX_BASE_STAT_FOR_BAR = 300; // Mewtwo's base attack (300) is the ceiling in our seed data range

function StatBar({ label, value }: { label: string; value: number }): React.JSX.Element {
  const widthPercentage = Math.min(100, (value / MAX_BASE_STAT_FOR_BAR) * 100);
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarTrack}>
        <View style={[styles.statBarFill, { width: `${widthPercentage}%` }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function PokemonDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const species = getSpeciesById(route.params.speciesId);
  const pvpRankings = getPvpRankingsForSpecies(route.params.speciesId);

  if (!species) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.notFound}>Species not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dexNumber}>#{String(species.id).padStart(3, '0')}</Text>
        <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.sprite} resizeMode="contain" />
        <Text style={styles.name}>{species.name}</Text>
        <Text style={styles.generation}>Generation {species.generation}</Text>

        <View style={styles.typeRow}>
          {species.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>

        <PixelPanel style={styles.statsPanel}>
          <Text style={styles.panelTitle}>Base Stats</Text>
          <StatBar label="ATK" value={species.baseAttack} />
          <StatBar label="DEF" value={species.baseDefense} />
          <StatBar label="STA" value={species.baseStamina} />
        </PixelPanel>

        <PixelPanel style={styles.statsPanel}>
          <Text style={styles.panelTitle}>Best Moveset (PvP)</Text>
          {LEAGUE_ORDER.filter((league) => pvpRankings?.[league] !== undefined).map((league) => {
            const moveset = pvpRankings![league]!;
            return (
              <View key={league} style={styles.movesetRow}>
                <Text style={styles.movesetLeague}>{PVP_LEAGUE_LABELS[league]}</Text>
                <Text style={styles.movesetMoves}>
                  {formatMoveName(moveset.fastMove)} +{' '}
                  {moveset.chargedMoves.map(formatMoveName).join(' / ')}
                </Text>
                <Text style={styles.movesetScore}>Score: {moveset.score.toFixed(1)}/100</Text>
              </View>
            );
          })}
          {pvpRankings === undefined && (
            <Text style={styles.movesetEmpty}>Not competitively ranked in PvP.</Text>
          )}
          <Text style={styles.movesetSource}>Source: PvPoke community rankings (pvpoke.com)</Text>
        </PixelPanel>

        <PixelPanel style={styles.lorePanel} backgroundColor={COLORS.screenGreen}>
          <Text style={styles.panelTitle}>Lore & Trivia</Text>
          <Text style={styles.loreComingSoon}>Coming soon.</Text>
        </PixelPanel>

        <Pressable
          style={styles.calculateButton}
          onPress={() => navigation.navigate('IvCalculator', { speciesId: species.id })}
        >
          <Text style={styles.calculateButtonText}>Calculate IV</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
  },
  dexNumber: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.navyLight,
  },
  sprite: {
    width: 120,
    height: 120,
    marginVertical: 8,
  },
  name: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.pokedexRed,
    textAlign: 'center',
  },
  generation: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.navyLight,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statsPanel: {
    width: '100%',
    marginTop: 24,
  },
  panelTitle: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.ink,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },
  statBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.ink,
    marginHorizontal: 8,
  },
  statBarFill: {
    height: '100%',
    backgroundColor: COLORS.pokedexRed,
  },
  statValue: {
    width: 32,
    fontSize: 12,
    textAlign: 'right',
    color: COLORS.ink,
  },
  movesetRow: {
    marginBottom: 10,
  },
  movesetLeague: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.pokedexRed,
  },
  movesetMoves: {
    fontSize: 14,
    color: COLORS.ink,
    marginTop: 2,
  },
  movesetScore: {
    fontSize: 11,
    color: COLORS.navyLight,
    marginTop: 2,
  },
  movesetEmpty: {
    fontSize: 13,
    color: COLORS.navyLight,
  },
  movesetSource: {
    fontSize: 10,
    color: COLORS.navyLight,
    marginTop: 8,
  },
  lorePanel: {
    width: '100%',
    marginTop: 16,
  },
  loreComingSoon: {
    fontSize: 13,
    color: COLORS.screenGreenDark,
  },
  calculateButton: {
    marginTop: 24,
    backgroundColor: COLORS.navy,
    borderWidth: 3,
    borderColor: COLORS.ink,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  calculateButtonText: {
    fontFamily: PIXEL_FONT,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
  },
});
