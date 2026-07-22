import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllSpecies, getSpeciesById, getSpriteUrl } from '../../data/pokedex/pokedexRepository';
import { getLoreWithFallback } from '../../data/lore/loreRepository';
import { getPowerUpSteps } from '../../data/power-up/powerUpRepository';
import { getPvpRankingsForSpecies } from '../../data/pvp/pvpRepository';
import { calculatePowerUpCost } from '../../domain/power-up';
import { formatMoveName, getMetaTier, PvpLeague } from '../../domain/pvp';
import { rankBulkPercentile } from '../../use-cases/rankBulkPercentile';
import { useTranslation } from '../../i18n';
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
  const { t, language } = useTranslation();
  const species = getSpeciesById(route.params.speciesId);
  const pvpRankings = getPvpRankingsForSpecies(route.params.speciesId);
  const lore = getLoreWithFallback(species, language);
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
        <Text style={styles.notFound}>{t('detail.speciesNotFound')}</Text>
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
          <Text style={styles.generation}>{t('detail.generation', { n: species.generation })}</Text>

          <View style={styles.typeRow}>
            {species.types.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </View>

          <Card style={styles.card} accentColor={typeColor} tilt={-1}>
            <Text style={styles.panelTitle}>{t('detail.baseStats')}</Text>
            <StatBar label="ATK" value={species.baseAttack} color={typeColor} />
            <StatBar label="DEF" value={species.baseDefense} color={typeColor} />
            <StatBar label="STA" value={species.baseStamina} color={typeColor} />
          </Card>

          <Card style={styles.card} accentColor={COLORS.brandGold} tilt={1}>
            <Text style={styles.panelTitle}>{t('detail.bestMoveset')}</Text>
            {LEAGUE_ORDER.filter((league) => pvpRankings?.[league] !== undefined).map((league) => {
              const moveset = pvpRankings![league]!;
              return (
                <View key={league} style={styles.movesetRow}>
                  <Text style={styles.movesetLeague}>{t(`pvpLeague.${league}`)}</Text>
                  <Text style={styles.movesetMoves}>
                    {formatMoveName(moveset.fastMove)} +{' '}
                    {moveset.chargedMoves.map(formatMoveName).join(' / ')}
                  </Text>
                  <Text style={styles.movesetScore}>Score: {moveset.score.toFixed(1)}/100</Text>
                </View>
              );
            })}
            {pvpRankings === undefined && (
              <Text style={styles.emptyText}>{t('detail.notRankedPvp')}</Text>
            )}
            <Text style={styles.sourceText}>{t('detail.pvpSource')}</Text>
          </Card>

          <Card style={styles.card} accentColor={COLORS.brandBlue} tilt={-1}>
            <Text style={styles.panelTitle}>{t('detail.battleRole')}</Text>
            <View style={styles.roleToggleRow}>
              <Pressable
                style={[styles.roleToggleButton, battleRoleView === 'attack' && styles.roleToggleButtonSelected]}
                onPress={() => setBattleRoleView('attack')}
                accessibilityRole="button"
                accessibilityLabel={t('detail.attack')}
                accessibilityState={{ selected: battleRoleView === 'attack' }}
              >
                <Text
                  style={battleRoleView === 'attack' ? styles.roleToggleTextSelected : styles.roleToggleText}
                >
                  {t('detail.attack')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.roleToggleButton, battleRoleView === 'defense' && styles.roleToggleButtonSelected]}
                onPress={() => setBattleRoleView('defense')}
                accessibilityRole="button"
                accessibilityLabel={t('detail.defense')}
                accessibilityState={{ selected: battleRoleView === 'defense' }}
              >
                <Text
                  style={battleRoleView === 'defense' ? styles.roleToggleTextSelected : styles.roleToggleText}
                >
                  {t('detail.defense')}
                </Text>
              </Pressable>
            </View>

            {battleRoleView === 'attack' ? (
              bestAttackScore !== null ? (
                <Text style={styles.roleResultText}>
                  {t('detail.bestPvpScore', {
                    tier: t(`metaTier.${getMetaTier(bestAttackScore)}`),
                    score: bestAttackScore.toFixed(1),
                  })}
                </Text>
              ) : (
                <Text style={styles.roleResultText}>{t('detail.notRankedAttacking')}</Text>
              )
            ) : (
              <Text style={styles.roleResultText}>
                {bulkRanking
                  ? t('detail.tankierThan', {
                      tier: t(`bulkTier.${bulkRanking.tier}`),
                      percentile: bulkRanking.percentile,
                    })
                  : t('detail.bulkUnavailable')}
              </Text>
            )}
          <Text style={styles.sourceText}>{t('detail.roleSourceNote')}</Text>
        </Card>

          <Card style={styles.card} accentColor={COLORS.brandGold}>
            <Text style={styles.panelTitle}>{t('detail.powerUpCost')}</Text>
            <View style={styles.levelRangeRow}>
              <View style={styles.levelRangeField}>
                <Text style={styles.label}>{t('detail.fromLevel')}</Text>
                <TextInput
                  style={styles.levelInput}
                  keyboardType="numeric"
                  value={fromLevelInput}
                  onChangeText={setFromLevelInput}
                />
              </View>
              <View style={styles.levelRangeField}>
                <Text style={styles.label}>{t('detail.toLevel')}</Text>
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
                <Text style={styles.roleResultText}>
                  {t('detail.stardust', { n: powerUpResult.stardust.toLocaleString() })}
                </Text>
                <Text style={styles.roleResultText}>{t('detail.candy', { n: powerUpResult.candy })}</Text>
                {powerUpResult.xlCandy > 0 && (
                  <Text style={styles.roleResultText}>{t('detail.xlCandy', { n: powerUpResult.xlCandy })}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.emptyText}>{t('detail.powerUpHint')}</Text>
            )}
          </Card>

          <Card style={styles.card} backgroundColor={COLORS.retroScreenGreen} accentColor={COLORS.retroScreenGreenDark}>
            <Text style={[styles.panelTitle, { color: COLORS.retroScreenGreenDark }]}>
              {t('detail.loreTitle')}
              {lore.isAutoGenerated && (
                <Text style={styles.autoGenLabel}> {t('detail.autoGenerated')}</Text>
              )}
            </Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.origin')}</Text>
            <Text style={styles.loreFact}>{lore.origin}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.goRelevance')}</Text>
            <Text style={styles.loreFact}>{lore.goRelevance}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.battleTip')}</Text>
            <Text style={styles.loreFact}>{lore.battleTip}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.easterEgg')}</Text>
            <Text style={styles.loreFact}>{lore.easterEgg}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.goDifference')}</Text>
            <Text style={styles.loreFact}>{lore.goDifference}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.evolutionCost')}</Text>
            <Text style={styles.loreFact}>{lore.evolutionCost}</Text>

            <Text style={styles.loreCategoryLabel}>{t('detail.lore.shinyRate')}</Text>
            <Text style={styles.loreFact}>{lore.shinyRate}</Text>
          </Card>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.calculateButtonPressed]}
            onPress={() => navigation.navigate('EvolutionChain', { speciesId: species.id })}
            accessibilityRole="button"
            accessibilityLabel={t('detail.evolutionChainButton')}
          >
            <Text style={styles.secondaryButtonText}>{t('detail.evolutionChainButton')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.calculateButton, pressed && styles.calculateButtonPressed]}
            onPress={() => navigation.navigate('IvCalculator', { speciesId: species.id })}
            accessibilityRole="button"
            accessibilityLabel={t('detail.calculateIvButton')}
          >
            <Text style={styles.calculateButtonText}>{t('detail.calculateIvButton')}</Text>
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
    textShadowColor: 'rgba(20, 23, 28, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    fontSize: FONT_SIZE.xs,
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
    fontSize: FONT_SIZE.xs,
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
