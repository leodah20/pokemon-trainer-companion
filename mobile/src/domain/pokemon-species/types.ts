import { BaseStats } from '../iv-calculator';

export interface PokemonSpecies extends BaseStats {
  id: number;
  name: string;
  form?: string;
  baseSpeciesId?: number;
  generation: number;
  types: readonly string[];
}
