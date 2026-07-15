import { calculateBulk, PokemonSpecies } from '../domain/pokemon-species';
import { calculateCombatPower } from '../domain/iv-calculator';
import { PvpLeague } from '../domain/pvp';
import { getPvpRankingsForSpecies } from '../data/pvp/pvpRepository';

export type RankingCategory = 'attack' | 'defense' | 'stamina' | 'bulk' | 'cp' | `pvp-${PvpLeague}`;

export interface RankingCategoryOption {
  category: RankingCategory;
  label: string;
  unit: string;
}

export const RANKING_CATEGORIES: readonly RankingCategoryOption[] = [
  { category: 'attack', label: 'Attack', unit: 'ATK' },
  { category: 'defense', label: 'Defense', unit: 'DEF' },
  { category: 'stamina', label: 'Stamina', unit: 'STA' },
  { category: 'bulk', label: 'Bulk', unit: 'DEF+STA' },
  { category: 'cp', label: 'Max CP', unit: 'CP' },
  { category: 'pvp-great', label: 'PvP Great League', unit: '/100' },
  { category: 'pvp-ultra', label: 'PvP Ultra League', unit: '/100' },
  { category: 'pvp-master', label: 'PvP Master League', unit: '/100' },
];

export interface RankedEntry {
  rank: number;
  species: PokemonSpecies;
  value: number;
}

// Community-standard "max CP" comparison: level 40, perfect IVs.
const MAX_LEVEL = 40;
const PERFECT_IVS = { ivAttack: 15, ivDefense: 15, ivStamina: 15 };

function valueFor(category: RankingCategory, species: PokemonSpecies): number | null {
  switch (category) {
    case 'attack':
      return species.baseAttack;
    case 'defense':
      return species.baseDefense;
    case 'stamina':
      return species.baseStamina;
    case 'bulk':
      return calculateBulk(species);
    case 'cp':
      return calculateCombatPower(species, PERFECT_IVS, MAX_LEVEL);
    default: {
      const league = category.replace('pvp-', '') as PvpLeague;
      return getPvpRankingsForSpecies(species.id)?.[league]?.score ?? null;
    }
  }
}

export function getTopRanking(
  category: RankingCategory,
  allSpecies: readonly PokemonSpecies[],
  limit = 20,
): RankedEntry[] {
  const withValues = allSpecies
    .map((species) => ({ species, value: valueFor(category, species) }))
    .filter((entry): entry is { species: PokemonSpecies; value: number } => entry.value !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return withValues.map((entry, index) => ({ rank: index + 1, ...entry }));
}
