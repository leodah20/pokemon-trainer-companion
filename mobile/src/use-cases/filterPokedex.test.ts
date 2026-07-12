import { EMPTY_POKEDEX_FILTERS, filterPokedex } from './filterPokedex';
import { PokemonSpecies } from '../domain/pokemon-species';

const SPECIES: PokemonSpecies[] = [
  { id: 1, name: 'Bulbasaur', generation: 1, baseAttack: 118, baseDefense: 111, baseStamina: 128, types: ['Grass', 'Poison'] },
  { id: 4, name: 'Charmander', generation: 1, baseAttack: 116, baseDefense: 93, baseStamina: 118, types: ['Fire'] },
  { id: 906, name: 'Sprigatito', generation: 9, baseAttack: 116, baseDefense: 99, baseStamina: 120, types: ['Grass'] },
];

describe('filterPokedex', () => {
  it('returns everything when filters are empty', () => {
    expect(filterPokedex(SPECIES, EMPTY_POKEDEX_FILTERS)).toHaveLength(3);
  });

  it('filters by case-insensitive partial name match', () => {
    const result = filterPokedex(SPECIES, { ...EMPTY_POKEDEX_FILTERS, searchText: 'char' });
    expect(result.map((s) => s.name)).toEqual(['Charmander']);
  });

  it('filters by generation', () => {
    const result = filterPokedex(SPECIES, { ...EMPTY_POKEDEX_FILTERS, generation: 9 });
    expect(result.map((s) => s.name)).toEqual(['Sprigatito']);
  });

  it('filters by type', () => {
    const result = filterPokedex(SPECIES, { ...EMPTY_POKEDEX_FILTERS, type: 'Grass' });
    expect(result.map((s) => s.name)).toEqual(['Bulbasaur', 'Sprigatito']);
  });

  it('combines filters with AND semantics', () => {
    const result = filterPokedex(SPECIES, { searchText: '', generation: 1, type: 'Grass' });
    expect(result.map((s) => s.name)).toEqual(['Bulbasaur']);
  });
});
