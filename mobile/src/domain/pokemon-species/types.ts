import { BaseStats } from '../iv-calculator';

export interface PokemonSpecies extends BaseStats {
  id: number;
  name: string;
  generation: number;
  types: readonly string[];
}
