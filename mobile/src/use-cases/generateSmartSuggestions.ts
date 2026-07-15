import { PokemonSpecies } from '../domain/pokemon-species';
import { EvolutionChainLink } from '../domain/evolution/types';
import { getMetaTier, META_TIER_LABELS, PVP_LEAGUE_LABELS, PvpLeague, PvpRankingsBySpecies } from '../domain/pvp';
import { getCombinedMultiplier } from '../data/type-effectiveness/typeEffectivenessRepository';
import { ALL_TYPE_NAMES } from '../data/type-effectiveness/typeEffectivenessRepository';
import { BulkRanking, BULK_TIER_LABELS } from './rankBulkPercentile';

const LEAGUE_ORDER: readonly PvpLeague[] = ['great', 'ultra', 'master'];

/**
 * Rule-based "what should I do with this Pokemon" suggestions — deliberately not an LLM call.
 * Every suggestion here is derived from data this app already computes (type chart, PvP scores,
 * bulk percentile, evolution chain), so it's free, offline, and doesn't send screen data
 * anywhere. See README's "Post-beta scope" for why an LLM integration was explicitly declined.
 */
export function generateSmartSuggestions(
  species: PokemonSpecies,
  pvpRankings: PvpRankingsBySpecies | undefined,
  bulkRanking: BulkRanking | null,
  evolutionChain: readonly EvolutionChainLink[] | null,
): string[] {
  const suggestions: string[] = [];

  suggestions.push(...evolutionSuggestion(species, evolutionChain));
  suggestions.push(...pvpSuggestion(pvpRankings));
  suggestions.push(...raidAttackerSuggestion(species));
  suggestions.push(...gymDefenderSuggestion(bulkRanking));

  return suggestions;
}

function evolutionSuggestion(species: PokemonSpecies, chain: readonly EvolutionChainLink[] | null): string[] {
  if (!chain) {
    return [];
  }
  const index = chain.findIndex((link) => link.speciesId === species.id);
  if (index === -1 || index === chain.length - 1) {
    return ['Already at its final evolution stage.'];
  }
  const next = chain[index + 1];
  const atkGain = next.baseAttack - species.baseAttack;
  const cost = next.candyCost !== null ? `${next.candyCost} candy` : 'candy';
  return [`Evolve to ${next.speciesName} for ${cost} — +${atkGain} ATK.`];
}

function pvpSuggestion(pvpRankings: PvpRankingsBySpecies | undefined): string[] {
  if (!pvpRankings) {
    return ['Not competitively ranked in PvP — best used for raids/gyms instead.'];
  }
  const ranked = LEAGUE_ORDER.filter((league) => pvpRankings[league] !== undefined).map((league) => ({
    league,
    moveset: pvpRankings[league]!,
  }));
  if (ranked.length === 0) {
    return ['Not competitively ranked in PvP — best used for raids/gyms instead.'];
  }
  const best = ranked.reduce((top, entry) => (entry.moveset.score > top.moveset.score ? entry : top));
  return [
    `Best PvP league: ${PVP_LEAGUE_LABELS[best.league]} (${META_TIER_LABELS[getMetaTier(best.moveset.score)]}, score ${best.moveset.score.toFixed(1)}/100).`,
  ];
}

const MAX_RAID_TYPES = 3;

function raidAttackerSuggestion(species: PokemonSpecies): string[] {
  const strongAgainst = ALL_TYPE_NAMES.filter((defenderType) =>
    species.types.some((attackerType) => getCombinedMultiplier(attackerType, [defenderType]) > 1),
  ).slice(0, MAX_RAID_TYPES);

  if (strongAgainst.length === 0) {
    return [];
  }
  return [`Good raid attacker against ${strongAgainst.join('/')} bosses.`];
}

function gymDefenderSuggestion(bulkRanking: BulkRanking | null): string[] {
  if (!bulkRanking || bulkRanking.tier === 'belowAverage' || bulkRanking.tier === 'fragile') {
    return [];
  }
  return [`${BULK_TIER_LABELS[bulkRanking.tier]} — tankier than ${bulkRanking.percentile}% of all Pokemon, solid gym defender.`];
}
