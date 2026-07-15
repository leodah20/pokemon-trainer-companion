export type RaidTier = 1 | 3 | 5;

export interface RaidBoss {
  id: string;
  speciesId: number;
  speciesName: string;
  tier: RaidTier;
  types: string[];
}

export interface RaidCounter {
  speciesId: number;
  speciesName: string;
  types: string[];
  estimatedDps: number;
  weatherBoosted: boolean;
}
