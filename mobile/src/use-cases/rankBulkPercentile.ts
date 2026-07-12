import { calculateBulk, PokemonSpecies } from '../domain/pokemon-species';

export type BulkTier = 'elite' | 'great' | 'aboveAverage' | 'belowAverage' | 'fragile';

export const BULK_TIER_LABELS: Record<BulkTier, string> = {
  elite: 'Elite bulk (top 10%)',
  great: 'Great bulk (top 25%)',
  aboveAverage: 'Above average bulk',
  belowAverage: 'Below average bulk',
  fragile: 'Fragile',
};

export interface BulkRanking {
  percentile: number;
  tier: BulkTier;
}

function tierForPercentile(percentile: number): BulkTier {
  if (percentile >= 90) {
    return 'elite';
  }
  if (percentile >= 75) {
    return 'great';
  }
  if (percentile >= 50) {
    return 'aboveAverage';
  }
  if (percentile >= 25) {
    return 'belowAverage';
  }
  return 'fragile';
}

export function rankBulkPercentile(
  allSpecies: readonly PokemonSpecies[],
  targetSpeciesId: number,
): BulkRanking | null {
  const target = allSpecies.find((species) => species.id === targetSpeciesId);
  if (!target) {
    return null;
  }

  const targetBulk = calculateBulk(target);
  const lowerOrEqualCount = allSpecies.filter((species) => calculateBulk(species) <= targetBulk).length;
  const percentile = Math.round((lowerOrEqualCount / allSpecies.length) * 100);

  return { percentile, tier: tierForPercentile(percentile) };
}
