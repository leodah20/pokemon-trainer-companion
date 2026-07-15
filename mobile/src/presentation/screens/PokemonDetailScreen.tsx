import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies, getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getLoreWithFallback } from '../../data/lore/loreRepository';
import { getPowerUpSteps } from '../../data/power-up/powerUpRepository';
import { getPvpRankingsForSpecies } from '../../data/pvp/pvpRepository';
import { calculatePowerUpCost } from '../../domain/power-up';
import { formatMoveName, getMetaTier, META_TIER_LABELS, PVP_LEAGUE_LABELS, PvpLeague } from '../../domain/pvp';
import { BULK_TIER_LABELS, rankBulkPercentile } from '../../use-cases/rankBulkPercentile';
import {
  Card,
  COLORS,
  DISPLAY_FONT,
  FONT_SIZE,
  getTypeColor,
  getTypeGradient,
  PokeballIcon,
  RADIUS,
  SHADOW,
  SPACING,
  TypeBadge,
} from '../theme';
import { RootStackScreenProps } from '../navigation/types';

const LEAGUE_ORDER: PvpLeague[] = ['great', 'ultra', 'master'];
const ALL_SPECIES = getAllSpecies();
const POWER_UP_STEPS = getPowerUpSteps();
const MAX_BASE_STAT_FOR_BAR = 300; // Mewtwo's base attack (300) is the ceiling in our data range

type Props = RootStackScreenProps<'PokemonDetail'>;
type BattleRoleView = 'attack' | 'defense';

function StatBar({ label, value, color }: { label: string; value: number; color: string }): React.JSX.Element {
  const widthPercentage = Math.min(100, (value / MAX_BASE_STAT_FOR_BAR) * 100);
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarTrack}>
        <View style={[styles.statBarFill, { width: `${widthPercentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function PokemonDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const species = getSpeciesById(route.params.speciesId);
  const pvpRankings = getPvpRankingsForSpecies(route.params.speciesId);
  const lore = getLoreWithFallback(species);
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
      <SafeAreaView style={styles.fallbackScreen}>
        <Text style={styles.notFound}>Species not found.</Text>
      </SafeAreaView>
    );
  }

  const typeColor = getTypeColor(species.types[0]);
  const gradient = getTypeGradient(typeColor);

  return (
    <LinearGradient colors={gradient} style={styles.gradient}>
      {/* Giant watermark Pokeball peeking from the corner, poster-style */}
      <View style={styles.watermark} pointerEvents="none">
        <PokeballIcon size={280} />
      </View>

      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: getSpriteUrl(species.id) }} style={styles.sprite} resizeMode="contain" />
          <Text style={styles.dexNumber}>#{String(species.id).padStart(3, '0')}</Text>
          <Text style={styles.name}>{species.name}</Text>
          <Text style={styles.generation}>Generation {species.generation}</Text>

          <View style={styles.typeRow}>
            {species.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>

          <Card style={styles.card} accentColor={typeColor} tilt={-1}>
            <Text style={styles.panelTitle}>Base Stats</Text>
            <StatBar label="ATK" value={species.baseAttack} color={typeColor} />
            <StatBar label="DEF" value={species.baseDefense} color={typeColor} />
            <StatBar label="STA" value={species.baseStamina} color={typeColor} />
          </Card>

          <Card style={styles.card} accentColor={COLORS.brandGold} tilt={1}>
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

          <Card style={styles.card} accentColor={COLORS.brandBlue} tilt={-1}>
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
            <Text style={[styles.panelTitle, { color: COLORS.retroScreenGreenDark }]}>
              Lore & Trivia
              {lore.isAutoGenerated && (
                <Text style={styles.autoGenLabel}> (auto-gerado)</Text>
              )}
            </Text>

            <Text style={styles.loreCategoryLabel}>Origem & Inspiração</Text>
            <Text style={styles.loreFact}>{lore.origin}</Text>

            <Text style={styles.loreCategoryLabel}>Relevância no Pokémon GO</Text>
            <Text style={styles.loreFact}>{lore.goRelevance}</Text>

            <Text style={styles.loreCategoryLabel}>Dica de Batalha</Text>
            <Text style={styles.loreFact}>{lore.battleTip}</Text>

            <Text style={styles.loreCategoryLabel}>Easter Egg / Curiosidade</Text>
            <Text style={styles.loreFact}>{lore.easterEgg}</Text>

            <Text style={styles.loreCategoryLabel}>Diferença: GO vs Main Series</Text>
            <Text style={styles.loreFact}>{lore.goDifference}</Text>

            <Text style={styles.loreCategoryLabel}>Custo de Evolução</Text>
            <Text style={styles.loreFact}>{lore.evolutionCost}</Text>

            <Text style={styles.loreCategoryLabel}>Shiny Rate</Text>
            <Text style={styles.loreFact}>{lore.shinyRate}</Text>
          </Card>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.calculateButtonPressed]}
            onPress={() => navigation.navigate('EvolutionChain', { speciesId: species.id })}
          >
            <Text style={styles.secondaryButtonText}>Evolution Chain</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.calculateButton, pressed && styles.calculateButtonPressed]}
            onPress={() => navigation.navigate('IvCalculator', { speciesId: species.id })}
          >
            <Text style={styles.calculateButtonText}>Calculate IV</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  fallbackScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  watermark: {
    position: 'absolute',
    top: -70,
    right: -90,
    opacity: 0.14,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
  },
  sprite: {
    width: 170,
    height: 170,
  },
  dexNumber: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.surface,
    fontWeight: '800',
    opacity: 0.85,
  },
  name: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.surface,
    textAlign: 'center',
    textShadowColor: COLORS.outline,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  generation: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.surface,
    opacity: 0.9,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  card: {
    marginTop: SPACING.xl,
  },
  panelTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
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
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  statBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: RADIUS.full,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  statValue: {
    width: 32,
    fontSize: 12,
    textAlign: 'right',
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  movesetRow: {
    marginBottom: SPACING.sm,
  },
  movesetLeague: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.brandRed,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  movesetMoves: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginTop: 2,
    fontWeight: '600',
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
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
  },
  roleToggleButtonSelected: {
    backgroundColor: COLORS.brandBlue,
  },
  roleToggleText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  roleToggleTextSelected: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.surface,
  },
  roleResultText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
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
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glassSurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  powerUpResult: {
    marginTop: SPACING.md,
    gap: 2,
  },
  loreCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.retroScreenGreenDark,
    letterSpacing: 0.8,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase' as const,
  },
  autoGenLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  loreFact: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.retroScreenGreenDark,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  secondaryButton: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.glassSurface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingVertical: SPACING.md + 2,
    width: '100%',
    alignItems: 'center',
    ...SHADOW.md,
  },
  secondaryButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  calculateButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.brandRed,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md + 2,
    width: '100%',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  calculateButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  calculateButtonText: {
    fontFamily: DISPLAY_FONT,
    fontSize: FONT_SIZE.lg,
    color: COLORS.surface,
  },
});
