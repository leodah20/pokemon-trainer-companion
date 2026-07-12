import { PokemonSpecies } from '../../domain/pokemon-species';
import nationalPokedexData from './national-pokedex.json';

/**
 * Bundled offline snapshot (965 species, generations 1-9), merged from PoGo API's
 * pokemon_stats.json and pokemon_types.json. This is the "local cache" described in
 * docs/use-cases.md (UC-06) — a live scheduled sync job replaces this static file later without
 * changing the interface below.
 */
const ALL_SPECIES = nationalPokedexData as readonly PokemonSpecies[];

export function getAllSpecies(): readonly PokemonSpecies[] {
  return ALL_SPECIES;
}

export function getSpeciesById(id: number): PokemonSpecies | undefined {
  return ALL_SPECIES.find((species) => species.id === id);
}

export function getAllGenerations(): readonly number[] {
  const generations = new Set(ALL_SPECIES.map((species) => species.generation));
  return Array.from(generations).sort((a, b) => a - b);
}

export function getAllTypes(): readonly string[] {
  const types = new Set(ALL_SPECIES.flatMap((species) => species.types));
  return Array.from(types).sort();
}

export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
