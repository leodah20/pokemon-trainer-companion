import { findIndividualValueCombinations, IvCombination, IvSearchRange } from '../domain/iv-calculator';
import { getSpeciesById } from '../data/pokedex/pokedexRepository';

export interface CalculateIvsForSpeciesInput {
  speciesId: number;
  observedCp: number;
  observedHp: number;
  levelRange: IvSearchRange;
}

export class UnknownSpeciesError extends Error {
  constructor(speciesId: number) {
    super(`No Pokedex data for species id ${speciesId}`);
  }
}

export function calculateIvsForSpecies(input: CalculateIvsForSpeciesInput): IvCombination[] {
  const species = getSpeciesById(input.speciesId);
  if (!species) {
    throw new UnknownSpeciesError(input.speciesId);
  }

  return findIndividualValueCombinations(species, input.observedCp, input.observedHp, input.levelRange);
}
