import { PokemonSpecies } from '../domain/pokemon-species';

export interface PokedexFilters {
  searchText: string;
  generation: number | null;
  type: string | null;
}

export const EMPTY_POKEDEX_FILTERS: PokedexFilters = {
  searchText: '',
  generation: null,
  type: null,
};

export function filterPokedex(
  allSpecies: readonly PokemonSpecies[],
  filters: PokedexFilters,
): readonly PokemonSpecies[] {
  const normalizedSearch = filters.searchText.trim().toLowerCase();

  return allSpecies.filter((species) => {
    if (normalizedSearch !== '' && !species.name.toLowerCase().includes(normalizedSearch)) {
      return false;
    }
    if (filters.generation !== null && species.generation !== filters.generation) {
      return false;
    }
    if (filters.type !== null && !species.types.includes(filters.type)) {
      return false;
    }
    return true;
  });
}
