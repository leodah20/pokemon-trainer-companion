import { getTopRanking } from './rankTopPokemon';
import { PokemonSpecies } from '../domain/pokemon-species';

// High, unused ids so these fixtures never collide with real species in the bundled PvP rankings data.
const SPECIES: PokemonSpecies[] = [
  { id: 9001, name: 'Low', generation: 1, baseAttack: 50, baseDefense: 50, baseStamina: 50, types: ['Normal'] },
  { id: 9002, name: 'High', generation: 1, baseAttack: 300, baseDefense: 50, baseStamina: 50, types: ['Normal'] },
  { id: 9003, name: 'Mid', generation: 1, baseAttack: 150, baseDefense: 50, baseStamina: 50, types: ['Normal'] },
];

describe('getTopRanking', () => {
  it('orders by attack descending and assigns rank starting at 1', () => {
    const result = getTopRanking('attack', SPECIES);
    expect(result.map((entry) => entry.species.name)).toEqual(['High', 'Mid', 'Low']);
    expect(result[0].rank).toBe(1);
    expect(result[0].value).toBe(300);
  });

  it('respects the limit', () => {
    const result = getTopRanking('attack', SPECIES, 2);
    expect(result).toHaveLength(2);
  });

  it('excludes species with no PvP ranking for that league', () => {
    const result = getTopRanking('pvp-great', SPECIES);
    expect(result).toHaveLength(0);
  });
});
