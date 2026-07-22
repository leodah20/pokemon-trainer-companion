export interface Species {
  id: number;
  name: string;
  form?: string;
  baseSpeciesId?: number;
  generation: number;
  types: string[];
  baseAttack: number;
  baseDefense: number;
  baseStamina: number;
}

export type SpeciesSortField = 'id' | 'name' | 'generation' | 'baseAttack' | 'baseDefense' | 'baseStamina';

export interface SpeciesFilter {
  name?: string;
  type?: string;
  generation?: number;
  minAttack?: number;
  maxAttack?: number;
  minDefense?: number;
  maxDefense?: number;
  minStamina?: number;
  maxStamina?: number;
  page: number;
  limit: number;
  sortBy: SpeciesSortField;
  sortOrder: 'asc' | 'desc';
}

export interface SpeciesCounter {
  speciesId: number;
  speciesName: string;
  types: string[];
  effectiveness: number;
}

export interface PvpRanking {
  league: string;
  rank: number;
  rating: number;
  speciesId: number;
  speciesName: string;
  fastMove: string;
  chargeMove: string;
}

export interface EvolutionNode {
  speciesId: number;
  speciesName: string;
  type: 'basic' | 'stage1' | 'stage2';
  candyCost: number;
}

export interface EvolutionFamily {
  speciesId: number;
  speciesName: string;
  evolutions: EvolutionNode[];
}

export interface SpeciesDetail extends Species {
  evolutionFamily: EvolutionFamily | null;
  counters: SpeciesCounter[];
  pvpRankings: PvpRanking[];
}
