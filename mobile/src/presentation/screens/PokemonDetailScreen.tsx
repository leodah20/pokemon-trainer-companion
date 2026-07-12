import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies, getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getLoreForSpecies } from '../../data/lore/loreRepository';
import { getPowerUpSteps } from '../../data/power-up/powerUpRepository';
import { getPvpRankingsForSpecies } from '../../data/pvp/pvpRepository';
import { calculatePowerUpCost } from '../../domain/power-up';
import { formatMoveName, getMetaTier, META_TIER_LABELS, PVP_LEAGUE_LABELS, PvpLeague } from '../../domain/pvp';
import { BULK_TIER_LABELS, rankBulkPercentile } from '../../use-cases/rankBulkPercentile';
import { Card, COLORS, DISPLAY_FONT, FONT_SIZE, getTypeColor, RADIUS, SPACING, TypeBadge } from '../theme';
import { RootStackParamList } from '../navigation/types';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];
const ALL_SPECIES = getAllSpecies();
const POWER_UP_STEPS = getPowerUpSteps();
const MAX_BASE_STAT_FOR_BAR = 300; // Mewtwo's base attack (300) is the ceiling in our data range

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;
type BattleRoleView = 'attack' | 'defense';

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
  const lore = getLoreForSpecies(route.params.speciesId);
  const [battleRoleView, setBattleRoleView] = useState<BattleRoleView>('attack');
  const [fromLevelInput, setFromLevelInput] = useState('1');
  const [toLevelInput, setToLevelInput] = useState('40');

  const bestAttackScore = useMemo(() => {
    const scores = LEAGUE_ORDER.map((league) => pvpRankings?.[league]?.score).filter(
      (score): score is number => score !== undefined,
    );
    return scores.length > 0 ? Math.max(...scores) : null;
  }, [pvpRankings]);

  const bulkRanking = useMemo(
    () => (species ? rankBulkPercentile(ALL_SPECIES, species.id) : null),
    [species],
  );

  const powerUpResult = useMemo(() => {
    const fromLevel = Number(fromLevelInput);
    const toLevel = Number(toLevelInput);
    if (!Number.isFinite(fromLevel) || !Number.isFinite(toLevel) || fromLevel >= toLevel) {
      return null;
    }
    return calculatePowerUpCost(POWER_UP_STEPS, fromLevel, toLevel);
  }, [fromLevelInput, toLevelInput]);

  if (!species) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.notFound}>Species not found.</Text>
      </SafeAreaView>
    );
  }

  const accentColor = getTypeColor(species.types[0]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.spriteBackdrop, { backgroundColor: `${accentColor}22` }]}>
          <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.sprite} resizeMode="contain" />
        </View>
        <Text style={styles.dexNumber}>#{String(species.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{species.name}</Text>
        <Text style={styles.generation}>Generation {species.generation}</Text>

        <View style={styles.typeRow}>
          {species.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>

        <Card style={styles.card} accentColor={COLORS.brandRed}>
          <Text style={styles.panelTitle}>Base Stats</Text>
          <StatBar label="ATK" value={species.baseAttack} />
          <StatBar label="DEF" value={species.baseDefense} />
          <StatBar label="STA" value={species.baseStamina} />
        </Card>

        <Card style={styles.card} accentColor={COLORS.brandGold}>
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
            <Text style={styles.emptyText}>Not competitively ranked in PvP.</Text>
          )}
          <Text style={styles.sourceText}>Source: PvPoke community rankings (pvpoke.com)</Text>
        </Card>

        <Card style={styles.card} accentColor={COLORS.textPrimary}>
          <Text style={styles.panelTitle}>Battle Role</Text>
          <View style={styles.roleToggleRow}>
            <Pressable
              style={[styles.roleToggleButton, battleRoleView === 'attack' && styles.roleToggleButtonSelected]}
              onPress={() => setBattleRoleView('attack')}
            >
              <Text
                style={battleRoleView === 'attack' ? styles.roleToggleTextSelected : styles.roleToggleText}
              >
                Attack
              </Text>
            </Pressable>
            <Pressable
              style={[styles.roleToggleButton, battleRoleView === 'defense' && styles.roleToggleButtonSelected]}
              onPress={() => setBattleRoleView('defense')}
            >
              <Text
                style={battleRoleView === 'defense' ? styles.roleToggleTextSelected : styles.roleToggleText}
              >
                Defense
              </Text>
            </Pressable>
          </View>

          {battleRoleView === 'attack' ? (
            bestAttackScore !== null ? (
              <Text style={styles.roleResultText}>
                {META_TIER_LABELS[getMetaTier(bestAttackScore)]} — best PvP score {bestAttackScore.toFixed(1)}/100
              </Text>
            ) : (
              <Text style={styles.roleResultText}>Not competitively ranked for attacking.</Text>
            )
          ) : (
            <Text style={styles.roleResultText}>
              {bulkRanking
                ? `${BULK_TIER_LABELS[bulkRanking.tier]} — tankier than ${bulkRanking.percentile}% of all Pokemon`
                : 'Bulk data unavailable.'}
            </Text>
          )}
          <Text style={styles.sourceText}>
            Attack rating from PvPoke score; defense rating is a DEF+STA heuristic, not an official
            gym-defender metric.
          </Text>
        </Card>

        <Card style={styles.card} accentColor={COLORS.brandGold}>
          <Text style={styles.panelTitle}>Power-Up Cost</Text>
          <View style={styles.levelRangeRow}>
            <View style={styles.levelRangeField}>
              <Text style={styles.label}>From level</Text>
              <TextInput
                style={styles.levelInput}
                keyboardType="numeric"
                value={fromLevelInput}
                onChangeText={setFromLevelInput}
              />
            </View>
            <View style={styles.levelRangeField}>
              <Text style={styles.label}>To level</Text>
              <TextInput
                style={styles.levelInput}
                keyboardType="numeric"
                value={toLevelInput}
                onChangeText={setToLevelInput}
              />
            </View>
          </View>
          {powerUpResult ? (
            <View style={styles.powerUpResult}>
              <Text style={styles.roleResultText}>Stardust: {powerUpResult.stardust.toLocaleString()}</Text>
              <Text style={styles.roleResultText}>Candy: {powerUpResult.candy}</Text>
              {powerUpResult.xlCandy > 0 && (
                <Text style={styles.roleResultText}>XL Candy: {powerUpResult.xlCandy}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>Enter a valid "from" level lower than "to" level.</Text>
          )}
        </Card>

        <Card style={styles.card} backgroundColor={COLORS.retroScreenGreen} accentColor={COLORS.retroScreenGreenDark}>
          <Text style={[styles.panelTitle, { color: COLORS.retroScreenGreenDark }]}>Lore & Trivia</Text>
          {lore ? (
            lore.trivia.map((fact, index) => (
              <Text key={index} style={styles.loreFact}>
                • {fact}
              </Text>
            ))
          ) : (
            <Text style={styles.loreFact}>No trivia written for this species yet.</Text>
          )}
        </Card>

        <Pressable
          style={({ pressed }) => [styles.calculateButton, pressed && styles.calculateButtonPressed]}
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
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
  },
  spriteBackdrop: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprite: {
    width: 108,
    height: 108,
  },
  dexNumber: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  name: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  generation: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  card: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  panelTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.brandRed,
  },
  statValue: {
    width: 32,
    fontSize: 12,
    textAlign: 'right',
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  movesetRow: {
    marginBottom: SPACING.sm,
  },
  movesetLeague: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brandRed,
  },
  movesetMoves: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  movesetScore: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  sourceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  roleToggleButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  roleToggleButtonSelected: {
    backgroundColor: COLORS.textPrimary,
  },
  roleToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  roleToggleTextSelected: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.surface,
  },
  roleResultText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  levelRangeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  levelRangeField: {
    flex: 1,
  },
  levelInput: {
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  powerUpResult: {
    marginTop: SPACING.md,
    gap: 2,
  },
  loreFact: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.retroScreenGreenDark,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  calculateButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.brandRed,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    width: '100%',
    alignItems: 'center',
  },
  calculateButtonPressed: {
    opacity: 0.85,
  },
  calculateButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.md,
    color: COLORS.surface,
  },
});
