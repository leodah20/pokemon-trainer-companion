import { PokemonSpecies } from '../domain/pokemon-species';
import { EvolutionChainLink, EvolutionStage } from '../domain/evolution/types';
import { EVOLUTION_FAMILIES } from '../data/evolution/evolutionFamiliesData';

function stageFor(index: number, length: number): EvolutionStage {
  if (index === 0) {
    return 'basic';
  }
  return index === length - 1 ? 'stage2' : 'stage1';
}

/**
 * Candy cost is a heuristic (25 for the first evolution, 100 for the second), not real
 * per-species data — mirrors backend/src/data/species/speciesRepository.ts's approximation.
 */
function candyCostFor(index: number): number | null {
  if (index === 0) {
    return null;
  }
  return index === 1 ? 25 : 100;
}

/** Returns the full evolution chain for a species, or null if it isn't in the known families. */
export function getEvolutionChain(
  speciesId: number,
  allSpecies: readonly PokemonSpecies[],
): EvolutionChainLink[] | null {
  const speciesById = new Map(allSpecies.map((s) => [s.id, s]));
  const chainIds = Object.values(EVOLUTION_FAMILIES).find((chain) => chain.includes(speciesId));
  if (!chainIds) {
    return null;
  }

  return chainIds
    .map((id, index) => {
      const species = speciesById.get(id);
      if (!species) {
        return null;
      }
      return {
        speciesId: species.id,
        speciesName: species.name,
        types: species.types,
        baseAttack: species.baseAttack,
        baseDefense: species.baseDefense,
        baseStamina: species.baseStamina,
        stage: stageFor(index, chainIds.length),
        candyCost: candyCostFor(index),
      };
    })
    .filter((link): link is EvolutionChainLink => link !== null);
}
