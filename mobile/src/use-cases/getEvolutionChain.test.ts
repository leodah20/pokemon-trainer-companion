import { getEvolutionChain } from './getEvolutionChain';
import { PokemonSpecies } from '../domain/pokemon-species';

const SPECIES: PokemonSpecies[] = [
  { id: 1, name: 'Bulbasaur', generation: 1, baseAttack: 118, baseDefense: 111, baseStamina: 128, types: ['Grass', 'Poison'] },
  { id: 2, name: 'Ivysaur', generation: 1, baseAttack: 151, baseDefense: 143, baseStamina: 155, types: ['Grass', 'Poison'] },
  { id: 3, name: 'Venusaur', generation: 1, baseAttack: 198, baseDefense: 189, baseStamina: 190, types: ['Grass', 'Poison'] },
];

describe('getEvolutionChain', () => {
  it('returns the ordered chain with stages and candy costs for any member species', () => {
    const chain = getEvolutionChain(2, SPECIES);
    expect(chain).not.toBeNull();
    expect(chain!.map((link) => link.speciesName)).toEqual(['Bulbasaur', 'Ivysaur', 'Venusaur']);
    expect(chain![0].stage).toBe('basic');
    expect(chain![0].candyCost).toBeNull();
    expect(chain![1].stage).toBe('stage1');
    expect(chain![1].candyCost).toBe(25);
    expect(chain![2].stage).toBe('stage2');
    expect(chain![2].candyCost).toBe(100);
  });

  it('returns null for a species with no known evolution family', () => {
    expect(getEvolutionChain(999999, SPECIES)).toBeNull();
  });
});
